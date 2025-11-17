/**
 * Analytics tracking for questions workflow
 */

import { logger } from '@/lib/logger'

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
    const completionRate = data.totalCount > 0
      ? (data.answeredCount / data.totalCount) * 100
      : 0;

    // Track for debugging (can be replaced with actual analytics service)
    logger.debug("Analytics: Questions Skipped", "", {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      auto_filled_count: data.autoFilledCount,
      completion_rate: completionRate,
      had_context: data.hasExtractedContext,
      timestamp: new Date().toISOString(),
    });

    // Track with analytics service
    (window as any).analytics.track('Questions Skipped', {
      conversation_id: data.conversationId,
      answered_count: data.answeredCount,
      total_count: data.totalCount,
      auto_filled_count: data.autoFilledCount,
      completion_rate: completionRate,
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
    logger.debug("Analytics: Questions Completed", "", {
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
