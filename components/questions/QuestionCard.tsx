import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: {
    question: string;
    placeholder?: string;
    answer?: string;
    required: boolean;
    type: string;
  };
  onAnswerChange: (answer: string) => void;
}

export function QuestionCard({ question, onAnswerChange }: QuestionCardProps) {
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
