"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface SelectionProgressProps {
  total: number;
  selected: number;
}

export function SelectionProgress({ total, selected }: SelectionProgressProps) {
  const percentage = (selected / total) * 100;

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Selection Progress</span>
        <span className="text-sm text-muted-foreground">
          {selected} of {total} selected
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {selected === total && (
        <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>All categories selected!</span>
        </div>
      )}
    </div>
  );
}
