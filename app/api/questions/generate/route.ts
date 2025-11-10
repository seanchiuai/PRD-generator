import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const QUESTION_GENERATION_PROMPT = `Generate 12-15 clarifying questions for creating a Product Requirements Document.

Context from discovery:
{productContext}

Generate questions in these categories:
1. Core Features (3-4 questions)
2. User Types & Personas (2-3 questions)
3. Data Requirements (2-3 questions)
4. Scalability & Performance (2 questions)
5. Integrations & Third-party Services (2 questions)
6. Technical Constraints (1-2 questions)

Requirements:
- Questions must be specific to THIS product, not generic
- Mix of open-ended and specific questions
- Answers should inform tech stack decisions
- Keep questions concise and clear

Output format (JSON only, no markdown):
{
  "questions": [
    {
      "id": "unique-id",
      "category": "Core Features",
      "question": "What specific actions should users be able to perform?",
      "placeholder": "e.g., Create projects, invite team members...",
      "required": true,
      "type": "textarea"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productContext } = await request.json();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: QUESTION_GENERATION_PROMPT.replace(
            "{productContext}",
            JSON.stringify(productContext, null, 2)
          ),
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Extract JSON from response (handle both plain JSON and markdown-wrapped JSON)
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    const questions = JSON.parse(jsonText);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
