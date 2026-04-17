import { logger } from '@/lib/logger';

export async function setSessionCookie(token: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    logger.error('session.setCookie', { status: response.status });
    throw new Error('Unable to establish session');
  }
}

export async function deleteSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch (error) {
    logger.error('session.deleteCookie', { error });
  }
}
