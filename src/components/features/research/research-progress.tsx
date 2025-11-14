"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchCategory {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  icon?: React.ReactNode;
}

interface ResearchProgressProps {
  categories: ResearchCategory[];
}

export function ResearchProgress({ categories }: ResearchProgressProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Researching Tech Stack...</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              category.status === "completed" && "bg-green-50 dark:bg-green-950/20",
              category.status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20",
              category.status === "failed" && "bg-red-50 dark:bg-red-950/20"
            )}
          >
            {category.status === "completed" && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {category.status === "in_progress" && (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            {category.status === "pending" && (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            {category.status === "failed" && (
              <Circle className="h-5 w-5 text-red-600" />
            )}

            <span className="font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
