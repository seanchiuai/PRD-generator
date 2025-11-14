import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import { handleAPIError, handleUnauthorizedError } from "@/lib/api-error-handler";
import { safeParseAIResponse } from "@/lib/parse-ai-json";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const FALLBACK_CONTEXT = {
  productName: "New Product",
  description: "A product to be defined",
  targetAudience: "Target users",
  keyFeatures: [],
  problemStatement: "To be determined",
  technicalPreferences: [],
  extractedAt: Date.now(),
};

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return handleUnauthorizedError();
    }

    // Get Clerk token for Convex authentication
    const token = await getToken({ template: "convex" });
    if (!token) {
      return handleUnauthorizedError();
    }

    // Create authenticated Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      );
    }

    // Fetch conversation messages
    const conversation = await convex.query(api.conversations.get, {
      conversationId: conversationId as Id<"conversations">,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
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
    interface ContextData {
      productName?: string;
      description?: string;
      targetAudience?: string;
      keyFeatures?: string[];
      problemStatement?: string;
      technicalPreferences?: string[];
    }

    const contextData = safeParseAIResponse<ContextData>(extractedText) || FALLBACK_CONTEXT;

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
    await convex.mutation(api.conversations.saveExtractedContext, {
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
}

const CONTEXT_EXTRACTION_PROMPT = `
Analyze the following product discovery conversation and extract key information about the product being discussed.

Even if the conversation is very brief, make your best attempt to extract whatever information is available.

Conversation:
{messages}

Extract and return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "productName": "Name of the product (or generate a descriptive name if not mentioned)",
  "description": "Brief 1-2 sentence description of what the product does",
  "targetAudience": "Who will use this product (be specific if mentioned, otherwise infer)",
  "keyFeatures": ["Feature 1", "Feature 2", ...],
  "problemStatement": "What problem does this product solve",
  "technicalPreferences": ["Any tech mentioned like 'mobile app', 'web', 'AI-powered', etc."]
}

Guidelines:
- If information is not explicitly mentioned, make reasonable inferences
- Be concise but specific
- Extract all features mentioned, even if briefly
- Include any technical requirements or preferences mentioned
- If the conversation is very short, still provide your best interpretation
- Product name: if not mentioned, create a descriptive name based on the concept
`;
