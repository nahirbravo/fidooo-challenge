import type { ZodError } from 'zod';

export function formatZodError(error: ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((e) => [e.path.join('.'), e.message]),
  );
}
