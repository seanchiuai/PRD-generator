"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/components/features/chat/chat-container";
import { ChatInput } from "@/components/features/chat/chat-input";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/features/workflow/workflow-layout";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const addMessage = useMutation(api.conversations.addMessage);

  const [isTyping, setIsTyping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Validation: Check if user has provided enough context to skip
  const canSkip = useMemo(() => {
    if (!conversation?.messages) return false;

    const userMessages = conversation.messages.filter((m) => m.role === "user");

    // Require at least one message with minimum 50 characters for meaningful context
    const hasMinimumContent = userMessages.some((m) => m.content.trim().length >= 50);

    return userMessages.length >= 1 && hasMinimumContent;
  }, [conversation?.messages]);

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

  const handleSkip = async () => {
    try {
      setIsSkipping(true);

      // Call context extraction API
      const response = await fetch("/api/conversation/extract-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract context");
      }

      const { success } = await response.json();

      if (success) {
        // Navigate to questions page
        router.push(`/chat/${conversationId}/questions`);
      } else {
        throw new Error("Context extraction was not successful");
      }
    } catch (error) {
      console.error("Skip failed:", error);
      toast({
        title: "Skip failed",
        description: "Failed to skip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
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
    <WorkflowLayout
      currentStep="discovery"
      completedSteps={[]}
      conversationId={conversationId}
      showSkipButton={canSkip}
      onSkip={handleSkip}
      skipButtonText="Skip to Questions"
      skipButtonLoading={isSkipping}
      skipConfirmMessage="Are you sure you want to skip? We recommend having a conversation to better understand your product."
      skipConfirmTitle="Skip Discovery Phase?"
    >
      <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">Product Discovery</h1>
          <p className="text-sm text-muted-foreground">
            Tell me about your product idea
          </p>
        </div>

        <ChatContainer messages={conversation.messages} isTyping={isTyping} />

        <div className="border-t bg-background">
          <div className="p-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
}
