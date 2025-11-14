import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError } from "@/lib/api-error-handler";
import { safeParseAIResponse } from "@/lib/parse-ai-json";
import { ValidationWarning } from "@/types";
import { withAuth } from "@/lib/middleware/withAuth";

const VALIDATION_PROMPT = `You are a tech stack architecture expert. Analyze the following technology selections for compatibility issues.

Selected Technologies:
{selections}

Provide:
1. Any INCOMPATIBLE combinations (these prevent the stack from working)
2. Any WARNINGS about suboptimal combinations (these work but have issues)
3. SUGGESTIONS for better alternatives if issues exist

Format your response as JSON:
{
  "errors": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech A", "Tech B"],
      "suggestion": "Try using X instead of Y"
    }
  ],
  "warnings": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech C"],
      "suggestion": "Consider Z for better performance"
    }
  ]
}

Only include actual issues. If the stack is compatible, return empty arrays.`;

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
 * @param request - NextRequest whose JSON body must include `selections: Record<string, string>` mapping categories to chosen technologies.
 * @returns A JSON response containing either:
 *  - `warnings`: an array of entries `{ level: "error" | "warning", message, affectedTechnologies, suggestion }` when validation completes, or
 *  - `error`: an error message when the request is unauthorized (401) or an internal validation failure occurs (500).
 */
export const POST = withAuth(async (request) => {
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

    const prompt = VALIDATION_PROMPT.replace("{selections}", selectionsText);

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
    if (content.type !== "text") {
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