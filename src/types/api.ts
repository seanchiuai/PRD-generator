/**
 * API Request/Response Types
 */

import type { Message } from "./conversation";
import type { ProductContext } from "./product-context";
import type { ResearchResults, ValidationWarning } from "./tech-stack";
import type { PRDData, PRDStatus } from "./prd";

// Message API
export interface MessageAPIRequest {
  messages: Message[];
}

export interface MessageAPIResponse {
  message: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Question Generation API
export interface QuestionGenerationRequest {
  productContext: ProductContext;
  conversationMessages: Message[];
}

// Research API
export interface ResearchRequest {
  productContext: ProductContext;
  answers: Record<string, string>;
}

// Tech Stack Validation API
export interface TechStackValidationRequest {
  selections: Record<string, string>;
  researchResults: ResearchResults;
}

export interface TechStackValidationResponse {
  warnings: ValidationWarning[];
}

// PRD Generation API
export interface PRDGenerationRequest {
  conversationId: string;
}

export interface PRDGenerationResponse {
  prdId: string;
  status: PRDStatus;
  prdData?: PRDData;
  error?: string;
}

// Error Types
export interface APIError {
  error: string;
  details?: string;
  code?: string;
}

// Export Types
export interface ExportOptions {
  format: "json" | "pdf";
  includeTimestamp?: boolean;
}
