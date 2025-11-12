"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

interface QuestionCardProps {
  question: {
    question: string;
    placeholder?: string;
    answer?: string;
    required: boolean;
    type: string;
    suggestedOptions?: string[];
  };
  onAnswerChange: (answer: string) => void;
}

export function QuestionCard({ question, onAnswerChange }: QuestionCardProps) {
  // Determine initial state based on existing answer
  const [selectedOption, setSelectedOption] = useState<string | null>(() => {
    if (
      question.answer &&
      question.suggestedOptions?.includes(question.answer)
    ) {
      return question.answer;
    }
    return null;
  });

  const [isOtherSelected, setIsOtherSelected] = useState(() => {
    return (
      !!question.answer &&
      !question.suggestedOptions?.includes(question.answer || "")
    );
  });

  const [otherText, setOtherText] = useState(() => {
    if (
      question.answer &&
      !question.suggestedOptions?.includes(question.answer)
    ) {
      return question.answer;
    }
    return "";
  });

  // Handle option button click
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOtherSelected(false);
    setOtherText("");
    onAnswerChange(option);
  };

  // Handle "Other" checkbox toggle
  const handleOtherToggle = () => {
    const newValue = !isOtherSelected;
    setIsOtherSelected(newValue);
    if (newValue) {
      setSelectedOption(null);
      // If there's text, keep it; otherwise clear
      if (otherText.trim()) {
        onAnswerChange(otherText);
      }
    } else {
      setOtherText("");
      onAnswerChange("");
    }
  };

  // Handle "Other" text change
  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (text.trim()) {
      setIsOtherSelected(true);
      setSelectedOption(null);
      onAnswerChange(text);
    }
  };

  // If no suggested options, render traditional input
  if (!question.suggestedOptions || question.suggestedOptions.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Label className="text-base">{question.question}</Label>
          {question.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>

        {question.type === "textarea" ? (
          <Textarea
            value={question.answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[100px]"
          />
        ) : (
          <Input
            value={question.answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
          />
        )}
      </div>
    );
  }

  // Render with suggested options
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Label className="text-base font-medium">{question.question}</Label>
        {question.required && (
          <Badge variant="secondary" className="text-xs">
            Required
          </Badge>
        )}
      </div>

      {/* Suggested Options */}
      <div className="flex flex-col sm:flex-row gap-2">
        {question.suggestedOptions.map((option, idx) => (
          <Button
            key={idx}
            variant={selectedOption === option ? "default" : "outline"}
            onClick={() => handleOptionClick(option)}
            className="flex-1 h-auto py-3 px-4 text-left justify-start whitespace-normal"
          >
            {selectedOption === option && (
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{option}</span>
          </Button>
        ))}
      </div>

      {/* Other Option */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`other-${question.question}`}
            checked={isOtherSelected}
            onCheckedChange={handleOtherToggle}
          />
          <label
            htmlFor={`other-${question.question}`}
            className="text-sm font-medium cursor-pointer"
          >
            Other (specify)
          </label>
        </div>

        {isOtherSelected && (
          <Textarea
            value={otherText}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className="min-h-[100px] transition-all"
          />
        )}
      </div>
    </div>
  );
}
