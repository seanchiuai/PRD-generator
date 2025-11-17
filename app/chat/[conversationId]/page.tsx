"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const addMessage = useMutation(api.conversations.addMessage);
  const saveProjectSetup = useMutation(api.conversations.saveProjectSetup);

  const [isTyping, setIsTyping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSavingSetup, setIsSavingSetup] = useState(false);

  // Setup form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

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

    // Validate content
    if (!content.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    // Use trimmed content
    const trimmedContent = content.trim();

    try {
      // Add user message to Convex and wait for completion
      await addMessage({
        conversationId,
        role: "user",
        content: trimmedContent,
      });

      setIsTyping(true);

      // Call API for Claude response - server will fetch authoritative message list
      const response = await fetch("/api/conversation/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
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
      logger.error("ChatPage.handleSendMessage", error, { conversationId });
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !projectDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a project name and description.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingSetup(true);

      // Save project setup to database and create PRD
      await saveProjectSetup({
        conversationId,
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
      });

      // Generate initial discovery message using Anthropic API
      const response = await fetch("/api/conversation/initial-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectName.trim(),
          projectDescription: projectDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate initial message");
      }

      const { message } = await response.json();

      // Add the generated message to the conversation
      await addMessage({
        conversationId,
        role: "assistant",
        content: message,
      });

      toast({
        title: "Project saved",
        description: "Your project has been created. Let's start the discovery!",
      });

      // The mutation updates the stage to "discovery", so the page will re-render
      // showing the discovery chat with the generated initial message
    } catch (error) {
      logger.error("ChatPage.handleSetupSubmit", error, { conversationId });
      toast({
        title: "Error",
        description: "Failed to save project setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSetup(false);
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
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        logger.error("ChatPage.handleSkip.extractContext", errorData, { conversationId });
        throw new Error(errorData.error || "Failed to extract context");
      }

      const { success } = await response.json();

      if (success) {
        // Navigate to questions page
        router.push(`/chat/${conversationId}/questions`);
      } else {
        throw new Error("Context extraction was not successful");
      }
    } catch (error) {
      logger.error("ChatPage.handleSkip", error, { conversationId });
      toast({
        title: "Skip failed",
        description: error instanceof Error ? error.message : "Failed to skip. Please try again.",
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

  // Show setup form if in setup stage
  if (conversation.currentStage === "setup") {
    return (
      <WorkflowLayout
        currentStep="setup"
        completedSteps={[]}
        conversationId={conversationId}
        showSkipButton={false}
      >
        <div className="flex flex-col max-w-2xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Your Project</h1>
            <p className="text-muted-foreground">
              Let's start by giving your project a name and description. This will be saved to the database and used throughout the PRD generation process.
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g., Task Management App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isSavingSetup}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                placeholder="Briefly describe what your project is about and what problem it solves..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={isSavingSetup}
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Minimum 50 characters recommended
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSavingSetup || !projectName.trim() || !projectDescription.trim()}
              className="w-full"
            >
              {isSavingSetup ? "Saving..." : "Continue to Product Discovery"}
            </Button>
          </form>
        </div>
      </WorkflowLayout>
    );
  }

  // Show discovery chat for all other stages
  return (
    <WorkflowLayout
      currentStep="discovery"
      completedSteps={conversation.workflowProgress?.completedSteps || []}
      conversationId={conversationId}
      showSkipButton={true}
      onSkip={handleSkip}
      skipButtonText="Skip to Questions"
      skipButtonLoading={isSkipping}
      skipButtonDisabled={!canSkip || isTyping}
      skipButtonDisabledMessage={
        isTyping
          ? "Please wait for the response to complete"
          : "Please send at least one message with 50+ characters to provide context before skipping"
      }
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

        <ChatContainer
          messages={conversation.messages}
          isTyping={isTyping}
          isLoadingInitialMessage={isSavingSetup && conversation.messages.length === 0}
        />

        <div className="border-t bg-background">
          <div className="p-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping || isSavingSetup}
            />
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
}
