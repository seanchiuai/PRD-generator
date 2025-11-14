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
