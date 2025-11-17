import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStepIcon } from "./WorkflowStepIcon";
import { WorkflowStepLabel } from "./WorkflowStepLabel";
import { WorkflowConnector } from "./WorkflowConnector";
import {
  WORKFLOW_STEPS,
  getStepStatus,
  getStepPath,
  canNavigate,
} from "./workflowConfig";

interface DesktopWorkflowProps {
  currentStep: string;
  completedSteps: string[];
  conversationId: string;
  onStepClick?: (stepId: string) => void;
}

export function DesktopWorkflow({
  currentStep,
  completedSteps,
  conversationId,
  onStepClick,
}: DesktopWorkflowProps) {
  return (
    <div className="hidden md:flex items-center justify-between py-6 px-4">
      <div className="flex-shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-5xl flex-1 justify-center">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step.id, currentStep, completedSteps);
          const isNavigable = canNavigate(step.id, completedSteps);
          const nextStep = WORKFLOW_STEPS[index + 1];

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <WorkflowStepIcon
                  icon={step.icon}
                  status={status}
                  isNavigable={isNavigable}
                  href={isNavigable ? getStepPath(step, conversationId) : undefined}
                  onClick={() => onStepClick?.(step.id)}
                />
                <WorkflowStepLabel label={step.label} status={status} />
              </div>

              {nextStep && (
                <WorkflowConnector
                  isCompleted={completedSteps.includes(nextStep.id)}
                  variant="desktop"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 w-[100px]" />
    </div>
  );
}
