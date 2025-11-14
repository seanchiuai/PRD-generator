# Workflow UI Agent

## Role
Responsible for creating the visual workflow infrastructure: progress bar, layout wrapper, skip buttons, and navigation components.

## Objective
Build reusable UI components that provide consistent navigation and skip functionality across all workflow steps.

## Context
The PRD generator has 5 main workflow steps that need visual progress tracking:
1. Discovery (chat)
2. Questions
3. Tech Research
4. Tech Selection
5. PRD Generation

Users should see their progress, be able to navigate back to completed steps, and have access to skip buttons.

---

## Tasks

### 1. Create WorkflowProgress Component

**File:** `components/workflow/WorkflowProgress.tsx`

Create a horizontal progress bar component:

**Requirements:**
- Show all 5 workflow steps with icons
- Highlight current step
- Show checkmarks for completed steps
- Grey out future steps
- Allow clicking completed steps to navigate back
- Responsive: horizontal on desktop, scrollable on mobile
- Use Tailwind for styling
- Use shadcn/ui components where appropriate

**Step Configuration:**
```typescript
const WORKFLOW_STEPS = [
  { id: 'discovery', label: 'Discovery', path: '/chat/[id]', icon: MessageSquare },
  { id: 'questions', label: 'Questions', path: '/chat/[id]/questions', icon: HelpCircle },
  { id: 'research', label: 'Research', path: '/chat/[id]/research', icon: Search },
  { id: 'selection', label: 'Selection', path: '/chat/[id]/select', icon: CheckSquare },
  { id: 'generate', label: 'Generate', path: '/chat/[id]/generate', icon: FileText },
]
```

**Props:**
```typescript
interface WorkflowProgressProps {
  currentStep: string
  completedSteps: string[]
  conversationId: string
  onStepClick?: (stepId: string) => void
}
```

**Visual Design:**
```
Desktop:
[✓ Discovery] ──→ [● Questions] ──→ [ Research ] ──→ [ Selection ] ──→ [ Generate ]
  Completed         Current              Future            Future          Future

Mobile:
[✓] Discovery
[●] Questions  ← Scrollable
[ ] Research
[ ] Selection
[ ] Generate
```

**Implementation Notes:**
- Use `lucide-react` for icons
- Add hover states for completed steps
- Use `next/link` for navigation
- Add smooth transitions with framer-motion
- Use Tailwind classes for colors: completed (green), current (blue), future (gray)

---

### 2. Create WorkflowLayout Component

**File:** `components/workflow/WorkflowLayout.tsx`

Wrapper component for all workflow pages:

**Requirements:**
- Fixed progress bar at top
- Optional skip button in top-right
- Main content area (scrollable)
- Optional footer with Back/Next buttons
- Consistent padding and spacing
- Mobile-responsive

**Props:**
```typescript
interface WorkflowLayoutProps {
  currentStep: string
  completedSteps: string[]
  conversationId: string
  children: React.ReactNode
  showSkipButton?: boolean
  onSkip?: () => void
  skipButtonText?: string
  skipButtonLoading?: boolean
  showFooter?: boolean
  onBack?: () => void
  onNext?: () => void
  nextButtonText?: string
  nextButtonDisabled?: boolean
}
```

**Layout Structure:**
```tsx
<div className="min-h-screen flex flex-col">
  {/* Fixed header with progress */}
  <header className="sticky top-0 z-50 bg-white border-b">
    <WorkflowProgress {...progressProps} />
    {showSkipButton && (
      <div className="absolute top-4 right-4">
        <SkipButton {...skipProps} />
      </div>
    )}
  </header>

  {/* Main content */}
  <main className="flex-1 container mx-auto py-8">
    {children}
  </main>

  {/* Optional footer */}
  {showFooter && (
    <footer className="border-t p-4">
      <div className="container mx-auto flex justify-between">
        <Button onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={nextButtonDisabled}>
          {nextButtonText}
        </Button>
      </div>
    </footer>
  )}
</div>
```

---

### 3. Create SkipButton Component

**File:** `components/workflow/SkipButton.tsx`

Reusable skip button with consistent styling:

**Requirements:**
- Icon + text
- Loading state
- Hover animation
- Optional confirmation dialog
- Analytics tracking

**Props:**
```typescript
interface SkipButtonProps {
  onSkip: () => void
  loading?: boolean
  confirmMessage?: string
  confirmTitle?: string
  buttonText?: string
  variant?: 'default' | 'outline' | 'ghost'
}
```

**Features:**
- Default text: "Skip this step"
- Use `ArrowRight` icon from lucide-react
- Show confirmation dialog if `confirmMessage` provided
- Use shadcn/ui AlertDialog for confirmation
- Disable during loading
- Show spinner during loading
- Track skip event with analytics (if available)

**Example Usage:**
```tsx
<SkipButton
  onSkip={handleSkip}
  loading={isSkipping}
  confirmMessage="Are you sure you want to skip? Default options will be selected."
  confirmTitle="Skip Questions?"
  buttonText="Skip to Research"
/>
```

---

### 4. Update All Workflow Pages

Wrap each workflow page with `WorkflowLayout`:

#### 4.1 Discovery Page
**File:** `app/chat/[conversationId]/page.tsx`

