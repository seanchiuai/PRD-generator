import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { handleAPIError, handleUnauthorizedError } from "@/lib/api-error-handler";
import { Id } from "@/convex/_generated/dataModel";
import { Question } from "@/types";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ExtractedContext {
  productName: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
  problemStatement: string;
  technicalPreferences: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleUnauthorizedError();
    }

    const { conversationId, extractedContext } = await request.json();

    // Fetch conversation with questions
    const conversation = await convex.query(api.conversations.get, {
      conversationId: conversationId as Id<"conversations">,
    });

    if (!conversation || !conversation.clarifyingQuestions) {
      return NextResponse.json(
        { error: "Questions not found" },
        { status: 404 }
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
}

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
