/**
 * Question and Answer Types
 */

export type QuestionType = "text" | "textarea" | "select";

export interface Question {
  id: string;
  category: string;
  question: string;
  placeholder?: string;
  answer?: string;
  required: boolean;
  type: QuestionType;
  suggestedOptions?: string[];
  autoCompleted?: boolean;
}

export interface QuestionGenerationResponse {
  questions: Question[];
}
