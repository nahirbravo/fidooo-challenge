import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  MAX_CONTEXT_MESSAGES,
  SYSTEM_PROMPT,
  type ChatErrorCode,
} from '@fidooo/shared';
import { FirebaseService } from '../firebase/firebase.service';
import { OpenAIService } from '../openai/openai.service';
import { ContextService } from './services/context.service';

export interface GenerateReplyResult {
  ok: boolean;
  messageId: string;
  chatId: string;
}

function internal(
  code: ChatErrorCode,
  message: string,
): InternalServerErrorException {
  return new InternalServerErrorException({
    ok: false,
    error: { code, message },
  });
}

function badGateway(message: string): BadGatewayException {
  return new BadGatewayException({
    ok: false,
    error: { code: 'OPENAI_FAILED' satisfies ChatErrorCode, message },
  });
}

@Injectable()
export class ChatService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly openaiService: OpenAIService,
    private readonly contextService: ContextService,
    private readonly logger: PinoLogger,
  ) {}

  async generateReply(
    uid: string,
    message: string,
  ): Promise<GenerateReplyResult> {
    const startMs = Date.now();

    let userMessageId: string;
    try {
      userMessageId = await this.firebaseService.writeUserMessage(uid, message);
    } catch (error) {
      this.logger.error(
        { uid, error },
        'Firestore writeUserMessage failed',
      );
      throw internal('FIRESTORE_WRITE_FAILED', 'Could not persist user message');
    }

    let recentMessages: Awaited<
      ReturnType<FirebaseService['getRecentMessages']>
    >;
    try {
      recentMessages = await this.firebaseService.getRecentMessages(
        uid,
        MAX_CONTEXT_MESSAGES,
      );
    } catch (error) {
      this.logger.error(
        { uid, error },
        'Firestore getRecentMessages failed',
      );
      throw internal('FIRESTORE_READ_FAILED', 'Could not read chat history');
    }

    const truncated = this.contextService.truncate(recentMessages);
    const openaiMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...truncated.map((m) => ({ role: m.role, content: m.content })),
    ];

    let aiResponse: string;
    try {
      aiResponse = await this.openaiService.chatCompletion(openaiMessages);
    } catch (error) {
      this.logger.error({ uid, error }, 'OpenAI chat completion failed');
      // Roll back the user message so the user can retry without duplicating
      // their input. Best-effort: failure is logged inside deleteMessage.
      await this.firebaseService.deleteMessage(uid, userMessageId);
      throw badGateway('Failed to generate AI response');
    }

    let messageId: string;
    try {
      messageId = await this.firebaseService.writeAssistantMessage(
        uid,
        aiResponse,
      );
    } catch (error) {
      this.logger.error(
        { uid, error },
        'Firestore writeAssistantMessage failed',
      );
      throw internal(
        'FIRESTORE_WRITE_FAILED',
        'Could not persist assistant reply',
      );
    }

    const durationMs = Date.now() - startMs;
    this.logger.info(
      { uid, durationMs, userMessageId, messageId },
      'Chat reply generated',
    );

    return { ok: true, messageId, chatId: uid };
  }
}
