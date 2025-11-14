# Questions Skip Agent

## Role
Responsible for implementing skip functionality in the clarifying questions phase, including intelligent default answer selection.

## Objective
Enable users to skip the questions phase entirely or skip individual questions, with the system automatically selecting recommended or first-choice answers for unanswered questions.

## Context
Currently, the questions page requires 70% completion before allowing users to continue. The new requirement is:
- Allow skipping at any time, even with 0% completion
- Auto-select recommended answers for skipped questions
- For questions without recommended answers, use intelligent defaults
- Mark auto-completed questions visually
- Navigate automatically to research page

---

## Tasks

### 1. Update Questions Page UI

**File:** `app/chat/[conversationId]/questions/page.tsx`

**Changes Needed:**
1. Add skip button (always visible)
2. Remove 70% completion requirement for "Continue" button
3. Add skip handler with default selection logic
4. Show visual indicator for auto-completed answers

**Add Skip Button:**
```tsx
<WorkflowLayout
  currentStep="questions"
  completedSteps={['discovery']}
  conversationId={conversationId}
  showSkipButton={true} // Always show
  onSkip={handleSkipQuestions}
  skipButtonLoading={isSkipping}
  skipButtonText={`Skip (${answeredCount}/${totalQuestions} answered)`}
>
  {/* Existing questions UI */}
</WorkflowLayout>
```

**Add Skip Handler:**
```typescript
const [isSkipping, setIsSkipping] = useState(false)

const handleSkipQuestions = async () => {
  setIsSkipping(true)
  try {
    // Call API to fill defaults
    const response = await fetch('/api/questions/fill-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        currentAnswers: answers,
        extractedContext: conversation?.extractedContext,
      }),
    })

    if (!response.ok) throw new Error('Failed to fill defaults')

    const { filledAnswers } = await response.json()

    // Save filled answers to Convex
    await saveAnswers.mutateAsync({
      conversationId,
      answers: filledAnswers,
      autoCompleted: true,
    })

    // Navigate to research
    router.push(`/chat/${conversationId}/research`)
  } catch (error) {
    console.error('Skip failed:', error)
    toast.error('Failed to skip questions. Please try again.')
  } finally {
    setIsSkipping(false)
  }
}
```

---

### 2. Create Default Answer Selection API

**File:** `app/api/questions/fill-defaults/route.ts`

Create API endpoint to intelligently fill unanswered questions:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { conversationId, currentAnswers, extractedContext } =
      await request.json()

    // Fetch conversation with questions
    const conversation = await convex.query(api.conversations.get, {
      conversationId,
    })

    if (!conversation || !conversation.questions) {
      return NextResponse.json(
        { error: 'Questions not found' },
        { status: 404 }
      )
    }

    const questions = conversation.questions

    // Fill defaults for unanswered questions
    const filledAnswers = { ...currentAnswers }

    for (const question of questions) {
      // Skip if already answered
      if (currentAnswers[question.id]) continue

      // Determine default based on question type
      const defaultAnswer = await getDefaultAnswer(
        question,
        extractedContext,
        questions
      )

      filledAnswers[question.id] = {
        value: defaultAnswer,
        autoCompleted: true,
      }
    }

    return NextResponse.json({
      success: true,
      filledAnswers,
    })
  } catch (error) {
    console.error('Fill defaults error:', error)
    return NextResponse.json(
      { error: 'Failed to fill defaults', details: error.message },
      { status: 500 }
    )
  }
}

async function getDefaultAnswer(
  question: any,
  extractedContext: any,
  allQuestions: any[]
) {
  switch (question.type) {
    case 'multiple-choice':
      return getMultipleChoiceDefault(question, extractedContext)

    case 'text':
      return getTextDefault(question, extractedContext)

    case 'priority':
      return 'medium'

    case 'yes-no':
      return getYesNoDefault(question)

    case 'number':
      return getNumberDefault(question)

    default:
      return ''
  }
}

function getMultipleChoiceDefault(question: any, extractedContext: any) {
  // If there are suggested answers, use the first one
  if (question.suggestedAnswers && question.suggestedAnswers.length > 0) {
    return question.suggestedAnswers[0]
  }

  // Otherwise use first option
  if (question.options && question.options.length > 0) {
    return question.options[0]
  }

  return ''
}

function getTextDefault(question: any, extractedContext: any) {
  // Try to use extracted context for specific questions
  if (!extractedContext) return ''

  const questionLower = question.question.toLowerCase()

  if (questionLower.includes('product name')) {
    return extractedContext.productName
  }

  if (questionLower.includes('target audience') || questionLower.includes('users')) {
    return extractedContext.targetAudience
  }

  if (questionLower.includes('description') || questionLower.includes('what does')) {
    return extractedContext.description
  }

  if (questionLower.includes('problem') || questionLower.includes('solve')) {
    return extractedContext.problemStatement
  }

  // For other text questions, leave blank or use placeholder
  return ''
}

