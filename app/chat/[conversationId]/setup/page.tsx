"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;

  const conversation = useQuery(api.conversations.get, { conversationId });

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not yet past setup stage, redirect to main chat page
  if (conversation.currentStage !== "setup") {
    router.push(`/chat/${conversationId}`);
    return null;
  }

  return (
    <WorkflowLayout
      currentStep="setup"
      completedSteps={conversation.workflowProgress?.completedSteps || []}
      conversationId={conversationId}
      showSkipButton={false}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Setup</h1>
          <p className="text-muted-foreground">
            View your project information that was set up at the beginning of this PRD generation workflow.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              This information was used to guide the PRD generation process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Project Name</Label>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-foreground">
                  {conversation.projectName || "Not set"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Project Description</Label>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-foreground whitespace-pre-wrap">
                  {conversation.projectDescription || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkflowLayout>
  );
}
