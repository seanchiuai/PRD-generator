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
 * Sends the provided `productContext` to the Anthropic model, extracts and parses the model's JSON output (handling optional markdown code fences), and returns the resulting questions.
 *
 * @param request - The incoming NextRequest whose JSON body must include a `productContext` object.
 * @returns A NextResponse containing the parsed questions JSON on success; responds with `{ error: "Unauthorized" }` and status 401 when the user is not authenticated, or with `{ error: "Failed to generate questions" }` and status 500 on failure.
 */
export const POST = withAuth(async (request) => {
  try {
    const { productContext, extractedContext } = await request.json();

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

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse AI response using centralized utility
    const questions = parseAIResponse<QuestionGenerationResponse>(content.text);

    return NextResponse.json(questions);
  } catch (error) {
    return handleAPIError(error, "generate questions");
  }
});