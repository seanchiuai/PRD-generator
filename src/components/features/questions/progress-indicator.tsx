import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  total: number;
  completed: number;
  className?: string;
}

export function ProgressIndicator({
  total,
  completed,
  className,
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">
          {completed} of {total} answered
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
