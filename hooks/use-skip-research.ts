import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { trackTechStackSkip } from "@/lib/analytics/techStackEvents";
import { detectProductType } from "@/lib/techStack/defaults";
import type { Conversation } from "./use-research";

export interface UseSkipResearchOptions {
  conversationId: Id<"conversations">;
  conversation: Conversation | undefined | null;
}

export interface UseSkipResearchReturn {
  isSkipping: boolean;
  handleSkip: () => Promise<void>;
}

/**
 * Hook to manage skip research functionality
 * Generates default tech stack and navigates to PRD generation
 */
export function useSkipResearch({
  conversationId,
  conversation,
}: UseSkipResearchOptions): UseSkipResearchReturn {
  const router = useRouter();
  const { toast } = useToast();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = useCallback(async () => {
    setIsSkipping(true);
    try {
      // Generate and save default stack
      const response = await fetch("/api/tech-stack/suggest-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          useAI: true, // Use Claude for smarter defaults
        }),
      });

      if (!response.ok) throw new Error("Failed to generate defaults");

      const { success, techStack } = await response.json();

      if (success) {
        // Track analytics
        const productType = detectProductType(
          conversation?.extractedContext ?? null,
          conversation?.clarifyingQuestions ?? null
        );
        trackTechStackSkip({
          conversationId,
          productType,
          defaultStack: techStack,
          useAI: true,
        });

        // Show brief preview
        toast({
          title: "Recommended Stack Selected",
          description: `${techStack.frontend}, ${techStack.backend}, ${techStack.database}`,
        });

        // Add 1.5 second delay to show toast
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Navigate directly to generate (skip selection page)
        router.push(`/chat/${conversationId}/generate`);
      }
    } catch (error) {
      toast({
        title: "Skip failed",
        description: "Failed to skip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
    }
  }, [conversationId, conversation, router, toast]);

  return {
    isSkipping,
    handleSkip,
  };
}
