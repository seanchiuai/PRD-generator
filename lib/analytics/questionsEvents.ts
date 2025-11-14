/**
 * Analytics tracking for questions workflow
 */

interface QuestionsSkipData {
  conversationId: string;
  answeredCount: number;
  totalCount: number;
  autoFilledCount: number;
  hasExtractedContext: boolean;
}

/**
 * Track when users skip the questions phase
 */
export function trackQuestionsSkip(data: QuestionsSkipData) {
  if (typeof window !== "undefined" && (window as any).analytics) {
    // Track to console for now (can be replaced with actual analytics service)
    console.log("[Analytics] Questions Skipped", {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      auto_filled_count: data.autoFilledCount,
      completion_rate: (data.answeredCount / data.totalCount) * 100,
      had_context: data.hasExtractedContext,
      timestamp: new Date().toISOString(),
    });

    // Track with analytics service
    (window as any).analytics.track('Questions Skipped', {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      auto_filled_count: data.autoFilledCount,
      completion_rate: (data.answeredCount / data.totalCount) * 100,
      had_context: data.hasExtractedContext,
    });
  }
}

interface QuestionsCompletedData {
  conversationId: string;
  answeredCount: number;
  totalCount: number;
  completionRate: number;
}

/**
 * Track when users complete the questions phase
 */
export function trackQuestionsCompleted(data: QuestionsCompletedData) {
  if (typeof window !== "undefined" && (window as any).analytics) {
    console.log("[Analytics] Questions Completed", {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      completion_rate: data.completionRate,
      timestamp: new Date().toISOString(),
    });

    // Track with analytics service
    (window as any).analytics.track('Questions Completed', {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      completion_rate: data.completionRate,
    });
  }
}
