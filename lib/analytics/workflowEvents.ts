// Declare window.analytics type for TypeScript
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void
    }
  }
}

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
    // Guard against division by zero
    const skipRate = data.completedSteps.length > 0
      ? (data.skippedSteps.length / data.completedSteps.length) * 100
      : 0;

    window.analytics.track('Workflow Completed', {
      conversation_id: data.conversationId,
      total_time_seconds: data.totalTime,
      skipped_steps: data.skippedSteps,
      completed_steps: data.completedSteps,
      skip_rate: skipRate,
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

export function trackAutoAdvanceShown(data: {
  conversationId: string
  fromStep: string
  toStep: string
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Auto Advance Shown', {
      conversation_id: data.conversationId,
      from_step: data.fromStep,
      to_step: data.toStep,
    })
  }
}

export function trackAutoAdvanceCancelled(data: {
  conversationId: string
  fromStep: string
  toStep: string
  timeRemaining: number
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Auto Advance Cancelled', {
      conversation_id: data.conversationId,
      from_step: data.fromStep,
      to_step: data.toStep,
      time_remaining_seconds: data.timeRemaining,
    })
  }
}

export function trackAutoAdvanceCompleted(data: {
  conversationId: string
  fromStep: string
  toStep: string
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Auto Advance Completed', {
      conversation_id: data.conversationId,
      from_step: data.fromStep,
      to_step: data.toStep,
    })
  }
}
