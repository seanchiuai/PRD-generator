import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleUnauthorizedError } from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";
import { QuestionGenerationResponse } from "@/types";

const QUESTION_GENERATION_PROMPT = `Generate 12-15 clarifying questions for creating a Product Requirements Document.

Context from discovery:
{productContext}

Generate questions in these categories:
1. Core Features (3-4 questions)
2. User Types & Personas (2-3 questions)
3. Data Requirements (2-3 questions)
4. Scalability & Performance (2 questions)
5. Integrations & Third-party Services (2 questions)
6. Technical Constraints (1-2 questions)

Requirements:
- Questions must be specific to THIS product, not generic
- Mix of open-ended and specific questions
- Answers should inform tech stack decisions
- Keep questions concise and clear
- For each question, provide 2 intelligent suggested answer options based on the product context
- Suggested options should be:
  * Product-specific (not generic)
  * Concise (3-10 words each)
  * Mutually exclusive
  * Helpful starting points for the user

Output format (JSON only, no markdown):
{
  "questions": [
    {
      "id": "unique-id",
      "category": "Core Features",
      "question": "What specific actions should users be able to perform?",
      "placeholder": "e.g., Create projects, invite team members...",
      "required": true,
      "type": "textarea",
      "suggestedOptions": ["Create and share content", "Search and discover items"]
    }
  ]
}`;

/**
 * Generate clarifying questions for a product requirements document using Anthropic and return them as parsed JSON.
 *
 * Sends the provided `productContext` to the Anthropic model, extracts and parses the model's JSON output (handling optional markdown code fences), and returns the resulting questions.
 *
 * @param request - The incoming NextRequest whose JSON body must include a `productContext` object.
 * @returns A NextResponse containing the parsed questions JSON on success; responds with `{ error: "Unauthorized" }` and status 401 when the user is not authenticated, or with `{ error: "Failed to generate questions" }` and status 500 on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleUnauthorizedError();
    }

    const { productContext } = await request.json();

    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.QUESTION_GENERATION,
      messages: [
        {
          role: "user",
          content: QUESTION_GENERATION_PROMPT.replace(
            "{productContext}",
            JSON.stringify(productContext, null, 2)
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
}