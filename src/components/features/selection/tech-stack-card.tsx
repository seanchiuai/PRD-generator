"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface TechStackCardProps {
  option: TechOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function TechStackCard({ option, isSelected, onSelect }: TechStackCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{option.name}</CardTitle>
              {option.popularity && (
                <Badge variant="secondary" className="text-xs">
                  {option.popularity}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-2">{option.description}</CardDescription>
          </div>
          {isSelected && (
            <div className="flex-shrink-0 ml-2">
              <div className="rounded-full bg-primary p-1">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                    Pros
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {option.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                    Cons
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {option.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>

                {option.learnMore && (
                  <a
                    href={option.learnMore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn more <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
