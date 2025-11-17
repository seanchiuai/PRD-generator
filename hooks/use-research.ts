import { useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

export interface Conversation {
  productContext?: {
    productName?: string;
    description?: string;
    targetAudience?: string;
    coreFeatures?: string[];
  };
  extractedContext?: {
    productName?: string;
    description?: string;
    targetAudience?: string;
    keyFeatures?: string[];
  };
  clarifyingQuestions?: Array<{
    question: string;
    answer?: string;
  }>;
  researchResults?: Record<string, unknown>;
  queriesGenerated?: Array<{ category: string; reasoning: string }>;
}

export interface UseResearchOptions {
  conversationId: Id<"conversations">;
  conversation: Conversation | undefined | null;
  autoStart?: boolean;
}

export interface UseResearchReturn {
  isResearching: boolean;
  error: string | null;
  hasExistingResults: boolean;
  startResearch: () => Promise<void>;
  setError: (error: string | null) => void;
}

/**
 * Hook to manage tech stack research functionality
 * Handles API calls, state management, and auto-start behavior
 */
export function useResearch({
  conversationId,
  conversation,
  autoStart = true,
}: UseResearchOptions): UseResearchReturn {
  const { toast } = useToast();
  const saveResults = useMutation(api.conversations.saveResearchResults);

  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if research results actually have data (not just an empty object)
  const hasExistingResults =
    !!conversation?.researchResults &&
    Object.keys(conversation.researchResults).length > 0;

  const startResearch = useCallback(async () => {
    if (!conversation) {
      return;
    }

    setIsResearching(true);
    setError(null);

    try {
      // Extract product context from conversation
      const productContext = {
        productName:
          conversation.productContext?.productName ||
          conversation.extractedContext?.productName ||
          "the product",
        description:
          conversation.productContext?.description ||
          conversation.extractedContext?.description ||
          "",
        targetAudience:
          conversation.productContext?.targetAudience ||
          conversation.extractedContext?.targetAudience ||
          "",
        coreFeatures:
          conversation.productContext?.coreFeatures ||
          conversation.extractedContext?.keyFeatures ||
          [],
        answers:
          conversation.clarifyingQuestions?.reduce(
            (acc, q) => {
              if (q.answer) {
                acc[q.question] = q.answer;
              }
              return acc;
            },
            {} as Record<string, string>
          ) || {},
      };

      // Call research API
      const response = await fetch("/api/research/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Research failed");
      }

      const data = await response.json();

      // Save to Convex
      await saveResults({
        conversationId,
        researchResults: data.researchResults,
        queriesGenerated: data.queriesGenerated,
      });

      const categoriesCount =
        data.queriesGenerated?.length ||
        Object.keys(data.researchResults).length;
      toast({
        title: "Research Complete",
        description: `${categoriesCount} tech stack categories researched successfully!`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Research Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  }, [conversation, conversationId, saveResults, toast]);

  // Auto-start research if no existing results
  useEffect(() => {
    if (autoStart && conversation && !hasExistingResults) {
      startResearch();
    }
  }, [autoStart, conversation, hasExistingResults, startResearch]);

  return {
    isResearching,
    error,
    hasExistingResults,
    startResearch,
    setError,
  };
}
