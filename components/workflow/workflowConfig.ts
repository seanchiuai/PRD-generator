import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  HelpCircle,
  Layers,
  FileText,
  Settings,
} from "lucide-react";

export interface WorkflowStep {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "setup", label: "Setup", path: "/chat/[id]/setup", icon: Settings },
  { id: "discovery", label: "Discovery", path: "/chat/[id]", icon: MessageSquare },
  { id: "questions", label: "Questions", path: "/chat/[id]/questions", icon: HelpCircle },
  { id: "tech-stack", label: "Tech Stack", path: "/chat/[id]/tech-stack", icon: Layers },
  { id: "generate", label: "Generate", path: "/chat/[id]/generate", icon: FileText },
];

/**
 * Determines the status of a workflow step.
 * Precedence: completed > current > future
 * (A step marked as completed takes precedence over being the current step)
 */
export const getStepStatus = (stepId: string, currentStep: string, completedSteps: string[]) => {
  if (completedSteps.includes(stepId)) return "completed";
  if (stepId === currentStep) return "current";
  return "future";
};

export const getStepPath = (step: WorkflowStep, conversationId: string) => {
  return step.path.replace("[id]", conversationId);
};

export const canNavigate = (stepId: string, completedSteps: string[]) => {
  return completedSteps.includes(stepId);
};
