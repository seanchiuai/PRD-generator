import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  HelpCircle,
  Search,
  CheckSquare,
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
  { id: "research", label: "Research", path: "/chat/[id]/research", icon: Search },
  { id: "selection", label: "Selection", path: "/chat/[id]/select", icon: CheckSquare },
  { id: "generate", label: "Generate", path: "/chat/[id]/generate", icon: FileText },
];

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
