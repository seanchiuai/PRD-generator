/**
 * PRD (Product Requirements Document) Data Types
 */

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

export type PRDStatus = "generating" | "completed" | "failed";
