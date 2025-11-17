/**
 * Centralized AI API Clients
 *
 * Single source of truth for AI service initialization.
 * Prevents duplicate client instantiation across API routes.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

/**
 * Validate required environment variables
 */
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error("PERPLEXITY_API_KEY environment variable is required");
}

/**
 * Anthropic Claude client
 * Used for: Conversations, PRD generation, question generation, validation
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Perplexity AI client (via OpenAI SDK)
 * Used for: Tech stack research
 */
export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

/**
 * AI Model Configuration
 */
export const AI_MODELS = {
  CLAUDE_SONNET: "claude-sonnet-4-5",
  CLAUDE_HAIKU: "claude-haiku-4-5",
  PERPLEXITY_SONAR: "sonar-pro",
} as const;

/**
 * Token limits for different operations
 */
export const TOKEN_LIMITS = {
  CONVERSATION: 1024,
  QUESTION_GENERATION: 4096,
  PRD_GENERATION: 8192,
  VALIDATION: 2048,
  RESEARCH: 4096,
  CONTEXT_EXTRACTION: 2048,
  TECH_STACK: 1024,
} as const;