function getYesNoDefault(question: any) {
  const questionLower = question.question.toLowerCase()

  // Common safe defaults
  if (questionLower.includes('authentication') || questionLower.includes('login')) {
    return 'yes'
  }

  if (questionLower.includes('mobile')) {
    return 'no' // Default to web
  }

  if (questionLower.includes('analytics') || questionLower.includes('tracking')) {
    return 'yes'
  }

  // Default to yes for most features
  return 'yes'
}

function getNumberDefault(question: any) {
  const questionLower = question.question.toLowerCase()

  if (questionLower.includes('users') || questionLower.includes('people')) {
    return '1000'
  }

  if (questionLower.includes('team size')) {
    return '5'
  }

  if (questionLower.includes('budget')) {
    return '10000'
  }

  if (questionLower.includes('timeline') || questionLower.includes('weeks')) {
    return '12'
  }

  return '1'
}
```

---

### 3. Enhanced Smart Default Selection with AI

**File:** `app/api/questions/fill-defaults-smart/route.ts`

Optional: Use Claude to make smarter default selections:

```typescript
async function getSmartDefaults(
  questions: any[],
  currentAnswers: any,
  extractedContext: any
) {
  // Build unanswered questions list
  const unansweredQuestions = questions.filter(q => !currentAnswers[q.id])

  if (unansweredQuestions.length === 0) {
    return currentAnswers
  }

  // Use Claude to suggest answers
  const prompt = `
You are helping auto-complete a product requirements questionnaire.

PRODUCT CONTEXT:
${JSON.stringify(extractedContext, null, 2)}

UNANSWERED QUESTIONS:
${unansweredQuestions
  .map(
    (q, i) => `
${i + 1}. ${q.question}
   Type: ${q.type}
   ${q.options ? `Options: ${q.options.join(', ')}` : ''}
   ${q.suggestedAnswers ? `Suggested: ${q.suggestedAnswers.join(', ')}` : ''}
`
  )
  .join('\n')}

For each unanswered question, provide a sensible default answer based on:
1. The product context
2. Suggested answers (if provided, prefer these)
3. Common best practices
4. Conservative/safe defaults when uncertain

Return ONLY a JSON object mapping question IDs to default answers:

{
  "question-id-1": "answer",
  "question-id-2": "answer",
  ...
}
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  })

  const suggestedAnswers = JSON.parse(response.content[0].text)

  // Merge with current answers
  const filledAnswers = { ...currentAnswers }

  for (const question of unansweredQuestions) {
    filledAnswers[question.id] = {
      value: suggestedAnswers[question.id] || '',
      autoCompleted: true,
    }
  }

  return filledAnswers
}
```

---

### 4. Update Convex Schema

**File:** `convex/schema.ts`

Add `autoCompleted` flag to answers:

```typescript
conversations: defineTable({
  // ... existing fields ...

  answers: v.optional(
    v.object({
      // Dynamic keys for question IDs
      // Each answer now has value and autoCompleted flag
    })
  ),

  // Track which questions were auto-completed
  autoCompletedQuestions: v.optional(v.array(v.string())),

  // ... rest of fields
})
```

---

### 5. Update Save Answers Mutation

**File:** `convex/conversations.ts`

Modify to track auto-completed questions:

```typescript
export const saveAnswers = mutation({
  args: {
    conversationId: v.id('conversations'),
    answers: v.any(), // Flexible structure
    autoCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    // Track which questions were auto-completed
    const autoCompletedQuestions: string[] = []
    if (args.autoCompleted) {
      Object.entries(args.answers).forEach(([questionId, answer]: any) => {
        if (answer.autoCompleted) {
          autoCompletedQuestions.push(questionId)
        }
      })
    }

    await ctx.db.patch(args.conversationId, {
      answers: args.answers,
      autoCompletedQuestions: args.autoCompleted
        ? autoCompletedQuestions
        : undefined,
      updatedAt: Date.now(),
    })

    // Update workflow progress
    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        currentStep: 'research',
        completedSteps: ['discovery', 'questions'],
        skippedSteps: args.autoCompleted
          ? ['discovery', 'questions']
          : ['discovery'],
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})
```

---

### 6. Visual Indicators for Auto-Completed Answers

**File:** `components/questions/QuestionCard.tsx`

Add visual indicator for auto-completed answers:

```typescript
interface QuestionCardProps {
  question: Question
  answer?: any
  onChange: (value: string) => void
  isAutoCompleted?: boolean
}

export function QuestionCard({
  question,
  answer,
  onChange,
  isAutoCompleted,
}: QuestionCardProps) {
  return (
    <Card className={cn('p-6', isAutoCompleted && 'border-blue-200 bg-blue-50')}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{question.question}</h3>
          {isAutoCompleted && (
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-filled
            </Badge>
          )}
        </div>

        {/* Question input based on type */}
        {question.type === 'multiple-choice' && (
          <RadioGroup value={answer?.value} onValueChange={onChange}>
            {question.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'text' && (
          <Textarea
            value={answer?.value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter your answer..."
            className={cn(isAutoCompleted && 'border-blue-300')}
          />
        )}

        {/* Other question types... */}
      </div>
    </Card>
  )
}
```

**Update Questions Page:**
```typescript
const autoCompletedQuestions = conversation?.autoCompletedQuestions || []

{questions.map(question => (
  <QuestionCard
    key={question.id}
    question={question}
    answer={answers[question.id]}
    onChange={value => handleAnswerChange(question.id, value)}
    isAutoCompleted={autoCompletedQuestions.includes(question.id)}
  />
))}
```

---

### 7. Allow Editing Auto-Completed Answers

**File:** `app/chat/[conversationId]/questions/page.tsx`

Enable users to modify auto-completed answers:

```typescript
const handleAnswerChange = (questionId: string, value: string) => {
  // Update answer and remove auto-completed flag
  setAnswers(prev => ({
    ...prev,
    [questionId]: {
      value,
      autoCompleted: false, // User is now editing, no longer auto
    },
  }))

  // Also update in Convex to remove from autoCompletedQuestions
  // This can be done via debounced save
}
```

---

### 8. Add Confirmation Dialog for Skip

**File:** `components/questions/SkipConfirmDialog.tsx`

Show confirmation with summary of what will be auto-filled:

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SkipConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  answeredCount: number
  totalCount: number
  unansweredCount: number
}

