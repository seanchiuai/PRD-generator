# Implementation Plan: Structured PRD Generation

## Overview
Synthesize all conversation data (discovery, questions, research, selections) into a comprehensive Product Requirements Document using Claude API. This is the fifth and most critical stage of the PRD generation flow.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript + shadcn/ui
- **Backend**: Next.js API Routes + Convex
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Database**: Convex
- **Auth**: Clerk (already configured)

---

## Phase 1: Database Schema (Convex)

### File: `convex/schema.ts`

Add PRDs table:

```typescript
prds: defineTable({
  conversationId: v.id("conversations"),
  userId: v.string(),
  prdData: v.any(), // Full structured PRD object
  productName: v.string(), // For quick lookup/display
  version: v.number(),
  status: v.union(
    v.literal("generating"),
    v.literal("completed"),
    v.literal("failed")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_conversation", ["conversationId"])
  .index("by_user_and_created", ["userId", "createdAt"]),
```

**PRD Data Structure** (stored in `prdData` field):

```typescript
interface PRD {
  projectOverview: {
    productName: string;
    tagline: string;
    description: string;
    targetAudience: string;
    problemStatement: string;
  };
  purposeAndGoals: {
    vision: string;
    keyObjectives: string[];
    successMetrics: string[];
  };
  techStack: {
    frontend: TechChoice;
    backend: TechChoice;
    database: TechChoice;
    authentication: TechChoice;
    hosting: TechChoice;
    additionalTools: AdditionalTool[];
    reasoning: string; // Overall tech stack rationale
  };
  features: {
    mvpFeatures: Feature[];
    niceToHaveFeatures: Feature[];
    outOfScope: string[];
  };
  userPersonas: Persona[];
  technicalArchitecture: {
    systemDesign: string;
    dataModels: DataModel[];
    apiEndpoints: APIEndpoint[];
    integrations: Integration[];
  };
  uiUxConsiderations: {
    designPrinciples: string[];
    keyUserFlows: UserFlow[];
    accessibility: string;
  };
  timeline: {
    phases: Phase[];
    estimatedDuration: string;
  };
  risks: Risk[];
}

interface TechChoice {
  name: string;
  purpose: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

interface Feature {
  name: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string[];
  technicalRequirements: string[];
  priority: "critical" | "high" | "medium" | "low";
}

interface Persona {
  name: string;
  role: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  technicalProficiency: string;
}

interface DataModel {
  entityName: string;
  description: string;
  fields: { name: string; type: string; required: boolean }[];
  relationships: string[];
}

interface APIEndpoint {
  method: string;
  path: string;
  purpose: string;
  authentication: boolean;
}

interface UserFlow {
  name: string;
  steps: string[];
  expectedOutcome: string;
}

interface Phase {
  name: string;
  duration: string;
  deliverables: string[];
}

interface Risk {
  category: string;
  description: string;
  impact: string;
  mitigation: string;
}
```

---

## Phase 2: UI Components (Build UI First!)

### 2.1 PRD Generation Progress Component

**File**: `components/prd/GenerationProgress.tsx`

```typescript
"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GenerationStep {
  name: string;
  status: "pending" | "in_progress" | "completed";
}

interface GenerationProgressProps {
  steps: GenerationStep[];
}

export function GenerationProgress({ steps }: GenerationProgressProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Generating Your PRD...</h3>
            <p className="text-sm text-muted-foreground">
              This may take 20-30 seconds
            </p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.name} className="flex items-center gap-3">
                {step.status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {step.status === "in_progress" && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {step.status === "pending" && (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span
                  className={step.status === "completed" ? "text-muted-foreground" : ""}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.2 PRD Display Component

**File**: `components/prd/PRDDisplay.tsx`

```typescript
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PRDDisplayProps {
  prd: any; // PRD interface from Phase 1
}

