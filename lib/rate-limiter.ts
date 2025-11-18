/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using Upstash Redis or similar persistent store.
 * This implementation uses an in-memory store that resets on server restart.
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  tokensUsed?: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed per window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Maximum tokens allowed per window (optional) */
  maxTokens?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  tokensRemaining?: number;
}

// In-memory store for rate limiting
// Key format: `${type}:${identifier}` (e.g., "user:user123" or "ip:192.168.1.1")
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanupTimer() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't block process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

// Start cleanup on module load
startCleanupTimer();

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  /** Standard API route - 60 requests per minute */
  API_STANDARD: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  /** AI API routes - 20 requests per minute (more expensive) */
  API_AI: {
    maxRequests: 20,
    windowMs: 60 * 1000,
    maxTokens: 100000, // 100k tokens per minute
  },
  /** Strict limit for anonymous/IP-based - 10 requests per minute */
  API_ANONYMOUS: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
} as const;

/**
 * Check and update rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  tokensUsed?: number
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      tokensUsed: tokensUsed || 0,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      tokensRemaining: config.maxTokens ? config.maxTokens - (tokensUsed || 0) : undefined,
    };
  }

  // Check request limit
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      tokensRemaining: config.maxTokens ? config.maxTokens - (entry.tokensUsed || 0) : undefined,
    };
  }

  // Check token limit if configured
  if (config.maxTokens && tokensUsed) {
    const newTokenTotal = (entry.tokensUsed || 0) + tokensUsed;
    if (newTokenTotal > config.maxTokens) {
      return {
        success: false,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        tokensRemaining: config.maxTokens - (entry.tokensUsed || 0),
      };
    }
    entry.tokensUsed = newTokenTotal;
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    tokensRemaining: config.maxTokens ? config.maxTokens - (entry.tokensUsed || 0) : undefined,
  };
}

/**
 * Record token usage after API call completes
 */
export function recordTokenUsage(identifier: string, tokens: number): void {
  const entry = rateLimitStore.get(identifier);
  if (entry) {
    entry.tokensUsed = (entry.tokensUsed || 0) + tokens;
    rateLimitStore.set(identifier, entry);
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIP = forwarded.split(",")[0];
    return firstIP ? firstIP.trim() : "unknown";
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to unknown
  return "unknown";
}

/**
 * Rate limit middleware for API routes
 *
 * @param request - The incoming request
 * @param userId - User ID if authenticated, null for anonymous
 * @param config - Rate limit configuration
 * @returns null if allowed, or error response if rate limited
 */
export function rateLimitRequest(
  request: Request,
  userId: string | null,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.API_AI
): { error: NextResponse } | { identifier: string; result: RateLimitResult } {
  // Use userId for authenticated requests, IP for anonymous
  const identifier = userId
    ? `user:${userId}`
    : `ip:${getClientIP(request)}`;

  const result = checkRateLimit(identifier, config);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    logger.warn("Rate Limit", "Rate limit exceeded", {
      identifier,
      remaining: result.remaining,
      resetTime: new Date(result.resetTime).toISOString(),
    });

    return {
      error: NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(result.resetTime),
          },
        }
      ),
    };
  }

  return { identifier, result };
}

/**
 * Get rate limit headers for successful response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetTime),
    ...(result.tokensRemaining !== undefined && {
      "X-RateLimit-Tokens-Remaining": String(result.tokensRemaining),
    }),
  };
}
