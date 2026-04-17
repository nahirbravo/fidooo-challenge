import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable().optional(),
  photoURL: z.string().url().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
