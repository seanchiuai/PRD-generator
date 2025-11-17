/**
 * Custom error classes for better error handling and type safety
 */

export class NotAuthenticatedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "NotAuthenticatedError";
    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(resource: string) {
    super(`Unauthorized access to ${resource}`);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with ID ${id} not found` : `${resource} not found`);
    this.name = "ResourceNotFoundError";
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class APITimeoutError extends Error {
  constructor(service: string, timeout: number) {
    super(`${service} request timed out after ${timeout}ms`);
    this.name = "APITimeoutError";
    Object.setPrototypeOf(this, APITimeoutError.prototype);
  }
}

export class RateLimitError extends Error {
  constructor(service: string, retryAfter?: number) {
    super(
      retryAfter
        ? `Rate limit exceeded for ${service}. Retry after ${retryAfter}s`
        : `Rate limit exceeded for ${service}`
    );
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
