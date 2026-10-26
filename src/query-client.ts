// Single shared React Query client. Exported so the mock dev panel
// (issue #95) can invalidate every cache when the scenario/role changes —
// main.tsx mounts the same instance, so app behaviour is unchanged.
import { QueryClient } from '@tanstack/react-query';
import { isAbortError, RateLimitError } from './services/api-client';

const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;

/**
 * Retry policy (issues #123, #80): one automatic retry for transient
 * failures (network blips, a cold-starting backend answering slowly), never
 * for a cancellation — an aborted request is not a failure, and retrying it
 * would fire a request no component is waiting for any more.
 */
export function shouldRetry(failureCount: number, error?: unknown): boolean {
  return !isAbortError(error) && failureCount < 1;
}

/**
 * Exponential backoff, except when the server said how long to wait: a 429's
 * `Retry-After` is a floor, so a query retry can never fire sooner than
 * docforum-core allows (issue #80).
 */
export function retryDelay(failureCount: number, error?: unknown): number {
  if (error instanceof RateLimitError) return error.retryAfterMs;
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(0, failureCount - 1), MAX_RETRY_DELAY_MS);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay,
      refetchOnWindowFocus: false,
    },
  },
});
