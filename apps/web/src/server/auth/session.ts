import 'server-only';
import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  EXPECTED_SESSION_VERIFY_ERRORS,
  SESSION_COOKIE_NAME,
} from '@/lib/constants/session';

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    return await getFirebaseAdminAuth().verifySessionCookie(session, true);
  } catch (error) {
    const code = getErrorCode(error);
    if (code && EXPECTED_SESSION_VERIFY_ERRORS.has(code)) {
      logger.warn('session.verify.invalid', { code });
      return null;
    }
    logger.error('session.verify.unexpected', { code, error });
    throw error;
  }
}
