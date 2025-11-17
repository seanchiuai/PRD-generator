import { useMemo } from "react";
import type { Conversation } from "./use-research";

export interface ResearchCategory {
  key: string;
  name: string;
  reasoning?: string;
}

/**
 * Hook to compute research categories from conversation data
 * Dynamically builds categories from queriesGenerated or researchResults
 */
export function useResearchCategories(
  conversation: Conversation | undefined | null
): ResearchCategory[] {
  return useMemo(() => {
    // First try to use queriesGenerated (new format with reasoning)
    if (conversation?.queriesGenerated && conversation.queriesGenerated.length > 0) {
      return conversation.queriesGenerated.map((q) => ({
        key: q.category,
        name:
          q.category.charAt(0).toUpperCase() +
          q.category.slice(1).replace(/-/g, " "),
        reasoning: q.reasoning,
      }));
    }

    // Fallback to researchResults keys (old format)
    if (conversation?.researchResults) {
      return Object.keys(conversation.researchResults).map((key) => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " "),
        reasoning: undefined,
      }));
    }

    return [];
  }, [conversation?.queriesGenerated, conversation?.researchResults]);
}
