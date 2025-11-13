/**
 * AI Response Parsing Utility
 *
 * Extracts and parses JSON from AI responses that may include markdown code blocks.
 */

/**
 * Parses JSON from AI response text
 *
 * AI models often wrap JSON in markdown code blocks (```json ... ```).
 * This function handles both formats:
 * 1. JSON wrapped in markdown code blocks
 * 2. Raw JSON text
 *
 * @param text - Raw text response from AI
 * @returns Parsed JSON object
 * @throws Error if JSON parsing fails
 *
 * @example
 * const response = await anthropic.messages.create(...);
 * const data = parseAIResponse<PRDData>(response.content[0].text);
 */
export function parseAIResponse<T>(text: string): T {
  try {
    // Try to extract JSON from markdown code block first
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }

    // Fallback to parsing the raw text (trim whitespace)
    return JSON.parse(text.trim());
  } catch (error) {
    // Provide helpful error message
    const preview = text.substring(0, 100);
    throw new Error(
      `Failed to parse AI response as JSON. Preview: ${preview}... Original error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Safely parses AI response with error handling
 *
 * Returns null instead of throwing on parse failure.
 *
 * @param text - Raw text response from AI
 * @returns Parsed JSON object or null if parsing fails
 */
export function safeParseAIResponse<T>(text: string): T | null {
  try {
    return parseAIResponse<T>(text);
  } catch {
    return null;
  }
}
