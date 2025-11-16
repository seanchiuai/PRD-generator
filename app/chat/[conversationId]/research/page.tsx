"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ResearchResults } from "@/components/research/ResearchResults";
import { LoadingSkeleton } from "@/components/research/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { trackTechStackSkip } from "@/lib/analytics/techStackEvents";
import { detectProductType } from "@/lib/techStack/defaults";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveResults = useMutation(api.conversations.saveResearchResults);

  const [isResearching, setIsResearching] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dynamically build categories from queriesGenerated or researchResults
  const categories = useMemo(() => {
    return conversation?.queriesGenerated?.map(q => ({
      key: q.category,
      name: q.category.charAt(0).toUpperCase() + q.category.slice(1).replace(/-/g, ' '),
      reasoning: q.reasoning,
    })) || Object.keys(conversation?.researchResults || {}).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
      reasoning: undefined,
    })) || [];
  }, [conversation?.queriesGenerated, conversation?.researchResults]);

  // Check if research results actually have data (not just an empty object)
  const hasExistingResults = conversation?.researchResults &&
    Object.keys(conversation.researchResults).length > 0;

  const startResearch = useCallback(async () => {
    if (!conversation) {
      console.log("No conversation, skipping research");
      return;
    }

    console.log("Starting research...", {
      hasProductContext: !!conversation.productContext,
      hasClarifyingQuestions: !!conversation.clarifyingQuestions
    });

    setIsResearching(true);
    setError(null);

    try {
      // Extract product context from conversation
      const productContext = {
        productName: conversation.productContext?.productName || conversation.extractedContext?.productName || "the product",
        description: conversation.productContext?.description || conversation.extractedContext?.description || "",
        targetAudience: conversation.productContext?.targetAudience || conversation.extractedContext?.targetAudience || "",
        coreFeatures: conversation.productContext?.coreFeatures || conversation.extractedContext?.keyFeatures || [],
        answers: conversation.clarifyingQuestions?.reduce((acc, q) => {
          if (q.answer) {
            acc[q.question] = q.answer;
          }
          return acc;
        }, {} as Record<string, string>) || {},
      };

      console.log("Product context for research:", productContext);

      // Call research API
      const response = await fetch("/api/research/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Research failed");
      }

      const data = await response.json();

      // Save to Convex
      await saveResults({
        conversationId,
        researchResults: data.researchResults,
        queriesGenerated: data.queriesGenerated,
      });

      const categoriesCount = data.queriesGenerated?.length || Object.keys(data.researchResults).length;
      toast({
        title: "Research Complete",
        description: `${categoriesCount} tech stack categories researched successfully!`,
      });
    } catch (error) {
      console.error("Research error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Research Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  }, [conversation, conversationId, saveResults, toast]);

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
    console.log("Research useEffect triggered", {
      hasConversation: !!conversation,
      hasExistingResults,
      shouldStart: conversation && !hasExistingResults
    });

    if (conversation && !hasExistingResults) {
      console.log("Auto-starting research...");
      startResearch();
    }
  }, [conversation, hasExistingResults, startResearch]);

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

        {/* Error State */}
        {error && !isResearching && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">
                  Research Failed
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={startResearch}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    Retry Research
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
                  >
                    {isSkipping ? "Loading..." : "Use Recommended Stack Instead"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Progress */}
        {isResearching && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="font-medium">Researching tech stack options...</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Claude is analyzing your product requirements to determine which tech stack categories to research.
                Perplexity will then search for the best options in each category. This may take a minute.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isResearching && <LoadingSkeleton />}

        {/* Research Results */}
        {!isResearching && !error && hasExistingResults && (
          <div className="space-y-6">
            {categories.map((cat) => {
              const categoryData = conversation.researchResults?.[cat.key as keyof typeof conversation.researchResults];
              if (!categoryData) return null;

              // Handle both old format (array) and new format ({ options, reasoning })
              const options = Array.isArray(categoryData) ? categoryData : categoryData.options;
              const reasoning = !Array.isArray(categoryData) ? categoryData.reasoning : cat.reasoning;

              if (!options || options.length === 0) return null;

              return (
                <ResearchResults
                  key={cat.key}
                  category={cat.name}
                  options={options}
                  reasoning={reasoning}
                />
              );
            })}
          </div>
        )}
      </div>
    </WorkflowLayout>
  );
}
