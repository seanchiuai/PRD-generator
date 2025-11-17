"use client";

import { useReducer, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    question: string;
    placeholder?: string;
    answer?: string;
    required: boolean;
    type: string;
    suggestedOptions?: string[];
    autoCompleted?: boolean;
  };
  onAnswerChange: (answer: string) => void;
}

type State = {
  selectedOption: string | null;
  selectedOptions: string[];
  isOtherSelected: boolean;
  otherText: string;
};

type Action =
  | { type: "TOGGLE_MULTISELECT"; option: string }
  | { type: "SELECT_OPTION"; option: string }
  | { type: "TOGGLE_OTHER" }
  | { type: "UPDATE_OTHER_TEXT"; text: string }
  | { type: "INITIALIZE"; payload: State };

function questionReducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_MULTISELECT": {
      const newSelected = state.selectedOptions.includes(action.option)
        ? state.selectedOptions.filter((o) => o !== action.option)
        : [...state.selectedOptions, action.option];
      return {
        ...state,
        selectedOptions: newSelected,
      };
    }
    case "SELECT_OPTION":
      return {
        ...state,
        selectedOption: action.option,
        isOtherSelected: false,
        otherText: "",
      };
    case "TOGGLE_OTHER": {
      const newValue = !state.isOtherSelected;
      return {
        ...state,
        isOtherSelected: newValue,
        selectedOption: newValue ? null : state.selectedOption,
        otherText: newValue ? state.otherText : "",
      };
    }
    case "UPDATE_OTHER_TEXT":
      return {
        ...state,
        otherText: action.text,
        isOtherSelected: action.text.trim().length > 0,
        selectedOption: action.text.trim().length > 0 ? null : state.selectedOption,
      };
    case "INITIALIZE":
      return action.payload;
    default:
      return state;
  }
}

export function QuestionCard({ question, onAnswerChange }: QuestionCardProps) {
  // Initialize state from question props
  const getInitialState = (): State => {
    const isMultiselect = question.type === "multiselect";
    const answer = question.answer || "";
    const options = question.suggestedOptions || [];

    if (isMultiselect && answer) {
      return {
        selectedOption: null,
        selectedOptions: answer.split(", ").filter(Boolean),
        isOtherSelected: false,
        otherText: "",
      };
    }

    if (!isMultiselect && answer) {
      const isAnswerInOptions = options.includes(answer);
      return {
        selectedOption: isAnswerInOptions ? answer : null,
        selectedOptions: [],
        isOtherSelected: !isAnswerInOptions,
        otherText: !isAnswerInOptions ? answer : "",
      };
    }

    return {
      selectedOption: null,
      selectedOptions: [],
      isOtherSelected: false,
      otherText: "",
    };
  };

  const [state, dispatch] = useReducer(questionReducer, null, getInitialState);

  // Emit answer changes
  useEffect(() => {
    if (question.type === "multiselect") {
      onAnswerChange(state.selectedOptions.join(", "));
    } else if (state.isOtherSelected && state.otherText.trim()) {
      onAnswerChange(state.otherText);
    } else if (state.selectedOption) {
      onAnswerChange(state.selectedOption);
    } else if (!state.isOtherSelected) {
      onAnswerChange("");
    }
  }, [
    state.selectedOptions,
    state.selectedOption,
    state.isOtherSelected,
    state.otherText,
    question.type,
    onAnswerChange,
  ]);

  // Handle multiselect option toggle
  const handleMultiselectToggle = (option: string) => {
    dispatch({ type: "TOGGLE_MULTISELECT", option });
  };

  // Handle option button click (for single select)
  const handleOptionClick = (option: string) => {
    dispatch({ type: "SELECT_OPTION", option });
  };

  // Handle "Other" checkbox toggle
  const handleOtherToggle = () => {
    dispatch({ type: "TOGGLE_OTHER" });
  };

  // Handle "Other" text change
  const handleOtherChange = (text: string) => {
    dispatch({ type: "UPDATE_OTHER_TEXT", text });
  };

  // If no suggested options, render traditional input
  if (!question.suggestedOptions || question.suggestedOptions.length === 0) {
    return (
      <div className={cn("space-y-2 p-4 rounded-lg", question.autoCompleted && "bg-blue-50 border border-blue-200")}>
        <div className="flex items-start justify-between gap-2">
          <Label className="text-base">{question.question}</Label>
          <div className="flex gap-2">
            {question.autoCompleted && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-filled
              </Badge>
            )}
            {question.required && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
          </div>
        </div>

        {question.type === "textarea" ? (
          <Textarea
            value={question.answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            className={cn("min-h-[100px]", question.autoCompleted && "border-blue-300")}
          />
        ) : (
          <Input
            value={question.answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            className={cn(question.autoCompleted && "border-blue-300")}
          />
        )}
      </div>
    );
  }

  // Render with suggested options
  return (
    <div className={cn("space-y-3 p-4 rounded-lg", question.autoCompleted && "bg-blue-50 border border-blue-200")}>
      <div className="flex items-start justify-between gap-2">
        <Label className="text-base font-medium">{question.question}</Label>
        <div className="flex gap-2">
          {question.autoCompleted && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-filled
            </Badge>
          )}
          {question.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>

      {/* Suggested Options */}
      {question.type === "multiselect" ? (
        // Multiselect: Show checkboxes for all options
        <div className="space-y-2">
          {question.suggestedOptions.map((option) => {
            const checkboxId = `${question.id}-${option.replace(/\s+/g, '-')}`;

            return (
              <div
                key={option}
                className="flex items-start gap-3 p-3 rounded border hover:bg-accent/50 cursor-pointer"
                onClick={() => handleMultiselectToggle(option)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMultiselectToggle(option);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <Checkbox
                  id={checkboxId}
                  checked={state.selectedOptions.includes(option)}
                  onCheckedChange={() => handleMultiselectToggle(option)}
                  className="mt-0.5"
                />
                <label htmlFor={checkboxId} className="text-sm flex-1 cursor-pointer">
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        // Single select: Show buttons
        <div className="flex flex-col sm:flex-row gap-2">
          {question.suggestedOptions.map((option) => (
            <Button
              key={option}
              variant={state.selectedOption === option ? "default" : "outline"}
              onClick={() => handleOptionClick(option)}
              className="flex-1 h-auto py-3 px-4 text-left justify-start whitespace-normal"
            >
              {state.selectedOption === option && (
                <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{option}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Other Option */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`other-${question.question}`}
            checked={state.isOtherSelected}
            onCheckedChange={handleOtherToggle}
          />
          <label
            htmlFor={`other-${question.question}`}
            className="text-sm font-medium cursor-pointer"
          >
            Other (specify)
          </label>
        </div>

        {state.isOtherSelected && (
          <Textarea
            value={state.otherText}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className={cn("min-h-[100px] transition-all", question.autoCompleted && "border-blue-300")}
          />
        )}
      </div>
    </div>
  );
}
