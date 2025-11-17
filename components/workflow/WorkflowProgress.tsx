"use client";

import { DesktopWorkflow } from "./DesktopWorkflow";
import { MobileWorkflow } from "./MobileWorkflow";

export type { WorkflowStep } from "./workflowConfig";

export interface WorkflowProgressProps {
  currentStep: string;
  completedSteps: string[];
  conversationId: string;
  onStepClick?: (stepId: string) => void;
}

export function WorkflowProgress({
  currentStep,
  completedSteps,
  conversationId,
  onStepClick,
}: WorkflowProgressProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b">
      <div className="hidden md:block">
        <DesktopWorkflow
          currentStep={currentStep}
          completedSteps={completedSteps}
          conversationId={conversationId}
          onStepClick={onStepClick}
        />
      </div>
      <div className="block md:hidden">
        <MobileWorkflow
          currentStep={currentStep}
          completedSteps={completedSteps}
          conversationId={conversationId}
          onStepClick={onStepClick}
        />
      </div>
    </div>
  );
}
