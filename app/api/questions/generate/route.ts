import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError } from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";
import { QuestionGenerationResponse } from "@/types";
import { withAuth } from "@/lib/middleware/withAuth";
import { QUESTION_GENERATION_PROMPT } from "@/lib/prompts/questions";

/**
 * Generate clarifying questions for a product requirements document using Anthropic and return them as parsed JSON.
 *
 * Authentication is handled by the withAuth middleware wrapper.
 * Sends the provided `productContext` to the Anthropic model, extracts and parses the model's JSON output,
 * and returns the resulting questions.
 *
 * The request body must include a `productContext` object and optionally `extractedContext`.
 *
 * @returns A NextResponse containing the parsed questions JSON on success, or a JSON error with status 500 on failure.
 */
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { productContext, extractedContext } = body;

    // Validate that at least one context is provided
    if (!productContext && !extractedContext) {
      return NextResponse.json(
        { error: "Either productContext or extractedContext is required" },
        { status: 400 }
      );
    }

    // Build context-aware prompt
    let contextSection = "";
    if (extractedContext) {
      contextSection = `
PRODUCT CONTEXT (extracted from discovery):
- Product: ${extractedContext.productName}
- Description: ${extractedContext.description}
- Target Audience: ${extractedContext.targetAudience}
- Key Features: ${extractedContext.keyFeatures.join(", ")}
- Problem: ${extractedContext.problemStatement}
- Technical Preferences: ${extractedContext.technicalPreferences.join(", ")}

Use this context to generate highly relevant questions.
`;
    } else if (productContext) {
      contextSection = JSON.stringify(productContext, null, 2);
    }

    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.QUESTION_GENERATION,
      messages: [
        {
          role: "user",
          content: QUESTION_GENERATION_PROMPT.replace(
            "{productContext}",
            contextSection
          ),
        },
      ],
    });

    // Validate response content array has elements
    if (!response.content || !response.content.length) {
      throw new Error("Empty response content from AI");
    }

    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse AI response using centralized utility
    const parsedResponse = parseAIResponse<any>(content.text);

    // Normalize response structure
    // AI may return nested structure (grouped by category) or flat structure
    let questions: QuestionGenerationResponse["questions"];
    if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
      const firstItem = parsedResponse.questions[0];

      // Check if nested structure (has 'questions' array inside category groups)
      if (firstItem && "questions" in firstItem && Array.isArray(firstItem.questions)) {
        // Flatten nested structure: extract questions from each category group
        questions = parsedResponse.questions.flatMap((categoryGroup: any) =>
          categoryGroup.questions.map((q: any) => ({
            ...q,
            category: categoryGroup.category, // Add category field from parent
          }))
        );
      } else {
        // Already flat structure
        questions = parsedResponse.questions;
      }
    } else {
      throw new Error("Invalid AI response structure: missing questions array");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    return handleAPIError(error, "generate questions");
  }
});