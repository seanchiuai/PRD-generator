# Workflow Orchestration Agent

## Role
Responsible for coordinating the overall workflow flow, including auto-advance between steps, state management, navigation guards, and seamless transitions.

## Objective
Create a smooth, automatic workflow experience where:
1. Users can skip any step
2. System auto-advances to next step when appropriate
3. PRD generation starts automatically (no button click)
4. State persists across page refreshes
5. Navigation is guarded (can't skip ahead)
6. Transitions are smooth and intuitive

## Context
The workflow has 5 steps that need orchestration:
1. Discovery → 2. Questions → 3. Research → 4. Selection → 5. Generate

Currently, users manually click "Continue" buttons. New requirement is auto-advancement with optional user override.

---

## Tasks

### 1. Create Workflow Context Provider

**File:** `contexts/WorkflowContext.tsx`

Global state management for workflow:

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export type WorkflowStep = 'discovery' | 'questions' | 'research' | 'selection' | 'generate'

interface WorkflowState {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  skippedSteps: WorkflowStep[]
  isTransitioning: boolean
  autoAdvanceEnabled: boolean
}

interface WorkflowContextType {
  state: WorkflowState
  conversationId: Id<'conversations'> | null
  setConversationId: (id: Id<'conversations'>) => void
  advanceToNextStep: () => Promise<void>
  goToStep: (step: WorkflowStep) => void
  markStepComplete: (step: WorkflowStep, skipped?: boolean) => void
  canNavigateToStep: (step: WorkflowStep) => boolean
  setAutoAdvance: (enabled: boolean) => void
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)

  // Fetch workflow progress from Convex
  const progress = useQuery(
    api.workflow.getProgress,
    conversationId ? { conversationId } : 'skip'
  )

  // Update progress mutation
  const updateProgress = useMutation(api.workflow.updateProgress)

  const [state, setState] = useState<WorkflowState>({
    currentStep: 'discovery',
    completedSteps: [],
    skippedSteps: [],
    isTransitioning: false,
    autoAdvanceEnabled: true,
  })

  // Sync state with Convex
  useEffect(() => {
    if (progress) {
      setState(prev => ({
        ...prev,
        currentStep: progress.currentStep as WorkflowStep,
        completedSteps: progress.completedSteps as WorkflowStep[],
        skippedSteps: progress.skippedSteps as WorkflowStep[],
      }))
    }
  }, [progress])

  const markStepComplete = async (step: WorkflowStep, skipped = false) => {
    if (!conversationId) return

    const newCompletedSteps = [...state.completedSteps, step]
    const newSkippedSteps = skipped ? [...state.skippedSteps, step] : state.skippedSteps

    setState(prev => ({
      ...prev,
      completedSteps: newCompletedSteps,
      skippedSteps: newSkippedSteps,
    }))

    // Update Convex
    await updateProgress({
      conversationId,
      currentStep: state.currentStep,
      completedSteps: newCompletedSteps,
      skippedSteps: newSkippedSteps,
    })
  }

  const advanceToNextStep = async () => {
    const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]

      setIsTransitioning(true)

      // Mark current step as complete
      await markStepComplete(state.currentStep)

      // Advance to next step
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
      }))

      if (conversationId) {
        await updateProgress({
          conversationId,
          currentStep: nextStep,
          completedSteps: [...state.completedSteps, state.currentStep],
          skippedSteps: state.skippedSteps,
        })
      }

      setIsTransitioning(false)
    }
  }

  const goToStep = (step: WorkflowStep) => {
    if (canNavigateToStep(step)) {
      setState(prev => ({ ...prev, currentStep: step }))

      if (conversationId) {
        updateProgress({
          conversationId,
          currentStep: step,
          completedSteps: state.completedSteps,
          skippedSteps: state.skippedSteps,
        })
      }
    }
  }

  const canNavigateToStep = (targetStep: WorkflowStep): boolean => {
    // Can always navigate to completed steps
    if (state.completedSteps.includes(targetStep)) return true

    // Can only navigate to next step after current
    const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
    const currentIndex = steps.indexOf(state.currentStep)
    const targetIndex = steps.indexOf(targetStep)

    return targetIndex <= currentIndex + 1
  }

  const setAutoAdvance = (enabled: boolean) => {
    setAutoAdvanceEnabled(enabled)
    setState(prev => ({ ...prev, autoAdvanceEnabled: enabled }))
  }

  return (
    <WorkflowContext.Provider
      value={{
        state: { ...state, isTransitioning, autoAdvanceEnabled },
        conversationId,
        setConversationId,
        advanceToNextStep,
        goToStep,
        markStepComplete,
        canNavigateToStep,
        setAutoAdvance,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}
```

---

### 2. Add Workflow Provider to App

**File:** `app/layout.tsx`

Wrap app with WorkflowProvider:

```tsx
import { WorkflowProvider } from '@/contexts/WorkflowContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexProviderWithClerk client={convex}>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </ConvexProviderWithClerk>
      </body>
    </html>
  )
}
```

---

### 3. Create Navigation Guards

**File:** `lib/workflow/guards.ts`

Prevent unauthorized navigation:

```typescript
import { WorkflowStep } from '@/contexts/WorkflowContext'
import { redirect } from 'next/navigation'

