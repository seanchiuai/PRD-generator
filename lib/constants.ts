/**
 * Application Constants
 *
 * Centralized configuration values and magic numbers.
 * Extracted from hardcoded values across the codebase for maintainability.
 */

// ============================================================================
// WORKFLOW THRESHOLDS
// ============================================================================

/**
 * Thresholds for automatic workflow progression
 */
export const WORKFLOW_THRESHOLDS = {
  /** Minimum number of messages before allowing discovery skip */
  MIN_MESSAGES_TO_SKIP: 3,

  /** Minimum total characters in user messages before allowing skip */
  MIN_CHARS_TO_SKIP: 100,

  /** Minimum percentage of answered questions to proceed (0-100) */
  QUESTION_COMPLETENESS_THRESHOLD: 70,
} as const;

// ============================================================================
// TECH STACK CATEGORIES
// ============================================================================

/**
 * Available tech stack research categories
 */
export const TECH_STACK_CATEGORIES = [
  "frontend",
  "backend",
  "database",
  "authentication",
  "hosting",
] as const;

/**
 * Number of tech options to research per category
 */
export const TECH_OPTIONS_PER_CATEGORY = 3;

// ============================================================================
// QUESTION GENERATION
// ============================================================================

/**
 * Target number of clarifying questions to generate
 */
export const QUESTION_COUNT_RANGE = {
  MIN: 12,
  MAX: 15,
} as const;

/**
 * Question categories and their target counts
 */
export const QUESTION_CATEGORIES = {
  "Core Features": { min: 3, max: 3 },
  "User Types & Personas": { min: 2, max: 3 },
  "Data Requirements": { min: 2, max: 3 },
  "Scalability & Performance": { min: 2, max: 2 },
  "Integrations & Third-party Services": { min: 2, max: 2 },
  "Technical Constraints": { min: 1, max: 2 },
} as const;

// ============================================================================
// PRD GENERATION
// ============================================================================

/**
 * Target counts for PRD sections
 */
export const PRD_TARGETS = {
  /** Number of MVP features to include */
  MVP_FEATURES_RANGE: { min: 5, max: 8 },

  /** Number of user personas to create */
  USER_PERSONAS_RANGE: { min: 2, max: 3 },

  /** Number of key objectives */
  KEY_OBJECTIVES: 5,

  /** Number of success metrics */
  SUCCESS_METRICS: 5,
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Pagination limits for lists
 */
export const PAGINATION = {
  /** Default number of conversations to fetch */
  CONVERSATIONS_DEFAULT_LIMIT: 50,

  /** Default number of PRDs to fetch */
  PRDS_DEFAULT_LIMIT: 50,

  /** Items per page in table views */
  TABLE_PAGE_SIZE: 10,
} as const;

/**
 * Timeouts and delays (in milliseconds)
 */
export const TIMEOUTS = {
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE: 300,

  /** Typing indicator display duration */
  TYPING_INDICATOR: 1000,

  /** Toast notification duration */
  TOAST_DURATION: 5000,
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Input validation constraints
 */
export const VALIDATION_RULES = {
  /** Minimum product name length */
  MIN_PRODUCT_NAME_LENGTH: 1,

  /** Maximum product name length */
  MAX_PRODUCT_NAME_LENGTH: 100,

  /** Minimum description length */
  MIN_DESCRIPTION_LENGTH: 10,

  /** Maximum message length */
  MAX_MESSAGE_LENGTH: 10000,

  /** Minimum answer length for required questions */
  MIN_ANSWER_LENGTH: 3,
} as const;

// ============================================================================
// FILE EXPORT
// ============================================================================

/**
 * Export file naming patterns
 */
export const EXPORT_PATTERNS = {
  /** JSON file name pattern: {productName}_PRD_{timestamp}.json */
  JSON_FILENAME: (productName: string) =>
    `${(productName || "unnamed_product").trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}_PRD_${Date.now()}.json`,

  /** PDF file name pattern: {productName}_PRD_{timestamp}.pdf */
  PDF_FILENAME: (productName: string) =>
    `${(productName || "unnamed_product").trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}_PRD_${Date.now()}.pdf`,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * User-facing error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to perform this action",
  INVALID_INPUT: "Please check your input and try again",
  CONVERSATION_NOT_FOUND: "Conversation not found",
  PRD_NOT_FOUND: "PRD not found",
  GENERATION_FAILED: "Failed to generate content. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * User-facing success messages
 */
export const SUCCESS_MESSAGES = {
  PRD_EXPORTED: "PRD exported successfully",
  PRD_DELETED: "PRD deleted successfully",
  CONVERSATION_DELETED: "Conversation deleted successfully",
  PROGRESS_SAVED: "Progress saved automatically",
} as const;
