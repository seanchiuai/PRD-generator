# Implementation Plan: Interactive Tech Stack Selection

## Overview
Build an interactive comparison interface where users select their preferred technologies from research results, with real-time compatibility validation. This is the fourth stage of the PRD generation flow.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript + shadcn/ui
- **Backend**: Next.js API Routes + Convex
- **AI**: Claude API (for compatibility validation)
- **Database**: Convex
- **Auth**: Clerk (already configured)

---

## Phase 1: Database Schema Extensions (Convex)

### File: `convex/schema.ts`

Add selections to the conversation schema:

```typescript
// Add to existing conversations table
selectedTechStack: v.optional(
  v.object({
    frontend: v.optional(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()), // All options user saw
      })
    ),
    backend: v.optional(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()),
      })
    ),
    database: v.optional(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()),
      })
    ),
    authentication: v.optional(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()),
      })
    ),
    hosting: v.optional(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()),
      })
    ),
    additionalTools: v.optional(
      v.array(
        v.object({
          category: v.string(),
          name: v.string(),
          reasoning: v.string(),
        })
      )
    ),
  })
),
validationWarnings: v.optional(
  v.array(
    v.object({
      level: v.union(v.literal("warning"), v.literal("error")),
      message: v.string(),
      affectedTechnologies: v.array(v.string()),
      suggestion: v.optional(v.string()),
    })
  )
),
```

**Key Points:**
- Store selections with reasoning
- Track which options were available
- Validation warnings separate from selections
- Support additional tools beyond core categories

---

## Phase 2: UI Components (Build UI First!)

### 2.1 Tech Stack Card Component

**File**: `components/selection/TechStackCard.tsx`

```typescript
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface TechStackCardProps {
  option: TechOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function TechStackCard({ option, isSelected, onSelect }: TechStackCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{option.name}</CardTitle>
              {option.popularity && (
                <Badge variant="secondary" className="text-xs">
                  {option.popularity}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-2">{option.description}</CardDescription>
          </div>
          {isSelected && (
            <div className="flex-shrink-0 ml-2">
              <div className="rounded-full bg-primary p-1">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                    Pros
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {option.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                    Cons
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn more <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
```

### 2.2 Category Section Component

**File**: `components/selection/CategorySection.tsx`

```typescript
"use client";

import { TechStackCard } from "./TechStackCard";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface CategorySectionProps {
  category: string;
  options: TechOption[];
  selectedOption?: string;
  onSelect: (optionName: string) => void;
}

export function CategorySection({
  category,
  options,
  selectedOption,
  onSelect,
}: CategorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{category}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose one option for your tech stack
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <TechStackCard
            key={option.name}
            option={option}
            isSelected={selectedOption === option.name}
            onSelect={() => onSelect(option.name)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2.3 Validation Warnings Component

**File**: `components/selection/ValidationWarnings.tsx`

```typescript
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, XCircle } from "lucide-react";

interface ValidationWarning {
  level: "warning" | "error";
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
}

