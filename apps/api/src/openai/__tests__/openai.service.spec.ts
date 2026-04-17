import type { ConfigService } from '@nestjs/config';
import type { PinoLogger } from 'nestjs-pino';
import { OpenAIService } from '../openai.service';

interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens: number;
}

describe('OpenAIService', () => {
  const create = jest.fn();
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const map: Record<string, string | number> = {
        OPENAI_API_KEY: 'sk-test',
        OPENAI_TIMEOUT_MS: 30000,
        OPENAI_MODEL: 'gpt-4o-mini',
        OPENAI_MAX_TOKENS: 1024,
      };
      const value = map[key];
      if (value === undefined) {
        throw new Error(`Missing config: ${key}`);
      }
      return value;
    }),
  };

  let service: OpenAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenAIService(
      config as unknown as ConfigService,
      logger as unknown as PinoLogger,
    );
    service.onModuleInit();
    Object.assign(service as unknown as { client: { chat: { completions: { create: jest.Mock } } } }, {
      client: { chat: { completions: { create } } },
    });
  });

  it('returns the trimmed assistant content on success', async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: '   Hello world  ' } }],
      usage: { total_tokens: 12 },
    });

    const result = await service.chatCompletion([
      { role: 'user', content: 'hi' },
    ]);

    expect(result).toBe('Hello world');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ChatCompletionParams>>({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
      }),
    );
  });

  it('throws when OpenAI returns an empty response', async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: '' } }],
      usage: { total_tokens: 0 },
    });

    await expect(
      service.chatCompletion([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow('empty assistant response');
  });

  it('propagates network errors and logs them', async () => {
    const error = new Error('network down');
    create.mockRejectedValue(error);

    await expect(
      service.chatCompletion([{ role: 'user', content: 'hi' }]),
    ).rejects.toBe(error);
    expect(logger.error).toHaveBeenCalled();
  });
});
