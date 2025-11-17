import { cn } from "@/lib/utils";

interface WorkflowStepLabelProps {
  label: string;
  status: "completed" | "current" | "future";
  variant?: "desktop" | "mobile";
}

export function WorkflowStepLabel({ label, status, variant = "desktop" }: WorkflowStepLabelProps) {
  return (
    <span
      className={cn(
        "text-xs text-center transition-colors",
        variant === "mobile" && "whitespace-nowrap",
        status === "completed" && "text-green-700 dark:text-green-400 font-medium",
        status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
        status === "future" && "text-gray-400 dark:text-gray-600 font-medium"
      )}
    >
      {label}
    </span>
  );
}