export function SkipConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  answeredCount,
  totalCount,
  unansweredCount,
}: SkipConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Skip Questions?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You've answered {answeredCount} out of {totalCount} questions.
            </p>
            <p>
              We'll automatically fill the remaining {unansweredCount}{' '}
              questions with recommended or default answers.
            </p>
            <p className="text-sm text-muted-foreground">
              You can always come back to review and edit these answers.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Answering</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Skip & Auto-Fill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

**Usage:**
```typescript
const [showSkipConfirm, setShowSkipConfirm] = useState(false)

const handleSkipClick = () => {
  setShowSkipConfirm(true)
}

const handleConfirmSkip = async () => {
  setShowSkipConfirm(false)
  await handleSkipQuestions()
}

// In JSX
<SkipConfirmDialog
  open={showSkipConfirm}
  onOpenChange={setShowSkipConfirm}
  onConfirm={handleConfirmSkip}
  answeredCount={answeredCount}
  totalCount={totalQuestions}
  unansweredCount={totalQuestions - answeredCount}
/>
```

---

### 9. Analytics Tracking

**File:** `lib/analytics/questionsEvents.ts`

Track skip behavior:

```typescript
export function trackQuestionsSkip(data: {
  conversationId: string
  answeredCount: number
  totalCount: number
  autoFilledCount: number
  hasExtractedContext: boolean
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Questions Skipped', {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      auto_filled_count: data.autoFilledCount,
      completion_rate: (data.answeredCount / data.totalCount) * 100,
      had_context: data.hasExtractedContext,
    })
  }
}
```

---

## Default Answer Rules Summary

### Multiple Choice
1. Use first suggested answer if available
2. Otherwise use first option
3. Fall back to empty string

### Text Input
1. Match question keywords to extracted context
2. Use context fields (productName, description, etc.)
3. Leave blank if no match

### Priority
- Default: "medium"

### Yes/No
- Authentication/Security: "yes"
- Mobile features: "no" (default web)
- Analytics/Tracking: "yes"
- Other: "yes" (inclusive default)

### Number
- Users/Scale: 1000
- Team size: 5
- Budget: 10000
- Timeline: 12 weeks

---

## Testing Checklist

- [ ] Skip button always visible on questions page
- [ ] Skip confirmation dialog shows correct counts
- [ ] Default answers API works for all question types
- [ ] Auto-completed answers saved correctly
- [ ] Visual indicators show auto-completed questions
- [ ] Users can edit auto-completed answers
- [ ] Edited answers remove auto-completed flag
- [ ] Navigation to research page works
- [ ] Works with 0% completion
- [ ] Works with partial completion (50%)
- [ ] Works with extracted context
- [ ] Works without extracted context
- [ ] Error handling for API failures
- [ ] Loading states are clear
- [ ] Analytics tracking works
- [ ] Mobile responsive

---

## Notes

- Prefer recommended/suggested answers when available
- Use extracted context to make answers more relevant
- Conservative defaults for yes/no questions
- Mark auto-completed answers clearly for transparency
- Allow users to edit any answer, including auto-completed ones
- Consider using AI for smarter defaults (optional enhancement)
- Track skip rate and completion rate for product insights