**Changes:**
- Import and use `WorkflowLayout`
- Pass `currentStep="discovery"`
- Calculate `completedSteps` based on conversation stage
- Add skip button (shown after first user message)
- Handle skip click (will be implemented by discovery-skip agent)

**Example:**
```tsx
<WorkflowLayout
  currentStep="discovery"
  completedSteps={[]}
  conversationId={conversationId}
  showSkipButton={messages.length > 0}
  onSkip={handleSkipDiscovery}
  skipButtonText="Skip to Questions"
>
  {/* Existing chat UI */}
</WorkflowLayout>
```

#### 4.2 Questions Page
**File:** `app/chat/[conversationId]/questions/page.tsx`

**Changes:**
- Wrap with `WorkflowLayout`
- Pass `currentStep="questions"`
- Pass `completedSteps={['discovery']}`
- Add skip button (always shown)
- Remove existing "Continue" button, add to footer

#### 4.3 Research Page
**File:** `app/chat/[conversationId]/research/page.tsx`

**Changes:**
- Wrap with `WorkflowLayout`
- Pass `currentStep="research"`
- Pass `completedSteps={['discovery', 'questions']}`
- Add skip button
- Move navigation to footer

#### 4.4 Selection Page
**File:** `app/chat/[conversationId]/select/page.tsx`

**Changes:**
- Wrap with `WorkflowLayout`
- Pass `currentStep="selection"`
- Pass `completedSteps={['discovery', 'questions', 'research']}`
- Add skip button
- Move navigation to footer

#### 4.5 Generate Page
**File:** `app/chat/[conversationId]/generate/page.tsx`

**Changes:**
- Wrap with `WorkflowLayout`
- Pass `currentStep="generate"`
- Pass `completedSteps={['discovery', 'questions', 'research', 'selection']}`
- No skip button (final step)
- No footer (auto-redirects when complete)

---

### 5. Add Workflow Progress Tracking

**File:** `lib/workflow/progress.ts`

Utility functions for tracking progress:

```typescript
export type WorkflowStep = 'discovery' | 'questions' | 'research' | 'selection' | 'generate'

export interface WorkflowProgress {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  skippedSteps: WorkflowStep[]
}

export function getCompletedSteps(stage: string): WorkflowStep[] {
  const stageMap: Record<string, WorkflowStep[]> = {
    'chat': [],
    'questions': ['discovery'],
    'research': ['discovery', 'questions'],
    'selection': ['discovery', 'questions', 'research'],
    'generation': ['discovery', 'questions', 'research', 'selection'],
  }
  return stageMap[stage] || []
}

export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
  const currentIndex = steps.indexOf(currentStep)
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
}

export function canNavigateToStep(
  targetStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
  const targetIndex = steps.indexOf(targetStep)

  // Can only navigate to completed steps or next step
  if (completedSteps.includes(targetStep)) return true

  const nextStep = getNextStep(completedSteps[completedSteps.length - 1])
  return nextStep === targetStep
}
```

---

### 6. Update Convex Schema

**File:** `convex/schema.ts`

Add workflow progress tracking to conversations:

```typescript
// Add to conversations table
workflowProgress: v.optional(v.object({
  currentStep: v.string(), // 'discovery' | 'questions' | 'research' | 'selection' | 'generate'
  completedSteps: v.array(v.string()),
  skippedSteps: v.array(v.string()),
  lastUpdated: v.number(),
}))
```

---

### 7. Create Convex Workflow Functions

**File:** `convex/workflow.ts`

```typescript
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const updateProgress = mutation({
  args: {
    conversationId: v.id('conversations'),
    currentStep: v.string(),
    completedSteps: v.array(v.string()),
    skippedSteps: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation) throw new Error('Conversation not found')
    if (conversation.userId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        currentStep: args.currentStep,
        completedSteps: args.completedSteps,
        skippedSteps: args.skippedSteps || [],
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})

export const getProgress = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== identity.subject) return null

    return conversation.workflowProgress || {
      currentStep: 'discovery',
      completedSteps: [],
      skippedSteps: [],
      lastUpdated: Date.now(),
    }
  },
})
```

---

## Testing Checklist

- [ ] Progress bar shows all 5 steps correctly
- [ ] Current step is highlighted
- [ ] Completed steps show checkmarks
- [ ] Can click completed steps to navigate back
- [ ] Progress bar is responsive on mobile
- [ ] WorkflowLayout wraps all pages consistently
- [ ] Skip buttons appear when expected
- [ ] Skip buttons show loading state
- [ ] Confirmation dialogs work
- [ ] Footer buttons navigate correctly
- [ ] Convex progress tracking works
- [ ] No layout shifts when skip button appears
- [ ] Animations are smooth
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader friendly

---

## Dependencies

Install if not already present:
```bash
npm install framer-motion lucide-react
```

---

## Notes

- Use existing shadcn/ui components (Button, AlertDialog, Card, etc.)
- Follow Tailwind 4 conventions
- Ensure mobile-first responsive design
- Add proper TypeScript types for all components
- Use `"use client"` directive for client components
- Follow existing code patterns in the codebase
- Test on multiple screen sizes
- Ensure progress state persists on page refresh
