/**
 * System prompts for conversation/discovery phase
 */

import { loadPrompt } from "./loader";

export const CONVERSATION_SYSTEM_PROMPT = loadPrompt("conversation");
export const CONTEXT_EXTRACTION_PROMPT = loadPrompt("context-extraction");
