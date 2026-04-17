import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from '../constants';

export const MESSAGE_ROLES = ['user', 'assistant'] as const;

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(MESSAGE_ROLES),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  createdAt: z.union([z.date(), z.number()]),
  uid: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

/**
 * Schema for *writing* a message into Firestore from the API.
 * The server is the only producer of these fields, so we re-validate
 * defensively before persisting (defense-in-depth: client rules already
 * filter, but server should never trust its own callers either).
 */
export const WriteMessageSchema = z.object({
  uid: z.string().min(1, 'uid is required'),
  role: z.enum(MESSAGE_ROLES),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

export type WriteMessageInput = z.infer<typeof WriteMessageSchema>;
