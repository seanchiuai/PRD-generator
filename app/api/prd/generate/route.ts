import { NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError, handleUnauthorizedError } from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";
import { withAuth } from "@/lib/middleware/withAuth";
import { PRD_SYSTEM_PROMPT } from "@/lib/prompts/prd-generation";
import { PRDData, Message, Question } from "@/types";
import { getAuthenticatedConvexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Generate a Product Requirements Document (PRD) JSON from a product discovery conversation.
 *
 * Authentication is handled by the withAuth middleware wrapper.
 * Builds a prompt from the provided conversationData (messages, clarifying questions, and optional selected tech stack),
 * sends it to the Anthropic Claude model to generate a PRD, parses the model's JSON output,
 * validates that the PRD includes a product name, and returns the parsed PRD along with model usage metadata.
 *
 * The request body must include `conversationId` to verify ownership.
 *
 * @returns A JSON object containing `prdData` (the parsed PRD structure) and `usage` (Anthropic response usage).
 * On error returns a JSON error with status 400 (validation error), 401 (unauthorized), 404 (not found), or 500 (generation/parse errors).
 */
export const POST = withAuth(async (request, { userId, token }) => {
  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return handleValidationError("Conversation ID required");
    }

    // Get authenticated Convex client
    const convexClient = getAuthenticatedConvexClient(token);

    // Fetch and verify conversation ownership
    const conversation = await convexClient.query(api.conversations.get, {
      conversationId: conversationId as Id<"conversations">,
    });

    if (!conversation) {
      return handleAPIError(
        new Error("Conversation not found"),
        "find conversation",
        404
      );
    }

    if (conversation.userId !== userId) {
      return handleUnauthorizedError();
    }

    // Build conversation data from the verified conversation
    const conversationData = {
      messages: conversation.messages,
      clarifyingQuestions: conversation.clarifyingQuestions,
      selectedTechStack: conversation.selectedTechStack,
    };

    // Build comprehensive prompt
    const userPrompt = `
# Product Discovery Conversation
${conversationData.messages?.map((m: Message) => `${m.role}: ${m.content}`).join("\n") || "No messages"}

# Clarifying Questions & Answers
${conversationData.clarifyingQuestions
  ?.map((q: Question) => `Q: ${q.question}\nA: ${q.answer || "Not answered"}`)
  .join("\n\n") || "No questions answered"}

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
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse JSON response using centralized utility
    const prdData = parseAIResponse<PRDData>(content.text);

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