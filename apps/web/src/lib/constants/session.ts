/**
 * Single source of truth for the Firebase session cookie shared between
 * the proxy (optimistic check), the server-side verifier, and the
 * route handlers that create / clear it.
 */

export const SESSION_COOKIE_NAME = '__session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 days
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

/**
 * Firebase Auth error codes that we treat as "expected" when verifying an
 * existing session cookie. Any other error escalates as infrastructure failure.
 */
export const EXPECTED_SESSION_VERIFY_ERRORS: ReadonlySet<string> = new Set([
  'auth/session-cookie-expired',
  'auth/session-cookie-revoked',
  'auth/invalid-session-cookie',
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/argument-error',
]);

/**
 * Firebase Auth error codes that we treat as "expected" when minting a new
 * session cookie from an ID token (e.g. the client sent a stale token).
 */
export const EXPECTED_SESSION_CREATE_ERRORS: ReadonlySet<string> = new Set([
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/invalid-id-token',
  'auth/argument-error',
  'auth/user-disabled',
  'auth/user-not-found',
]);
