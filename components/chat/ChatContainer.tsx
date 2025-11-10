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
}

export function ChatContainer({ messages, isTyping }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={scrollRef} />
    </div>
  );
}
