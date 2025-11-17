"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}

export default AppError;
