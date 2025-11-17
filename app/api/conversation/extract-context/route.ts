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
import type { Id } from "@/convex/_generated/dataModel";
import { withAuth } from "@/lib/middleware/withAuth";
import { CONTEXT_EXTRACTION_PROMPT } from "@/lib/prompts/conversation";
import type { ExtractedContext } from "@/types";

const FALLBACK_CONTEXT = {
  productName: "New Product",
  description: "A product to be defined",
  targetAudience: "Target users",
  keyFeatures: [],
  problemStatement: "To be determined",
  technicalPreferences: [],
  extractedAt: Date.now(),
};

/**
 * Helper to ensure a value is an array of strings
 */
const ensureArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((el): el is string => typeof el === "string");
};

export const POST = withAuth(async (request, { userId, token }) => {
  try {
    const { conversationId } = await request.json();

    if (!conversationId || typeof conversationId !== "string") {
      return handleValidationError("Valid conversation ID required");
    }

    // Get authenticated Convex client
    const convexClient = getAuthenticatedConvexClient(token);

    // Fetch conversation messages with error handling for invalid ID
    let conversation;
    try {
      conversation = await convexClient.query(api.conversations.get, {
        conversationId: conversationId as Id<"conversations">,
      });
    } catch {
      return handleAPIError(
        new Error("Invalid conversation ID format"),
        "validate conversation ID",
        400
      );
    }

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

    // Build message history for Claude with sanitization
    const PER_MESSAGE_LIMIT = 2000;
    const TOTAL_HISTORY_LIMIT = 10000;

    const sanitizeContent = (content: string): string => {
      return content
        .trim()
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/`{3,}/g, '``') // Escape multiple backticks
        .slice(0, PER_MESSAGE_LIMIT);
    };

    const messages = conversation.messages
      .map((m) => {
        const role = m.role === "user" ? "User" : "Assistant";
        const sanitized = sanitizeContent(m.content);
        return `${role}: ${sanitized}`;
      });

    let messageHistory = messages.join("\n\n");

    // Enforce total history limit
    if (messageHistory.length > TOTAL_HISTORY_LIMIT) {
      // Trim from the start (keep most recent messages)
      const excess = messageHistory.length - TOTAL_HISTORY_LIMIT;
      messageHistory = "...(earlier messages truncated)\n\n" + messageHistory.slice(excess);
    }

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

    // Validate extracted context using helper
    const validatedContext = {
      productName: contextData.productName || "Untitled Product",
      description: contextData.description || "",
      targetAudience: contextData.targetAudience || "General users",
      keyFeatures: ensureArray(contextData.keyFeatures),
      problemStatement: contextData.problemStatement || "",
      technicalPreferences: ensureArray(contextData.technicalPreferences),
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
