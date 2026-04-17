/**
 * Local hostnames that should be treated as equivalent in non-production
 * environments. Lets developers reach the API from any of them without
 * redefining `CORS_ORIGIN`.
 */
export const LOOPBACK_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
] as const;

export type LoopbackHost = (typeof LOOPBACK_HOSTS)[number];
