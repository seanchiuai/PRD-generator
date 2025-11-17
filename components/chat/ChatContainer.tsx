"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  isLoadingInitialMessage?: boolean;
}

export function ChatContainer({ messages, isTyping, isLoadingInitialMessage }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages only if user is near bottom
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current.parentElement;
      if (container) {
        // Check if user is near the bottom (within 100px)
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        // Only auto-scroll if user is near bottom
        if (isNearBottom) {
          scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Fallback: always scroll if container not found (initial load)
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isLoadingInitialMessage && messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
          <TypingIndicator />
          <p className="text-sm">Discovery agent is preparing your personalized greeting...</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.timestamp} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
