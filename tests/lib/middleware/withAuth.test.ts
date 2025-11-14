import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedContext } from '@/lib/middleware/withAuth'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

describe('withAuth middleware', () => {
  const mockAuth = auth as Mock

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    it('should call handler with userId in context', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      })

      await wrappedHandler(request)

      expect(mockHandler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ userId: 'user-123' })
      )
    })

    it('should return the handlers response', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-456' })

      const expectedResponse = NextResponse.json({ data: 'test-data' })
      const mockHandler = vi.fn().mockResolvedValue(expectedResponse)
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const result = await wrappedHandler(request)

      expect(result).toBe(expectedResponse)
    })

    it('should pass through request object unchanged', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-789' })

      let capturedRequest: NextRequest | null = null
      const mockHandler = vi.fn((req: NextRequest) => {
        capturedRequest = req
        return NextResponse.json({ ok: true })
      })

      const wrappedHandler = withAuth(mockHandler)
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      })

      await wrappedHandler(request)

      expect(capturedRequest).toBe(request)
    })

    it('should work with different userIds', async () => {
      const userIds = ['user-1', 'user-2', 'user-3']

      for (const userId of userIds) {
        mockAuth.mockResolvedValue({ userId })

        let capturedContext: AuthenticatedContext | null = null
        const mockHandler = vi.fn((_req: NextRequest, ctx: AuthenticatedContext) => {
          capturedContext = ctx
          return NextResponse.json({ ok: true })
        })

        const wrappedHandler = withAuth(mockHandler)
        const request = new NextRequest('http://localhost:3000/api/test')

        await wrappedHandler(request)

        expect(capturedContext?.userId).toBe(userId)
      }
    })
  })

  describe('when user is not authenticated', () => {
    it('should return 401 when userId is null', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const mockHandler = vi.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await wrappedHandler(request)

      expect(response.status).toBe(401)
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should return 401 when userId is undefined', async () => {
      mockAuth.mockResolvedValue({ userId: undefined })

      const mockHandler = vi.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await wrappedHandler(request)

      expect(response.status).toBe(401)
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should return standard unauthorized error format', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const mockHandler = vi.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(json).toEqual({
        error: 'Unauthorized',
        details: 'Authentication required',
        code: 'UNAUTHORIZED',
      })
    })

    it('should not call handler when authentication fails', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const mockHandler = vi.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      await wrappedHandler(request)

      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should propagate errors from auth() call', async () => {
      const authError = new Error('Auth service unavailable')
      mockAuth.mockRejectedValue(authError)

      const mockHandler = vi.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')

      await expect(wrappedHandler(request)).rejects.toThrow('Auth service unavailable')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should propagate errors from handler', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const handlerError = new Error('Handler failed')
      const mockHandler = vi.fn().mockRejectedValue(handlerError)
      const wrappedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')

      await expect(wrappedHandler(request)).rejects.toThrow('Handler failed')
    })
  })

  describe('type safety', () => {
    it('should enforce userId is always present in context', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      // This test verifies TypeScript types at compile time
      // The handler should always receive userId in context
      const wrappedHandler = withAuth(async (_request, { userId }) => {
        // userId should be typed as string, not string | undefined
        const _userIdLength: number = userId.length
        return NextResponse.json({ userId })
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(json.userId).toBe('user-123')
    })
  })
})
