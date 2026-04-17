/**
 * Type guard for Firebase Admin SDK errors. Firebase tags errors with a
 * stable string `code` (e.g. `auth/id-token-expired`). Anything that lacks
 * that shape is treated as an unknown infrastructure failure.
 */
export interface FirebaseLikeError {
  code: string;
}

export function isFirebaseError(value: unknown): value is FirebaseLikeError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code: unknown }).code === 'string'
  );
}

export function getFirebaseErrorCode(value: unknown): string | undefined {
  return isFirebaseError(value) ? value.code : undefined;
}
