# Implementation Plan: Real-Time Tech Stack Research

## Overview
Build a real-time tech stack research system using Perplexity API that performs parallel queries across technology categories based on user's product requirements. This is the third stage of the PRD generation flow.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript + shadcn/ui
- **Backend**: Next.js API Routes + Convex
- **AI**: Perplexity API (sonar model)
- **Database**: Convex
- **Auth**: Clerk (already configured)

---

## Phase 1: Database Schema Extensions (Convex)

### File: `convex/schema.ts`

Add research results to the conversation schema:

```typescript
// Add to existing conversations table
researchResults: v.optional(
  v.object({
    frontend: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
          popularity: v.optional(v.string()),
          learnMore: v.optional(v.string()),
        })
      )
    ),
    backend: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
          popularity: v.optional(v.string()),
          learnMore: v.optional(v.string()),
        })
      )
    ),
    database: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
          popularity: v.optional(v.string()),
          learnMore: v.optional(v.string()),
        })
      )
    ),
    authentication: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
          popularity: v.optional(v.string()),
          learnMore: v.optional(v.string()),
        })
      )
    ),
    hosting: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
          popularity: v.optional(v.string()),
          learnMore: v.optional(v.string()),
        })
      )
    ),
    additionalTools: v.optional(
      v.array(
        v.object({
          category: v.string(),
          name: v.string(),
          description: v.string(),
          pros: v.array(v.string()),
          cons: v.array(v.string()),
        })
      )
    ),
  })
),
researchMetadata: v.optional(
  v.object({
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    categoriesCompleted: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
  })
),
```

**Key Points:**
- Each category has array of 3-5 options
- Each option includes name, description, pros/cons
- Metadata tracks research progress
- Status field enables progress UI

---

## Phase 2: UI Components (Build UI First!)

### 2.1 Research Progress Component

**File**: `components/research/ResearchProgress.tsx`

```typescript
"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchCategory {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  icon?: React.ReactNode;
}

interface ResearchProgressProps {
  categories: ResearchCategory[];
}

export function ResearchProgress({ categories }: ResearchProgressProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Researching Tech Stack...</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              category.status === "completed" && "bg-green-50 dark:bg-green-950/20",
              category.status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20",
              category.status === "failed" && "bg-red-50 dark:bg-red-950/20"
            )}
          >
            {category.status === "completed" && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {category.status === "in_progress" && (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            {category.status === "pending" && (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            {category.status === "failed" && (
              <Circle className="h-5 w-5 text-red-600" />
            )}

            <span className="font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Research Results Display Component

**File**: `components/research/ResearchResults.tsx`

```typescript
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface ResearchResultsProps {
  category: string;
  options: TechOption[];
}

