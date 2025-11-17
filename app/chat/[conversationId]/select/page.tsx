"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

export default function SelectRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Page Updated",
      description: "Research and Selection have been merged into a single Tech Stack page.",
    });
    router.replace(`/chat/${conversationId}/tech-stack`);
  }, [conversationId, router, toast]);

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Redirecting to Tech Stack...</p>
      </div>
    </div>
  );
}
