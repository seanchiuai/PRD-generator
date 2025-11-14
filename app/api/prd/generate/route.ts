import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError } from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";
import { withAuth } from "@/lib/middleware/withAuth";
import { PRD_SYSTEM_PROMPT } from "@/lib/prompts/prd-generation";

/**
 * Generate a Product Requirements Document (PRD) JSON from a product discovery conversation.
 *
 * Builds a prompt from the provided conversationData (messages, clarifying questions, and optional selected tech stack),
 * sends it to the Anthropic Claude model to generate a PRD, parses the model's JSON output (including JSON wrapped in ```json code blocks),
 * validates that the PRD includes a product name, and returns the parsed PRD along with model usage metadata.
 *
 * @param request - NextRequest whose JSON body must include `conversationData` with `messages` and optional `clarifyingQuestions` and `selectedTechStack`.
 * @returns A JSON object containing `prdData` (the parsed PRD structure) and `usage` (Anthropic response usage). On error returns a JSON error with an appropriate HTTP status: 400 if conversation data is missing, 401 if the user is unauthorized, or 500 for other failures (including parse or validation errors).
 */
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { conversationData } = body;

    if (!conversationData) {
      return handleValidationError("Conversation data required");
    }

    // Build comprehensive prompt
    const userPrompt = `
# Product Discovery Conversation
${conversationData.messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

# Clarifying Questions & Answers
${conversationData.clarifyingQuestions
  ?.map((q: any) => `Q: ${q.question}\nA: ${q.answer || "Not answered"}`)
  .join("\n\n")}

# Selected Tech Stack
${
  conversationData.selectedTechStack
    ? `Frontend: ${conversationData.selectedTechStack.frontend?.name || "Not selected"}
Backend: ${conversationData.selectedTechStack.backend?.name || "Not selected"}
Database: ${conversationData.selectedTechStack.database?.name || "Not selected"}
Authentication: ${conversationData.selectedTechStack.authentication?.name || "Not selected"}
Hosting: ${conversationData.selectedTechStack.hosting?.name || "Not selected"}`
    : "Tech stack not yet selected"
}

Generate a complete PRD for this product.
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.PRD_GENERATION,
      system: PRD_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse JSON response using centralized utility
    const prdData = parseAIResponse(content.text);

    // Validate required fields
    if (!prdData.projectOverview?.productName) {
      throw new Error("Invalid PRD structure: missing productName");
    }

    return NextResponse.json({
      prdData,
      usage: response.usage,
    });
  } catch (error) {
    return handleAPIError(error, "generate PRD");
  }
});