export function ResearchResults({ category, options }: ResearchResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
        <CardDescription>
          Top {options.length} recommendations for your product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {options.map((option, index) => (
            <AccordionItem key={index} value={`option-${index}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{option.name}</span>
                  {option.popularity && (
                    <Badge variant="secondary">{option.popularity}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>

                  <div>
                    <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                      Pros
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {option.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                      Cons
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {option.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>

                  {option.learnMore && (
                    <a
                      href={option.learnMore}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
```

### 2.3 Loading Skeleton Component

**File**: `components/research/LoadingSkeleton.tsx`

```typescript
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Phase 3: Convex Functions

### File: `convex/conversations.ts` (add to existing file)

```typescript
export const saveResearchResults = mutation({
  args: {
    conversationId: v.id("conversations"),
    researchResults: v.any(), // Use the detailed schema object
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      researchResults: args.researchResults,
      researchMetadata: {
        startedAt: conversation.researchMetadata?.startedAt || Date.now(),
        completedAt: Date.now(),
        categoriesCompleted: Object.keys(args.researchResults),
        status: "completed",
      },
      currentStage: "selecting",
      updatedAt: Date.now(),
    });
  },
});

export const updateResearchProgress = mutation({
  args: {
    conversationId: v.id("conversations"),
    category: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const currentCompleted = conversation.researchMetadata?.categoriesCompleted || [];
    const newCompleted =
      args.status === "completed" && !currentCompleted.includes(args.category)
        ? [...currentCompleted, args.category]
        : currentCompleted;

    await ctx.db.patch(args.conversationId, {
      researchMetadata: {
        startedAt: conversation.researchMetadata?.startedAt || Date.now(),
        categoriesCompleted: newCompleted,
        status: "in_progress",
      },
      updatedAt: Date.now(),
    });
  },
});
```

---

## Phase 4: Perplexity API Integration

### 4.1 Install Perplexity SDK

```bash
npm install openai
```

Note: Perplexity uses OpenAI-compatible API

### 4.2 Add Environment Variable

Add to `.env.local`:
```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 4.3 Create Research API Route

**File**: `app/api/research/tech-stack/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

interface ProductContext {
  productName: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  answers: Record<string, string>;
}

// Build context-aware queries
function buildCategoryQuery(category: string, context: ProductContext): string {
  const { productName, description, targetAudience, answers } = context;

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
    console.error("Parse error:", error);
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
    console.error(`Research error for ${category}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productContext } = body as { productContext: ProductContext };

    if (!productContext) {
      return NextResponse.json(
        { error: "Product context required" },
        { status: 400 }
      );
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
    console.error("Research API Error:", error);
    return NextResponse.json(
      { error: "Failed to complete research" },
      { status: 500 }
    );
  }
}
```

---

## Phase 5: Main Research Page

### File: `app/chat/[conversationId]/research/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ResearchProgress } from "@/components/research/ResearchProgress";
import { ResearchResults } from "@/components/research/ResearchResults";
import { LoadingSkeleton } from "@/components/research/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveResults = useMutation(api.conversations.saveResearchResults);

  const [isResearching, setIsResearching] = useState(false);
  const [categoryStatuses, setCategoryStatuses] = useState<
    Record<string, "pending" | "in_progress" | "completed" | "failed">
  >({
    frontend: "pending",
    backend: "pending",
    database: "pending",
    authentication: "pending",
    hosting: "pending",
  });

  const categories = [
    { name: "Frontend Framework", key: "frontend" },
    { name: "Backend Framework", key: "backend" },
    { name: "Database", key: "database" },
    { name: "Authentication", key: "authentication" },
    { name: "Hosting Platform", key: "hosting" },
  ];

  const hasExistingResults = conversation?.researchResults;

  const startResearch = async () => {
    if (!conversation) return;

    setIsResearching(true);

    try {
      // Extract product context from questions
      const productContext = {
        productName: conversation.productContext?.productName || "the product",
        description: conversation.productContext?.description || "",
        targetAudience: conversation.productContext?.targetAudience || "",
        coreFeatures: conversation.productContext?.coreFeatures || [],
        answers: {},
      };

      // Call research API
      const response = await fetch("/api/research/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productContext }),
      });

      if (!response.ok) throw new Error("Research failed");

      const data = await response.json();

      // Save to Convex
      await saveResults({
        conversationId,
        researchResults: data.researchResults,
      });

      toast({
        title: "Research Complete",
        description: "Tech stack recommendations are ready!",
      });
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Research Failed",
        description: "Please try again or skip to manual selection.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  // Auto-start research if no existing results
  useEffect(() => {
    if (conversation && !hasExistingResults && !isResearching) {
      startResearch();
    }
  }, [conversation, hasExistingResults]);

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tech Stack Research</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered recommendations based on your product requirements
        </p>
      </div>

      {/* Research Progress */}
      {isResearching && (
        <ResearchProgress
          categories={categories.map((cat) => ({
            name: cat.name,
            status: categoryStatuses[cat.key],
          }))}
        />
      )}

      {/* Loading State */}
      {isResearching && <LoadingSkeleton />}

      {/* Research Results */}
      {!isResearching && hasExistingResults && (
        <div className="space-y-6">
          {categories.map((cat) => {
            const options = conversation.researchResults?.[cat.key];
            if (!options || options.length === 0) return null;

            return (
              <ResearchResults
                key={cat.key}
                category={cat.name}
                options={options}
              />
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/questions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>

        <Button
          onClick={() => router.push(`/chat/${conversationId}/select`)}
          disabled={isResearching || !hasExistingResults}
        >
          Continue to Selection
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
```

---

## Phase 6: Testing Checklist

### Manual Testing
- [ ] Research starts automatically on page load
- [ ] All 5 categories complete successfully
- [ ] Results display with pros/cons
- [ ] Can navigate back to questions
- [ ] Can continue to selection
- [ ] Results persist after page reload
- [ ] Mobile layout is responsive

### Error Scenarios
- [ ] API rate limiting handled gracefully
- [ ] Individual category failures don't block others
- [ ] Network errors show user-friendly messages
- [ ] Retry functionality works
- [ ] Skip option available if research fails

### Performance
- [ ] Parallel queries complete in <30 seconds
- [ ] No UI blocking during research
- [ ] Progress updates in real-time

---

## Common Pitfalls to Avoid

### 1. **Sequential Queries**
❌ Don't: `await` each category sequentially
✅ Do: Use `Promise.allSettled()` for parallel execution

### 2. **Generic Queries**
❌ Don't: "What are the best frontend frameworks?"
✅ Do: Include product-specific context in every query

### 3. **Unparsed Results**
❌ Don't: Store raw Perplexity responses
✅ Do: Parse into structured format before saving

### 4. **No Caching**
❌ Don't: Re-research on every page visit
✅ Do: Check for existing results first

### 5. **Poor Error UX**
❌ Don't: Show generic "Error occurred" messages
✅ Do: Show which categories failed with retry options

---

## Next Steps

After completing this feature:
1. Test parallel research execution
2. Verify all categories return valid results
3. Move to **Interactive Tech Stack Selection** feature
4. Implement stage transition from "researching" to "selecting"

---

## Integration Points

This feature connects to:
- **Clarifying Questions** - Uses answers for context
- **Perplexity API** - AI-powered research
- **Convex DB** - Stores research results
- **Next Feature** - Transitions to tech stack selection
