import { Injectable } from '@nestjs/common';
import { MAX_CONTEXT_MESSAGES, MAX_CONTEXT_TOKENS } from '@fidooo/shared';
import type { MessageRole } from '@fidooo/shared';

interface ContextMessage {
  role: MessageRole;
  content: string;
}

@Injectable()
export class ContextService {
  truncate(messages: ReadonlyArray<ContextMessage>): ContextMessage[] {
    const limited = messages.slice(-MAX_CONTEXT_MESSAGES);

    let tokenCount = 0;
    const result: ContextMessage[] = [];

    for (let i = limited.length - 1; i >= 0; i--) {
      const msg = limited[i]!;
      const estimatedTokens = Math.ceil(msg.content.length / 4);

      if (tokenCount + estimatedTokens > MAX_CONTEXT_TOKENS) break;

      tokenCount += estimatedTokens;
      result.unshift(msg);
    }

    return result;
  }
}
