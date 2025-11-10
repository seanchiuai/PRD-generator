import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "./QuestionCard";

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  answer?: string;
  required: boolean;
  type: string;
}

interface QuestionCategoryProps {
  category: string;
  questions: Question[];
  onAnswerChange: (questionId: string, answer: string) => void;
}

export function QuestionCategory({
  category,
  questions,
  onAnswerChange,
}: QuestionCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
