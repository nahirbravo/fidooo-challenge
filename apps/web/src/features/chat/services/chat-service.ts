import {
  subscribeToMessages,
  loadOlderMessages,
} from '@/lib/firebase/firestore';
import { postChatReply } from '@/lib/api/client';
import { getIdToken } from '@/features/auth/services/auth-service';
import type { Message } from '@fidooo/shared';
import type { Unsubscribe } from 'firebase/auth';

export function subscribe(
  uid: string,
  onMessages: (messages: Message[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return subscribeToMessages(uid, onMessages, onError);
}

export async function loadOlder(
  uid: string,
  beforeTimestamp: number,
): Promise<Message[]> {
  return loadOlderMessages(uid, beforeTimestamp);
}

export async function sendMessage(
  content: string,
): Promise<{ ok: boolean; messageId?: string }> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return postChatReply(content, token);
}
