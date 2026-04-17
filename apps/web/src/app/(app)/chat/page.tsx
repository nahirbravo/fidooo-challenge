'use client';

import { ChatShell } from '@/features/chat/components/ChatShell';
import { useChatSubscription } from '@/features/chat/hooks/useChatSubscription';
import { useSendMessage } from '@/features/chat/hooks/useSendMessage';

export default function ChatPage() {
  const {
    messages, isLoading, error, hasOlder, isLoadingOlder, loadOlder, reconnect,
  } = useChatSubscription();
  const { send, retry, dismiss, isPending, isInputDisabled } = useSendMessage();

  return (
    <ChatShell
      messages={messages}
      isLoading={isLoading}
      error={error}
      isPending={isPending}
      isInputDisabled={isInputDisabled}
      hasOlder={hasOlder}
      isLoadingOlder={isLoadingOlder}
      onSend={send}
      onLoadOlder={loadOlder}
      onRetry={retry}
      onDismiss={dismiss}
      onReconnect={reconnect}
    />
  );
}
