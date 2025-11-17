"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategorySection } from "@/components/selection/CategorySection";
import { ValidationWarnings } from "@/components/selection/ValidationWarnings";
import { SelectionProgress } from "@/components/selection/SelectionProgress";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { AutoAdvance } from "@/components/workflow/AutoAdvance";
import { Sparkles } from "lucide-react";
import { logger } from "@/lib/logger";

interface ValidationWarning {
  level: "warning" | "error";
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}

export default function SelectionPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveSelection = useMutation(api.conversations.saveSelection);
  const saveWarnings = useMutation(api.conversations.saveValidationWarnings);
  const updateStage = useMutation(api.conversations.updateStage);

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(false);

  // Detect if the stack was auto-selected
  const isAutoSelected = conversation?.selection?.autoSelected || false;

  // Dynamically build categories from queriesGenerated or researchResults
  const categories = conversation?.queriesGenerated?.map(q => ({
    key: q.category,
    name: q.category.charAt(0).toUpperCase() + q.category.slice(1).replace(/-/g, ' '),
  })) || Object.keys(conversation?.researchResults || {}).map(key => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
  })) || [];

  // Load existing selections
  useEffect(() => {
    if (conversation?.selectedTechStack) {
      const loaded: Record<string, string> = {};
      Object.entries(conversation.selectedTechStack).forEach(([key, value]: [string, any]) => {
        if (value?.name) {
          loaded[key] = value.name;
        }
      });
      setSelections(loaded);
    }

    if (conversation?.validationWarnings) {
      setValidationWarnings(conversation.validationWarnings as ValidationWarning[]);
    }
  }, [conversation]);

  // Auto-advance countdown for auto-selected stacks
  useEffect(() => {
    if (isAutoSelected && conversation?.selection && !showCountdown) {
      setShowCountdown(true);
    }
  }, [isAutoSelected, conversation?.selection, showCountdown]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      router.push(`/chat/${conversationId}/generate`);
    }
    return undefined;
  }, [showCountdown, countdown, conversationId, router]);

  const validateSelections = useCallback(async (currentSelections: Record<string, string>) => {
    if (Object.keys(currentSelections).length < 2) return;

    setIsValidating(true);

    try {
      const response = await fetch("/api/validate/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: currentSelections }),
      });

      if (!response.ok) throw new Error("Validation failed");

      const data = await response.json();
      setValidationWarnings(data.warnings || []);

      await saveWarnings({
        conversationId,
        warnings: data.warnings || [],
      });
    } catch (error) {
      logger.error("SelectionPage.validateTechStack", error, { conversationId });
    } finally {
      setIsValidating(false);
    }
  }, [conversationId, saveWarnings]);

  const handleSelection = async (category: string, optionName: string) => {
    // Update local state
    const newSelections = {
      ...selections,
      [category]: optionName,
    };
    setSelections(newSelections);

    // Save to Convex
    const categoryData = (conversation?.researchResults as any)?.[category];
    // Handle both old format (array) and new format ({ options, reasoning })
    const options = Array.isArray(categoryData) ? categoryData : (categoryData?.options || []);
    await saveSelection({
      conversationId,
      category,
      selection: {
        name: optionName,
        reasoning: `Selected from ${options.length} options`,
        selectedFrom: options.map((o: any) => o.name),
      },
    });

    // Trigger validation with updated selections
    validateSelections(newSelections);
  };

  const handleContinue = async () => {
    const errors = validationWarnings.filter((w) => w.level === "error");

    if (errors.length > 0) {
      toast({
        title: "Incompatible Technologies",
        description: "Please resolve the errors before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(selections).length < categories.length) {
      toast({
        title: "Incomplete Selection",
        description: "Please select an option for all categories.",
        variant: "destructive",
      });
      return;
    }

    await updateStage({
      conversationId,
      stage: "generating",
    });

    router.push(`/chat/${conversationId}/generate`);
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await updateStage({
        conversationId,
        stage: "generating",
      });
      router.push(`/chat/${conversationId}/generate`);
    } catch (error) {
      logger.error("SelectionPage.handleSkip", error, { conversationId });
      toast({
        title: "Skip failed",
        description: "Failed to skip to generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
    }
  };

  if (!conversation) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!conversation.researchResults) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            No research results found. Please complete the research step first.
          </p>
          <Button onClick={() => router.push(`/chat/${conversationId}/research`)}>
            Go to Research
          </Button>
        </div>
      </div>
    );
  }

  const selectedCount = Object.keys(selections).length;
  const hasErrors = validationWarnings.some((w) => w.level === "error");

  return (
    <WorkflowLayout
      currentStep="selection"
      completedSteps={["discovery", "questions", "research"]}
      conversationId={conversationId}
      showSkipButton={true}
      onSkip={handleSkip}
      skipButtonText="Skip to Generate"
      skipButtonLoading={isSkipping}
      skipConfirmMessage="Skipping selection will use default technology choices. This may not be optimal for your needs. Continue?"
      skipConfirmTitle="Skip Selection?"
      showFooter={true}
      onBack={() => router.push(`/chat/${conversationId}/research`)}
      onNext={handleContinue}
      nextButtonText={isValidating ? "Validating..." : "Generate PRD"}
      nextButtonDisabled={isValidating || hasErrors || selectedCount < categories.length}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Select Your Tech Stack</h1>
          <p className="text-muted-foreground mt-2">
            Choose one technology from each category based on your requirements
          </p>
        </div>

        {/* Auto-Selection Indicator */}
        {isAutoSelected && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Recommended Stack Selected</AlertTitle>
            <AlertDescription className="text-green-800">
              We've selected a tech stack based on your product requirements.
              You can review and change any selections below.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <SelectionProgress total={categories.length} selected={selectedCount} />

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <ValidationWarnings warnings={validationWarnings} />
        )}

        {/* Category Sections */}
        <div className="space-y-12">
          {categories.map((cat) => {
            const categoryData = (conversation.researchResults as any)?.[cat.key];
            if (!categoryData) return null;

            // Handle both old format (array) and new format ({ options, reasoning })
            const options = Array.isArray(categoryData) ? categoryData : categoryData.options;
            if (!options || options.length === 0) return null;

            return (
              <CategorySection
                key={cat.key}
                category={cat.name}
                options={options}
                selectedOption={selections[cat.key]}
                onSelect={(optionName) => handleSelection(cat.key, optionName)}
              />
            );
          })}
        </div>

        {/* Auto-advance Countdown */}
        <AutoAdvance
          enabled={showCountdown && isAutoSelected}
          delaySeconds={5}
          nextStepName="PRD Generation"
          onAdvance={() => router.push(`/chat/${conversationId}/generate`)}
          onCancel={() => setShowCountdown(false)}
        />
      </div>
    </WorkflowLayout>
  );
}
