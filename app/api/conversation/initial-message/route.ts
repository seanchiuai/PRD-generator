import { NextResponse } from "next/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/withAuth";
import { CONVERSATION_SYSTEM_PROMPT } from "@/lib/prompts/conversation";

/**
 * Generate the initial discovery message based on project name and description.
 * This endpoint is called after project setup to create a personalized greeting
 * that kicks off the discovery conversation.
 */
export const POST = withAuth(async (request, { userId }) => {
  try {
    const body = await request.json();
    const { projectName, projectDescription } = body;

    if (!projectName || !projectDescription) {
      return handleValidationError("Project name and description are required");
    }

    // Create a user message that provides the project context
    const contextMessage = `My app will be called "${projectName}". Here's the initial description: ${projectDescription}`;

    // Call Claude API to generate the initial discovery message
    const response = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: TOKEN_LIMITS.CONVERSATION,
      system: CONVERSATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: contextMessage,
        },
      ],
    });

    const assistantMessage = response.content[0];
    if (!assistantMessage || assistantMessage.type !== "text") {
      throw new Error("Unexpected response type");
    }

    logger.info("Initial Message Generated", "Generated discovery greeting", {
      userId,
      projectName,
    });

    return NextResponse.json({
      message: assistantMessage.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    return handleAPIError(error, "generate initial discovery message");
  }
});
