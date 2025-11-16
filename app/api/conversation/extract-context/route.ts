import { NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import {
  handleAPIError,
  handleValidationError,
  handleUnauthorizedError,
} from "@/lib/api-error-handler";
import { safeParseAIResponse } from "@/lib/parse-ai-json";
import { getAuthenticatedConvexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { withAuth } from "@/lib/middleware/withAuth";
import { CONTEXT_EXTRACTION_PROMPT } from "@/lib/prompts/conversation";
import { ExtractedContext } from "@/types";

const FALLBACK_CONTEXT = {
  productName: "New Product",
  description: "A product to be defined",
  targetAudience: "Target users",
  keyFeatures: [],
  problemStatement: "To be determined",
  technicalPreferences: [],
  extractedAt: Date.now(),
};

export const POST = withAuth(async (request, { userId, token }) => {
  try {
    const { conversationId } = await request.json();

    if (!conversationId) {
      return handleValidationError("Conversation ID required");
    }

    // Get authenticated Convex client
    const convexClient = getAuthenticatedConvexClient(token);

    // Fetch conversation messages
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

    // Verify ownership
    if (conversation.userId !== userId) {
      return handleUnauthorizedError();
    }

    // Build message history for Claude
    const messageHistory = conversation.messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    // Call Claude to extract context
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_SONNET,
      max_tokens: TOKEN_LIMITS.CONTEXT_EXTRACTION,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: CONTEXT_EXTRACTION_PROMPT.replace(
            "{messages}",
            messageHistory
          ),
        },
      ],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const extractedText = content.text;

    // Use safe parser with fallback
    const contextData = safeParseAIResponse<Partial<ExtractedContext>>(extractedText) || FALLBACK_CONTEXT;

    // Validate extracted context
    const validatedContext = {
      productName: contextData.productName || "Untitled Product",
      description: contextData.description || "",
      targetAudience: contextData.targetAudience || "General users",
      keyFeatures: Array.isArray(contextData.keyFeatures)
        ? contextData.keyFeatures
        : [],
      problemStatement: contextData.problemStatement || "",
      technicalPreferences: Array.isArray(contextData.technicalPreferences)
        ? contextData.technicalPreferences
        : [],
      extractedAt: Date.now(),
    };

    // Save to Convex
    await convexClient.mutation(api.conversations.saveExtractedContext, {
      conversationId: conversationId as Id<"conversations">,
      context: validatedContext,
    });

    return NextResponse.json({
      success: true,
      context: validatedContext,
    });
  } catch (error) {
    return handleAPIError(error, "extract context");
  }
});
