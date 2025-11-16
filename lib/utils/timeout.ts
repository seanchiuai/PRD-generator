/**
 * Timeout and AbortController Utilities
 *
 * Provides reusable timeout management for API calls with proper cleanup.
 */

export interface TimeoutConfig {
  timeoutMs: number;
  onTimeout?: () => void;
}

export interface AbortControllerWithCleanup {
  controller: AbortController;
  cleanup: () => void;
  signal: AbortSignal;
}

/**
 * Creates an AbortController with automatic timeout and cleanup
 *
 * @example
 * const { controller, cleanup, signal } = createAbortController({ timeoutMs: 30000 });
 * try {
 *   await fetch(url, { signal });
 * } finally {
 *   cleanup();
 * }
 */
export function createAbortController(config: TimeoutConfig): AbortControllerWithCleanup {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
    config.onTimeout?.();
  }, config.timeoutMs);

  return {
    controller,
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/**
 * Executes an async function with a timeout
 *
 * @example
 * const result = await withTimeout(
 *   async (signal) => fetch(url, { signal }),
 *   { timeoutMs: 30000 }
 * );
 */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  config: TimeoutConfig
): Promise<T> {
  const { signal, cleanup } = createAbortController(config);

  try {
    return await fn(signal);
  } finally {
    cleanup();
  }
}
