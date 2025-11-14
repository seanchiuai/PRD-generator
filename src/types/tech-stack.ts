/**
 * Tech Stack Research, Selection, and Validation Types
 */

// Research Types
export interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

export interface AdditionalTool {
  category: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface ResearchResults {
  frontend?: TechOption[];
  backend?: TechOption[];
  database?: TechOption[];
  authentication?: TechOption[];
  hosting?: TechOption[];
  additionalTools?: AdditionalTool[];
}

export type ResearchStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ResearchMetadata {
  startedAt: number;
  completedAt?: number;
  categoriesCompleted: string[];
  status: ResearchStatus;
}

// Selection Types
export interface TechSelection {
  name: string;
  reasoning: string;
  selectedFrom: string[];
}

export interface SelectedTechStack {
  frontend?: TechSelection;
  backend?: TechSelection;
  database?: TechSelection;
  authentication?: TechSelection;
  hosting?: TechSelection;
  additionalTools?: Array<{
    category: string;
    name: string;
    reasoning: string;
  }>;
}

// Validation Types
export type ValidationLevel = "warning" | "error";

export interface ValidationWarning {
  level: ValidationLevel;
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}
