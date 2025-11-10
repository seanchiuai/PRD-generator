"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const addMessage = useMutation(api.conversations.addMessage);

  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      // Add user message to Convex
      await addMessage({
        conversationId,
        role: "user",
        content,
      });

      setIsTyping(true);

      // Call API for Claude response
      const response = await fetch("/api/conversation/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...conversation.messages,
            { role: "user", content, timestamp: Date.now() },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add assistant message to Convex
      await addMessage({
        conversationId,
        role: "assistant",
        content: data.message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Product Discovery</h1>
        <p className="text-sm text-muted-foreground">
          Tell me about your product idea
        </p>
      </div>

      <ChatContainer messages={conversation.messages} isTyping={isTyping} />

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
