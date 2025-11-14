import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleAPIError,
  handleValidationError,
  handleUnauthorizedError,
} from '@/lib/api-error-handler'

// Mock console.error to avoid cluttering test output
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('handleAPIError', () => {
  it('should return 500 status by default', () => {
    const error = new Error('Test error')
    const response = handleAPIError(error, 'test operation')

    expect(response.status).toBe(500)
  })

  it('should use custom status code when provided', () => {
    const error = new Error('Test error')
    const response = handleAPIError(error, 'test operation', 404)

    expect(response.status).toBe(404)
  })

  it('should return standardized error format', async () => {
    const error = new Error('Something went wrong')
    const response = handleAPIError(error, 'process data')
    const json = await response.json()

    expect(json).toEqual({
      error: 'Failed to process data',
      details: 'Something went wrong',
    })
  })

  it('should handle Error instances with message', async () => {
    const error = new Error('Specific error message')
    const response = handleAPIError(error, 'validate input')
    const json = await response.json()

    expect(json.details).toBe('Specific error message')
  })

  it('should handle non-Error objects gracefully', async () => {
    const error = 'String error'
    const response = handleAPIError(error, 'test operation')
    const json = await response.json()

    expect(json.details).toBe('Unknown error')
  })

  it('should include error code if present', async () => {
    const error = new Error('API rate limit exceeded') as Error & { code: string }
    error.code = 'RATE_LIMIT_EXCEEDED'

    const response = handleAPIError(error, 'make API call')
    const json = await response.json()

    expect(json.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('should log error with context', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    const error = new Error('Test error')

    handleAPIError(error, 'test operation')

    expect(consoleErrorSpy).toHaveBeenCalledWith('test operation Error:', error)
  })
})

describe('handleValidationError', () => {
  it('should return 400 status', () => {
    const response = handleValidationError('Invalid input')

    expect(response.status).toBe(400)
  })

  it('should return validation error format', async () => {
    const response = handleValidationError('Email is required')
    const json = await response.json()

    expect(json).toEqual({
      error: 'Email is required',
      details: 'Request validation failed',
      code: 'VALIDATION_ERROR',
    })
  })

  it('should use custom details when provided', async () => {
    const response = handleValidationError(
      'Invalid format',
      'Expected ISO 8601 date string'
    )
    const json = await response.json()

    expect(json.details).toBe('Expected ISO 8601 date string')
  })

  it('should log validation error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')

    handleValidationError('Test validation error')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Validation Error:',
      expect.objectContaining({
        error: 'Test validation error',
        code: 'VALIDATION_ERROR',
      })
    )
  })
})

describe('handleUnauthorizedError', () => {
  it('should return 401 status', () => {
    const response = handleUnauthorizedError()

    expect(response.status).toBe(401)
  })

  it('should return unauthorized error format', async () => {
    const response = handleUnauthorizedError()
    const json = await response.json()

    expect(json).toEqual({
      error: 'Unauthorized',
      details: 'Authentication required',
      code: 'UNAUTHORIZED',
    })
  })

  it('should have consistent structure', async () => {
    const response = handleUnauthorizedError()
    const json = await response.json()

    expect(json).toHaveProperty('error')
    expect(json).toHaveProperty('details')
    expect(json).toHaveProperty('code')
    expect(Object.keys(json)).toHaveLength(3)
  })
})

describe('Error handler consistency', () => {
  it('should all return NextResponse with json method', () => {
    const apiError = handleAPIError(new Error('test'), 'test')
    const validationError = handleValidationError('test')
    const unauthorizedError = handleUnauthorizedError()

    expect(typeof apiError.json).toBe('function')
    expect(typeof validationError.json).toBe('function')
    expect(typeof unauthorizedError.json).toBe('function')
  })

  it('should all include error and details fields', async () => {
    const apiError = await handleAPIError(new Error('test'), 'test').json()
    const validationError = await handleValidationError('test').json()
    const unauthorizedError = await handleUnauthorizedError().json()

    expect(apiError).toHaveProperty('error')
    expect(apiError).toHaveProperty('details')

    expect(validationError).toHaveProperty('error')
    expect(validationError).toHaveProperty('details')

    expect(unauthorizedError).toHaveProperty('error')
    expect(unauthorizedError).toHaveProperty('details')
  })
})
