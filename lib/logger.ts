/**
 * Structured Logging Utility
 *
 * Provides production-ready logging with context and metadata.
 * Replace with external logging service (Sentry, LogRocket) in production.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Logs an error with context and metadata
   */
  error(context: string, error: unknown, metadata?: LogMetadata): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.log("error", context, errorMessage, {
      stack: errorStack,
      ...metadata,
    });
  }

  /**
   * Logs a warning message
   */
  warn(context: string, message: string, metadata?: LogMetadata): void {
    this.log("warn", context, message, metadata);
  }

  /**
   * Logs an informational message
   */
  info(context: string, message: string, metadata?: LogMetadata): void {
    this.log("info", context, message, metadata);
  }

  /**
   * Logs a debug message (only in development)
   */
  debug(context: string, message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      this.log("debug", context, message, metadata);
    }
  }

  /**
   * Internal logging method
   */
  private log(
    level: LogLevel,
    context: string,
    message: string,
    metadata?: LogMetadata
  ): void {
    const timestamp = new Date().toISOString();

    if (this.isDevelopment) {
      const logFn = level === "error" ? console.error :
                    level === "warn" ? console.warn : console.log;
      logFn(`[${level.toUpperCase()}] [${timestamp}] ${context}:`, message, metadata);
    } else {
      console.log(JSON.stringify({
        level,
        timestamp,
        context,
        message,
        ...metadata,
      }));
    }
  }
}

export const logger = new Logger();
