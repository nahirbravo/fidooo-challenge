import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatService } from '../chat.service';
import type { FirebaseService } from '../../firebase/firebase.service';
import type { OpenAIService } from '../../openai/openai.service';
import { ContextService } from '../services/context.service';
import type { PinoLogger } from 'nestjs-pino';

interface TestChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

describe('ChatService', () => {
  const firebaseService = {
    writeUserMessage: jest.fn(),
    getRecentMessages: jest.fn(),
    writeAssistantMessage: jest.fn(),
    deleteMessage: jest.fn(),
  };
  const openaiService = {
    chatCompletion: jest.fn(),
  };
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  let service: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    firebaseService.deleteMessage.mockResolvedValue(undefined);
    service = new ChatService(
      firebaseService as unknown as FirebaseService,
      openaiService as unknown as OpenAIService,
      new ContextService(),
      logger as unknown as PinoLogger,
    );
  });

  it('persists the user message before building context and does not duplicate it', async () => {
    firebaseService.writeUserMessage.mockResolvedValue('user-message-id');
    firebaseService.getRecentMessages.mockResolvedValue([
      { role: 'user', content: 'Hello' },
    ]);
    openaiService.chatCompletion.mockResolvedValue('Hi');
    firebaseService.writeAssistantMessage.mockResolvedValue(
      'assistant-message-id',
    );

    const result = await service.generateReply('user-1', 'Hello');
    const openaiMessages =
      (openaiService.chatCompletion.mock.calls[0]?.[0] as
        | TestChatMessage[]
        | undefined) ?? [];
    const matchingUserPrompts = openaiMessages.filter(
      (message: TestChatMessage) =>
        message.role === 'user' && message.content === 'Hello',
    );

    expect(firebaseService.writeUserMessage).toHaveBeenCalledWith(
      'user-1',
      'Hello',
    );
    expect(
      firebaseService.getRecentMessages.mock.invocationCallOrder[0],
    ).toBeGreaterThan(
      firebaseService.writeUserMessage.mock.invocationCallOrder[0] ?? 0,
    );
    expect(matchingUserPrompts).toHaveLength(1);
    expect(firebaseService.writeAssistantMessage).toHaveBeenCalledWith(
      'user-1',
      'Hi',
    );
    expect(firebaseService.deleteMessage).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      messageId: 'assistant-message-id',
      chatId: 'user-1',
    });
  });

  it('rolls back the user message and does not persist assistant when OpenAI fails', async () => {
    firebaseService.writeUserMessage.mockResolvedValue('user-message-id');
    firebaseService.getRecentMessages.mockResolvedValue([
      { role: 'user', content: 'Hello' },
    ]);
    openaiService.chatCompletion.mockRejectedValue(new Error('OpenAI failed'));

    await expect(service.generateReply('user-1', 'Hello')).rejects.toThrow(
      BadGatewayException,
    );
    expect(firebaseService.writeAssistantMessage).not.toHaveBeenCalled();
    expect(firebaseService.deleteMessage).toHaveBeenCalledWith(
      'user-1',
      'user-message-id',
    );
  });

  it('throws FIRESTORE_WRITE_FAILED when persisting the user message fails', async () => {
    firebaseService.writeUserMessage.mockRejectedValue(new Error('boom'));

    await expect(service.generateReply('user-1', 'Hello')).rejects.toMatchObject({
      response: { error: { code: 'FIRESTORE_WRITE_FAILED' } },
    });
    expect(openaiService.chatCompletion).not.toHaveBeenCalled();
    expect(firebaseService.deleteMessage).not.toHaveBeenCalled();
  });

  it('throws FIRESTORE_READ_FAILED when reading history fails', async () => {
    firebaseService.writeUserMessage.mockResolvedValue('user-message-id');
    firebaseService.getRecentMessages.mockRejectedValue(new Error('boom'));

    await expect(
      service.generateReply('user-1', 'Hello'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(openaiService.chatCompletion).not.toHaveBeenCalled();
  });

  it('throws FIRESTORE_WRITE_FAILED when persisting the assistant message fails', async () => {
    firebaseService.writeUserMessage.mockResolvedValue('user-message-id');
    firebaseService.getRecentMessages.mockResolvedValue([
      { role: 'user', content: 'Hello' },
    ]);
    openaiService.chatCompletion.mockResolvedValue('Hi');
    firebaseService.writeAssistantMessage.mockRejectedValue(new Error('boom'));

    await expect(service.generateReply('user-1', 'Hello')).rejects.toMatchObject(
      { response: { error: { code: 'FIRESTORE_WRITE_FAILED' } } },
    );
  });
});
