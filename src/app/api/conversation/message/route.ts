import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Message, MessageAPIResponse } from "@/types";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai/clients";
import {
  handleAPIError,
  handleUnauthorizedError,
  handleValidationError,
} from "@/lib/api/error-handler";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are a helpful AI assistant helping users create a Product Requirements Document (PRD).

Your goal in this discovery phase is to:
1. Understand the user's product idea
2. Ask clarifying questions about vague or incomplete aspects
3. Be conversational and encouraging
4. Keep responses concise (2-3 sentences max)
5. Gradually gather information about:
   - What the product does
   - Who will use it
   - Core features needed
   - Any specific requirements

When you have enough basic information, confirm understanding and let the user know you'll move to detailed questions next.`;

/**
 * Handle POST requests by sending the provided conversation messages to Anthropic Claude and returning the assistant's reply.
 *
 * @param request - A NextRequest whose JSON body must include a `messages` array of objects with `role` and `content` fields.
 * @returns A JSON NextResponse containing `{ message: string, usage: any }` with the assistant's reply text and usage data. On error, returns a JSON error response with status `401` (unauthorized), `400` (bad request), or `500` (internal server error).
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleUnauthorizedError();
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return handleValidationError("Messages array required");
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.CONVERSATION,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0];
    if (!assistantMessage || assistantMessage.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const apiResponse: MessageAPIResponse = {
      message: assistantMessage.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };

    logger.info("Conversation Message", "Message processed successfully", {
      userId,
      messageCount: messages.length,
    });

    return NextResponse.json(apiResponse);
  } catch (error) {
    return handleAPIError(error, "process conversation message");
  }
}