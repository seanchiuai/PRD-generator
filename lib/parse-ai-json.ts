/**
 * AI Response Parsing Utility
 *
 * Extracts and parses JSON from AI responses that may include markdown code blocks.
 */

/**
 * Extracts a complete JSON object or array from text, handling nested structures.
 * Finds the first { or [ and matches it with its corresponding closing brace.
 *
 * @param text - Text containing JSON
 * @returns Extracted JSON string or null if not found
 */
function extractJSON(text: string): string | null {
  const trimmed = text.trim();

  // Find the start of JSON (either { or [)
  if (trimmed[0] !== '{' && trimmed[0] !== '[') {
    // Look for { or [ in the text
    const objectStart = trimmed.indexOf('{');
    const arrayStart = trimmed.indexOf('[');

    let startIndex = -1;

    if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
      startIndex = objectStart;
    } else if (arrayStart !== -1) {
      startIndex = arrayStart;
    } else {
      return null;
    }

    // Count braces to find the matching closing brace
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{' || char === '[') {
        depth++;
      } else if (char === '}' || char === ']') {
        depth--;
        if (depth === 0) {
          return trimmed.substring(startIndex, i + 1);
        }
      }
    }

    return null;
  }

  // JSON starts at the beginning
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;
      if (depth === 0) {
        return trimmed.substring(0, i + 1);
      }
    }
  }

  return null;
}

/**
 * Parses JSON from AI response text
 *
 * AI models often wrap JSON in markdown code blocks (```json ... ```).
 * This function handles both formats:
 * 1. JSON wrapped in markdown code blocks
 * 2. Raw JSON text
 * 3. JSON embedded in conversational text
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
    // Handle various formats: ```json, ```, with/without newlines
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const extracted = jsonMatch[1].trim();
      if (extracted) {
        return JSON.parse(extracted);
      }
    }

    // Fallback to parsing the raw text (trim whitespace)
    const trimmedText = text.trim();

    // If text doesn't start with { or [, try to extract JSON from within the text
    if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
      const extracted = extractJSON(trimmedText);
      if (extracted) {
        return JSON.parse(extracted);
      }
    }

    return JSON.parse(trimmedText);
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