export function enforceWorkflowOrder(
  requestedStep: WorkflowStep,
  currentStep: WorkflowStep,
  completedSteps: WorkflowStep[],
  conversationId: string
): void {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']

  // Allow navigation to completed steps
  if (completedSteps.includes(requestedStep)) {
    return
  }

  // Allow navigation to current step
  if (requestedStep === currentStep) {
    return
  }

  // Allow navigation to next step only
  const currentIndex = steps.indexOf(currentStep)
  const requestedIndex = steps.indexOf(requestedStep)

  if (requestedIndex === currentIndex + 1) {
    return
  }

  // Otherwise, redirect to current step
  const stepRoutes: Record<WorkflowStep, string> = {
    discovery: `/chat/${conversationId}`,
    questions: `/chat/${conversationId}/questions`,
    research: `/chat/${conversationId}/research`,
    selection: `/chat/${conversationId}/select`,
    generate: `/chat/${conversationId}/generate`,
  }

  redirect(stepRoutes[currentStep])
}

export function getStepRoute(step: WorkflowStep, conversationId: string): string {
  const routes: Record<WorkflowStep, string> = {
    discovery: `/chat/${conversationId}`,
    questions: `/chat/${conversationId}/questions`,
    research: `/chat/${conversationId}/research`,
    selection: `/chat/${conversationId}/select`,
    generate: `/chat/${conversationId}/generate`,
  }
  return routes[step]
}

export function getNextStepRoute(currentStep: WorkflowStep, conversationId: string): string | null {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
  const currentIndex = steps.indexOf(currentStep)

  if (currentIndex < steps.length - 1) {
    const nextStep = steps[currentIndex + 1]
    return getStepRoute(nextStep, conversationId)
  }

  return null
}
```

---

### 4. Update Generate Page for Auto-Start

**File:** `app/chat/[conversationId]/generate/page.tsx`

Automatically start PRD generation when page loads:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import { useWorkflow } from '@/contexts/WorkflowContext'
import { GenerationProgress } from '@/components/prd/GenerationProgress'
import { PRDDisplay } from '@/components/prd/PRDDisplay'

export default function GeneratePage({
  params,
}: {
  params: { conversationId: string }
}) {
  const router = useRouter()
  const { markStepComplete } = useWorkflow()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [prdData, setPrdData] = useState(null)

  const conversationId = params.conversationId as Id<'conversations'>

  // Check if PRD already exists
  const existingPrd = useQuery(api.prds.getByConversation, { conversationId })

  useEffect(() => {
    // Auto-start generation if PRD doesn't exist
    if (existingPrd === undefined) return // Still loading

    if (existingPrd) {
      // PRD already exists, show it
      setPrdData(existingPrd)
      setGenerationComplete(true)
    } else if (!isGenerating) {
      // Start generation automatically
      startGeneration()
    }
  }, [existingPrd, isGenerating])

  const startGeneration = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/prd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()

      setPrdData(data.prd)
      setGenerationComplete(true)

      // Mark generation step complete
      await markStepComplete('generate')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate PRD. Please try again.')
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <WorkflowLayout
        currentStep="generate"
        completedSteps={['discovery', 'questions', 'research', 'selection']}
        conversationId={conversationId}
      >
        <GenerationProgress />
      </WorkflowLayout>
    )
  }

  if (generationComplete && prdData) {
    return (
      <WorkflowLayout
        currentStep="generate"
        completedSteps={['discovery', 'questions', 'research', 'selection', 'generate']}
        conversationId={conversationId}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your PRD is Ready!</h1>
            <Button onClick={() => router.push(`/prd/${prdData._id}`)}>
              View Full PRD
            </Button>
          </div>
          <PRDDisplay prd={prdData} />
        </div>
      </WorkflowLayout>
    )
  }

  return null
}
```

