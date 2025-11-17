import { describe, it, expect } from 'vitest'
import { parseAIResponse, safeParseAIResponse } from '@/lib/parse-ai-json'

describe('parseAIResponse', () => {
  describe('JSON wrapped in markdown code blocks', () => {
    it('should parse JSON from markdown code block', () => {
      const input = '```json\n{"name": "test", "value": 123}\n```'
      const result = parseAIResponse<{ name: string; value: number }>(input)

      expect(result).toEqual({ name: 'test', value: 123 })
    })

    it('should parse complex nested JSON from code block', () => {
      const input = '```json\n{"user": {"name": "John", "age": 30}, "items": [1, 2, 3]}\n```'
      const result = parseAIResponse(input)

      expect(result).toEqual({
        user: { name: 'John', age: 30 },
        items: [1, 2, 3]
      })
    })

    it('should handle extra whitespace in code blocks', () => {
      const input = '```json\n\n  {"name": "test"}  \n\n```'
      const result = parseAIResponse(input)

      expect(result).toEqual({ name: 'test' })
    })
  })

  describe('Raw JSON text', () => {
    it('should parse raw JSON when no code block present', () => {
      const input = '{"name": "test", "value": 456}'
      const result = parseAIResponse(input)

      expect(result).toEqual({ name: 'test', value: 456 })
    })

    it('should trim whitespace from raw JSON', () => {
      const input = '  \n  {"name": "test"}  \n  '
      const result = parseAIResponse(input)

      expect(result).toEqual({ name: 'test' })
    })

    it('should parse arrays as raw JSON', () => {
      const input = '[{"id": 1}, {"id": 2}]'
      const result = parseAIResponse(input)

      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  describe('Error handling', () => {
    it('should throw error for invalid JSON', () => {
      const input = 'This is not JSON at all'

      expect(() => parseAIResponse(input)).toThrow(/Failed to parse AI response/)
    })

    it('should throw error for malformed JSON in code block', () => {
      const input = '```json\n{invalid json}\n```'

      expect(() => parseAIResponse(input)).toThrow(/Failed to parse AI response/)
    })

    it('should include preview of input in error message', () => {
      const longInput = 'x'.repeat(200) + '{invalid}'

      try {
        parseAIResponse(longInput)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toContain('Preview:')
          expect(error.message.length).toBeLessThan(300) // Preview should be truncated
        }
      }
    })
  })

  describe('Conversational preambles', () => {
    it('should extract JSON from text with conversational preamble', () => {
      const input = 'I\'ll create a comprehensive PRD for you. {"name": "test", "value": 123}'
      const result = parseAIResponse(input)

      expect(result).toEqual({ name: 'test', value: 123 })
    })

    it('should extract JSON with non-greedy match (stops at first closing brace)', () => {
      const input = 'Response: {"valid":"json"} some text {something}'
      const result = parseAIResponse(input)

      expect(result).toEqual({ valid: 'json' })
    })

    it('should handle preamble with nested JSON object', () => {
      const input = 'Here is the data: {"user": {"name": "John", "age": 30}} Additional context {}'
      const result = parseAIResponse(input)

      expect(result).toEqual({ user: { name: 'John', age: 30 } })
    })

    it('should extract complex JSON from conversational response', () => {
      const input = 'I\'ll prepare the PRD now. {"projectOverview": {"productName": "Test App", "description": "A test"}, "features": []}'
      const result = parseAIResponse(input)

      expect(result).toEqual({
        projectOverview: { productName: 'Test App', description: 'A test' },
        features: []
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty object', () => {
      const input = '```json\n{}\n```'
      const result = parseAIResponse(input)

      expect(result).toEqual({})
    })

    it('should handle empty array', () => {
      const input = '[]'
      const result = parseAIResponse(input)

      expect(result).toEqual([])
    })

    it('should handle JSON with special characters', () => {
      const input = '{"message": "Hello\\nWorld\\t!"}'
      const result = parseAIResponse(input)

      expect(result).toEqual({ message: 'Hello\nWorld\t!' })
    })
  })
})

describe('safeParseAIResponse', () => {
  it('should return parsed object for valid JSON', () => {
    const input = '{"name": "test"}'
    const result = safeParseAIResponse(input)

    expect(result).toEqual({ name: 'test' })
  })

  it('should return null for invalid JSON instead of throwing', () => {
    const input = 'This is not JSON'
    const result = safeParseAIResponse(input)

    expect(result).toBeNull()
  })

  it('should return null for malformed JSON in code block', () => {
    const input = '```json\n{invalid}\n```'
    const result = safeParseAIResponse(input)

    expect(result).toBeNull()
  })

  it('should handle complex valid JSON safely', () => {
    const input = '```json\n{"users": [{"id": 1, "name": "John"}], "count": 1}\n```'
    const result = safeParseAIResponse(input)

    expect(result).toEqual({
      users: [{ id: 1, name: 'John' }],
      count: 1
    })
  })
})
