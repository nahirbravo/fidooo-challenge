import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PinoLogger } from 'nestjs-pino';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OpenAIService implements OnModuleInit {
  private client!: OpenAI;
  private model!: string;
  private timeoutMs!: number;
  private maxTokens!: number;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit(): void {
    const apiKey = this.config.getOrThrow<string>('OPENAI_API_KEY');
    this.timeoutMs = this.config.getOrThrow<number>('OPENAI_TIMEOUT_MS');
    this.model = this.config.getOrThrow<string>('OPENAI_MODEL');
    this.maxTokens = this.config.getOrThrow<number>('OPENAI_MAX_TOKENS');

    this.client = new OpenAI({
      apiKey,
      timeout: this.timeoutMs,
      maxRetries: 1,
    });
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    const startMs = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content?.trim() ?? '';
      if (!content) {
        throw new Error('OpenAI returned an empty assistant response');
      }
      const durationMs = Date.now() - startMs;

      this.logger.info(
        {
          model: this.model,
          durationMs,
          timeoutMs: this.timeoutMs,
          maxTokens: this.maxTokens,
          tokensUsed: response.usage?.total_tokens,
        },
        'OpenAI completion',
      );

      return content;
    } catch (error) {
      const durationMs = Date.now() - startMs;
      this.logger.error(
        { model: this.model, durationMs, error },
        'OpenAI completion failed',
      );
      throw error;
    }
  }
}
