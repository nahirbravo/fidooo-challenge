/**
 * Domain limits — single source of truth shared across web + api.
 */
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CONTEXT_MESSAGES = 20;
export const MAX_CONTEXT_TOKENS = 8000;
export const INITIAL_MESSAGES_LIMIT = 50;
export const PAGINATION_SIZE = 50;
export const MESSAGE_GROUP_THRESHOLD_MS = 2 * 60 * 1000;

/**
 * Default values surfaced as fallbacks in env schemas. The api owns its own
 * defaults via `EnvSchema`; these constants document the canonical values
 * and are reused by the web client where no env is involved.
 */
export const DEFAULT_RATE_LIMIT_TTL = 60;
export const DEFAULT_RATE_LIMIT_MAX = 20;
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
export const DEFAULT_OPENAI_TIMEOUT_MS = 30_000;
export const DEFAULT_OPENAI_MAX_TOKENS = 1024;

/**
 * Client-only feedback / haptics — not consumed by the api.
 */
export const RETRY_DELAY_MS = 2000;
export const HAPTIC_SUCCESS_MS = 50;
export const HAPTIC_ERROR_PATTERN = [100, 50, 100];
export const TOAST_DURATION_SUCCESS = 3000;
export const TOAST_DURATION_ERROR = 5000;
