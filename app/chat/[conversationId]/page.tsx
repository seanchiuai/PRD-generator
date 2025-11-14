"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const addMessage = useMutation(api.conversations.addMessage);
  const updateStage = useMutation(api.conversations.updateStage);

  const [isTyping, setIsTyping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Validation: Check if user has provided enough context to skip
  const canSkip = useMemo(() => {
    if (!conversation?.messages) return false;

    const messageCount = conversation.messages.length;
    const userMessages = conversation.messages.filter((m) => m.role === "user");
    const totalUserChars = userMessages.reduce(
      (sum, m) => sum + m.content.length,
      0
    );

    return messageCount >= 3 && totalUserChars >= 100;
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

      // Validate sufficient context
      if (!canSkip) {
        toast({
          title: "Need more context",
          description:
            "Please share a bit more about your product idea before skipping.",
          variant: "destructive",
        });
        return;
      }

      // Update conversation stage to clarifying
      await updateStage({
        conversationId,
        stage: "clarifying",
      });

      // Navigate to questions page
      router.push(`/chat/${conversationId}/questions`);
    } catch (error) {
      console.error("Error skipping to questions:", error);
      toast({
        title: "Skip failed",
        description: "Unable to skip to questions. Please try again.",
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Product Discovery</h1>
        <p className="text-sm text-muted-foreground">
          Tell me about your product idea
        </p>
      </div>

      <ChatContainer messages={conversation.messages} isTyping={isTyping} />

      <div className="border-t bg-background">
        <div className="p-4 space-y-3">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

          {canSkip && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isSkipping || isTyping}
                className="gap-2"
              >
                {isSkipping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Skipping...
                  </>
                ) : (
                  <>
                    Skip to Questions
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
