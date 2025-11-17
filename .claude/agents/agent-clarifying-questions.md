---
name: agent-clarifying-questions
description: Generates and manages clarifying questions to gather detailed product requirements. Handles question generation from conversation context, answer collection, auto-completion with defaults, and validation. Use when implementing or fixing the questions/answers feature.
model: inherit
color: green
---

# Agent: Clarifying Questions

Generates contextual questions based on discovery conversation and manages answer collection workflow.

## Core Responsibilities

1. **Question Generation** - Create relevant questions from extracted context
2. **Answer Management** - Handle user responses and auto-completion
3. **Progress Tracking** - Show completion status and category progress
4. **Validation** - Ensure required questions answered before proceeding

## Implementation Patterns

### 1. Question Schema
```typescript
// convex/schema.ts - Part of conversations table
clarifyingQuestions: v.optional(
  v.array(
    v.object({
      id: v.string(),
      category: v.string(),
      question: v.string(),
      placeholder: v.optional(v.string()),
      answer: v.optional(v.string()),
      required: v.boolean(),
      type: v.union(
        v.literal("text"),
        v.literal("textarea"),
        v.literal("select"),
        v.literal("multiselect"),
        v.literal("radio")
      ),
      suggestedOptions: v.optional(v.array(v.string())),
      autoCompleted: v.optional(v.boolean()),
    })
  )
),
answersCompleteness: v.optional(v.number()), // 0-100 percentage
autoCompletedQuestions: v.optional(v.array(v.string())), // question IDs
```

### 2. Question Generation API
```typescript
// /api/questions/generate
POST {
  conversationId: Id<"conversations">,
  extractedContext: ExtractedContext
}

// Claude generates 5-8 questions across categories:
// - Product Scope & Features
// - Target Users & Use Cases
// - Technical Requirements
// - Success Metrics
// - Edge Cases & Constraints

// Returns:
{
  success: boolean,
  questions: Question[] // categorized, with smart defaults
}

// Save to conversation.clarifyingQuestions
```

### 3. Auto-Fill Defaults
```typescript
// /api/questions/fill-defaults
POST {
  conversationId: Id<"conversations">,
  questions: Question[]
}

// Claude analyzes each question against conversation history
// Auto-fills answers that can be reasonably inferred
// Marks questions with autoCompleted: true
// Returns updated questions array

// Use case: Pre-fill obvious answers to save user time
// User can still modify auto-completed answers
```

### 4. Answer Update Pattern
```typescript
// Mutation: conversations.updateQuestions
export const updateQuestions = mutation({
  args: {
    conversationId: v.id("conversations"),
    questions: v.array(v.object({ /* question schema */ })),
  },
  handler: async (ctx, { conversationId, questions }) => {
    // Calculate completeness
    const answered = questions.filter(q => q.answer?.trim()).length;
    const required = questions.filter(q => q.required).length;
    const completeness = Math.round((answered / questions.length) * 100);

    await ctx.db.patch(conversationId, {
      clarifyingQuestions: questions,
      answersCompleteness: completeness,
      updatedAt: Date.now(),
    });
  },
});
```

### 5. Category-Based UI
```typescript
// components/questions/QuestionCategory.tsx
// Group questions by category
// Show progress per category
// Allow expand/collapse
// Highlight auto-completed answers

interface QuestionCategoryProps {
  category: string;
  questions: Question[];
  onAnswerChange: (questionId: string, answer: string) => void;
}

// Show badge if auto-completed
{question.autoCompleted && (
  <Badge variant="secondary">Auto-filled</Badge>
)}
```

### 6. Progress Indicator
```typescript
// components/questions/ProgressIndicator.tsx
// Show overall progress bar
// Display "X of Y questions answered"
// Highlight if all required questions complete

interface ProgressIndicatorProps {
  totalQuestions: number;
  answeredQuestions: number;
  requiredQuestions: number;
  answeredRequired: number;
}

// Can proceed when all required questions have answers
const canProceed = answeredRequired === requiredQuestions;
```

## Key Files

- `app/chat/[conversationId]/questions/page.tsx` - Questions UI
- `components/questions/QuestionCategory.tsx` - Category display
- `components/questions/ProgressIndicator.tsx` - Progress tracking
- `app/api/questions/generate/route.ts` - Question generation
- `app/api/questions/fill-defaults/route.ts` - Auto-completion
- `convex/conversations.ts` - Question mutations

## Critical Rules

