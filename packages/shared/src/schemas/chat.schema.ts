import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from '../constants';

export const ChatReplyRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(MAX_MESSAGE_LENGTH, 'Message too long'),
});

export type ChatReplyRequest = z.infer<typeof ChatReplyRequestSchema>;

export const CHAT_ERROR_CODES = [
  'VALIDATION_ERROR',
  'TOKEN_INVALID',
  'TOKEN_EXPIRED',
  'FIRESTORE_WRITE_FAILED',
  'FIRESTORE_READ_FAILED',
  'OPENAI_FAILED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

export const ChatReplyResponseSchema = z.object({
  ok: z.boolean(),
  messageId: z.string().optional(),
  chatId: z.string().optional(),
  error: z
    .object({
      code: z.enum(CHAT_ERROR_CODES),
      message: z.string(),
    })
    .optional(),
});

export type ChatReplyResponse = z.infer<typeof ChatReplyResponseSchema>;
