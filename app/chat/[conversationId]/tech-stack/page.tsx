"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CategorySection } from "@/components/tech-stack/CategorySection";
import { SelectionStatus } from "@/components/tech-stack/SelectionStatus";
import { useToast } from "@/hooks/use-toast";
import { WorkflowLayout } from "@/components/workflow/WorkflowLayout";
import { AutoAdvance } from "@/components/workflow/AutoAdvance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import { trackTechStackSkip } from "@/lib/analytics/techStackEvents";
import { detectProductType } from "@/lib/techStack/defaults";
import { logger } from "@/lib/logger";
import type { ValidationWarning, TechOption } from "@/types";

export default function TechStackPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const saveResults = useMutation(api.conversations.saveResearchResults);
  const saveSelection = useMutation(api.conversations.saveSelection);
  const saveWarnings = useMutation(api.conversations.saveValidationWarnings);
  const updateStage = useMutation(api.conversations.updateStage);

  const [isResearching, setIsResearching] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [validationAbortController, setValidationAbortController] = useState<AbortController | null>(null);
  const hasStartedResearchRef = useRef(false);

  // Detect if the stack was auto-selected
  const isAutoSelected = conversation?.selection?.autoSelected || false;

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

  // Check if research results actually have data
  const hasExistingResults = conversation?.researchResults &&
    Object.keys(conversation.researchResults).length > 0;

  // Load existing selections - only once per conversation
  useEffect(() => {
    if (!conversation) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Auto-advance countdown for auto-selected stacks
  useEffect(() => {
    if (isAutoSelected && conversation?.selection && !showCountdown && hasExistingResults) {
      setShowCountdown(true);
    }
  }, [isAutoSelected, conversation?.selection, showCountdown, hasExistingResults]);

  const validateSelections = useCallback(async (currentSelections: Record<string, string>) => {
    if (Object.keys(currentSelections).length < 2) return;

    // Abort previous validation request
    if (validationAbortController) {
      validationAbortController.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    setValidationAbortController(controller);

    setIsValidating(true);

    try {
      const response = await fetch("/api/validate/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: currentSelections }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Validation failed");

      const data = await response.json();
      setValidationWarnings(data.warnings || []);

      await saveWarnings({
        conversationId,
        warnings: data.warnings || [],
      });
    } catch (error) {
      // Don't log abort errors - they're expected
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      logger.error("TechStackPage.validateTechStack", error, { conversationId });
    } finally {
      setIsValidating(false);
      setValidationAbortController(null);
    }
  }, [conversationId, saveWarnings, validationAbortController]);

  const startResearch = useCallback(async () => {
    if (!conversation) {
      logger.debug("TechStackPage.startResearch", "No conversation, skipping research", {});
      return;
    }

    logger.debug("TechStackPage.startResearch", "Starting research", {
      hasProductContext: !!conversation.productContext,
      hasClarifyingQuestions: !!conversation.clarifyingQuestions,
      conversationId
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

      logger.debug("TechStackPage.startResearch", "Product context for research", { productContext, conversationId });

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
      logger.error("TechStackPage.startResearch", error, { conversationId });
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

  const handleSelection = async (category: string, optionName: string) => {
    // Update local state
    const newSelections = {
      ...selections,
      [category]: optionName,
    };
    setSelections(newSelections);

    // Save to Convex
    const categoryData = conversation?.researchResults?.[category as keyof typeof conversation.researchResults];
    const options = (Array.isArray(categoryData) ? categoryData : (categoryData?.options || [])) as TechOption[];
    await saveSelection({
      conversationId,
      category,
      selection: {
        name: optionName,
        reasoning: `Selected from ${options.length} options`,
        selectedFrom: options.map((o) => o.name),
      },
    });

    // Trigger validation with updated selections
    validateSelections(newSelections);
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
          useAI: true,
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

        // Navigate directly to generate
        router.push(`/chat/${conversationId}/generate`);
      }
    } catch (error) {
      logger.error("TechStackPage.handleSkip", error, { conversationId });
      toast({
        title: "Skip failed",
        description: "Failed to skip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkipping(false);
    }
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

  // Reset ref when conversationId changes
  useEffect(() => {
    hasStartedResearchRef.current = false;
  }, [conversationId]);

  // Auto-start research if no existing results
  useEffect(() => {
    logger.debug("TechStackPage.useEffect", "Research useEffect triggered", {
      hasConversation: !!conversation,
      hasExistingResults,
      shouldStart: conversation && !hasExistingResults && !hasStartedResearchRef.current,
      conversationId
    });

    if (conversation && !hasExistingResults && !hasStartedResearchRef.current) {
      hasStartedResearchRef.current = true;
      logger.debug("TechStackPage.useEffect", "Auto-starting research", { conversationId });
      startResearch();
    }
  }, [conversation, hasExistingResults, startResearch, conversationId]);

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

  const selectedCount = Object.keys(selections).length;
  const hasErrors = validationWarnings.some((w) => w.level === "error");

  return (
    <WorkflowLayout
      currentStep="tech-stack"
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
      onNext={handleContinue}
      nextButtonText={isValidating ? "Validating..." : "Generate PRD"}
      nextButtonDisabled={isResearching || isValidating || hasErrors || selectedCount < categories.length || !hasExistingResults}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Select Your Tech Stack</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered recommendations based on your product requirements
          </p>
        </div>

        {/* Auto-Selection Indicator */}
        {isAutoSelected && hasExistingResults && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Recommended Stack Selected</AlertTitle>
            <AlertDescription className="text-green-800">
              We've selected a tech stack based on your product requirements.
              You can review and change any selections below.
            </AlertDescription>
          </Alert>
        )}

        {/* Global Error State */}
        {error && !isResearching && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="error-icon-title"
                >
                  <title id="error-icon-title">Error</title>
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
                    type="button"
                    onClick={startResearch}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    Retry Research
                  </button>
                  <button
                    type="button"
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

        {/* Selection Status */}
        {!isResearching && hasExistingResults && (
          <SelectionStatus
            total={categories.length}
            selected={selectedCount}
            warnings={validationWarnings}
            isValidating={isValidating}
          />
        )}

        {/* Category Sections */}
        <div className="space-y-12">
          {categories.map((cat) => {
            const categoryData = conversation.researchResults?.[cat.key as keyof typeof conversation.researchResults];

            // During research, show loading state
            if (isResearching) {
              return (
                <CategorySection
                  key={cat.key}
                  category={cat.name}
                  reasoning={cat.reasoning}
                  options={[]}
                  selectedOption={selections[cat.key]}
                  onSelect={(optionName) => handleSelection(cat.key, optionName)}
                  isLoading={true}
                />
              );
            }

            if (!categoryData) return null;

            // Handle both old format (array) and new format ({ options, reasoning })
            const options = Array.isArray(categoryData) ? categoryData : categoryData.options;
            const reasoning = !Array.isArray(categoryData) ? categoryData.reasoning : cat.reasoning;

            if (!options || options.length === 0) return null;

            return (
              <CategorySection
                key={cat.key}
                category={cat.name}
                reasoning={reasoning}
                options={options}
                selectedOption={selections[cat.key]}
                onSelect={(optionName) => handleSelection(cat.key, optionName)}
                isLoading={false}
              />
            );
          })}
        </div>

        {/* Auto-advance Countdown */}
        <AutoAdvance
          enabled={showCountdown && isAutoSelected && hasExistingResults}
          delaySeconds={5}
          nextStepName="PRD Generation"
          onAdvance={() => router.push(`/chat/${conversationId}/generate`)}
          onCancel={() => setShowCountdown(false)}
        />
      </div>
    </WorkflowLayout>
  );
}
