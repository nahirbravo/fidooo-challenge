import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema, ForgotSchema } from '@/features/auth/schemas';
import { MessageSchema, ChatReplyRequestSchema } from '@fidooo/shared';

describe('LoginSchema', () => {
  it('accepts valid email + password', () => {
    const result = LoginSchema.safeParse({ email: 'test@email.com', password: 'pass123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'pass123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'notanemail', password: 'pass123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = LoginSchema.safeParse({ email: 'test@email.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('accepts valid registration', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@email.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@email.com',
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without digit', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@email.com',
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@email.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@email.com',
      password: 'Password1',
      confirmPassword: 'Password2',
    });
    expect(result.success).toBe(false);
  });
});

describe('ForgotSchema', () => {
  it('accepts valid email', () => {
    const result = ForgotSchema.safeParse({ email: 'test@email.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = ForgotSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('MessageSchema', () => {
  it('accepts valid message', () => {
    const result = MessageSchema.safeParse({
      id: '123',
      role: 'user',
      content: 'Hello',
      createdAt: Date.now(),
      uid: 'user-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = MessageSchema.safeParse({
      id: '123',
      role: 'admin',
      content: 'Hello',
      createdAt: Date.now(),
      uid: 'user-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = MessageSchema.safeParse({
      id: '123',
      role: 'user',
      content: '',
      createdAt: Date.now(),
      uid: 'user-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects content over 4000 chars', () => {
    const result = MessageSchema.safeParse({
      id: '123',
      role: 'user',
      content: 'x'.repeat(4001),
      createdAt: Date.now(),
      uid: 'user-1',
    });
    expect(result.success).toBe(false);
  });
});

describe('ChatReplyRequestSchema', () => {
  it('accepts valid message', () => {
    const result = ChatReplyRequestSchema.safeParse({ message: 'Hello' });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = ChatReplyRequestSchema.safeParse({ message: '' });
    expect(result.success).toBe(false);
  });

  it('rejects message over 4000 chars', () => {
    const result = ChatReplyRequestSchema.safeParse({ message: 'x'.repeat(4001) });
    expect(result.success).toBe(false);
  });
});
