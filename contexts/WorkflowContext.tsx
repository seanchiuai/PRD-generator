'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { saveWorkflowSnapshot, loadWorkflowSnapshot } from '@/lib/workflow/persistence'
import { logger } from '@/lib/logger'

export type WorkflowStep = 'discovery' | 'questions' | 'research' | 'selection' | 'generate'

const WORKFLOW_STEPS: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx])
}

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
  markStepComplete: (step: WorkflowStep, skipped?: boolean) => Promise<void>
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
      setState(prev => {
        // Only update if values have changed
        if (
          prev.currentStep === progress.currentStep &&
          arraysEqual(prev.completedSteps, progress.completedSteps as WorkflowStep[]) &&
          arraysEqual(prev.skippedSteps, progress.skippedSteps as WorkflowStep[])
        ) {
          return prev
        }
        return {
          ...prev,
          currentStep: progress.currentStep as WorkflowStep,
          completedSteps: progress.completedSteps as WorkflowStep[],
          skippedSteps: progress.skippedSteps as WorkflowStep[],
        }
      })
    }
  }, [progress])

  // Load snapshot on mount
  useEffect(() => {
    if (conversationId) {
      const snapshot = loadWorkflowSnapshot(conversationId)
      if (snapshot && !progress) {
        // Only use snapshot if Convex hasn't loaded yet
        setState(prev => ({
          ...prev,
          currentStep: snapshot.currentStep,
          completedSteps: snapshot.completedSteps,
          skippedSteps: snapshot.skippedSteps,
        }))
      }
    }
  }, [conversationId, progress])

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
  }, [conversationId, state.currentStep, state.completedSteps, state.skippedSteps])

  const markStepComplete = async (step: WorkflowStep, skipped = false) => {
    if (!conversationId) return

    const newCompletedSteps = state.completedSteps.includes(step)
      ? state.completedSteps
      : [...state.completedSteps, step]
    const newSkippedSteps = skipped
      ? state.skippedSteps.includes(step)
        ? state.skippedSteps
        : [...state.skippedSteps, step]
      : state.skippedSteps

    try {
      // Update Convex
      await updateProgress({
        conversationId,
        currentStep: state.currentStep,
        completedSteps: newCompletedSteps,
        skippedSteps: newSkippedSteps,
      })

      // Only update local state after successful remote update
      setState(prev => ({
        ...prev,
        completedSteps: newCompletedSteps,
        skippedSteps: newSkippedSteps,
      }))
    } catch (error) {
      logger.error('WorkflowContext.markStepComplete', error, { conversationId, step })
    }
  }

  const advanceToNextStep = async () => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)

    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1]
      const newCompletedSteps = state.completedSteps.includes(state.currentStep)
        ? state.completedSteps
        : [...state.completedSteps, state.currentStep]

      setIsTransitioning(true)

      try {
        // Single Convex update
        if (conversationId) {
          await updateProgress({
            conversationId,
            currentStep: nextStep as WorkflowStep,
            completedSteps: newCompletedSteps,
            skippedSteps: state.skippedSteps,
          })
        }

        // Only update local state after successful remote update
        setState(prev => ({
          ...prev,
          currentStep: nextStep as WorkflowStep,
          completedSteps: newCompletedSteps,
        }))
      } catch (error) {
        logger.error('WorkflowContext.advanceToNextStep', error, { conversationId })
      } finally {
        setIsTransitioning(false)
      }
    }
  }

  const goToStep = async (step: WorkflowStep) => {
    if (canNavigateToStep(step)) {
      if (conversationId) {
        // Await the promise and handle errors
        try {
          await updateProgress({
            conversationId,
            currentStep: step,
            completedSteps: state.completedSteps,
            skippedSteps: state.skippedSteps,
          })

          // Update local state only after successful remote update
          setState(prev => ({ ...prev, currentStep: step }))
        } catch (error) {
          logger.error('WorkflowContext.goToStep', error, { conversationId, step })
        }
      } else {
        // No conversationId, update local state directly
        setState(prev => ({ ...prev, currentStep: step }))
      }
    }
  }

  const canNavigateToStep = (targetStep: WorkflowStep): boolean => {
    // Can always navigate to completed steps
    if (state.completedSteps.includes(targetStep)) return true

    // Can only navigate to next step after current
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
    const targetIndex = WORKFLOW_STEPS.indexOf(targetStep)

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