export function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  const errors = warnings.filter((w) => w.level === "error");
  const warningsOnly = warnings.filter((w) => w.level === "warning");

  return (
    <div className="space-y-3">
      {errors.map((error, index) => (
        <Alert key={`error-${index}`} variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Incompatible Combination</AlertTitle>
          <AlertDescription>
            <p>{error.message}</p>
            <p className="text-sm mt-1 font-medium">
              Affected: {error.affectedTechnologies.join(", ")}
            </p>
            {error.suggestion && (
              <p className="text-sm mt-2 italic">{error.suggestion}</p>
            )}
          </AlertDescription>
        </Alert>
      ))}

      {warningsOnly.map((warning, index) => (
        <Alert key={`warning-${index}`} className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            Consider This
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <p>{warning.message}</p>
            <p className="text-sm mt-1 font-medium">
              Related to: {warning.affectedTechnologies.join(", ")}
            </p>
            {warning.suggestion && (
              <p className="text-sm mt-2 italic">{warning.suggestion}</p>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
```

### 2.4 Selection Progress Component

**File**: `components/selection/SelectionProgress.tsx`

```typescript
"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface SelectionProgressProps {
  total: number;
  selected: number;
}

export function SelectionProgress({ total, selected }: SelectionProgressProps) {
  const percentage = (selected / total) * 100;

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Selection Progress</span>
        <span className="text-sm text-muted-foreground">
          {selected} of {total} selected
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {selected === total && (
        <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>All categories selected!</span>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 3: Convex Functions

### File: `convex/conversations.ts` (add to existing file)

```typescript
export const saveSelection = mutation({
  args: {
    conversationId: v.id("conversations"),
    category: v.string(),
    selection: v.object({
      name: v.string(),
      reasoning: v.string(),
      selectedFrom: v.array(v.string()),
    }),
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

    const currentSelections = conversation.selectedTechStack || {};

    await ctx.db.patch(args.conversationId, {
      selectedTechStack: {
        ...currentSelections,
        [args.category]: args.selection,
      },
      updatedAt: Date.now(),
    });
  },
});

export const saveValidationWarnings = mutation({
  args: {
    conversationId: v.id("conversations"),
    warnings: v.array(
      v.object({
        level: v.union(v.literal("warning"), v.literal("error")),
        message: v.string(),
        affectedTechnologies: v.array(v.string()),
        suggestion: v.optional(v.string()),
      })
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

    await ctx.db.patch(args.conversationId, {
      validationWarnings: args.warnings,
      updatedAt: Date.now(),
    });
  },
});
```

---

## Phase 4: Validation API Route

### File: `app/api/validate/tech-stack/route.ts`

```typescript
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
      return NextResponse.json({ errors: [], warnings: [] });
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
```

---

## Phase 5: Main Selection Page

### File: `app/chat/[conversationId]/select/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CategorySection } from "@/components/selection/CategorySection";
import { ValidationWarnings } from "@/components/selection/ValidationWarnings";
import { SelectionProgress } from "@/components/selection/SelectionProgress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SelectionPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveSelection = useMutation(api.conversations.saveSelection);
  const saveWarnings = useMutation(api.conversations.saveValidationWarnings);
  const updateStage = useMutation(api.conversations.updateStage);

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const categories = [
    { name: "Frontend Framework", key: "frontend" },
    { name: "Backend Framework", key: "backend" },
    { name: "Database", key: "database" },
    { name: "Authentication", key: "authentication" },
    { name: "Hosting Platform", key: "hosting" },
  ];

  // Load existing selections
  useEffect(() => {
    if (conversation?.selectedTechStack) {
      const loaded: Record<string, string> = {};
      Object.entries(conversation.selectedTechStack).forEach(([key, value]: [string, any]) => {
        if (value?.name) {
          loaded[key] = value.name;
        }
      });
      setSelections(loaded);
    }

    if (conversation?.validationWarnings) {
      setValidationWarnings(conversation.validationWarnings);
    }
  }, [conversation]);

  const handleSelection = async (category: string, optionName: string) => {
    // Update local state
    setSelections((prev) => ({
      ...prev,
      [category]: optionName,
    }));

    // Save to Convex
    const options = conversation?.researchResults?.[category] || [];
    await saveSelection({
      conversationId,
      category,
      selection: {
        name: optionName,
        reasoning: `Selected from ${options.length} options`,
        selectedFrom: options.map((o: any) => o.name),
      },
    });

    // Trigger validation with updated selections
    validateSelections({
      ...selections,
      [category]: optionName,
    });
  };

  const validateSelections = async (currentSelections: Record<string, string>) => {
    if (Object.keys(currentSelections).length < 2) return;

    setIsValidating(true);

    try {
      const response = await fetch("/api/validate/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: currentSelections }),
      });

      if (!response.ok) throw new Error("Validation failed");

      const data = await response.json();
      setValidationWarnings(data.warnings || []);

      await saveWarnings({
        conversationId,
        warnings: data.warnings || [],
      });
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = async () => {
    const errors = validationWarnings.filter((w) => w.level === "error");

    if (errors.length > 0) {
      toast({
        title: "Incompatible Technologies",
        description: "Please resolve the errors before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(selections).length < categories.length) {
      toast({
        title: "Incomplete Selection",
        description: "Please select an option for all categories.",
        variant: "destructive",
      });
      return;
    }

    await updateStage({
      conversationId,
      stage: "generating",
    });

    router.push(`/chat/${conversationId}/generate`);
  };

  if (!conversation || !conversation.researchResults) {
    return <div>Loading...</div>;
  }

  const selectedCount = Object.keys(selections).length;
  const hasErrors = validationWarnings.some((w) => w.level === "error");

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Select Your Tech Stack</h1>
        <p className="text-muted-foreground mt-2">
          Choose one technology from each category based on your requirements
        </p>
      </div>

      {/* Progress */}
      <SelectionProgress total={categories.length} selected={selectedCount} />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <ValidationWarnings warnings={validationWarnings} />
      )}

      {/* Category Sections */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const options = conversation.researchResults?.[cat.key];
          if (!options || options.length === 0) return null;

          return (
            <CategorySection
              key={cat.key}
              category={cat.name}
              options={options}
              selectedOption={selections[cat.key]}
              onSelect={(optionName) => handleSelection(cat.key, optionName)}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t sticky bottom-0 bg-background">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/research`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research
        </Button>

        <Button
          onClick={handleContinue}
          disabled={isValidating || hasErrors || selectedCount < categories.length}
        >
          Generate PRD
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
- [ ] All research results display as cards
- [ ] Selecting an option highlights the card
- [ ] Validation runs after each selection
- [ ] Errors prevent continuing
- [ ] Warnings allow continuing
- [ ] Selections persist after page reload
- [ ] Mobile layout is responsive
- [ ] Progress indicator updates correctly

### Error Scenarios
- [ ] Incompatible combinations show errors
- [ ] Network errors handled gracefully
- [ ] Missing research results handled
- [ ] Can't continue with errors
- [ ] Validation timeout handled

### Performance
- [ ] Validation debounced (300ms)
- [ ] No UI blocking during validation
- [ ] Smooth card interactions

---

## Common Pitfalls to Avoid

### 1. **Blocking Validation**
❌ Don't: Block UI while validating
✅ Do: Show validation status, allow interaction

### 2. **Too Many Options**
❌ Don't: Show 10+ options per category
✅ Do: Limit to top 3-5 from research

### 3. **No Pre-selection**
❌ Don't: Force user to click everything
✅ Do: Pre-select recommended option (first one)

### 4. **Hidden Validation**
❌ Don't: Only show errors on continue
✅ Do: Show warnings inline in real-time

### 5. **Poor Mobile UX**
❌ Don't: Use grid on mobile
✅ Do: Stack cards vertically on small screens

---

## Next Steps

After completing this feature:
1. Test all selection combinations
2. Verify validation logic
3. Move to **Structured PRD Generation** feature
4. Pass selected tech stack to PRD generator

---

## Integration Points

This feature connects to:
- **Tech Stack Research** - Uses research results
- **Claude API** - Validates compatibility
- **Convex DB** - Stores selections
- **Next Feature** - Transitions to PRD generation
