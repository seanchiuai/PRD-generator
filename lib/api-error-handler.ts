/**
 * Standardized API Error Handling
 *
 * Provides consistent error responses across all API routes.
 */

import { NextResponse } from "next/server";
import { APIError } from "@/types";
import { logger } from "@/lib/logger";

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
  logger.error(`${context} Error`, context, error);

  // Extract error message
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  // Create standardized error response
  const apiError: APIError = {
    error: `Failed to ${context}`,
    details: errorMessage,
  };

  // Add error code if available
  if (error instanceof Error && "code" in error && typeof (error as Error & { code?: string }).code === "string") {
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

  logger.error("Validation Error", "validation", apiError);
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
