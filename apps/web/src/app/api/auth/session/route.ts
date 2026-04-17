import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  EXPECTED_SESSION_CREATE_ERRORS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/constants/session';

const SessionBodySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = SessionBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let sessionCookie: string;
  try {
    sessionCookie = await getFirebaseAdminAuth().createSessionCookie(
      parsed.data.token,
      { expiresIn: SESSION_MAX_AGE_MS },
    );
  } catch (error) {
    const code = getErrorCode(error);
    if (code && EXPECTED_SESSION_CREATE_ERRORS.has(code)) {
      logger.warn('session.create.invalidToken', { code });
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    logger.error('session.create.unexpected', { code, error });
    return NextResponse.json(
      { error: 'Session service unavailable' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
