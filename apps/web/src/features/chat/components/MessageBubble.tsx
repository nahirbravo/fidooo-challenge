'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import type { Message } from '@fidooo/shared';
import type { OptimisticMessage, OptimisticStatus } from '@/stores';
import { MessageActions } from './MessageActions';

const bubbleVariants = cva('chat-bubble', {
  variants: {
    variant: {
      user: 'chat-bubble-user',
      assistant: 'chat-bubble-assistant',
    },
  },
  defaultVariants: { variant: 'assistant' },
});

function isOptimistic(
  msg: Message | OptimisticMessage,
): msg is OptimisticMessage {
  return 'status' in msg;
}

interface MessageBubbleProps extends VariantProps<typeof bubbleVariants> {
  message: Message | OptimisticMessage;
  onRetry?: (id: string, content: string) => void;
  onDismiss?: (id: string) => void;
}

export function MessageBubble({
  message,
  onRetry,
  onDismiss,
}: MessageBubbleProps) {
  const t = useTranslations();
  const variant = message.role;
  const timestamp =
    typeof message.createdAt === 'number'
      ? message.createdAt
      : isOptimistic(message)
        ? message.localCreatedAt
        : 0;
  const status: OptimisticStatus | undefined = isOptimistic(message)
    ? message.status
    : undefined;

  return (
    <div
      className={cn(
        'chat-message group',
        variant === 'user' ? 'items-end' : 'items-start',
      )}
    >
      <div className={bubbleVariants({ variant })}>
        {variant === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              code: ({ children, className }) => (
                <code className={cn('chat-markdown-code', className)}>
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="chat-markdown-pre">{children}</pre>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>

      {status === 'sending' ? (
        <div className="chat-status-row">
          <Spinner size="sm" className="chat-status-muted" />
          <span className="sr-only">{t('chat.sending')}</span>
        </div>
      ) : null}

      {status === 'error' ? (
        <span className="chat-status-error" role="alert">
          {t('chat.sendError')}
        </span>
      ) : null}

      <MessageActions
        messageId={message.id}
        content={message.content}
        timestamp={timestamp}
        align={variant === 'user' ? 'end' : 'start'}
        status={status}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    </div>
  );
}

MessageBubble.displayName = 'MessageBubble';
