import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, AI_MODELS, TOKEN_LIMITS } from "@/lib/ai-clients";
import {
  handleAPIError,
  handleUnauthorizedError,
  handleValidationError,
} from "@/lib/api-error-handler";
import { parseAIResponse } from "@/lib/parse-ai-json";

const PRD_SYSTEM_PROMPT = `You are a senior product manager and technical architect creating a comprehensive Product Requirements Document.

You will receive:
1. Initial product discovery conversation
2. Detailed answers to clarifying questions
3. Tech stack research results
4. User's selected technologies

Your task:
Generate a complete, specific, and actionable PRD in JSON format. The PRD should be tailored to THIS SPECIFIC PRODUCT - not generic templates.

Requirements:
- Extract exact details from user inputs
- Reference specific technologies selected
- Create 5-8 detailed MVP features with acceptance criteria
- Design 2-3 specific user personas (not generic ones)
- Define data models that align with features
- Include API endpoints that support the features
- Provide realistic timeline estimates
- Identify specific technical risks

Output ONLY valid JSON matching this exact structure:

{
  "projectOverview": {
    "productName": "string",
    "tagline": "string",
    "description": "string",
    "targetAudience": "string",
    "problemStatement": "string"
  },
  "purposeAndGoals": {
    "vision": "string",
    "keyObjectives": ["string"],
    "successMetrics": ["string"]
  },
  "techStack": {
    "frontend": {
      "name": "string",
      "purpose": "string",
      "pros": ["string"],
      "cons": ["string"],
      "alternatives": ["string"]
    },
    "backend": { /* same structure */ },
    "database": { /* same structure */ },
    "authentication": { /* same structure */ },
    "hosting": { /* same structure */ },
    "reasoning": "string"
  },
  "features": {
    "mvpFeatures": [
      {
        "name": "string",
        "description": "string",
        "userStory": "As a [user], I want [goal] so that [benefit]",
        "acceptanceCriteria": ["string"],
        "technicalRequirements": ["string"],
        "priority": "critical" | "high" | "medium"
      }
    ],
    "niceToHaveFeatures": [ /* same structure */ ],
    "outOfScope": ["string"]
  },
  "userPersonas": [
    {
      "name": "string",
      "role": "string",
      "demographics": "string",
      "goals": ["string"],
      "painPoints": ["string"],
      "technicalProficiency": "string"
    }
  ],
  "technicalArchitecture": {
    "systemDesign": "string (paragraph description)",
    "dataModels": [
      {
        "entityName": "string",
        "description": "string",
        "fields": [
          { "name": "string", "type": "string", "required": boolean }
        ],
        "relationships": ["string"]
      }
    ],
    "apiEndpoints": [
      {
        "method": "GET|POST|PUT|DELETE",
        "path": "string",
        "purpose": "string",
        "authentication": boolean
      }
    ],
    "integrations": [
      { "service": "string", "purpose": "string" }
    ]
  },
  "uiUxConsiderations": {
    "designPrinciples": ["string"],
    "keyUserFlows": [
      {
        "name": "string",
        "steps": ["string"],
        "expectedOutcome": "string"
      }
    ],
    "accessibility": "string"
  },
  "timeline": {
    "phases": [
      {
        "name": "string",
        "duration": "string",
        "deliverables": ["string"]
      }
    ],
    "estimatedDuration": "string"
  },
  "risks": [
    {
      "category": "string",
      "description": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ]
}`;

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
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleUnauthorizedError();
    }

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
}