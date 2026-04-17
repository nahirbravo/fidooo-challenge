import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message } from '@fidooo/shared';

type OptimisticStatus = 'sending' | 'sent' | 'error';

interface OptimisticMessage extends Message {
  status: OptimisticStatus;
  localCreatedAt: number;
}

interface ChatState {
  messages: (Message | OptimisticMessage)[];
  setMessages: (messages: Message[]) => void;
  addOptimistic: (message: OptimisticMessage) => void;
  markSent: (tempId: string) => void;
  markError: (tempId: string) => void;
  removeMessage: (tempId: string) => void;
  prependMessages: (older: Message[]) => void;
  clear: () => void;
}

function isOptimistic(
  msg: Message | OptimisticMessage,
): msg is OptimisticMessage {
  return 'status' in msg;
}

function hasMatchingPersistedMessage(
  optimistic: OptimisticMessage,
  messages: Message[],
): boolean {
  return messages.some((message) => (
    message.role === optimistic.role &&
    message.uid === optimistic.uid &&
    message.content === optimistic.content &&
    typeof message.createdAt === 'number' &&
    message.createdAt >= optimistic.localCreatedAt - 30_000
  ));
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      messages: [],
      setMessages: (messages) =>
        set((state) => {
          const optimistics = state.messages.filter(
            (message) =>
              isOptimistic(message) &&
              message.status === 'sending' &&
              !hasMatchingPersistedMessage(message, messages),
          );
          return { messages: [...messages, ...optimistics] };
        }),
      addOptimistic: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      markSent: (tempId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId && isOptimistic(m)
              ? { ...m, status: 'sent' as const }
              : m,
          ),
        })),
      markError: (tempId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId && isOptimistic(m)
              ? { ...m, status: 'error' as const }
              : m,
          ),
        })),
      removeMessage: (tempId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== tempId),
        })),
      prependMessages: (older) =>
        set((state) => ({ messages: [...older, ...state.messages] })),
      clear: () => set({ messages: [] }),
    }),
    { name: 'ChatStore', enabled: process.env.NODE_ENV === 'development' },
  ),
);

export type { OptimisticMessage, OptimisticStatus };
