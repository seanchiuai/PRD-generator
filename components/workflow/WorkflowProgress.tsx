"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  MessageSquare,
  HelpCircle,
  Search,
  CheckSquare,
  FileText,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface WorkflowStep {
  id: string
  label: string
  path: string
  icon: typeof MessageSquare
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "discovery", label: "Discovery", path: "/chat/[id]", icon: MessageSquare },
  { id: "questions", label: "Questions", path: "/chat/[id]/questions", icon: HelpCircle },
  { id: "research", label: "Research", path: "/chat/[id]/research", icon: Search },
  { id: "selection", label: "Selection", path: "/chat/[id]/select", icon: CheckSquare },
  { id: "generate", label: "Generate", path: "/chat/[id]/generate", icon: FileText },
]

export interface WorkflowProgressProps {
  currentStep: string
  completedSteps: string[]
  conversationId: string
  onStepClick?: (stepId: string) => void
}

export function WorkflowProgress({
  currentStep,
  completedSteps,
  conversationId,
  onStepClick,
}: WorkflowProgressProps) {
  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return "completed"
    if (stepId === currentStep) return "current"
    return "future"
  }

  const getStepPath = (step: WorkflowStep) => {
    return step.path.replace("[id]", conversationId)
  }

  const canNavigate = (stepId: string) => {
    return completedSteps.includes(stepId)
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b">
      {/* Desktop view - horizontal */}
      <div className="hidden md:flex items-center justify-center py-6 px-4">
        <div className="flex items-center gap-2 max-w-5xl w-full">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            const isNavigable = canNavigate(step.id)
            const nextStep = WORKFLOW_STEPS[index + 1]

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step item */}
                <div className="flex flex-col items-center gap-2 min-w-[100px]">
                  {/* Icon circle */}
                  {isNavigable ? (
                    <Link
                      href={getStepPath(step)}
                      onClick={() => onStepClick?.(step.id)}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer",
                          status === "completed" &&
                            "bg-green-500 border-green-500 text-white hover:bg-green-600",
                          status === "current" &&
                            "bg-blue-500 border-blue-500 text-white",
                          status === "future" &&
                            "bg-gray-100 border-gray-300 text-gray-400"
                        )}
                      >
                        {status === "completed" ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </motion.div>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        status === "completed" &&
                          "bg-green-500 border-green-500 text-white",
                        status === "current" &&
                          "bg-blue-500 border-blue-500 text-white",
                        status === "future" &&
                          "bg-gray-100 border-gray-300 text-gray-400"
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                  )}

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-medium text-center transition-colors",
                      status === "completed" && "text-green-700 dark:text-green-400",
                      status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
                      status === "future" && "text-gray-400 dark:text-gray-600"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {nextStep && (
                  <div className="flex-1 h-0.5 mx-2 mt-[-24px]">
                    <div
                      className={cn(
                        "h-full transition-colors",
                        completedSteps.includes(nextStep.id)
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile view - vertical scrollable */}
      <div className="md:hidden py-4 px-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            const isNavigable = canNavigate(step.id)
            const nextStep = WORKFLOW_STEPS[index + 1]

            return (
              <div key={step.id} className="flex items-center">
                {/* Step item */}
                <div className="flex flex-col items-center gap-1.5">
                  {/* Icon circle */}
                  {isNavigable ? (
                    <Link
                      href={getStepPath(step)}
                      onClick={() => onStepClick?.(step.id)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          status === "completed" &&
                            "bg-green-500 border-green-500 text-white",
                          status === "current" &&
                            "bg-blue-500 border-blue-500 text-white",
                          status === "future" &&
                            "bg-gray-100 border-gray-300 text-gray-400"
                        )}
                      >
                        {status === "completed" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </motion.div>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        status === "completed" &&
                          "bg-green-500 border-green-500 text-white",
                        status === "current" &&
                          "bg-blue-500 border-blue-500 text-white",
                        status === "future" &&
                          "bg-gray-100 border-gray-300 text-gray-400"
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-medium text-center whitespace-nowrap",
                      status === "completed" && "text-green-700 dark:text-green-400",
                      status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
                      status === "future" && "text-gray-400 dark:text-gray-600"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {nextStep && (
                  <div className="w-8 h-0.5 mx-1">
                    <div
                      className={cn(
                        "h-full transition-colors",
                        completedSteps.includes(nextStep.id)
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
