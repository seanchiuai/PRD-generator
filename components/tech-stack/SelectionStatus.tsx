"use client";

import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface ValidationWarning {
  level: "warning" | "error";
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}

interface SelectionStatusProps {
  total: number;
  selected: number;
  warnings: ValidationWarning[];
  isValidating?: boolean;
}

export function SelectionStatus({
  total,
  selected,
  warnings,
  isValidating = false,
}: SelectionStatusProps) {
  const percentage = total > 0 ? (selected / total) * 100 : 0;
  const errors = warnings.filter((w) => w.level === "error");
  const warningsOnly = warnings.filter((w) => w.level === "warning");

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Selection Progress</span>
          <span className="text-sm text-muted-foreground">
            {selected} of {total} selected
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {selected === total && errors.length === 0 && (
          <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>All categories selected!</span>
          </div>
        )}
        {isValidating && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating compatibility...</span>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {errors.map((error, index) => (
        <Alert key={`error-${index}`} variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Incompatible Combination</AlertTitle>
          <AlertDescription>
            <p>{error.message}</p>
            <p className="text-sm mt-1 font-medium">
              Affected: {error.affectedTechnologies.join(", ")}
            </p>
            {error.suggestion && (
              <p className="text-sm mt-2 italic">{error.suggestion}</p>
            )}
          </AlertDescription>
        </Alert>
      ))}

      {/* Validation Warnings */}
      {warningsOnly.map((warning, index) => (
        <Alert
          key={`warning-${index}`}
          className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            Consider This
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <p>{warning.message}</p>
            <p className="text-sm mt-1 font-medium">
              Related to: {warning.affectedTechnologies.join(", ")}
            </p>
            {warning.suggestion && (
              <p className="text-sm mt-2 italic">{warning.suggestion}</p>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
