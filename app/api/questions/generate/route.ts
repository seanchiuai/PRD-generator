import { NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError } from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";
import type { Question, QuestionType } from "@/types";
import { withAuth } from "@/lib/middleware/withAuth";
import { QUESTION_GENERATION_PROMPT } from "@/lib/prompts/questions";

// Define the raw AI response structure
interface RawQuestionItem {
  id?: string;
  question: string;
  placeholder?: string;
  answer?: string;
  required?: boolean;
  type?: QuestionType;
  suggestedOptions?: string[];
  category?: string;
}

interface RawCategoryGroup {
  category: string;
  questions: RawQuestionItem[];
}

type RawAIResponse = {
  questions: RawQuestionItem[] | RawCategoryGroup[];
};

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
      const keyFeatures = Array.isArray(extractedContext.keyFeatures)
        ? extractedContext.keyFeatures.join(", ")
        : "";
      const technicalPreferences = Array.isArray(extractedContext.technicalPreferences)
        ? extractedContext.technicalPreferences.join(", ")
        : "";

      contextSection = `
PRODUCT CONTEXT (extracted from discovery):
- Product: ${extractedContext.productName}
- Description: ${extractedContext.description}
- Target Audience: ${extractedContext.targetAudience}
- Key Features: ${keyFeatures || "None specified"}
- Problem: ${extractedContext.problemStatement}
- Technical Preferences: ${technicalPreferences || "None specified"}

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
    const parsedResponse = parseAIResponse<RawAIResponse>(content.text);

    // Normalize response structure
    // AI may return nested structure (grouped by category) or flat structure
    let questions: Question[];
    if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
      const firstItem = parsedResponse.questions[0];

      // Check if nested structure (has 'questions' array inside category groups)
      if (firstItem && "questions" in firstItem && Array.isArray(firstItem.questions)) {
        // Flatten nested structure: extract questions from each category group
        questions = (parsedResponse.questions as RawCategoryGroup[]).flatMap((categoryGroup) =>
          categoryGroup.questions.map((q) => ({
            id: q.id ?? `${categoryGroup.category}-${Math.random().toString(36).substr(2, 9)}`,
            question: q.question,
            placeholder: q.placeholder,
            answer: q.answer,
            category: categoryGroup.category, // Add category field from parent
            required: q.required ?? true, // Default to true if not specified
            type: q.type ?? (q.suggestedOptions && q.suggestedOptions.length > 0 ? "select" : "textarea"), // Default based on options
            suggestedOptions: q.suggestedOptions,
          }))
        );
      } else {
        // Already flat structure - ensure required field exists
        questions = (parsedResponse.questions as RawQuestionItem[]).map((q) => ({
          id: q.id ?? `${q.category ?? 'general'}-${Math.random().toString(36).substr(2, 9)}`,
          question: q.question,
          placeholder: q.placeholder,
          answer: q.answer,
          category: q.category ?? 'general',
          required: q.required ?? true, // Default to true if not specified
          type: q.type ?? (q.suggestedOptions && q.suggestedOptions.length > 0 ? "select" : "textarea"), // Default based on options
          suggestedOptions: q.suggestedOptions,
        }));
      }
    } else {
      throw new Error("Invalid AI response structure: missing questions array");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    return handleAPIError(error, "generate questions");
  }
});