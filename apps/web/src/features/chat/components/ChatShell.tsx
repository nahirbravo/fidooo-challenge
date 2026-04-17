'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { MessageList } from './MessageList';
import { MessageInput, type MessageInputHandle } from './MessageInput';
import { EmptyState } from './EmptyState';
import { NewMessagesButton } from './NewMessagesButton';
import { PromptSuggestions } from './PromptSuggestions';
import { useAutoScroll } from '../hooks/useAutoScroll';
import type { Message } from '@fidooo/shared';
import type { OptimisticMessage } from '@/stores';

interface ChatShellProps {
  messages: (Message | OptimisticMessage)[];
  isLoading: boolean;
  error: string | null;
  isPending: boolean;
  isInputDisabled: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onSend: (message: string) => void;
  onLoadOlder: () => void;
  onRetry: (id: string, content: string) => void;
  onDismiss: (id: string) => void;
  onReconnect: () => void;
}

export function ChatShell({
  messages,
  isLoading,
  error,
  isPending,
  isInputDisabled,
  hasOlder,
  isLoadingOlder,
  onSend,
  onLoadOlder,
  onRetry,
  onDismiss,
  onReconnect,
}: ChatShellProps) {
  const t = useTranslations();
  const { containerRef, showNewMessages, scrollToBottom, onScroll } =
    useAutoScroll(messages.length);
  const heroInputRef = useRef<MessageInputHandle>(null);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={t(error)}
        variant="network"
        onRetry={onReconnect}
      />
    );
  }

  if (messages.length === 0 && !isPending) {
    return (
      <div className="chat-shell chat-shell-new">
        <div className="chat-new-center">
          <EmptyState />
          <PromptSuggestions
            onSelect={(text) => heroInputRef.current?.setValue(text)}
          />
          <MessageInput
            ref={heroInputRef}
            onSend={onSend}
            isPending={isPending}
            isDisabled={isInputDisabled}
            variant="hero"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-shell">
      <MessageList
        messages={messages}
        isPending={isPending}
        hasOlder={hasOlder}
        isLoadingOlder={isLoadingOlder}
        onLoadOlder={onLoadOlder}
        onRetry={onRetry}
        onDismiss={onDismiss}
        containerRef={containerRef}
        onScroll={onScroll}
      />
      <NewMessagesButton
        isVisible={showNewMessages}
        onClick={() => scrollToBottom()}
      />
      <MessageInput onSend={onSend} isPending={isPending} isDisabled={isInputDisabled} />
    </div>
  );
}

ChatShell.displayName = 'ChatShell';
