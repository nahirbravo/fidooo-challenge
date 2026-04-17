'use client';

import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore, useAuthStore, type OptimisticMessage } from '@/stores';
import { sendMessage } from '../services/chat-service';
import { feedback } from '@/lib/feedback';
import { useTranslations } from 'next-intl';
import { RETRY_DELAY_MS } from '@fidooo/shared';

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || msg.includes('fetch') || msg.includes('500');
  }
  return false;
}

export function useSendMessage() {
  const t = useTranslations();
  const uid = useAuthStore((s) => s.user?.uid);
  const authStatus = useAuthStore((s) => s.authStatus);
  const { addOptimistic, markSent, markError, removeMessage } = useChatStore(
    useShallow((s) => ({
      addOptimistic: s.addOptimistic,
      markSent: s.markSent,
      markError: s.markError,
      removeMessage: s.removeMessage,
    })),
  );

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (authStatus !== 'authenticated' || !uid) {
        throw new Error(authStatus === 'unauthenticated' ? 'Not authenticated' : 'Auth state not ready');
      }
      return sendMessage(message);
    },
    onMutate: (message: string) => {
      const tempId = nanoid();
      const optimistic: OptimisticMessage = {
        id: tempId,
        role: 'user',
        content: message,
        createdAt: Date.now(),
        uid: uid ?? '',
        status: 'sending',
        localCreatedAt: Date.now(),
      };
      addOptimistic(optimistic);
      return { tempId };
    },
    onSuccess: (_data, _message, context) => {
      if (context?.tempId) markSent(context.tempId);
    },
    onError: (_error, _message, context) => {
      if (context?.tempId) markError(context.tempId);
      feedback.error(t('chat.sendError'));
    },
    retry: (failureCount, error) => failureCount < 1 && isRetryableError(error),
    retryDelay: RETRY_DELAY_MS,
  });

  const send = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  const retry = (tempId: string, message: string) => {
    removeMessage(tempId);
    send(message);
  };

  const dismiss = (tempId: string) => {
    removeMessage(tempId);
  };

  return {
    send,
    retry,
    dismiss,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isInputDisabled: authStatus !== 'authenticated',
  };
}
