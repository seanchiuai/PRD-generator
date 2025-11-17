import { cn } from "@/lib/utils";

export interface WorkflowConnectorProps {
  isCompleted: boolean;
  variant?: "desktop" | "mobile";
}

export function WorkflowConnector({ isCompleted, variant = "desktop" }: WorkflowConnectorProps) {
  const barClassName = cn(
    "h-full transition-colors",
    isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
  );

  if (variant === "mobile") {
    return (
      <div className="w-8 h-0.5 mx-1">
        <div className={barClassName} />
      </div>
    );
  }

  return (
    <div className="flex-1 h-0.5 mx-2 self-center -mt-6">
      <div className={barClassName} />
    </div>
  );
}
