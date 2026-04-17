import { z } from 'zod';
import {
  DEFAULT_OPENAI_MAX_TOKENS,
  DEFAULT_OPENAI_MODEL,
  DEFAULT_OPENAI_TIMEOUT_MS,
  DEFAULT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_TTL,
} from '@fidooo/shared';

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be a valid email'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL: z.string().default(DEFAULT_OPENAI_MODEL),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(DEFAULT_OPENAI_TIMEOUT_MS),
  OPENAI_MAX_TOKENS: z.coerce.number().default(DEFAULT_OPENAI_MAX_TOKENS),
  RATE_LIMIT_TTL: z.coerce.number().default(DEFAULT_RATE_LIMIT_TTL),
  RATE_LIMIT_MAX: z.coerce.number().default(DEFAULT_RATE_LIMIT_MAX),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  API_VERSION: z.string().default('1.0.0'),
  FIRESTORE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export type FieldErrors = Record<string, string[] | undefined>;

export class EnvValidationError extends Error {
  readonly fieldErrors: FieldErrors;

  constructor(fieldErrors: FieldErrors) {
    const summary = Object.entries(fieldErrors)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([key, messages]) => `  - ${key}: ${messages?.join(', ')}`)
      .join('\n');
    super(`Invalid environment variables:\n${summary}`);
    this.name = 'EnvValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export function validateEnv(
  config: Record<string, unknown> = process.env,
): EnvConfig {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    throw new EnvValidationError(parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
