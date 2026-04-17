'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '@fidooo/shared';
import type { OptimisticMessage } from '@/stores';

interface MessageListProps {
  messages: (Message | OptimisticMessage)[];
  isPending: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: (id: string, content: string) => void;
  onDismiss: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export function MessageList({
  messages,
  isPending,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onRetry,
  onDismiss,
  containerRef,
  onScroll,
}: MessageListProps) {
  const t = useTranslations();

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="chat-list"
    >
      <div className="chat-list-inner">
        {hasOlder ? (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadOlder}
              isLoading={isLoadingOlder}
              className="chat-load-button"
            >
              {t('chat.loadOlder')}
            </Button>
          </div>
        ) : null}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRetry={onRetry}
            onDismiss={onDismiss}
          />
        ))}

        <TypingIndicator isVisible={isPending} />
      </div>
    </div>
  );
}

MessageList.displayName = 'MessageList';
