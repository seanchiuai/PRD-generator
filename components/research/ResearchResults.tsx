"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface ResearchResultsProps {
  category: string;
  options: TechOption[];
  reasoning?: string;
}

export function ResearchResults({ category, options, reasoning }: ResearchResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
        <CardDescription>
          {reasoning || `Top ${options.length} recommendations for your product`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {options.map((option, index) => (
            <AccordionItem key={index} value={`option-${index}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{option.name}</span>
                  {option.popularity && (
                    <Badge variant="secondary">{option.popularity}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>

                  <div>
                    <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                      Pros
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {option.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                      Cons
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
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
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
