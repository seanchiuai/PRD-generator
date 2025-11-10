import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALIDATION_PROMPT = `You are a tech stack architecture expert. Analyze the following technology selections for compatibility issues.

Selected Technologies:
{selections}

Provide:
1. Any INCOMPATIBLE combinations (these prevent the stack from working)
2. Any WARNINGS about suboptimal combinations (these work but have issues)
3. SUGGESTIONS for better alternatives if issues exist

Format your response as JSON:
{
  "errors": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech A", "Tech B"],
      "suggestion": "Try using X instead of Y"
    }
  ],
  "warnings": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech C"],
      "suggestion": "Consider Z for better performance"
    }
  ]
}

Only include actual issues. If the stack is compatible, return empty arrays.`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { selections } = body as { selections: Record<string, string> };

    if (!selections || Object.keys(selections).length === 0) {
      return NextResponse.json({ warnings: [] });
    }

    // Build prompt with selections
    const selectionsText = Object.entries(selections)
      .map(([category, name]) => `${category}: ${name}`)
      .join("\n");

    const prompt = VALIDATION_PROMPT.replace("{selections}", selectionsText);

    // Call Claude for validation
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse JSON response
    let validationResult;
    try {
      const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
      validationResult = JSON.parse(jsonMatch?.[1] || content.text);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      validationResult = { errors: [], warnings: [] };
    }

    // Format warnings
    const warnings = [
      ...validationResult.errors.map((e: any) => ({
        level: "error" as const,
        message: e.message,
        affectedTechnologies: e.affectedTechnologies,
        suggestion: e.suggestion,
      })),
      ...validationResult.warnings.map((w: any) => ({
        level: "warning" as const,
        message: w.message,
        affectedTechnologies: w.affectedTechnologies,
        suggestion: w.suggestion,
      })),
    ];

    return NextResponse.json({ warnings });
  } catch (error) {
    console.error("Validation API Error:", error);
    return NextResponse.json(
      { error: "Failed to validate tech stack" },
      { status: 500 }
    );
  }
}
