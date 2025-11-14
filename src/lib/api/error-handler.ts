/**
 * Standardized API Error Handling
 *
 * Provides consistent error responses across all API routes.
 */

import { NextResponse } from "next/server";
import { APIError } from "@/types";

/**
 * Handles API errors with consistent format and logging
 *
 * @param error - The error object (Error, string, or unknown)
 * @param context - Description of the operation that failed (e.g., "generate PRD", "validate tech stack")
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse with standardized error format
 */
export function handleAPIError(
  error: unknown,
  context: string,
  statusCode: number = 500
): NextResponse<APIError> {
  // Log the full error for debugging
  console.error(`${context} Error:`, error);

  // Extract error message
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  // Create standardized error response
  const apiError: APIError = {
    error: `Failed to ${context}`,
    details: errorMessage,
  };

  // Add error code if available
  if (error instanceof Error && "code" in error) {
    apiError.code = (error as Error & { code: string }).code;
  }

  return NextResponse.json(apiError, { status: statusCode });
}

/**
 * Handles validation errors specifically
 *
 * @param message - Validation error message
 * @param details - Additional details about what failed validation
 * @returns NextResponse with 400 status
 */
export function handleValidationError(
  message: string,
  details?: string
): NextResponse<APIError> {
  const apiError: APIError = {
    error: message,
    details: details || "Request validation failed",
    code: "VALIDATION_ERROR",
  };

  console.error("Validation Error:", apiError);
  return NextResponse.json(apiError, { status: 400 });
}

/**
 * Handles unauthorized access errors
 *
 * @returns NextResponse with 401 status
 */
export function handleUnauthorizedError(): NextResponse<APIError> {
  return NextResponse.json(
    {
      error: "Unauthorized",
      details: "Authentication required",
      code: "UNAUTHORIZED",
    },
    { status: 401 }
  );
}
