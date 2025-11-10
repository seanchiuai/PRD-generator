# Implementation Plan: AI-Powered Clarifying Questions

## Overview
Generate intelligent, context-specific questions based on the user's product idea and present them in an accessible form interface.

## Prerequisites
- Conversational Product Discovery completed
- Product context extracted from discovery phase
- Claude API configured

---

## Phase 1: Question Generation System

### 1.1 API Route for Question Generation

**File**: `app/api/questions/generate/route.ts`

```typescript
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

Output format (JSON):
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

    const questions = JSON.parse(content.text);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
```

### 1.2 Update Convex Schema

**File**: `convex/schema.ts` (update conversations table)

```typescript
clarifyingQuestions: v.optional(
  v.array(
    v.object({
      id: v.string(),
      category: v.string(),
      question: v.string(),
      placeholder: v.optional(v.string()),
      answer: v.optional(v.string()),
      required: v.boolean(),
      type: v.union(v.literal("text"), v.literal("textarea"), v.literal("select")),
    })
  )
),
answersCompleteness: v.optional(v.number()), // Percentage 0-100
```

### 1.3 Save Questions Mutation

**File**: `convex/conversations.ts` (add mutation)

```typescript
export const saveQuestions = mutation({
  args: {
    conversationId: v.id("conversations"),
    questions: v.array(
      v.object({
        id: v.string(),
        category: v.string(),
        question: v.string(),
        placeholder: v.optional(v.string()),
        answer: v.optional(v.string()),
        required: v.boolean(),
        type: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      clarifyingQuestions: args.questions,
      currentStage: "clarifying",
      updatedAt: Date.now(),
    });
  },
});
```

---

## Phase 2: Form UI Components

### 2.1 Question Form Page

**File**: `app/chat/[conversationId]/questions/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { QuestionCategory } from "@/components/questions/QuestionCategory";
import { ProgressIndicator } from "@/components/questions/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveQuestions = useMutation(api.conversations.saveQuestions);
  const updateStage = useMutation(api.conversations.updateStage);

  const [questions, setQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate questions on mount if not already generated
  useEffect(() => {
    if (!conversation) return;

    if (conversation.clarifyingQuestions) {
      setQuestions(conversation.clarifyingQuestions);
    } else {
      generateQuestions();
    }
  }, [conversation]);

  const generateQuestions = async () => {
    if (!conversation) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productContext: conversation.productContext || {},
        }),
      });

      const data = await response.json();
      setQuestions(data.questions);

      await saveQuestions({
        conversationId,
        questions: data.questions,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, answer } : q
    );
    setQuestions(updatedQuestions);

    // Auto-save
    try {
      await saveQuestions({
        conversationId,
        questions: updatedQuestions,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const calculateCompleteness = () => {
    const requiredQuestions = questions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter(
      (q) => q.answer && q.answer.trim().length > 0
    );
    return (answeredRequired.length / requiredQuestions.length) * 100;
  };

  const handleContinue = async () => {
    const completeness = calculateCompleteness();

    if (completeness < 70) {
      toast({
        title: "More answers needed",
        description: "Please answer at least 70% of required questions",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateStage({
        conversationId,
        stage: "researching",
      });
      router.push(`/chat/${conversationId}/research`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return <div className="container py-8">Generating questions...</div>;
  }

  if (!questions.length) {
    return <div className="container py-8">Loading...</div>;
  }

  // Group questions by category
  const categories = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Clarifying Questions</h1>
        <p className="text-muted-foreground">
          Help us understand your product better by answering these questions
        </p>
      </div>

      <ProgressIndicator
        total={questions.filter((q) => q.required).length}
        completed={
          questions.filter((q) => q.required && q.answer?.trim()).length
        }
        className="mb-8"
      />

      <div className="space-y-8 mb-8">
        {Object.entries(categories).map(([category, categoryQuestions]) => (
          <QuestionCategory
            key={category}
            category={category}
            questions={categoryQuestions}
            onAnswerChange={handleAnswerChange}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isSaving || calculateCompleteness() < 70}
        >
          {isSaving ? "Saving..." : "Continue to Research"}
        </Button>
      </div>
    </div>
  );
}
```

### 2.2 Question Category Component

**File**: `components/questions/QuestionCategory.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "./QuestionCard";

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  answer?: string;
  required: boolean;
  type: string;
}

interface QuestionCategoryProps {
  category: string;
  questions: Question[];
  onAnswerChange: (questionId: string, answer: string) => void;
}

export function QuestionCategory({
  category,
  questions,
  onAnswerChange,
}: QuestionCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

### 2.3 Individual Question Card

**File**: `components/questions/QuestionCard.tsx`

```typescript
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: {
    question: string;
    placeholder?: string;
    answer?: string;
    required: boolean;
    type: string;
  };
  onAnswerChange: (answer: string) => void;
}

export function QuestionCard({ question, onAnswerChange }: QuestionCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Label className="text-base">{question.question}</Label>
        {question.required && (
          <Badge variant="secondary" className="text-xs">
            Required
          </Badge>
        )}
      </div>

      {question.type === "textarea" ? (
        <Textarea
          value={question.answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={question.placeholder}
          className="min-h-[100px]"
        />
      ) : (
        <Input
          value={question.answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}
    </div>
  );
}
```

### 2.4 Progress Indicator

**File**: `components/questions/ProgressIndicator.tsx`

```typescript
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  total: number;
  completed: number;
  className?: string;
}

export function ProgressIndicator({
  total,
  completed,
  className,
}: ProgressIndicatorProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">
          {completed} of {total} answered
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
```

---

## Phase 3: Auto-Save & Stage Management

### 3.1 Update Stage Mutation

**File**: `convex/conversations.ts` (add mutation)

```typescript
export const updateStage = mutation({
  args: {
    conversationId: v.id("conversations"),
    stage: v.union(
      v.literal("discovery"),
      v.literal("clarifying"),
      v.literal("researching"),
      v.literal("selecting"),
      v.literal("generating"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      currentStage: args.stage,
      updatedAt: Date.now(),
    });
  },
});
```

---

## Testing Checklist

- [ ] Questions generate based on product context
- [ ] Questions are specific to user's product (not generic)
- [ ] Auto-save works on answer changes
- [ ] Progress bar updates correctly
- [ ] Required vs optional questions enforced
- [ ] Cannot proceed without 70% completion
- [ ] Mobile-responsive form layout
- [ ] Keyboard navigation works
- [ ] Page refresh preserves answers

---

## Integration Points
- Receives product context from Conversational Discovery
- Transitions to Tech Stack Research when complete
- Saves answers for PRD Generation
