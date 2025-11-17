"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ResearchResults } from "@/components/research/ResearchResults";
import { LoadingSkeleton } from "@/components/research/LoadingSkeleton";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { useResearch } from "@/hooks/use-research";
import { useSkipResearch } from "@/hooks/use-skip-research";
import { useResearchCategories } from "@/hooks/use-research-categories";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;

  const conversation = useQuery(api.conversations.get, { conversationId });

  const { isResearching, error, hasExistingResults, startResearch } =
    useResearch({
      conversationId,
      conversation,
      autoStart: true,
    });

  const { isSkipping, handleSkip } = useSkipResearch({
    conversationId,
    conversation,
  });

  const categories = useResearchCategories(conversation);

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
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
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
                Claude is analyzing your product requirements to determine which
                tech stack categories to research. Perplexity will then search
                for the best options in each category. This may take a minute.
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
              const categoryData =
                conversation.researchResults?.[
                  cat.key as keyof typeof conversation.researchResults
                ];
              if (!categoryData) return null;

              // Handle both old format (array) and new format ({ options, reasoning })
              const options = Array.isArray(categoryData)
                ? categoryData
                : categoryData.options;
              const reasoning = !Array.isArray(categoryData)
                ? categoryData.reasoning
                : cat.reasoning;

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
