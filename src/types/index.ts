/**
 * Centralized Type Definitions for PRD Generator
 *
 * This file re-exports all type definitions from domain-specific files
 * for convenient importing throughout the application.
 */

// Conversation & Message Types
export type { MessageRole, Message, ConversationStage } from "./conversation";

// Product Context Types
export type { ProductContext } from "./product-context";

// Question Types
export type { QuestionType, Question, QuestionGenerationResponse } from "./question";

// Tech Stack Types
export type {
  TechOption,
  AdditionalTool,
  ResearchResults,
  ResearchStatus,
  ResearchMetadata,
  TechSelection,
  SelectedTechStack,
  ValidationLevel,
  ValidationWarning,
} from "./tech-stack";

// PRD Data Types
export type {
  ProjectOverview,
  PurposeAndGoals,
  TechStackItem,
  PRDTechStack,
  FeaturePriority,
  Feature,
  Features,
  UserPersona,
  DataModelField,
  DataModel,
  HTTPMethod,
  APIEndpoint,
  TechnicalArchitecture,
  TimelinePhase,
  Timeline,
  Risk,
  PRDData,
  PRDStatus,
} from "./prd";

// API Types
export type {
  MessageAPIRequest,
  MessageAPIResponse,
  QuestionGenerationRequest,
  ResearchRequest,
  TechStackValidationRequest,
  TechStackValidationResponse,
  PRDGenerationRequest,
  PRDGenerationResponse,
  APIError,
  ExportOptions,
} from "./api";
