/**
 * Logger utility — wraps all console calls.
 * In development: logs everything to console.
 * In production: errors route to Sentry, everything else suppressed.
 * Use logger.x everywhere — never call console.x directly in feature code.
 */

const isDev = process.env.APP_ENV !== 'production';

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error('[ERROR]', ...args);
    } else {
      // TODO: Route to Sentry when SENTRY_DSN is configured
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
};
