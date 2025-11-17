import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test'
}
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.PERPLEXITY_API_KEY = 'test-perplexity-key'
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
