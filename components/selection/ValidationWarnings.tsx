"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, XCircle } from "lucide-react";

interface ValidationWarning {
  level: "warning" | "error";
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
}

export function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  const errors = warnings.filter((w) => w.level === "error");
  const warningsOnly = warnings.filter((w) => w.level === "warning");

  return (
    <div className="space-y-3">
      {errors.map((error) => (
        <Alert key={`${error.message}::${error.affectedTechnologies.join('|')}`} variant="destructive">
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

      {warningsOnly.map((warning) => (
        <Alert key={`${warning.message}::${warning.affectedTechnologies.join('|')}`} className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
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
