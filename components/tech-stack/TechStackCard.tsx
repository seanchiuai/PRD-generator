"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TechOption } from "@/types";

interface TechStackCardProps {
  option: TechOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function TechStackCard({ option, isSelected, onSelect }: TechStackCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative min-h-[400px] flex flex-col",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{option.name}</CardTitle>
              {option.popularity && (
                <Badge variant="secondary" className="text-xs">
                  {option.popularity}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-2 line-clamp-3">
              {option.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Pros Section */}
          <div>
            <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Pros
            </h5>
            <ul className="space-y-1.5">
              {option.pros.map((pro, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons Section */}
          <div>
            <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400 flex items-center gap-1">
              <X className="h-4 w-4" />
              Cons
            </h5>
            <ul className="space-y-1.5">
              {option.cons.map((con, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <X className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn More */}
          {option.learnMore && (
            <a
              href={option.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="rounded-full bg-green-600 dark:bg-green-500 p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </Card>
  );
}
