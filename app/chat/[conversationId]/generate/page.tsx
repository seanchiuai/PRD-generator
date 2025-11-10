"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { GenerationProgress } from "@/components/prd/GenerationProgress";
import { PRDDisplay } from "@/components/prd/PRDDisplay";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const existingPRD = useQuery(api.prds.getByConversation, { conversationId });
  const createPRD = useMutation(api.prds.create);

  const [isGenerating, setIsGenerating] = useState(false);
  const [prd, setPrd] = useState<any>(null);
  const [generationSteps, setGenerationSteps] = useState([
    { name: "Analyzing conversation data", status: "pending" as const },
    { name: "Extracting product requirements", status: "pending" as const },
    { name: "Structuring features and architecture", status: "pending" as const },
    { name: "Generating timeline and risks", status: "pending" as const },
    { name: "Finalizing PRD", status: "pending" as const },
  ]);

  // Load existing PRD if available
  useEffect(() => {
    if (existingPRD?.prdData) {
      setPrd(existingPRD.prdData);
    }
  }, [existingPRD]);

  const updateStep = (stepIndex: number, status: "pending" | "in_progress" | "completed") => {
    setGenerationSteps((prev) =>
      prev.map((step, i) => (i === stepIndex ? { ...step, status } : step))
    );
  };

  const generatePRD = async () => {
    if (!conversation) return;

    setIsGenerating(true);

    try {
      // Update steps progressively
      updateStep(0, "in_progress");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStep(0, "completed");

      updateStep(1, "in_progress");

      // Build conversation data
      const conversationData = {
        messages: conversation.messages,
        clarifyingQuestions: conversation.clarifyingQuestions,
        selectedTechStack: conversation.selectedTechStack,
      };

      // Call generation API
      const response = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Generation failed");
      }

      updateStep(1, "completed");
      updateStep(2, "in_progress");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStep(2, "completed");

      updateStep(3, "in_progress");
      const data = await response.json();
      updateStep(3, "completed");

      updateStep(4, "in_progress");

      // Save to Convex
      await createPRD({
        conversationId,
        prdData: data.prdData,
        productName: data.prdData.projectOverview.productName,
      });

      updateStep(4, "completed");
      setPrd(data.prdData);

      toast({
        title: "PRD Generated Successfully!",
        description: "Your Product Requirements Document is ready.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive",
      });
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-start generation if no existing PRD
  useEffect(() => {
    if (conversation && !existingPRD && !isGenerating && !prd) {
      generatePRD();
    }
  }, [conversation, existingPRD]);

  if (!conversation) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Requirements Document</h1>
          <p className="text-muted-foreground mt-2">
            {prd ? "Your PRD is ready!" : "Generating your comprehensive PRD..."}
          </p>
        </div>
        {prd && existingPRD && (
          <Button onClick={() => router.push(`/prd/${existingPRD._id}`)}>
            <Download className="h-4 w-4 mr-2" />
            Export PRD
          </Button>
        )}
      </div>

      {/* Generation Progress */}
      {isGenerating && <GenerationProgress steps={generationSteps} />}

      {/* PRD Display */}
      {prd && !isGenerating && <PRDDisplay prd={prd} />}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/select`)}
          disabled={isGenerating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Selection
        </Button>

        {prd && (
          <Button onClick={() => router.push("/dashboard")}>
            View All PRDs
          </Button>
        )}
      </div>
    </div>
  );
}
