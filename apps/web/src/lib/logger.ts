type LogData = Record<string, unknown>;

const isDev = process.env.NODE_ENV === 'development';

function sanitize(data?: LogData): LogData | undefined {
  if (!data) return undefined;
  const sanitized = { ...data };
  const sensitiveKeys = ['token', 'password', 'authorization', 'cookie', 'secret'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

export const logger = {
  info(ctx: string, data?: LogData): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[${ctx}]`, sanitize(data) ?? '');
    }
  },
  warn(ctx: string, data?: LogData): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[${ctx}]`, sanitize(data) ?? '');
    }
    // TODO(sentry): Sentry.captureMessage(ctx, { level: 'warning', extra: sanitize(data) })
  },
  error(ctx: string, data?: LogData): void {
    // Always log errors — even in production
    // eslint-disable-next-line no-console
    console.error(`[${ctx}]`, sanitize(data) ?? '');
    // TODO(sentry): Sentry.captureException(data?.error ?? new Error(ctx), { extra: sanitize(data) })
  },
};