---

### 5. Create Auto-Advance Component

**File:** `components/workflow/AutoAdvance.tsx`

Reusable component for auto-advancing with countdown:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Pause } from 'lucide-react'

interface AutoAdvanceProps {
  enabled: boolean
  delaySeconds?: number
  nextStepName: string
  onAdvance: () => void
  onCancel?: () => void
}

export function AutoAdvance({
  enabled,
  delaySeconds = 5,
  nextStepName,
  onAdvance,
  onCancel,
}: AutoAdvanceProps) {
  const [countdown, setCountdown] = useState(delaySeconds)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!enabled || isPaused) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      // Countdown finished, advance
      onAdvance()
    }
  }, [enabled, countdown, isPaused, onAdvance])

  const handlePause = () => {
    setIsPaused(true)
    onCancel?.()
  }

  if (!enabled || isPaused) return null

  const progressPercent = ((delaySeconds - countdown) / delaySeconds) * 100

  return (
    <Card className="fixed bottom-8 right-8 p-6 max-w-sm shadow-xl border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Proceeding to {nextStepName}</p>
            <p className="text-sm text-muted-foreground">in {countdown} seconds</p>
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          className="w-full"
        >
          <Pause className="w-4 h-4 mr-2" />
          Stay on this page
        </Button>
      </div>
    </Card>
  )
}
```

---

### 6. Use Auto-Advance in Selection Page

**File:** `app/chat/[conversationId]/select/page.tsx`

Add auto-advance after selection complete:

```typescript
import { AutoAdvance } from '@/components/workflow/AutoAdvance'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SelectPage({ params }: { params: { conversationId: string } }) {
  const router = useRouter()
  const [showAutoAdvance, setShowAutoAdvance] = useState(false)

  // Check if selection is complete
  const isSelectionComplete = selection?.frontend &&
    selection?.backend &&
    selection?.database &&
    selection?.auth &&
    selection?.hosting

  useEffect(() => {
    if (isSelectionComplete && !validationErrors.length) {
      // Show auto-advance after 2 seconds
      const timer = setTimeout(() => {
        setShowAutoAdvance(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isSelectionComplete, validationErrors])

  const handleAdvanceToGenerate = () => {
    router.push(`/chat/${params.conversationId}/generate`)
  }

  return (
    <WorkflowLayout
      currentStep="selection"
      completedSteps={['discovery', 'questions', 'research']}
      conversationId={params.conversationId}
    >
      {/* Existing selection UI */}

      <AutoAdvance
        enabled={showAutoAdvance}
        delaySeconds={5}
        nextStepName="PRD Generation"
        onAdvance={handleAdvanceToGenerate}
        onCancel={() => setShowAutoAdvance(false)}
      />
    </WorkflowLayout>
  )
}
```

---

### 7. Create Transition Animations

**File:** `components/workflow/PageTransition.tsx`

Smooth page transitions using framer-motion:

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Use in WorkflowLayout:**
```tsx
import { PageTransition } from './PageTransition'

export function WorkflowLayout({ children, ...props }: WorkflowLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header>{/* Progress bar */}</header>

      <PageTransition>
        <main className="flex-1">
          {children}
        </main>
      </PageTransition>

      {props.showFooter && <footer>{/* Footer */}</footer>}
    </div>
  )
}
```

---

### 8. Add Workflow Persistence

**File:** `lib/workflow/persistence.ts`

Save workflow state to localStorage for recovery:

```typescript
import { WorkflowStep } from '@/contexts/WorkflowContext'

interface WorkflowSnapshot {
  conversationId: string
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  skippedSteps: WorkflowStep[]
  timestamp: number
}

const STORAGE_KEY = 'workflow_snapshot'

export function saveWorkflowSnapshot(snapshot: WorkflowSnapshot): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (error) {
    console.error('Failed to save workflow snapshot:', error)
  }
}

export function loadWorkflowSnapshot(conversationId: string): WorkflowSnapshot | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const snapshot: WorkflowSnapshot = JSON.parse(stored)

    // Only return if it's for the same conversation and recent (< 24 hours)
    const isRecent = Date.now() - snapshot.timestamp < 24 * 60 * 60 * 1000
    const isSameConversation = snapshot.conversationId === conversationId

    return isRecent && isSameConversation ? snapshot : null
  } catch (error) {
    console.error('Failed to load workflow snapshot:', error)
    return null
  }
}

