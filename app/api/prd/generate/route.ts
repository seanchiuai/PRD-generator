import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationData } = body;

    if (!conversationData) {
      return NextResponse.json(
        { error: "Conversation data required" },
        { status: 400 }
      );
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
      model: "claude-haiku-4-5",
      max_tokens: 8192,
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

    // Parse JSON response
    let prdData;
    try {
      // Try to extract JSON from code blocks first
      const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        prdData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the entire response
        prdData = JSON.parse(content.text);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", content.text);
      throw new Error("Failed to parse PRD JSON");
    }

    // Validate required fields
    if (!prdData.projectOverview?.productName) {
      throw new Error("Invalid PRD structure: missing productName");
    }

    return NextResponse.json({
      prdData,
      usage: response.usage,
    });
  } catch (error) {
    console.error("PRD Generation API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PRD",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
