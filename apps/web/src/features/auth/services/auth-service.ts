import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseResetPassword,
  firebaseSignOut,
  firebaseOnAuthStateChanged,
  firebaseOnIdTokenChanged,
  firebaseGetIdToken,
} from '@/lib/firebase/auth';
import { logger } from '@/lib/logger';
import { LoginSchema, SignUpSchema, ForgotSchema } from '../schemas';
import type { Unsubscribe, User as FirebaseUser } from 'firebase/auth';

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/user-not-found': 'auth.login.error',
  'auth/wrong-password': 'auth.login.error',
  'auth/invalid-credential': 'auth.login.error',
  'auth/invalid-email': 'auth.login.error',
  'auth/email-already-in-use': 'auth.register.emailExists',
  'auth/weak-password': 'auth.register.passwordHint',
  'auth/too-many-requests': 'errors.rateLimited',
  'auth/network-request-failed': 'errors.network',
  'auth/user-disabled': 'auth.login.error',
};

function isFirebaseError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>)['code'] === 'string'
  );
}

function translateFirebaseError(error: unknown): string {
  if (isFirebaseError(error)) {
    return FIREBASE_ERROR_MAP[error.code] ?? 'errors.generic';
  }
  return 'errors.generic';
}

export class AuthServiceError extends Error {
  public readonly i18nKey: string;
  constructor(i18nKey: string) {
    super(i18nKey);
    this.name = 'AuthServiceError';
    this.i18nKey = i18nKey;
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    LoginSchema.parse({ email, password });
    await firebaseSignIn(email, password);
  } catch (error) {
    logger.error('authService.signIn', { error });
    throw new AuthServiceError(translateFirebaseError(error));
  }
}

export async function signUp(email: string, password: string): Promise<void> {
  try {
    SignUpSchema.parse({ email, password });
    await firebaseSignUp(email, password);
  } catch (error) {
    logger.error('authService.signUp', { error });
    throw new AuthServiceError(translateFirebaseError(error));
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    ForgotSchema.parse({ email });
    await firebaseResetPassword(email);
  } catch (error) {
    logger.error('authService.resetPassword', { error });
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut();
  } catch (error) {
    logger.error('authService.signOut', { error });
    throw new AuthServiceError('errors.generic');
  }
}

export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChanged(callback);
}

export function onIdTokenChanged(
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe {
  return firebaseOnIdTokenChanged(callback);
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  return firebaseGetIdToken(forceRefresh);
}
