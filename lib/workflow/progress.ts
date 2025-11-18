// Note: 'discovery' kept for backwards compatibility with existing data
export type WorkflowStep = 'discovery' | 'questions' | 'tech-stack' | 'generate'

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
    'setup': [],
    'questions': [],
    'tech-stack': ['questions'],
    'generate': ['questions', 'tech-stack'],
  }
  return stageMap[stage] || []
}

/**
 * Get the next step in the workflow
 */
export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const steps = getAllSteps()
  const currentIndex = steps.indexOf(currentStep)
  const nextStep = steps[currentIndex + 1]
  return nextStep !== undefined ? nextStep : null
}

/**
 * Get the previous step in the workflow
 */
export function getPreviousStep(currentStep: WorkflowStep): WorkflowStep | null {
  const steps = getAllSteps()
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
  const steps = getAllSteps()

  // Can always navigate to completed steps
  if (completedSteps.includes(targetStep)) return true

  // Can navigate to the next step after the last completed step
  if (completedSteps.length === 0) {
    // If no steps completed, can only access questions
    return targetStep === 'questions'
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
  // Split pathname by '/' and filter empty segments
  const segments = pathname.split('/').filter(s => s.length > 0)

  // Check for exact segment matches to avoid false positives
  if (segments.includes('generate')) return 'generate'
  if (segments.includes('tech-stack')) return 'tech-stack'
  if (segments.includes('questions')) return 'questions'
  return 'questions'
}

/**
 * Get the path for a specific step
 */
export function getStepPath(step: WorkflowStep, conversationId: string): string {
  const pathMap: Record<WorkflowStep, string> = {
    discovery: `/chat/${conversationId}/questions`, // redirect to questions
    questions: `/chat/${conversationId}/questions`,
    'tech-stack': `/chat/${conversationId}/tech-stack`,
    generate: `/chat/${conversationId}/generate`,
  }
  return pathMap[step]
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(completedSteps: WorkflowStep[]): number {
  const totalSteps = getAllSteps().length
  if (totalSteps === 0) return 0
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
  return ['questions', 'tech-stack', 'generate']
}
