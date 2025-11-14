export type WorkflowStep = 'discovery' | 'questions' | 'research' | 'selection' | 'generate'

export interface WorkflowProgress {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  skippedSteps: WorkflowStep[]
}

/**
 * Get the list of completed steps based on the current stage
 */
export function getCompletedSteps(stage: string): WorkflowStep[] {
  const stageMap: Record<string, WorkflowStep[]> = {
    'chat': [],
    'questions': ['discovery'],
    'research': ['discovery', 'questions'],
    'selection': ['discovery', 'questions', 'research'],
    'generation': ['discovery', 'questions', 'research', 'selection'],
    'generate': ['discovery', 'questions', 'research', 'selection'],
  }
  return stageMap[stage] || []
}

/**
 * Get the next step in the workflow
 */
export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
  const currentIndex = steps.indexOf(currentStep)
  const nextStep = steps[currentIndex + 1]
  return nextStep !== undefined ? nextStep : null
}

/**
 * Get the previous step in the workflow
 */
export function getPreviousStep(currentStep: WorkflowStep): WorkflowStep | null {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
  const currentIndex = steps.indexOf(currentStep)
  const prevStep = steps[currentIndex - 1]
  return prevStep !== undefined ? prevStep : null
}

/**
 * Check if a user can navigate to a specific step
 * Users can navigate to:
 * - Completed steps (to go back and review)
 * - The next step after the last completed step
 */
export function canNavigateToStep(
  targetStep: WorkflowStep,
  completedSteps: WorkflowStep[]
): boolean {
  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']

  // Can always navigate to completed steps
  if (completedSteps.includes(targetStep)) return true

  // Can navigate to the next step after the last completed step
  if (completedSteps.length === 0) {
    // If no steps completed, can only access discovery
    return targetStep === 'discovery'
  }

  const lastCompletedIndex = Math.max(
    ...completedSteps.map(step => steps.indexOf(step))
  )
  const targetIndex = steps.indexOf(targetStep)

  // Can navigate to the next step
  return targetIndex === lastCompletedIndex + 1
}

/**
 * Get the step ID from a path
 */
export function getStepFromPath(pathname: string): WorkflowStep {
  if (pathname.includes('/generate')) return 'generate'
  if (pathname.includes('/select')) return 'selection'
  if (pathname.includes('/research')) return 'research'
  if (pathname.includes('/questions')) return 'questions'
  return 'discovery'
}

/**
 * Get the path for a specific step
 */
export function getStepPath(step: WorkflowStep, conversationId: string): string {
  const pathMap: Record<WorkflowStep, string> = {
    discovery: `/chat/${conversationId}`,
    questions: `/chat/${conversationId}/questions`,
    research: `/chat/${conversationId}/research`,
    selection: `/chat/${conversationId}/select`,
    generate: `/chat/${conversationId}/generate`,
  }
  return pathMap[step]
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(completedSteps: WorkflowStep[]): number {
  const totalSteps = 5
  return Math.round((completedSteps.length / totalSteps) * 100)
}

/**
 * Check if a step was skipped
 */
export function isStepSkipped(
  step: WorkflowStep,
  skippedSteps: WorkflowStep[]
): boolean {
  return skippedSteps.includes(step)
}

/**
 * Get all workflow steps
 */
export function getAllSteps(): WorkflowStep[] {
  return ['discovery', 'questions', 'research', 'selection', 'generate']
}
