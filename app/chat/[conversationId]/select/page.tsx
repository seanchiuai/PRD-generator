"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CategorySection } from "@/components/selection/CategorySection";
import { ValidationWarnings } from "@/components/selection/ValidationWarnings";
import { SelectionProgress } from "@/components/selection/SelectionProgress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  const categories = [
    { name: "Frontend Framework", key: "frontend" },
    { name: "Backend Framework", key: "backend" },
    { name: "Database", key: "database" },
    { name: "Authentication", key: "authentication" },
    { name: "Hosting Platform", key: "hosting" },
  ];

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
      console.error("Validation error:", error);
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
    const options = (conversation?.researchResults as any)?.[category] || [];
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Select Your Tech Stack</h1>
        <p className="text-muted-foreground mt-2">
          Choose one technology from each category based on your requirements
        </p>
      </div>

      {/* Progress */}
      <SelectionProgress total={categories.length} selected={selectedCount} />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <ValidationWarnings warnings={validationWarnings} />
      )}

      {/* Category Sections */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const options = (conversation.researchResults as any)?.[cat.key];
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

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t sticky bottom-0 bg-background py-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/chat/${conversationId}/research`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research
        </Button>

        <Button
          onClick={handleContinue}
          disabled={isValidating || hasErrors || selectedCount < categories.length}
        >
          {isValidating ? "Validating..." : "Generate PRD"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
