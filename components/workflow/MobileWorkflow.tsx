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

interface MobileWorkflowProps {
  currentStep: string;
  completedSteps: string[];
  conversationId: string;
  onStepClick?: (stepId: string) => void;
}

export function MobileWorkflow({
  currentStep,
  completedSteps,
  conversationId,
  onStepClick,
}: MobileWorkflowProps) {
  return (
    <div className="md:hidden">
      <div className="px-4 pt-3 pb-2">
        <Button variant="ghost" size="sm" asChild className="w-full justify-start">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="py-4 px-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id, currentStep, completedSteps);
            const isNavigable = canNavigate(step.id, completedSteps);
            const nextStep = WORKFLOW_STEPS[index + 1];

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <WorkflowStepIcon
                    icon={step.icon}
                    status={status}
                    isNavigable={isNavigable}
                    href={isNavigable ? getStepPath(step, conversationId) : undefined}
                    size="sm"
                    onClick={() => onStepClick?.(step.id)}
                  />
                  <WorkflowStepLabel label={step.label} status={status} variant="mobile" />
                </div>

                {nextStep && (
                  <WorkflowConnector
                    isCompleted={completedSteps.includes(nextStep.id)}
                    variant="mobile"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
