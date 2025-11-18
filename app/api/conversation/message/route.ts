import { NextResponse } from "next/server";
import type { Message, MessageAPIResponse, MessageRole } from "@/types";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/withAuth";
import { CONVERSATION_SYSTEM_PROMPT } from "@/lib/prompts/conversation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { rateLimitRequest, recordTokenUsage, RATE_LIMIT_CONFIGS } from "@/lib/rate-limiter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Handle POST requests by fetching the conversation from Convex and sending messages to Anthropic Claude.
 *
 * Authentication is handled by the withAuth middleware wrapper.
 * The request body must include a `conversationId` to fetch the authoritative message list from the database.
 *
 * @returns A JSON NextResponse containing `{ message: string, usage: any }` with the assistant's reply text and usage data.
 * On error, returns a JSON error response with status `400` (bad request) or `500` (internal server error).
 */
export const POST = withAuth(async (request, { userId }) => {
  // Apply rate limiting before processing
  const rateLimitResult = rateLimitRequest(request, userId, RATE_LIMIT_CONFIGS.API_AI);
  if ("error" in rateLimitResult) {
    return rateLimitResult.error;
  }
  const { identifier } = rateLimitResult;

  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return handleValidationError("conversationId is required");
    }

    // Fetch authoritative message list from Convex
    const conversation = await convex.query(api.conversations.get, {
      conversationId: conversationId as Id<"conversations">,
    });

    if (!conversation) {
      return handleValidationError("Conversation not found");
    }

    const messages = conversation.messages || [];

    // Validate message structure
    const validRoles: MessageRole[] = ['user', 'assistant'];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (!msg || typeof msg !== 'object') {
        return handleValidationError(`Message at index ${i} is not an object`);
      }

      if (!msg.role || !validRoles.includes(msg.role as MessageRole)) {
        return handleValidationError(`Invalid message role at index ${i}: ${msg.role}`);
      }

      if (!msg.content || typeof msg.content !== 'string') {
        return handleValidationError(`Invalid or missing content at index ${i}`);
      }

      if (msg.content.length > 50000) {
        return handleValidationError(`Message content at index ${i} exceeds maximum length of 50000 characters`);
      }
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.CONVERSATION,
      system: CONVERSATION_SYSTEM_PROMPT,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0];
    if (!assistantMessage || assistantMessage.type !== "text") {
      throw new Error(
        `Unexpected response type: expected 'text', got '${assistantMessage?.type || 'undefined'}' - ${JSON.stringify(assistantMessage)}`
      );
    }

    const apiResponse: MessageAPIResponse = {
      message: assistantMessage.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };

    // Monitor token usage and warn if approaching limits
    const tokenUsagePercentage = (response.usage.output_tokens / TOKEN_LIMITS.CONVERSATION) * 100;
    if (tokenUsagePercentage > 80) {
      logger.warn("Conversation Message", "High token usage detected", {
        userId,
        usage: response.usage,
        limit: TOKEN_LIMITS.CONVERSATION,
        percentage: tokenUsagePercentage.toFixed(1),
      });
    }

    // Record token usage for rate limiting
    const totalTokens = response.usage.input_tokens + response.usage.output_tokens;
    recordTokenUsage(identifier, totalTokens);

    logger.info("Conversation Message", "Message processed successfully", {
      userId,
      messageCount: messages.length,
      tokenUsage: response.usage,
    });

    return NextResponse.json(apiResponse);
  } catch (error) {
    return handleAPIError(error, "process conversation message");
  }
});