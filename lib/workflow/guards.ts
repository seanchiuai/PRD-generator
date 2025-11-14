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
    return getStepRoute(nextStep as WorkflowStep, conversationId)
  }

  return null
}
