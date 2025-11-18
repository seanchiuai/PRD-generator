"use client";

import type { ReactElement } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GenerationStep {
  name: string;
  status: "pending" | "in_progress" | "completed";
}

interface GenerationProgressProps {
  steps: GenerationStep[];
}

function renderStatusIcon(status: GenerationStep['status']): ReactElement {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'in_progress':
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    case 'pending':
      return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
  }
}

export function GenerationProgress({ steps }: GenerationProgressProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Generating Your PRD...</h3>
            <p className="text-sm text-muted-foreground">
              This may take 20-30 seconds
            </p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.name} className="flex items-center gap-3">
                {renderStatusIcon(step.status)}
                <span
                  className={step.status === "completed" ? "text-muted-foreground" : ""}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
