import { NextRequest, NextResponse } from "next/server";
import { perplexity } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/withAuth";

interface ProductContext {
  productName: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  answers: Record<string, string>;
}

// Build context-aware queries
function buildCategoryQuery(category: string, context: ProductContext): string {
  const { productName, description, targetAudience } = context;

  const queries: Record<string, string> = {
    frontend: `For a ${productName} (${description}) targeting ${targetAudience}, recommend the top 3 frontend frameworks or libraries in 2025. Consider: modern best practices, performance, developer experience, and community support. For each option, provide: name, brief description, 3-4 pros, 3-4 cons, and current popularity/adoption rate. Format as structured data.`,

    backend: `For a ${productName} application, recommend the top 3 backend frameworks or runtime environments in 2025. Consider: scalability, performance, ease of development, and ecosystem. Product context: ${description}. For each option, provide: name, brief description, 3-4 pros, 3-4 cons, and popularity. Format as structured data.`,

    database: `For a ${productName} with these requirements: ${description}, recommend the top 3 database solutions in 2025. Consider: data structure needs, scalability, real-time capabilities, and cost. For each option, provide: name, brief description, 3-4 pros, 3-4 cons, and adoption rate. Format as structured data.`,

    authentication: `For a ${productName} targeting ${targetAudience}, recommend the top 3 authentication solutions in 2025. Consider: security, user experience, ease of integration, and pricing. For each option, provide: name, brief description, 3-4 pros, 3-4 cons, and market position. Format as structured data.`,

    hosting: `For a ${productName} application, recommend the top 3 hosting/deployment platforms in 2025. Consider: scalability, pricing, developer experience, and infrastructure quality. For each option, provide: name, brief description, 3-4 pros, 3-4 cons, and popularity among similar products. Format as structured data.`,
  };

  return queries[category] || "";
}

// Parse Perplexity response into structured format
function parseResponse(content: string, category: string): any[] {
  try {
    // Try to extract JSON if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    // Fallback: parse structured text
    const options: any[] = [];
    const sections = content.split(/\d+\.\s+\*\*/).filter(Boolean);

    sections.forEach((section) => {
      const nameMatch = section.match(/^([^*]+)\*\*/);
      const descMatch = section.match(/\*\*\s*[-:]?\s*(.+?)(?=\n\n|Pros:|$)/s);
      const prosMatch = section.match(/Pros:?\s*\n([\s\S]*?)(?=Cons:|$)/);
      const consMatch = section.match(/Cons:?\s*\n([\s\S]*?)(?=Popularity:|$|Learn More:|###)/);
      const popularityMatch = section.match(/Popularity:?\s*(.+?)(?=\n|$)/);

      if (nameMatch) {
        options.push({
          name: nameMatch[1].trim(),
          description: descMatch?.[1]?.trim() || "",
          pros: prosMatch?.[1]
            ?.split(/\n/)
            .map((p) => p.replace(/^[-*•]\s*/, "").trim())
            .filter(Boolean) || [],
          cons: consMatch?.[1]
            ?.split(/\n/)
            .map((c) => c.replace(/^[-*•]\s*/, "").trim())
            .filter(Boolean) || [],
          popularity: popularityMatch?.[1]?.trim() || undefined,
        });
      }
    });

    return options.length > 0 ? options : [];
  } catch (error) {
    logger.error("Research Parse Error", "Failed to parse research response", { error });
    return [];
  }
}

async function researchCategory(
  category: string,
  context: ProductContext
): Promise<any[]> {
  try {
    const query = buildCategoryQuery(category, context);

    const response = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    });

    const content = response.choices[0].message.content || "";
    return parseResponse(content, category);
  } catch (error) {
    logger.error("Research Category Error", `Failed to research ${category}`, { category, error });
    return [];
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { productContext } = body as { productContext: ProductContext };

    if (!productContext) {
      return handleValidationError("Product context required");
    }

    // Research all categories in parallel
    const categories = ["frontend", "backend", "database", "authentication", "hosting"];

    const results = await Promise.allSettled(
      categories.map((category) => researchCategory(category, productContext))
    );

    // Build structured results object
    const researchResults: Record<string, any[]> = {};

    categories.forEach((category, index) => {
      const result = results[index];
      if (result.status === "fulfilled" && result.value.length > 0) {
        researchResults[category] = result.value;
      }
    });

    return NextResponse.json({ researchResults });
  } catch (error) {
    return handleAPIError(error, "complete research");
  }
});
