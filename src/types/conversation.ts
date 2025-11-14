/**
 * Conversation and Message Types
 */

export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: number;
}

export type ConversationStage =
  | "discovery"
  | "clarifying"
  | "researching"
  | "selecting"
  | "generating"
  | "completed";