1. **ALWAYS** generate questions based on extractedContext from discovery
2. **ALWAYS** categorize questions for better UX (5-8 categories max)
3. **ALWAYS** mark critical questions as required: true
4. **ALWAYS** auto-fill when conversation provides clear answers
5. **ALWAYS** validate all required questions answered before allowing proceed
6. **NEVER** auto-proceed - user must explicitly click "Continue"
7. **ALWAYS** save answers incrementally (on blur, not submit)

## Question Generation Best Practices

### Context Analysis
```typescript
// Analyze extractedContext to determine relevant questions
const context = {
  productName: "TaskFlow",
  description: "Team task management tool",
  keyFeatures: ["kanban boards", "real-time updates"],
  targetAudience: "small development teams",
  technicalPreferences: ["React", "real-time features"]
};

// Generate questions that:
// 1. Fill gaps in understanding
// 2. Clarify ambiguous features
// 3. Understand edge cases
// 4. Define success criteria
// 5. Identify technical constraints
```

### Question Quality
```typescript
// ✅ GOOD questions - specific, actionable
"What is the maximum number of team members per workspace?"
"Should users be able to export tasks to CSV/PDF?"
"Do you need offline support for mobile apps?"

// ❌ BAD questions - vague, already answered
"Tell me about your product" // Too broad
"What features do you need?" // Already in extractedContext
```

### Smart Defaults
```typescript
// If conversation mentions "mobile app"
question: "Which mobile platforms?",
suggestedOptions: ["iOS", "Android", "Both"],
type: "multiselect",
autoCompleted: true,
answer: "Both" // Reasonable default

// If mentions "team collaboration"
question: "Maximum team size?",
type: "select",
suggestedOptions: ["5-10", "10-50", "50-100", "100+"],
autoCompleted: true,
answer: "10-50" // Mid-range default
```

## UI/UX Patterns

### Question Input Types
```typescript
// text - Short answers (names, numbers)
<Input
  value={question.answer || ""}
  onChange={(e) => onAnswerChange(question.id, e.target.value)}
  placeholder={question.placeholder}
/>

// textarea - Long answers (descriptions, explanations)
<Textarea
  value={question.answer || ""}
  onChange={(e) => onAnswerChange(question.id, e.target.value)}
  rows={4}
/>

// select - Single choice from options
<Select
  value={question.answer}
  onValueChange={(value) => onAnswerChange(question.id, value)}
>
  {question.suggestedOptions?.map(opt => (
    <SelectItem value={opt}>{opt}</SelectItem>
  ))}
</Select>

// multiselect - Multiple choices
// Use checkbox group or multi-select component
```

### Auto-Fill Indication
```typescript
// Show user which answers were auto-filled
// Allow easy editing
// Visual distinction from manual answers

{question.autoCompleted && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Sparkles className="h-4 w-4" />
    <span>Auto-filled from conversation</span>
  </div>
)}
```

### Skip Functionality
```typescript
// Allow skipping if >60% complete and all required answered
const canSkip =
  answersCompleteness >= 60 &&
  answeredRequired === requiredQuestions;

// Show helpful message
{canSkip ? (
  <p>You can continue now, or answer more questions for better results.</p>
) : (
  <p>Please answer {requiredQuestions - answeredRequired} more required questions.</p>
)}
```

## Analytics Events

```typescript
import { trackQuestionsSkip } from '@/lib/analytics/questionsEvents';

// When user proceeds
trackQuestionsSkip(conversationId, {
  totalQuestions: questions.length,
  answeredQuestions: answered,
  completeness: answersCompleteness,
  autoFilledCount: autoCompletedQuestions.length,
});
```

## Testing Checklist

- [ ] Questions generate from extractedContext
- [ ] Questions categorized logically (5-8 categories)
- [ ] Auto-fill works for inferable answers
- [ ] Progress indicator updates in real-time
- [ ] Required validation blocks proceed when incomplete
- [ ] All input types (text, textarea, select, etc.) work
- [ ] Answers save incrementally without data loss
- [ ] Auto-filled answers clearly marked
- [ ] Can proceed when all required answered
- [ ] Stage transitions to "tech-stack" correctly

## Reference Docs

Follow patterns from:
- `docs/frontend-architecture.md` - Page structure
- `docs/component-patterns.md` - Form components
- `docs/convex-patterns.md` - Mutations
- `docs/state-management.md` - Local state for forms
- `docs/api-routes-guide.md` - API validation
