"use client";

import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const formattedTime = new Date(message.timestamp).toLocaleTimeString();
  const sender = isUser ? "You" : "Assistant";

  // Truncate message for aria-label (keep it concise for screen readers)
  const truncatedMessage = message.content.length > 100
    ? message.content.substring(0, 100) + "..."
    : message.content;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted text-foreground"
        )}
        aria-label={`Message from ${sender} at ${formattedTime}: ${truncatedMessage}`}
      >
        <p className="text-sm whitespace-pre-wrap" aria-hidden="true">
          {message.content}
        </p>
        <span className="text-xs opacity-70 mt-1 block" aria-hidden="true">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
