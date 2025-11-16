/**
 * API Timeout Constants
 *
 * Centralized timeout values for API calls to prevent magic numbers.
 */

export const API_TIMEOUTS = {
  /** Timeout for research query generation (30 seconds) */
  RESEARCH_QUERY_GENERATION: 30_000,

  /** Timeout for individual research query execution (20 seconds) */
  RESEARCH_QUERY_EXECUTION: 20_000,

  /** Timeout for PRD generation (60 seconds) */
  PRD_GENERATION: 60_000,

  /** Default timeout for API calls (15 seconds) */
  DEFAULT: 15_000,

  /** Timeout for question generation (30 seconds) */
  QUESTION_GENERATION: 30_000,

  /** Timeout for context extraction (20 seconds) */
  CONTEXT_EXTRACTION: 20_000,
} as const;

/**
 * API Limits and Thresholds
 */
export const API_LIMITS = {
  /** Maximum number of research queries to generate */
  MAX_RESEARCH_QUERIES: 20,

  /** Maximum JSON response size in bytes (50KB) */
  MAX_JSON_RESPONSE_SIZE: 50_000,

  /** Maximum number of retry attempts */
  MAX_RETRIES: 3,

  /** Initial retry delay in milliseconds */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
  /** Maximum concurrent research queries */
  MAX_CONCURRENT_RESEARCH: 5,

  /** Maximum requests per minute */
  MAX_REQUESTS_PER_MINUTE: 60,
} as const;
