/**
 * Safe JSON Parser Utilities
 *
 * Provides secure JSON parsing with size limits and error handling.
 */

import { API_LIMITS } from "@/lib/constants/timeouts";
import { logger } from "@/lib/logger";

export interface ParseOptions {
  /** Maximum JSON string size in characters (defaults to API_LIMITS.MAX_JSON_RESPONSE_SIZE) */
  maxSize?: number;
  /** Whether to log parsing errors (defaults to true) */
  logErrors?: boolean;
  /** Context string for error logging */
  context?: string;
}

export class JSONParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly jsonPreview?: string
  ) {
    super(message);
    this.name = "JSONParseError";
  }
}

/**
 * Safely parse JSON with size validation and error handling
 *
 * @example
 * const data = safeJSONParse<MyType>(jsonString, {
 *   maxSize: 100000,
 *   context: "User API Response"
 * });
 */
export function safeJSONParse<T = unknown>(
  jsonString: string,
  options: ParseOptions = {}
): T {
  const {
    maxSize = API_LIMITS.MAX_JSON_RESPONSE_SIZE,
    logErrors = true,
    context = "JSON parsing",
  } = options;

  // Validate size before parsing to prevent DoS
  if (jsonString.length > maxSize) {
    const error = new JSONParseError(
      `JSON string too large: ${jsonString.length} characters (max: ${maxSize})`,
      undefined,
      jsonString.substring(0, 100)
    );

    if (logErrors) {
      logger.error(context, error, {
        size: jsonString.length,
        maxSize,
        preview: jsonString.substring(0, 100),
      });
    }

    throw error;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    const parseError = new JSONParseError(
      "Failed to parse JSON",
      error instanceof Error ? error : undefined,
      jsonString.substring(0, 100)
    );

    if (logErrors) {
      logger.error(context, parseError, {
        originalError: error,
        preview: jsonString.substring(0, 100),
      });
    }

    throw parseError;
  }
}

/**
 * Extract JSON from text that may contain markdown code blocks or extra content
 *
 * Tries to find JSON in this order:
 * 1. JSON code block (```json ... ```)
 * 2. First valid JSON object or array in the text
 *
 * @example
 * const json = extractJSON("Here's the data: ```json\n{\"foo\": \"bar\"}\n```");
 */
export function extractJSON(text: string): string | null {
  // Try code block first
  const codeBlockMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  // Try to find JSON array
  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return text.substring(arrayStart, arrayEnd + 1);
  }

  // Try to find JSON object
  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return text.substring(objectStart, objectEnd + 1);
  }

  return null;
}

/**
 * Extract and parse JSON from text in one step
 *
 * @example
 * const data = extractAndParseJSON<MyType>(
 *   "Response: ```json\n[{\"id\": 1}]\n```",
 *   { context: "API Response" }
 * );
 */
export function extractAndParseJSON<T = unknown>(
  text: string,
  options: ParseOptions = {}
): T {
  const jsonString = extractJSON(text);

  if (!jsonString) {
    const error = new JSONParseError(
      "Could not find valid JSON in text",
      undefined,
      text.substring(0, 100)
    );

    if (options.logErrors !== false) {
      logger.error(options.context || "JSON extraction", error, {
        textPreview: text.substring(0, 200),
      });
    }

    throw error;
  }

  return safeJSONParse<T>(jsonString, options);
}
