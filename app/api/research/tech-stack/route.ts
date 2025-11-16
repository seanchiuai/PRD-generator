import { NextResponse } from "next/server";
import { perplexity, anthropic, AI_MODELS } from "@/lib/ai-clients";
import { handleAPIError, handleValidationError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/withAuth";
import { ResearchQuery, TechOption } from "@/types";

interface ProductContext {
  productName: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  answers: Record<string, string>;
}

// Use Claude to intelligently generate research queries based on product context
async function generateResearchQueries(context: ProductContext): Promise<ResearchQuery[]> {
  const { productName, description, targetAudience, coreFeatures, answers } = context;

  const prompt = `You are a technical architect analyzing a product to determine what technology stack research is needed.

Product Context:
- Name: ${productName}
- Description: ${description}
- Target Audience: ${targetAudience}
- Core Features: ${coreFeatures.join(", ")}
- Additional Context: ${JSON.stringify(answers, null, 2)}

Your task is to generate targeted research queries for technology stack recommendations.

Consider these common categories, but ONLY include them if they're relevant to this specific product:
- Frontend (web UI, mobile app, desktop app)
- Backend (server, API, runtime)
- Database (if data persistence is needed)
- Authentication (if user accounts are needed)
- Hosting/Deployment (infrastructure, cloud platforms)
- External APIs/Services (if the product relies on third-party services instead of custom backend)
- Other categories that might be relevant (e.g., real-time communication, payment processing, AI/ML services)

For each relevant category, generate a specific research query that:
1. Asks for the top 3 options for that category in 2025
2. Includes product-specific context and requirements
3. Requests structured data with: name, description, 3-4 pros, 3-4 cons, and popularity/adoption rate

Generate a JSON array of research queries. Each query should have:
- category: The tech stack category (e.g., "frontend", "database", "external-apis")
- query: The detailed research query to send to Perplexity
- reasoning: Brief explanation (1-2 sentences) of why this category is needed for this product

Be smart about what's actually needed. For example:
- A static marketing website might not need a database
- A mobile app might not need traditional backend if it uses Firebase/Supabase
- A data dashboard might need external API integrations instead of a custom backend`;

  try {
    logger.info("Research Query Generation", "Calling Claude to generate research queries");

    // Create AbortController for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30 second timeout

    try {
      const response = await anthropic.messages.create({
        model: AI_MODELS.CLAUDE_SONNET,
        max_tokens: 4096,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }, {
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const content = response.content[0];
      if (!content || content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      // Extract JSON from Claude's response
      const text = content.text;
      logger.info("Research Query Generation", "Claude response received, extracting queries");

      // Try code block first, then find any valid JSON array
      let jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        // Find the first '[' and last ']' to capture the entire array
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          const jsonStr = text.substring(firstBracket, lastBracket + 1);
          jsonMatch = [jsonStr, jsonStr];
        }
      }

      if (!jsonMatch) {
        logger.error("Research Query Generation", new Error("Failed to extract JSON from Claude response"), { text });
        throw new Error("Could not parse research queries from Claude");
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];

      // Validate JSON string size to prevent DoS
      if (jsonStr.length > 50000) {
        throw new Error("Response too large to parse safely");
      }

      const queries = JSON.parse(jsonStr) as ResearchQuery[];

      // Validate structure of parsed queries
      if (!Array.isArray(queries)) {
        throw new Error("Expected array of queries");
      }

      // Validate each query has required fields
      queries.forEach((q, idx) => {
        if (!q.category || !q.query || !q.reasoning) {
          throw new Error(`Invalid query at index ${idx}: missing required fields`);
        }
      });

      // Limit number of queries to prevent performance issues
      if (queries.length > 20) {
        logger.warn(
          "Excessive queries generated",
          `Limiting from ${queries.length} to 20 queries`,
          { originalCount: queries.length }
        );
        return queries.slice(0, 20);
      }

      logger.info("Research Query Generation", "Successfully parsed research queries", { count: queries.length });

      logger.info(
        "Generated research queries",
        `Generated ${queries.length} queries for ${productName}`,
        {
          productName,
          queryCount: queries.length,
          categories: queries.map(q => q.category)
        }
      );

      return queries;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error("Claude API request timed out after 30 seconds", error);
      throw new Error("Claude API request timed out. Please try again.");
    }
    logger.error("Failed to generate research queries with Claude", error);
    throw error;
  }
}

// Parse Perplexity response into structured format
function parseResponse(content: string, _category: string): TechOption[] {
  try {
    // Try to extract JSON if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    // Fallback: parse structured text
    const options: TechOption[] = [];
    const sections = content.split(/\d+\.\s+\*\*/).filter(Boolean);

    sections.forEach((section) => {
      const nameMatch = section.match(/^([^*]+)\*\*/);
      const descMatch = section.match(/\*\*\s*[-:]?\s*([\s\S]+?)(?=\n\n|Pros:|$)/);
      const prosMatch = section.match(/Pros:?\s*\n([\s\S]*?)(?=Cons:|$)/);
      const consMatch = section.match(/Cons:?\s*\n([\s\S]*?)(?=Popularity:|$|Learn More:|###)/);
      const popularityMatch = section.match(/Popularity:?\s*(.+?)(?=\n|$)/);

      if (nameMatch && nameMatch[1]) {
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
    logger.error("Research Parse Error", error);
    return [];
  }
}

async function executeResearchQuery(
  researchQuery: ResearchQuery
): Promise<{ category: string; options: TechOption[]; reasoning: string }> {
  logger.info("Research Query Execution", `Researching category: ${researchQuery.category}`);

  // Create AbortController for timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 20000); // 20 second timeout

  try {
    const response = await perplexity.chat.completions.create({
      model: AI_MODELS.PERPLEXITY_SONAR,
      messages: [
        {
          role: "user",
          content: researchQuery.query,
        },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }, {
      // NOTE: Perplexity SDK does not officially support AbortController per-request.
      // This is a workaround to enable request cancellation. Monitor SDK updates for official support.
      signal: abortController.signal,
    } as any);

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content || "";
    logger.info("Research Query Execution", "Perplexity response received", { category: researchQuery.category, preview: content.substring(0, 200) });
    const options = parseResponse(content, researchQuery.category);
    logger.info("Research Query Execution", "Parsed options", { category: researchQuery.category, count: options.length });

    return {
      category: researchQuery.category,
      options,
      reasoning: researchQuery.reasoning,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn(
        "Perplexity API timeout",
        `Timeout researching ${researchQuery.category}, returning empty results`,
        { category: researchQuery.category }
      );
    } else {
      logger.error(`Failed to research ${researchQuery.category}`, error, {
        category: researchQuery.category,
      });
    }

    return {
      category: researchQuery.category,
      options: [],
      reasoning: researchQuery.reasoning,
    };
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { productContext } = body as { productContext: ProductContext };

    if (!productContext) {
      logger.error("Research API", new Error("No product context provided"));
      return handleValidationError("Product context required");
    }

    logger.info("Research API", "Product context validated", {
      productName: productContext.productName,
      description: productContext.description?.substring(0, 100),
      targetAudience: productContext.targetAudience,
      coreFeatures: productContext.coreFeatures,
      answerCount: Object.keys(productContext.answers || {}).length
    });

    logger.info(
      "Starting tech stack research",
      `Starting research for ${productContext.productName}`,
      {
        productName: productContext.productName,
      }
    );

    // Step 1: Use Claude to intelligently determine what research queries are needed
    const researchQueries = await generateResearchQueries(productContext);

    if (researchQueries.length === 0) {
      logger.warn(
        "No research queries generated",
        `Claude did not generate any research queries for ${productContext.productName}`,
        {
          productName: productContext.productName,
        }
      );
      return NextResponse.json({
        researchResults: {},
        queriesGenerated: [],
      });
    }

    // Step 2: Execute all research queries in parallel using Perplexity
    const results = await Promise.allSettled(
      researchQueries.map((query) => executeResearchQuery(query))
    );

    // Step 3: Build structured results object
    const researchResults: Record<
      string,
      { options: TechOption[]; reasoning: string }
    > = {};
    const queriesGenerated: Array<{ category: string; reasoning: string }> = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { category, options, reasoning } = result.value;
        queriesGenerated.push({ category, reasoning });

        if (options.length > 0) {
          researchResults[category] = {
            options,
            reasoning,
          };
        }
      }
    });

    logger.info(
      "Tech stack research completed",
      `Completed research for ${productContext.productName}: ${Object.keys(researchResults).length} categories`,
      {
        productName: productContext.productName,
        categoriesResearched: Object.keys(researchResults).length,
        queriesGenerated: queriesGenerated.length,
      }
    );

    logger.info("Research API", "Research complete", {
      categories: Object.keys(researchResults),
      queriesGenerated: queriesGenerated.length
    });

    return NextResponse.json({
      researchResults,
      queriesGenerated,
    });
  } catch (error) {
    logger.error("Research API", error);
    return handleAPIError(error, "complete research");
  }
});
