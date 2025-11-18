"use client";

import { TechStackCard } from "./TechStackCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { TechOption } from "@/types";

interface CategorySectionProps {
  category: string;
  reasoning?: string;
  options: TechOption[];
  selectedOption?: string;
  onSelect: (techName: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  expectedOptionsCount?: number;
}

function CategorySkeleton() {
  return (
    <Card className="min-h-[400px]">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  );
}

export function CategorySection({
  category,
  reasoning,
  options,
  selectedOption,
  onSelect,
  isLoading = false,
  error,
  onRetry,
  expectedOptionsCount = 3,
}: CategorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{category}</h2>
        {reasoning && (
          <p className="text-sm text-muted-foreground mt-1">
            {reasoning}
          </p>
        )}
        {!reasoning && !isLoading && (
          <p className="text-sm text-muted-foreground mt-1">
            Choose one option for your tech stack
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: expectedOptionsCount }).map((_, i) => (
            <CategorySkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive mb-1">
                  Research Failed
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {error}
                </p>
                {onRetry && (
                  <Button onClick={onRetry} variant="outline" size="sm">
                    Retry Research
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && options.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No options found for this category.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Options Grid */}
      {!isLoading && !error && options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <TechStackCard
              key={`${option.name}-${index}`}
              option={option}
              isSelected={selectedOption === option.name}
              onSelect={() => onSelect(option.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
