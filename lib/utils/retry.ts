/**
 * Retry Utility for Transient Failures
 *
 * Provides exponential backoff retry logic for API calls.
 */

import { logger } from "@/lib/logger";
import { API_LIMITS } from "@/lib/constants/timeouts";

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Initial delay in milliseconds (default: 1000ms) */
  delayMs?: number;

  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;

  /** Optional function to determine if error should be retried */
  shouldRetry?: (error: Error) => boolean;

  /** Optional callback for retry attempts */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Executes a function with retry logic and exponential backoff
 *
 * @example
 * const data = await withRetry(
 *   async () => fetch('/api/data').then(r => r.json()),
 *   { maxRetries: 3, delayMs: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = API_LIMITS.MAX_RETRIES,
    delayMs = API_LIMITS.RETRY_DELAY_MS,
    exponentialBackoff = true,
    shouldRetry,
    onRetry,
  } = config;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === maxRetries;

      // Check if we should retry this error
      const shouldRetryError = shouldRetry?.(lastError) ?? isRetryableError(lastError);

      if (isLastAttempt || !shouldRetryError) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff
        ? delayMs * Math.pow(2, attempt)
        : delayMs;

      logger.warn(
        "Retry Attempt",
        `Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        { error: lastError.message, attempt, delay }
      );

      onRetry?.(attempt + 1, lastError);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError ?? new Error("Retry failed");
}

/**
 * Determines if an error is retryable (network errors, timeouts, 5xx errors)
 */
function isRetryableError(error: Error): boolean {
  // AbortError from timeout - retryable
  if (error.name === 'AbortError') {
    return true;
  }

  // Network errors - retryable
  if (error.message.includes('fetch failed') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED')) {
    return true;
  }

  // Check for HTTP status codes in error message
  const statusMatch = error.message.match(/status (\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    // Retry on 5xx errors and 429 (too many requests)
    return status >= 500 || status === 429;
  }

  return false;
}
