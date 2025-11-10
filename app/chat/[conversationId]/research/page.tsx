"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ResearchProgress } from "@/components/research/ResearchProgress";
import { ResearchResults } from "@/components/research/ResearchResults";
import { LoadingSkeleton } from "@/components/research/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveResults = useMutation(api.conversations.saveResearchResults);

  const [isResearching, setIsResearching] = useState(false);
  const [categoryStatuses, setCategoryStatuses] = useState<
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            status: categoryStatuses[cat.key],
          }))}
        />
      )}

      {/* Loading State */}
      {isResearching && <LoadingSkeleton />}

      {/* Research Results */}
      {!isResearching && hasExistingResults && (
        <div className="space-y-6">
          {categories.map((cat) => {
            const options = conversation.researchResults?.[cat.key];
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

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/questions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>

        <Button
          onClick={() => router.push(`/chat/${conversationId}/select`)}
          disabled={isResearching || !hasExistingResults}
        >
          Continue to Selection
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
