"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { QuestionCategory } from "@/components/questions/QuestionCategory";
import { ProgressIndicator } from "@/components/questions/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  category: string;
  question: string;
  placeholder?: string;
  answer?: string;
  required: boolean;
  type: string;
}

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
          productContext: conversation.productContext || {},
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
      q.id === questionId ? { ...q, answer } : q
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

  const calculateCompleteness = () => {
    const requiredQuestions = questions.filter((q) => q.required);
    if (requiredQuestions.length === 0) return 0;

    const answeredRequired = requiredQuestions.filter(
      (q) => q.answer && q.answer.trim().length > 0
    );
    return (answeredRequired.length / requiredQuestions.length) * 100;
  };

  const handleContinue = async () => {
    const completeness = calculateCompleteness();

    if (completeness < 70) {
      toast({
        title: "More answers needed",
        description: "Please answer at least 70% of required questions",
        variant: "destructive",
      });
      return;
    }

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
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const completeness = calculateCompleteness();
  const requiredQuestions = questions.filter((q) => q.required);
  const answeredRequired = requiredQuestions.filter(
    (q) => q.answer?.trim()
  ).length;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
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

      <div className="flex justify-between sticky bottom-0 bg-background py-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isSaving || completeness < 70}
        >
          {isSaving ? "Saving..." : "Continue to Research"}
        </Button>
      </div>
    </div>
  );
}
