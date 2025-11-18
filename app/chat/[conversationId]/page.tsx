"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  const saveProjectSetup = useMutation(api.conversations.saveProjectSetup);

  const [isSavingSetup, setIsSavingSetup] = useState(false);

  // Setup form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

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
      // This now also creates extractedContext and sets stage to "clarifying"
      await saveProjectSetup({
        conversationId,
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
      });

      toast({
        title: "Project saved",
        description: "Your project has been created. Let's answer some questions!",
      });

      // Navigate directly to questions page (skip discovery)
      router.push(`/chat/${conversationId}/questions`);
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

  // Redirect if not in setup stage
  useEffect(() => {
    if (conversation && conversation.currentStage !== "setup") {
      router.push(`/chat/${conversationId}/questions`);
    }
  }, [conversation, conversationId, router]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not in setup stage, show redirecting while useEffect handles navigation
  if (conversation.currentStage !== "setup") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // Show setup form
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
            Let&apos;s start by giving your project a name and description. This will help us generate tailored questions for your PRD.
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
              placeholder="Describe what your project is about, what problem it solves, and who it's for. The more detail you provide, the better questions we can generate..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={isSavingSetup}
              rows={8}
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters recommended for better question generation
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSavingSetup || !projectName.trim() || !projectDescription.trim()}
            className="w-full"
          >
            {isSavingSetup ? "Saving..." : "Continue to Questions"}
          </Button>
        </form>
      </div>
    </WorkflowLayout>
  );
}
