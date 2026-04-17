import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional().default(''),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional().default(''),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NEXT_PUBLIC_USE_EMULATOR: z.string().optional(),
  NEXT_PUBLIC_EMULATOR_AUTH_HOST: z.string().optional().default('localhost:9099'),
  NEXT_PUBLIC_EMULATOR_FIRESTORE_HOST: z.string().optional().default('localhost:8080'),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
    NEXT_PUBLIC_USE_EMULATOR: process.env['NEXT_PUBLIC_USE_EMULATOR'],
    NEXT_PUBLIC_EMULATOR_AUTH_HOST: process.env['NEXT_PUBLIC_EMULATOR_AUTH_HOST'],
    NEXT_PUBLIC_EMULATOR_FIRESTORE_HOST: process.env['NEXT_PUBLIC_EMULATOR_FIRESTORE_HOST'],
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    // eslint-disable-next-line no-console
    console.error('[env] Invalid environment variables:', errors);
    throw new Error(`Invalid environment variables: ${Object.keys(errors).join(', ')}`);
  }

  return parsed.data;
}

export const env = validateEnv();