export function clearWorkflowSnapshot(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear workflow snapshot:', error)
  }
}
```

**Use in WorkflowContext:**
```typescript
// Save snapshot whenever state changes
useEffect(() => {
  if (conversationId) {
    saveWorkflowSnapshot({
      conversationId,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      skippedSteps: state.skippedSteps,
      timestamp: Date.now(),
    })
  }
}, [conversationId, state])

// Load snapshot on mount
useEffect(() => {
  if (conversationId) {
    const snapshot = loadWorkflowSnapshot(conversationId)
    if (snapshot) {
      setState(prev => ({
        ...prev,
        currentStep: snapshot.currentStep,
        completedSteps: snapshot.completedSteps,
        skippedSteps: snapshot.skippedSteps,
      }))
    }
  }
}, [conversationId])
```

---

### 9. Create Workflow Analytics

**File:** `lib/analytics/workflowEvents.ts`

Track complete workflow journey:

```typescript
export function trackWorkflowStart(conversationId: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Workflow Started', {
      conversation_id: conversationId,
      timestamp: Date.now(),
    })
  }
}

export function trackStepComplete(data: {
  conversationId: string
  step: string
  skipped: boolean
  timeSpent: number
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Workflow Step Completed', {
      conversation_id: data.conversationId,
      step: data.step,
      skipped: data.skipped,
      time_spent_seconds: data.timeSpent,
    })
  }
}

export function trackWorkflowComplete(data: {
  conversationId: string
  totalTime: number
  skippedSteps: string[]
  completedSteps: string[]
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Workflow Completed', {
      conversation_id: data.conversationId,
      total_time_seconds: data.totalTime,
      skipped_steps: data.skippedSteps,
      completed_steps: data.completedSteps,
      skip_rate: (data.skippedSteps.length / data.completedSteps.length) * 100,
    })
  }
}

export function trackWorkflowAbandoned(data: {
  conversationId: string
  lastStep: string
  timeSpent: number
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Workflow Abandoned', {
      conversation_id: data.conversationId,
      last_step: data.lastStep,
      time_spent_seconds: data.timeSpent,
    })
  }
}
```

---

## Testing Checklist

- [ ] Workflow context provides state to all pages
- [ ] State persists on page refresh
- [ ] Navigation guards prevent skipping ahead
- [ ] Can navigate back to completed steps
- [ ] Auto-advance shows countdown
- [ ] Can cancel auto-advance
- [ ] Generate page auto-starts PRD generation
- [ ] Page transitions are smooth
- [ ] Loading states during transitions
- [ ] Analytics events fire correctly
- [ ] localStorage persistence works
- [ ] Multi-tab sync (if implemented)
- [ ] Error recovery works
- [ ] Mobile responsive
- [ ] Accessibility: keyboard navigation

---

## Dependencies

Install if needed:
```bash
npm install framer-motion
```

---

## Notes

- Auto-advance gives users 5 seconds to cancel (good UX balance)
- PRD generation starts immediately (no waiting)
- State syncs between Convex (server) and localStorage (client)
- Navigation guards prevent accessing incomplete steps
- Page transitions provide visual continuity
- Analytics track complete user journey
- Consider adding progress saving notification
- Consider multi-tab synchronization
- Test thoroughly on slow connections
