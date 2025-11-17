import { NextRequest, NextResponse } from "next/server";
import { perplexity, anthropic, AI_MODELS } from "@/lib/ai-clients";
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

interface ResearchQuery {
  category: string;
  query: string;
  reasoning: string;
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
    console.log("Calling Claude to generate research queries...");

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
      console.log("Claude response received, extracting queries...");

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
        console.error("Failed to extract JSON from Claude response:", text);
        logger.error("Failed to extract JSON from Claude response", { text });
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

      console.log(`Successfully parsed ${queries.length} research queries`);

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
function parseResponse(content: string, _category: string): any[] {
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
  researchQuery: ResearchQuery,
  retryCount = 0
): Promise<{ category: string; options: any[]; reasoning: string }> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000; // 2 seconds between retries

  console.log(`Researching category: ${researchQuery.category}${retryCount > 0 ? ` (retry ${retryCount}/${MAX_RETRIES})` : ''}`);

  // Create AbortController for timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 30000); // Increased to 30 second timeout

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
    console.log(`Perplexity response for ${researchQuery.category}: ${content.substring(0, 200)}...`);
    const options = parseResponse(content, researchQuery.category);
    console.log(`Parsed ${options.length} options for ${researchQuery.category}`);

    return {
      category: researchQuery.category,
      options,
      reasoning: researchQuery.reasoning,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry logic for aborted requests
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
      if (retryCount < MAX_RETRIES) {
        logger.warn(
          "Perplexity API request aborted",
          `Request aborted for ${researchQuery.category}, retrying (${retryCount + 1}/${MAX_RETRIES})`,
          { category: researchQuery.category, retryCount }
        );
        console.warn(`Request aborted for ${researchQuery.category}, retrying in ${RETRY_DELAY}ms...`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Retry the request
        return executeResearchQuery(researchQuery, retryCount + 1);
      } else {
        logger.warn(
          "Perplexity API max retries reached",
          `Max retries reached for ${researchQuery.category}, returning empty results`,
          { category: researchQuery.category }
        );
        console.warn(`Max retries reached for ${researchQuery.category}, returning empty results`);
      }
    } else {
      console.error(`Error researching ${researchQuery.category}:`, error);
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
      console.error("No product context provided");
      return handleValidationError("Product context required");
    }

    console.log("Product context validated:", {
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

    // Step 2: Execute research queries sequentially to avoid rate limits
    // Add a small delay between requests to prevent API overload
    const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay
    const results: Array<{ category: string; options: any[]; reasoning: string }> = [];

    console.log(`Processing ${researchQueries.length} research queries sequentially...`);

    for (let i = 0; i < researchQueries.length; i++) {
      const query = researchQueries[i];
      if (!query) continue;

      console.log(`[${i + 1}/${researchQueries.length}] Processing: ${query.category}`);

      try {
        const result = await executeResearchQuery(query);
        results.push(result);

        // Add delay between requests (except after the last one)
        if (i < researchQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
      } catch (error) {
        logger.error(`Failed to execute research query for ${query.category}`, error);
        // Continue with other queries even if one fails
        results.push({
          category: query.category,
          options: [],
          reasoning: query.reasoning,
        });
      }
    }

    // Step 3: Build structured results object
    const researchResults: Record<
      string,
      { options: any[]; reasoning: string }
    > = {};
    const queriesGenerated: Array<{ category: string; reasoning: string }> = [];

    results.forEach((result) => {
      const { category, options, reasoning } = result;
      queriesGenerated.push({ category, reasoning });

      if (options.length > 0) {
        researchResults[category] = {
          options,
          reasoning,
        };
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

    console.log("=== Research Complete ===");
    console.log(`Categories researched: ${Object.keys(researchResults).join(", ")}`);
    console.log(`Total queries generated: ${queriesGenerated.length}`);

    return NextResponse.json({
      researchResults,
      queriesGenerated,
    });
  } catch (error) {
    console.error("=== Research API Error ===", error);
    return handleAPIError(error, "complete research");
  }
});
