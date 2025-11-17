import { cn } from "@/lib/utils";

interface WorkflowConnectorProps {
  isCompleted: boolean;
  variant?: "desktop" | "mobile";
}

export function WorkflowConnector({ isCompleted, variant = "desktop" }: WorkflowConnectorProps) {
  if (variant === "mobile") {
    return (
      <div className="w-8 h-0.5 mx-1">
        <div
          className={cn(
            "h-full transition-colors",
            isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 h-0.5 mx-2 mt-[-24px]">
      <div
        className={cn(
          "h-full transition-colors",
          isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
        )}
      />
    </div>
  );
}
