"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ResearchProgress } from "@/components/features/research/research-progress";
import { ResearchResults } from "@/components/features/research/research-results";
import { LoadingSkeleton } from "@/components/features/research/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/features/workflow/workflow-layout";
import { trackTechStackSkip } from "@/lib/analytics/techStackEvents";
import { detectProductType } from "@/lib/tech-stack/defaults";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveResults = useMutation(api.conversations.saveResearchResults);

  const [isResearching, setIsResearching] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [categoryStatuses, _setCategoryStatuses] = useState<
    Record<string, "pending" | "in_progress" | "completed" | "failed">
  >({
    frontend: "pending",
    backend: "pending",
    database: "pending",
    authentication: "pending",
    hosting: "pending",
  });

  const categories = [
    { name: "Frontend Framework", key: "frontend" },
    { name: "Backend Framework", key: "backend" },
    { name: "Database", key: "database" },
    { name: "Authentication", key: "authentication" },
    { name: "Hosting Platform", key: "hosting" },
  ];

  const hasExistingResults = conversation?.researchResults;

  const startResearch = async () => {
    if (!conversation) return;

    setIsResearching(true);

    try {
      // Extract product context from questions
      const productContext = {
        productName: conversation.productContext?.productName || "the product",
        description: conversation.productContext?.description || "",
        targetAudience: conversation.productContext?.targetAudience || "",
        coreFeatures: conversation.productContext?.coreFeatures || [],
        answers: {},
      };

      // Call research API
      const response = await fetch("/api/research/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productContext }),
      });

      if (!response.ok) throw new Error("Research failed");

      const data = await response.json();

      // Save to Convex
      await saveResults({
        conversationId,
        researchResults: data.researchResults,
      });

      toast({
        title: "Research Complete",
        description: "Tech stack recommendations are ready!",
      });
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Research Failed",
        description: "Please try again or skip to manual selection.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      // Generate and save default stack
      const response = await fetch('/api/tech-stack/suggest-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          useAI: true, // Use Claude for smarter defaults
        }),
      });

      if (!response.ok) throw new Error('Failed to generate defaults');

      const { success, techStack } = await response.json();

      if (success) {
        // Track analytics
        const productType = detectProductType(
          conversation?.extractedContext,
          conversation?.clarifyingQuestions
        );
        trackTechStackSkip({
          conversationId,
          productType,
          defaultStack: techStack,
          useAI: true,
        });

        // Show brief preview
        toast({
          title: "Recommended Stack Selected",
          description: `${techStack.frontend}, ${techStack.backend}, ${techStack.database}`,
        });

        // Add 1.5 second delay to show toast
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Navigate directly to generate (skip selection page)
        router.push(`/chat/${conversationId}/generate`);
      }
    } catch (error) {
      console.error("Skip research failed:", error);
      toast({
        title: "Skip failed",
        description: "Failed to skip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
    }
  };

  // Auto-start research if no existing results
  useEffect(() => {
    if (conversation && !hasExistingResults && !isResearching) {
      startResearch();
    }
  }, [conversation, hasExistingResults]);

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <WorkflowLayout
      currentStep="research"
      completedSteps={["discovery", "questions"]}
      conversationId={conversationId}
      showSkipButton={true}
      onSkip={handleSkip}
      skipButtonText="Use Recommended Stack"
      skipButtonLoading={isSkipping}
      skipConfirmMessage="We'll automatically select a tech stack optimized for your product and skip directly to PRD generation. Continue?"
      skipConfirmTitle="Skip to PRD Generation?"
      showFooter={true}
      onBack={() => router.push(`/chat/${conversationId}/questions`)}
      onNext={() => router.push(`/chat/${conversationId}/select`)}
      nextButtonText="Continue to Selection"
      nextButtonDisabled={isResearching || !hasExistingResults}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tech Stack Research</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered recommendations based on your product requirements
          </p>
        </div>

        {/* Research Progress */}
        {isResearching && (
          <ResearchProgress
            categories={categories.map((cat) => ({
              name: cat.name,
              status: (categoryStatuses[cat.key] || "pending") as "pending" | "in_progress" | "completed" | "failed",
            }))}
          />
        )}

        {/* Loading State */}
        {isResearching && <LoadingSkeleton />}

        {/* Research Results */}
        {!isResearching && hasExistingResults && (
          <div className="space-y-6">
            {categories.map((cat) => {
              const options = conversation.researchResults?.[cat.key as keyof typeof conversation.researchResults];
              if (!options || options.length === 0) return null;

              return (
                <ResearchResults
                  key={cat.key}
                  category={cat.name}
                  options={options}
                />
              );
            })}
          </div>
        )}
      </div>
    </WorkflowLayout>
  );
}
