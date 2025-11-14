"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { QuestionCategory } from "@/components/features/questions/question-category";
import { ProgressIndicator } from "@/components/features/questions/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/features/workflow/workflow-layout";
import { trackQuestionsSkip } from "@/lib/analytics/questionsEvents";
import { Question } from "@/types";

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveQuestions = useMutation(api.conversations.saveQuestions);
  const updateStage = useMutation(api.conversations.updateStage);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Generate questions on mount if not already generated
  useEffect(() => {
    if (!conversation) return;

    if (conversation.clarifyingQuestions) {
      setQuestions(conversation.clarifyingQuestions as Question[]);
    } else {
      generateQuestions();
    }
  }, [conversation]);

  const generateQuestions = async () => {
    if (!conversation) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          productContext: conversation.productContext || {},
          extractedContext: conversation.extractedContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);

      await saveQuestions({
        conversationId,
        questions: data.questions,
      });
    } catch (error) {
      console.error("Question generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, answer, autoCompleted: false } : q
    );
    setQuestions(updatedQuestions);

    // Auto-save with debouncing
    try {
      await saveQuestions({
        conversationId,
        questions: updatedQuestions,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await updateStage({
        conversationId,
        stage: "researching",
      });
      router.push(`/chat/${conversationId}/research`);
    } catch (error) {
      console.error("Error proceeding:", error);
      toast({
        title: "Error",
        description: "Failed to proceed",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      const answeredCount = questions.filter((q) => q.answer?.trim()).length;
      const totalCount = questions.length;

      // Call API to fill defaults
      const response = await fetch("/api/questions/fill-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          extractedContext: conversation?.extractedContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fill defaults");
      }

      const { questions: filledQuestions } = await response.json();

      const autoFilledCount = filledQuestions.filter((q: Question) => q.autoCompleted).length;

      // Track skip event
      trackQuestionsSkip({
        conversationId,
        answeredCount,
        totalCount,
        autoFilledCount,
        hasExtractedContext: !!conversation?.extractedContext,
      });

      // Save filled questions to Convex
      await saveQuestions({
        conversationId,
        questions: filledQuestions,
      });

      // Update stage and navigate to research
      await updateStage({
        conversationId,
        stage: "researching",
      });

      toast({
        title: "Questions auto-completed",
        description: "Unanswered questions have been filled with recommended defaults.",
      });

      router.push(`/chat/${conversationId}/research`);
    } catch (error) {
      console.error("Error skipping:", error);
      toast({
        title: "Skip failed",
        description: "Failed to skip to research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Generating tailored questions for your product...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Group questions by category
  const categories = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category]!.push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const requiredQuestions = questions.filter((q) => q.required);
  const answeredRequired = requiredQuestions.filter(
    (q) => q.answer?.trim()
  ).length;

  const unansweredCount = requiredQuestions.length - answeredRequired;

  return (
    <WorkflowLayout
      currentStep="questions"
      completedSteps={["discovery"]}
      conversationId={conversationId}
      showSkipButton={true}
      onSkip={handleSkip}
      skipButtonText={`Skip (${answeredRequired}/${requiredQuestions.length} answered)`}
      skipButtonLoading={isSkipping}
      skipConfirmMessage={`You've answered ${answeredRequired} out of ${requiredQuestions.length} questions. We'll automatically fill the remaining ${unansweredCount} questions with recommended or default answers. You can always come back to review and edit these answers.`}
      skipConfirmTitle="Skip Questions?"
      showFooter={true}
      onBack={() => router.back()}
      onNext={handleContinue}
      nextButtonText={isSaving ? "Saving..." : "Continue to Research"}
      nextButtonDisabled={isSaving}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Clarifying Questions</h1>
          <p className="text-muted-foreground">
            Help us understand your product better by answering these questions.
            Your answers will help us recommend the best tech stack for your needs.
          </p>
        </div>

        <ProgressIndicator
          total={requiredQuestions.length}
          completed={answeredRequired}
          className="mb-8"
        />

        <div className="space-y-8 mb-8">
          {Object.entries(categories).map(([category, categoryQuestions]) => (
            <QuestionCategory
              key={category}
              category={category}
              questions={categoryQuestions}
              onAnswerChange={handleAnswerChange}
            />
          ))}
        </div>
      </div>
    </WorkflowLayout>
  );
}