export function PRDDisplay({ prd }: PRDDisplayProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="architecture">Architecture</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{prd.projectOverview.productName}</CardTitle>
            <CardDescription>{prd.projectOverview.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Target Audience</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.targetAudience}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Problem Statement</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.problemStatement}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purpose & Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Vision</h4>
              <p className="text-sm text-muted-foreground">{prd.purposeAndGoals.vision}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Objectives</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {prd.purposeAndGoals.keyObjectives.map((obj: string, i: number) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="techstack" className="space-y-4">
        {Object.entries(prd.techStack).map(([key, value]: [string, any]) => {
          if (key === "reasoning" || key === "additionalTools") return null;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="capitalize">{key}</CardTitle>
                <CardDescription>{value.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{value.purpose}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                      Pros
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {value.pros.map((pro: string, i: number) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                      Cons
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {value.cons.map((con: string, i: number) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MVP Features</CardTitle>
            <CardDescription>Critical features for initial launch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prd.features.mvpFeatures.map((feature: any, i: number) => (
              <div key={i} className="border-l-4 border-primary pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{feature.name}</h4>
                  <Badge>{feature.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {feature.description}
                </p>
                <p className="text-sm italic mb-2">
                  <strong>User Story:</strong> {feature.userStory}
                </p>
                <div>
                  <strong className="text-sm">Acceptance Criteria:</strong>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {feature.acceptanceCriteria.map((criteria: string, j: number) => (
                      <li key={j}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="architecture" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {prd.technicalArchitecture.systemDesign}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prd.technicalArchitecture.dataModels.map((model: any, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{model.entityName}</h4>
                <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                <div className="text-sm font-mono">
                  {model.fields.map((field: any, j: number) => (
                    <div key={j} className="flex justify-between py-1">
                      <span>{field.name}</span>
                      <span className="text-muted-foreground">
                        {field.type} {field.required && "*"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Development Timeline</CardTitle>
            <CardDescription>
              Estimated duration: {prd.timeline.estimatedDuration}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prd.timeline.phases.map((phase: any, i: number) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{phase.name}</h4>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <ul className="list-disc list-inside text-sm">
                    {phase.deliverables.map((deliverable: string, j: number) => (
                      <li key={j}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

---

## Phase 3: Convex Functions

### File: `convex/prds.ts` (new file)

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    prdData: v.any(),
    productName: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"prds">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const prdId = await ctx.db.insert("prds", {
      conversationId: args.conversationId,
      userId: identity.subject,
      prdData: args.prdData,
      productName: args.productName,
      version: 1,
      status: "completed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update conversation stage
    await ctx.db.patch(args.conversationId, {
      currentStage: "completed",
      updatedAt: Date.now(),
    });

    return prdId;
  },
});

export const get = query({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== identity.subject) return null;

    return prd;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

export const getByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (prds.length === 0) return null;

    const prd = prds[0];
    if (prd.userId !== identity.subject) return null;

    return prd;
  },
});
```

---

## Phase 4: PRD Generation API Route

### File: `app/api/prd/generate/route.ts`

```typescript
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
${Object.entries(conversationData.clarifyingQuestions || {})
  .map(([q, a]) => `Q: ${q}\nA: ${a}`)
  .join("\n\n")}

# Selected Tech Stack
Frontend: ${conversationData.selectedTechStack?.frontend?.name}
Backend: ${conversationData.selectedTechStack?.backend?.name}
Database: ${conversationData.selectedTechStack?.database?.name}
Authentication: ${conversationData.selectedTechStack?.authentication?.name}
Hosting: ${conversationData.selectedTechStack?.hosting?.name}

Generate a complete PRD for this product.
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
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
      const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
      prdData = JSON.parse(jsonMatch?.[1] || content.text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse PRD JSON");
    }

    // Validate required fields
    if (!prdData.projectOverview?.productName) {
      throw new Error("Invalid PRD structure");
    }

    return NextResponse.json({
      prdData,
      usage: response.usage,
    });
  } catch (error) {
    console.error("PRD Generation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PRD" },
      { status: 500 }
    );
  }
}
```

---

## Phase 5: Main Generation Page

### File: `app/chat/[conversationId]/generate/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { GenerationProgress } from "@/components/prd/GenerationProgress";
import { PRDDisplay } from "@/components/prd/PRDDisplay";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const existingPRD = useQuery(api.prds.getByConversation, { conversationId });
  const createPRD = useMutation(api.prds.create);

  const [isGenerating, setIsGenerating] = useState(false);
  const [prd, setPrd] = useState<any>(null);
  const [generationSteps, setGenerationSteps] = useState([
    { name: "Analyzing conversation data", status: "pending" as const },
    { name: "Extracting product requirements", status: "pending" as const },
    { name: "Structuring features and architecture", status: "pending" as const },
    { name: "Generating timeline and risks", status: "pending" as const },
    { name: "Finalizing PRD", status: "pending" as const },
  ]);

  // Load existing PRD if available
  useEffect(() => {
    if (existingPRD?.prdData) {
      setPrd(existingPRD.prdData);
    }
  }, [existingPRD]);

  const updateStep = (stepIndex: number, status: "pending" | "in_progress" | "completed") => {
    setGenerationSteps((prev) =>
      prev.map((step, i) => (i === stepIndex ? { ...step, status } : step))
    );
  };

  const generatePRD = async () => {
    if (!conversation) return;

    setIsGenerating(true);

    try {
      // Update steps progressively
      updateStep(0, "in_progress");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStep(0, "completed");

      updateStep(1, "in_progress");

      // Build conversation data
      const conversationData = {
        messages: conversation.messages,
        clarifyingQuestions: conversation.clarifyingQuestions,
        selectedTechStack: conversation.selectedTechStack,
      };

      // Call generation API
      const response = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationData }),
      });

      if (!response.ok) throw new Error("Generation failed");

      updateStep(1, "completed");
      updateStep(2, "in_progress");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStep(2, "completed");

      updateStep(3, "in_progress");
      const data = await response.json();
      updateStep(3, "completed");

      updateStep(4, "in_progress");

      // Save to Convex
      await createPRD({
        conversationId,
        prdData: data.prdData,
        productName: data.prdData.projectOverview.productName,
      });

      updateStep(4, "completed");
      setPrd(data.prdData);

      toast({
        title: "PRD Generated Successfully!",
        description: "Your Product Requirements Document is ready.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-start generation if no existing PRD
  useEffect(() => {
    if (conversation && !existingPRD && !isGenerating && !prd) {
      generatePRD();
    }
  }, [conversation, existingPRD]);

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Requirements Document</h1>
          <p className="text-muted-foreground mt-2">
            {prd ? "Your PRD is ready!" : "Generating your comprehensive PRD..."}
          </p>
        </div>
        {prd && (
          <Button onClick={() => router.push(`/prd/${existingPRD?._id}`)}>
            <Download className="h-4 w-4 mr-2" />
            Export PRD
          </Button>
        )}
      </div>

      {/* Generation Progress */}
      {isGenerating && <GenerationProgress steps={generationSteps} />}

      {/* PRD Display */}
      {prd && !isGenerating && <PRDDisplay prd={prd} />}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/select`)}
          disabled={isGenerating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Selection
        </Button>

        {prd && (
          <Button onClick={() => router.push("/dashboard")}>
            View All PRDs
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 6: Testing Checklist

### Manual Testing
- [ ] PRD generates successfully from conversation data
- [ ] All sections populated with specific details
- [ ] Tech stack choices reflected correctly
- [ ] Features have acceptance criteria
- [ ] Data models align with features
- [ ] Timeline is realistic
- [ ] PRD persists after page reload
- [ ] Mobile layout is responsive

### Error Scenarios
- [ ] API failures handled gracefully
- [ ] Invalid JSON parsing handled
- [ ] Missing conversation data handled
- [ ] Retry functionality works
- [ ] Can navigate back if generation fails

### Performance
- [ ] Generation completes in <30 seconds
- [ ] Progress updates smoothly
- [ ] No UI blocking

---

## Common Pitfalls to Avoid

### 1. **Generic PRDs**
❌ Don't: Generate template-like PRDs
✅ Do: Include user's exact inputs and specific details

### 2. **Lost Context**
❌ Don't: Only use latest conversation
✅ Do: Include all discovery, questions, and selections

### 3. **Invalid JSON**
❌ Don't: Assume Claude always returns valid JSON
✅ Do: Parse carefully with error handling

### 4. **No Retry**
❌ Don't: Force users to restart if generation fails
✅ Do: Allow regeneration from same page

### 5. **Missing Validation**
❌ Don't: Save incomplete PRDs
✅ Do: Validate required fields before saving

---

## Next Steps

After completing this feature:
1. Test PRD generation with various inputs
2. Verify JSON structure correctness
3. Move to **PRD Export** feature
4. Implement PDF and JSON download

---

## Integration Points

This feature connects to:
- **All Previous Stages** - Uses complete conversation data
- **Claude API** - Generates structured PRD
- **Convex DB** - Stores final PRD
- **Next Feature** - Enables export functionality
