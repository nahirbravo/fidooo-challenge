import {
  collection,
  query,
  orderBy,
  limit,
  limitToLast,
  startAfter,
  getDocs,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type QuerySnapshot,
} from 'firebase/firestore';
import { getFirebaseDb } from './client';
import { MessageSchema, type Message } from '@fidooo/shared';
import { INITIAL_MESSAGES_LIMIT, PAGINATION_SIZE } from '@fidooo/shared';
import { logger } from '@/lib/logger';

function messagesRef(uid: string) {
  return collection(getFirebaseDb(), 'chats', uid, 'messages');
}

function docToMessage(doc: QueryDocumentSnapshot<DocumentData>): Message | null {
  const data = doc.data();
  const raw = {
    id: doc.id,
    role: data['role'],
    content: data['content'],
    createdAt: data['createdAt']?.toMillis?.() ?? Date.now(),
    uid: data['uid'],
  };
  const result = MessageSchema.safeParse(raw);
  if (!result.success) {
    logger.warn('firestore.docToMessage.invalid', { docId: doc.id, errors: result.error.flatten() });
    return null;
  }
  return result.data;
}

export function subscribeToMessages(
  uid: string,
  callback: (messages: Message[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    messagesRef(uid),
    orderBy('createdAt', 'asc'),
    limitToLast(INITIAL_MESSAGES_LIMIT),
  );

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const messages = snapshot.docs.map(docToMessage).filter((m): m is Message => m !== null);
      callback(messages);
    },
    (error) => {
      logger.error('firestore.subscribeToMessages', { error, uid });
      onError?.(error);
    },
  );
}

export async function loadOlderMessages(
  uid: string,
  beforeCreatedAt: number,
): Promise<Message[]> {
  try {
    const q = query(
      messagesRef(uid),
      orderBy('createdAt', 'desc'),
      startAfter(Timestamp.fromMillis(beforeCreatedAt)),
      limit(PAGINATION_SIZE),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToMessage).filter((m): m is Message => m !== null).reverse();
  } catch (error) {
    logger.error('firestore.loadOlderMessages', { error, uid });
    throw error;
  }
}
