"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No PRDs Yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first Product Requirements Document. It only takes a few
        minutes!
      </p>
      <Button onClick={() => router.push("/chat/new")}>
        Create Your First PRD
      </Button>
    </div>
  );
}
