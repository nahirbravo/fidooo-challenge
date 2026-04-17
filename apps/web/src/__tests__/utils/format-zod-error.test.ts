import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { formatZodError } from '@fidooo/shared';

describe('formatZodError', () => {
  it('maps single field error', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'bad' });

    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toHaveProperty('email');
      expect(typeof formatted['email']).toBe('string');
    }
  });

  it('maps nested path errors', () => {
    const schema = z.object({
      user: z.object({ name: z.string().min(1) }),
    });
    const result = schema.safeParse({ user: { name: '' } });

    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toHaveProperty('user.name');
    }
  });

  it('maps multiple field errors', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });
    const result = schema.safeParse({ email: 'bad', password: 'x' });

    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(Object.keys(formatted)).toHaveLength(2);
      expect(formatted).toHaveProperty('email');
      expect(formatted).toHaveProperty('password');
    }
  });
});
