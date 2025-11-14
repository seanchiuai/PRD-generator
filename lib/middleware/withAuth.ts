/**
 * API Route Authentication Middleware
 *
 * Provides a higher-order function to wrap Next.js API route handlers
 * with automatic authentication checking, eliminating boilerplate code.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleUnauthorizedError } from "@/lib/api-error-handler";

/**
 * Authenticated request context
 * Extends the handler with guaranteed userId
 */
export interface AuthenticatedContext {
  userId: string;
}

/**
 * Type for authenticated route handlers
 */
export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route handler with authentication
 *
 * Automatically checks Clerk authentication and returns 401 if not authenticated.
 * If authenticated, the handler receives a context object with the guaranteed userId.
 *
 * @param handler - The authenticated route handler function
 * @returns A Next.js API route handler with auth checking
 *
 * @example
 * // Before: Manual auth checking in every route
 * export async function POST(request: NextRequest) {
 *   const { userId } = await auth();
 *   if (!userId) return handleUnauthorizedError();
 *   // ... rest of handler
 * }
 *
 * // After: Using withAuth wrapper
 * export const POST = withAuth(async (request, { userId }) => {
 *   // userId is guaranteed to be present
 *   // ... handler logic
 * });
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async function authenticatedRoute(
    request: NextRequest
  ): Promise<NextResponse> {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return handleUnauthorizedError();
    }

    // Call the original handler with authenticated context
    return handler(request, { userId });
  };
}
