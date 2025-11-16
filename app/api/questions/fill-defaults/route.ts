import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedConvexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import {
  handleAPIError,
  handleValidationError,
  handleUnauthorizedError,
} from "@/lib/api-error-handler";
import { Id } from "@/convex/_generated/dataModel";
import { Question, ExtractedContext } from "@/types";
import { withAuth } from "@/lib/middleware/withAuth";

export const POST = withAuth(async (request, { userId, token }) => {
  try {
    const { conversationId, extractedContext } = await request.json();

    if (!conversationId) {
      return handleValidationError("Conversation ID required");
    }

    // Get authenticated Convex client
    const convexClient = getAuthenticatedConvexClient(token);

    // Fetch conversation with questions
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

    if (!conversation.clarifyingQuestions) {
      return handleAPIError(
        new Error("Questions not found"),
        "find questions",
        404
      );
    }

    const questions = conversation.clarifyingQuestions as Question[];

    // Fill defaults for unanswered questions
    const filledQuestions = questions.map((question) => {
      // Skip if already answered
      if (question.answer && question.answer.trim()) {
        return { ...question, autoCompleted: false };
      }

      // Determine default based on question type
      const defaultAnswer = getDefaultAnswer(question, extractedContext);

      return {
        ...question,
        answer: defaultAnswer,
        autoCompleted: true,
      };
    });

    return NextResponse.json({
      success: true,
      questions: filledQuestions,
    });
  } catch (error) {
    return handleAPIError(error, "fill default answers");
  }
});

function getDefaultAnswer(
  question: Question,
  extractedContext: ExtractedContext | null
): string {
  switch (question.type) {
    case "select":
      return getSelectDefault(question);

    case "textarea":
    case "text":
      return getTextDefault(question, extractedContext);

    default:
      return "";
  }
}

function getSelectDefault(question: Question): string {
  // If there are suggested options, use the first one
  if (question.suggestedOptions && question.suggestedOptions.length > 0) {
    return question.suggestedOptions[0] ?? "";
  }

  return "";
}

function getTextDefault(
  question: Question,
  extractedContext: ExtractedContext | null
): string {
  // Try to use extracted context for specific questions
  if (!extractedContext) return "";

  const questionLower = question.question.toLowerCase();

  // Product name questions
  if (
    questionLower.includes("product name") ||
    questionLower.includes("name of the product")
  ) {
    return extractedContext.productName ?? "";
  }

  // Target audience questions
  if (
    questionLower.includes("target audience") ||
    questionLower.includes("target users") ||
    questionLower.includes("who will use") ||
    questionLower.includes("primary users")
  ) {
    return extractedContext.targetAudience ?? "";
  }

  // Description questions
  if (
    questionLower.includes("description") ||
    questionLower.includes("what does") ||
    questionLower.includes("purpose")
  ) {
    return extractedContext.description ?? "";
  }

  // Problem/solution questions
  if (
    questionLower.includes("problem") ||
    questionLower.includes("solve") ||
    questionLower.includes("challenge")
  ) {
    return extractedContext.problemStatement ?? "";
  }

  // Features questions
  if (
    questionLower.includes("features") ||
    questionLower.includes("functionality") ||
    questionLower.includes("capabilities")
  ) {
    return extractedContext.keyFeatures?.join(", ") ?? "";
  }

  // Technical preferences
  if (
    questionLower.includes("technical") ||
    questionLower.includes("technology") ||
    questionLower.includes("stack")
  ) {
    return extractedContext.technicalPreferences?.join(", ") ?? "";
  }

  // For other text questions, leave blank or use placeholder
  return "";
}
