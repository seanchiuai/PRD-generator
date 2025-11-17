/**
 * Centralized Type Definitions for PRD Generator
 *
 * This file contains all shared TypeScript interfaces used across
 * the application, replacing 'any' types with proper type safety.
 */

// ============================================================================
// MESSAGE & CONVERSATION TYPES
// ============================================================================

export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: number;
}

// ============================================================================
// WORKFLOW STAGE TYPES
// ============================================================================

export type ConversationStage =
  | "discovery"
  | "clarifying"
  | "researching"
  | "selecting"
  | "generating"
  | "completed";

// ============================================================================
// PRODUCT CONTEXT TYPES
// ============================================================================

export interface ProductContext {
  productName?: string;
  description?: string;
  targetAudience?: string;
  coreFeatures?: string[];
}

export interface ExtractedContext {
  productName: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
  problemStatement: string;
  technicalPreferences: string[];
  extractedAt?: number;
}

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type QuestionType = "text" | "textarea" | "select" | "radio";

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

// ============================================================================
// TECH STACK RESEARCH TYPES
// ============================================================================

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

// ============================================================================
// TECH STACK SELECTION TYPES
// ============================================================================

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

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export type ValidationLevel = "warning" | "error";

export interface ValidationWarning {
  level: ValidationLevel;
  message: string;
  affectedTechnologies: string[];
  suggestion?: string;
}

// ============================================================================
// PRD DATA TYPES
// ============================================================================

export interface ProjectOverview {
  productName: string;
  tagline: string;
  description: string;
  targetAudience: string;
  problemStatement: string;
}

export interface PurposeAndGoals {
  vision: string;
  keyObjectives: string[];
  successMetrics: string[];
}

export interface TechStackItem {
  name: string;
  purpose: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

export interface PRDTechStack {
  frontend: TechStackItem;
  backend: TechStackItem;
  database: TechStackItem;
  authentication: TechStackItem;
  hosting: TechStackItem;
  reasoning: string;
}

export type FeaturePriority = "critical" | "high" | "medium";

export interface Feature {
  name: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string[];
  technicalRequirements: string[];
  priority: FeaturePriority;
}

export interface Features {
  mvpFeatures: Feature[];
  niceToHaveFeatures: Feature[];
  outOfScope: string[];
}

export interface UserPersona {
  name: string;
  role: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  technicalProficiency: string;
}

export interface DataModelField {
  name: string;
  type: string;
  required: boolean;
}

export interface DataModel {
  entityName: string;
  description: string;
  fields: DataModelField[];
  relationships: string[];
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface APIEndpoint {
  method: HTTPMethod;
  path: string;
  purpose: string;
  authentication: boolean;
  requestBody?: string;
  responseBody?: string;
}

export interface TechnicalArchitecture {
  systemDesign: string;
  dataModels: DataModel[];
  apiEndpoints: APIEndpoint[];
  securityConsiderations: string[];
}

export interface TimelinePhase {
  name: string;
  duration: string;
  deliverables: string[];
}

export interface Timeline {
  estimatedDuration: string;
  phases: TimelinePhase[];
}

export interface Risk {
  category: string;
  description: string;
  impact: string;
  mitigation: string;
}

export interface PRDData {
  projectOverview: ProjectOverview;
  purposeAndGoals: PurposeAndGoals;
  techStack: PRDTechStack;
  features: Features;
  userPersonas: UserPersona[];
  technicalArchitecture: TechnicalArchitecture;
  timeline: Timeline;
  risks: Risk[];
}

// ============================================================================
// PRD STATUS TYPES
// ============================================================================

export type PRDStatus = "generating" | "completed" | "failed";

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

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

export interface QuestionGenerationRequest {
  productContext: ProductContext;
  conversationMessages: Message[];
}

export interface ResearchRequest {
  productContext: ProductContext;
  answers: Record<string, string>;
}

export interface TechStackValidationRequest {
  selections: Record<string, string>;
  researchResults: ResearchResults;
}

export interface TechStackValidationResponse {
  warnings: ValidationWarning[];
}

export interface PRDGenerationRequest {
  conversationId: string;
}

export interface PRDGenerationResponse {
  prdId: string;
  status: PRDStatus;
  prdData?: PRDData;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  error: string;
  details?: string;
  code?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: "json" | "pdf";
  includeTimestamp?: boolean;
}
