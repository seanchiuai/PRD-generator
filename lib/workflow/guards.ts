import { WorkflowStep } from '@/contexts/WorkflowContext'
import { redirect } from 'next/navigation'

// Active workflow steps (discovery removed from flow)
const WORKFLOW_STEPS: WorkflowStep[] = ['setup', 'questions', 'tech-stack', 'generate']

// Note: discovery route kept for backwards compatibility
const STEP_ROUTES: Record<WorkflowStep, (conversationId: string) => string> = {
  discovery: (conversationId) => `/chat/${conversationId}/questions`, // redirect to questions
  setup: (conversationId) => `/chat/${conversationId}/setup`,
  questions: (conversationId) => `/chat/${conversationId}/questions`,
  'tech-stack': (conversationId) => `/chat/${conversationId}/tech-stack`,
  generate: (conversationId) => `/chat/${conversationId}/generate`,
}

export function enforceWorkflowOrder(
  requestedStep: WorkflowStep,
  currentStep: WorkflowStep,
  completedSteps: WorkflowStep[],
  conversationId: string
): void {
  // Allow navigation to completed steps
  if (completedSteps.includes(requestedStep)) {
    return
  }

  // Allow navigation to current step
  if (requestedStep === currentStep) {
    return
  }

  // Allow navigation to next step only
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep)
  const requestedIndex = WORKFLOW_STEPS.indexOf(requestedStep)

  if (requestedIndex === currentIndex + 1) {
    return
  }

  // Otherwise, redirect to current step
  redirect(STEP_ROUTES[currentStep](conversationId))
}

export function getStepRoute(step: WorkflowStep, conversationId: string): string {
  return STEP_ROUTES[step](conversationId)
}

export function getNextStepRoute(currentStep: WorkflowStep, conversationId: string): string | null {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep)

  if (currentIndex < WORKFLOW_STEPS.length - 1) {
    const nextStep = WORKFLOW_STEPS[currentIndex + 1]
    return getStepRoute(nextStep as WorkflowStep, conversationId)
  }

  return null
}
