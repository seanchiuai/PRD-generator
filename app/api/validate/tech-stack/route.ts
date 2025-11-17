import { NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError } from "@/lib/api-error-handler";
import { safeParseAIResponse } from "@/lib/parse-ai-json";
import { ValidationWarning } from "@/types";
import { withAuth } from "@/lib/middleware/withAuth";
import { TECH_STACK_VALIDATION_PROMPT } from "@/lib/prompts/validation";

interface ValidationResponse {
  errors: Array<{
    message: string;
    affectedTechnologies: string[];
    suggestion?: string;
  }>;
  warnings: Array<{
    message: string;
    affectedTechnologies: string[];
    suggestion?: string;
  }>;
}

/**
 * Validate a submitted tech-stack selection using Anthropic Claude and return consolidated warnings and errors.
 *
 * Authentication is handled by the withAuth middleware wrapper.
 * The request body must include `selections: Record<string, string>` mapping categories to chosen technologies.
 *
 * @returns A JSON response containing an array of validation warnings/errors, or an error response on failure.
 */
export const POST = withAuth(async (request, { userId: _userId }) => {
  try {
    const body = await request.json();
    const { selections } = body as { selections: Record<string, string> };

    if (!selections || Object.keys(selections).length === 0) {
      return NextResponse.json({ warnings: [] });
    }

    // Build prompt with selections
    const selectionsText = Object.entries(selections)
      .map(([category, name]) => `${category}: ${name}`)
      .join("\n");

    const prompt = TECH_STACK_VALIDATION_PROMPT.replace("{selections}", selectionsText);

    // Call Claude for validation
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.VALIDATION,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse JSON response with fallback
    const validationResult = safeParseAIResponse<ValidationResponse>(content.text) || {
      errors: [],
      warnings: [],
    };

    // Format warnings with proper types
    const warnings: ValidationWarning[] = [
      ...validationResult.errors.map((e) => ({
        level: "error" as const,
        message: e.message,
        affectedTechnologies: e.affectedTechnologies,
        suggestion: e.suggestion,
      })),
      ...validationResult.warnings.map((w) => ({
        level: "warning" as const,
        message: w.message,
        affectedTechnologies: w.affectedTechnologies,
        suggestion: w.suggestion,
      })),
    ];

    return NextResponse.json({ warnings });
  } catch (error) {
    return handleAPIError(error, "validate tech stack");
  }
});