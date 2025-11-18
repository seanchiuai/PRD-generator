# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 2025-11-18

### Documentation Updates

Parallel analysis of codebase with agent-status-reporter. Updated all docs/* files.

**component-patterns.md:**
- Added useReducer pattern for complex state (QuestionCard example)
- Added accessibility patterns (ARIA labels, form associations, keyboard nav)

**frontend-architecture.md:**
- Updated workflow to 4 steps (Discovery → Questions → Tech Stack → Generate)
- Marked /research and /select as deprecated (redirect to /tech-stack)
- Added rate limiting annotation to API categories (20 req/min, 100k tokens/min)

**convex-patterns.md:**
- Added helper functions: validateConversationAccess(), getDefaultProgress()
- Documented TECH_STACK_CATEGORIES_COUNT constant (5 categories)
- Added deprecated stages section ("researching", "selecting" → "tech-stack")

**api-routes-guide.md:**
- Added complete rate limiting configuration section
- Documented RATE_LIMIT_CONFIGS (API_STANDARD, API_AI, API_ANONYMOUS)
- Added rate limiting middleware pattern with token tracking

**styling-guide.md:**
- Added "Known Issues & Missing Utilities" section
- Documented undefined utilities: animate-float, text-gradient-primary, macaron-*
- Added warning about hardcoded dark mode colors

**type-definitions.md:**
- Added PaginationResult type pattern
- Added ReactElement for icon rendering functions
- Added defensive type assertions pattern (filter before assert)

**Status Summary:**
- ✅ Components: All folders working, selection/ deprecated
- ✅ Routes: All working, rate limiting added
- ✅ Convex: Schema updated, helpers extracted
- ⚠️ Styles: Some undefined utilities need fixing
- ✅ Config: Rate limiting, logger, error handling complete

## 2025-11-17

### Pushed (301061d)
- **Schema Fix**: Fixed workflow.ts currentStep type from string to proper union. Added deprecated stages for backwards compatibility. Created migration utility. Dev server now starts without validation errors.

### Pulled (5ed9060)
- **PRD JSON Parsing**: Balanced brace matching implementation merged. Improved extraction of JSON from conversational responses.

### Added
- **Unified Tech Stack Page**: Merged research and selection phases into single `/tech-stack` page with always-visible pros/cons cards. Improves UX by eliminating redundant navigation and accordion clicks.
- **Skip Button Protection**: Skip button now disabled during message processing to prevent race conditions.
- **Merge Plan**: Created plan to merge research/selection phases for streamlined workflow.

### Changed
- **Workflow Stages**: Replaced "researching" and "selecting" stages with single "tech-stack" stage in schema and mutations.
- **Navigation**: Updated workflow progress to show 4 steps (Discovery → Questions → Tech Stack → Generate) instead of 5.
- **TechStackCard Component**: Enhanced to display pros/cons lists directly without accordion. Moved from `components/selection/` to `components/tech-stack/`.
- **Old Pages**: `/research` and `/select` now redirect to `/tech-stack` with notification toast.

### Fixed
- **PRD Generation**: Fixed API payload structure - removed incorrect `researchData` wrapper causing generation failures.
- **PRD JSON Parsing**: Strengthened prompt with explicit JSON-only instructions. Implemented balanced brace matching to extract JSON from conversational responses while preserving nested objects/arrays.
- **Test Setup**: Fixed NODE_ENV collision in test setup causing test failures.
- **Question Generation**: AI response flattening logic added to handle nested category structure. Questions now save to Convex without schema validation errors.
- **Question Required Field**: Added default `required=true` fallback when AI omits this field from question responses, preventing Convex schema validation errors.
- **Question Type Field**: Added intelligent default for missing `type` field - defaults to "select" if suggestedOptions exist, otherwise "textarea". Prevents Convex validation errors.
- **React Key Warning**: Changed QuestionCard option keys from array index to option value.
- **Multiselect Support**: Added "multiselect" question type to schema, types, and UI. Multiselect questions render as checkboxes allowing multiple selections.
- **Research Parsing**: Significantly improved parser to handle multiple Perplexity response formats:
  - Pattern 1: Numbered lists with bold (`1. **React**`)
  - Pattern 2: Markdown headers (`## React`)
  - Pattern 3: Comma-separated inline bold (`**React**, **Vue**, **Angular**`) - extracts tech name before delimiters like `/`, `:`, `(`
  - Pattern 4: Standalone bold text
  - Intelligent preamble detection skips intro text
  - Increased name length limit to 80 chars
  - Added prefix cleanup and simple name handling
  - Fixed Pattern 3 to extract only tech names, not trailing metadata (e.g., "React" not "React /Adoption Rate:**")

## 2025-11-16

### Fixed
- **Setup Page Route**: Created missing `/app/chat/[conversationId]/setup/page.tsx` to fix 404 error when navigating to Setup tab in workflow navigation. Page displays project name and description in read-only view.

## [Unreleased]

### Added - 2025-01-17

#### Rate Limiting for API Routes
- Created lib/rate-limiter.ts with in-memory rate limiting (20 req/min for AI routes)
- Added rate limiting to /api/conversation/message and /api/conversation/initial-message
- Includes token usage tracking and 429 responses with Retry-After headers

### Fixed - 2025-01-17

#### Pre-existing Type Errors & Build Fixes
- WorkflowContext.tsx: Updated WorkflowStep type from old steps ('research', 'selection') to new ('tech-stack')
- lib/workflow/guards.ts: Updated workflow steps and routes to match new schema
- convex/conversations.ts: Fixed totalCategories reference with TECH_STACK_CATEGORIES_COUNT constant
- convex/schema.ts: Made prdData optional for PRD records (allows null during generation)
- convex/prds.ts: Fixed paginationOptsValidator import from "convex/server"
- lib/analytics/workflowEvents.ts: Fixed Window.analytics type to use Record<string, unknown>
- lib/api-error-handler.ts: Fixed logger.error call signature
- lib/export-utils.ts: Fixed exportPDF type to use ReactElement<DocumentProps>
- tests/setup.ts: Removed attempt to assign read-only NODE_ENV
- components/workflow/WorkflowLayout.tsx: Added required pageKey prop to PageTransition

#### Code Review Group-7 Issues (Latest commit)

**Type Safety & Validation:**
- extract-context/route.ts: Added string type validation before conversationId type assertion with error handling for invalid IDs
- QuestionCard.tsx: Refactored complex state management from multiple useState calls to useReducer pattern for better maintainability
- questions/page.tsx: Added runtime validation for clarifyingQuestions array structure before type assertion
- ConvexClientProvider.tsx: Moved env variable check and client initialization inside component body
- schema.ts: Replaced v.any() with v.record(v.string(), v.any()) for prdData to enforce object structure while maintaining flexibility

**Code Organization:**
- workflowEvents.ts: Fixed skip rate calculation to use total steps instead of completed steps as denominator
- workflow.ts: Extracted default progress object to getDefaultProgress() helper function
- workflow.ts: Created validateConversationAccess() helper to eliminate auth validation duplication across mutations

**Accessibility:**
- ChatMessage.tsx: Added aria-label with sender, timestamp, and truncated message content for screen readers
- ChatMessage.tsx: Added aria-hidden to visual elements to prevent duplicate announcements

**UI/UX Improvements:**
- badge.tsx: Reformatted long className string into array with .join() for better readability
- PRDCard.tsx: Made techStack filtering defensive with proper type validation before rendering

**Code Quality:**
- export-utils.ts: Removed unnecessary async modifier from exportJSON function
- research/page.tsx: Added conversationId validation in research redirect page with error handling
- CHANGELOG.md: Fixed markdown formatting (added blank line after heading)

#### Code Review Group-3 Issues

**Component Refactoring:**
- ProfileMenu.tsx: Extracted duplicate Avatar logic into reusable UserAvatar component (reduced duplication)
- PRDCard.tsx: Renamed "Export" button to "View & Export" for clearer navigation intent

**Validation & Type Safety:**
- select/page.tsx: Added runtime validation for conversationId param before type assertion
- conversation/message/route.ts: Added comprehensive message structure validation (role, content, length limits)
- generate/page.tsx: Replaced `any` type with strict `PRDData` type for PRD state
- SortControls.tsx: Exported SortOption type for reuse across components
- FeaturesPage.tsx: Used stable composite keys (feature.name + index) instead of array indices

**Error Handling & Logging:**
- logger.ts: Refactored error method to delegate to internal log method (eliminated duplication)
- SkipButton.tsx: Replaced console.error with centralized logger utility

**UX Improvements:**
- nav-main.tsx: Added onClick handler to "Add Task" button (navigation to dashboard or custom callback)
- CategorySection.tsx: Added expectedOptionsCount prop for accurate loading skeleton count
- TechStackCard.tsx: Made min-height responsive (300px on small screens, 400px on sm breakpoints)

**Documentation:**
- README.md: Fixed markdown formatting (added blank lines around code blocks, language specifiers, rephrased repeated words)

**Critical Bug Fixes:**
- parse-ai-json.ts: Fixed logic error where startChar was never assigned in fallback branch (replaced type assertions with actual assignments)

#### Code Review Group-10 Issues

**Security:**
- chart.tsx: Strengthened color validation regex to prevent XSS (full string match with ^ and $, explicit parentheses matching)
- generate/route.ts: Added null-safe fallbacks for messages/clarifyingQuestions arrays

**Race Conditions & State Management:**
- WorkflowContext.tsx: Fixed race condition in goToStep - update local state only after successful remote update
- questions/page.tsx: Clear auto-save timeout in handleSkip to prevent race conditions
- questions/page.tsx: Fixed useEffect dependency (excluded generateQuestions with ESLint disable + explanation)

**Type Safety:**
- prds.ts: Added pagination support (paginationOptsValidator, returns PaginationResult)
- prds.ts: Clear orphaned conversation.prdId reference in deletePRD mutation
- dashboard/page.tsx: Updated to handle paginated results (prds.page)
- tech-stack/page.tsx: Convert Question[] to UserAnswers format for detectProductType

**Data Validation & Filtering:**
- TechStackPage.tsx: Use explicit .filter() chain instead of inline null return
- progress.ts: Use precise segment matching in getStepFromPath (split by '/' and check segments)
- conversations.ts: Improved mergeCompletedSteps sorting (handle unknown steps gracefully)

**Defensive Programming:**
- nav-user.tsx: Defensive initials calculation (trim, split by whitespace, filter empty parts, fallback to email/U)
- progress.tsx: Clamp value to 0-100 range to prevent visual glitches

**Component Fixes:**
- chat/new/page.tsx: Removed unused isLoading state variable
- suggest-defaults/route.ts: Added missing TECH_STACK_SUGGESTION_PROMPT import

#### Code Review Group-9 Issues

**Component Architecture:**
- section-cards.tsx: Refactored to data-driven design with props (cards, className) and DEFAULT_CARDS constant, added proper interfaces
- WorkflowLayout.tsx: Extracted SkipButton props into single object, eliminated duplication between desktop/mobile renders

**Type Safety & Validation:**
- workflow.ts: Added v.union validation for step parameter in completeStep/skipStep mutations (literal types: discovery/questions/tech-stack/generate)
- PageTransition.tsx: Made pageKey prop required (removed optional modifier)

**Code Quality:**
- button.tsx: Refactored 400+ char className string into logical array with .join(' ') for better readability
- TechStackPage.tsx: Added formatKey helper function for consistent key formatting (handles camelCase to Title Case)
- ProfileMenu.tsx: Simplified initials calculation (removed unnecessary filter/map chain)
- techStackEvents.ts: Removed unused originalStack/modifiedStack parameters from trackDefaultStackModified

**React Best Practices:**
- ResearchResults.tsx: Replaced array index keys with stable content-based keys (option.name)
- extract-context/route.ts: Optimized ensureArray helper (removed redundant .map(String), used type predicate)
- questions/generate/route.ts: Added null-safe array access for extractedContext.keyFeatures/technicalPreferences

**Accessibility:**
- QuestionCard.tsx: Added proper keyboard support (onKeyDown), ARIA roles, and htmlFor/id associations to multiselect checkboxes

**Data Consistency:**
- conversations.ts: Fixed contradictory workflow state in saveExtractedContext (removed "discovery" from skippedSteps while in completedSteps)

**Impact:** All 15 code review issues from docs/errors/group-9.md resolved

#### Code Review Group-12 Issues

**Code Quality & Readability:**
- toggle.tsx: Refactored 400+ char className string into logical array with .join(' ') for better maintainability

**Logging Consistency:**
- api-error-handler.ts: Replaced console.error with logger.error in handleAPIError and handleValidationError for consistent structured logging
- api-error-handler.ts: Added type guard for error.code property before assignment

**Type Safety:**
- defaults.ts: Added ExtractedContext and UserAnswers interfaces replacing any types
- defaults.ts: Added JSDoc with priority order documentation for detectProductType
- defaults.ts: Normalized array/string access with nullish coalescing (??) and defensive checks
- defaults.ts: Added TechRecommendation and TechCategoryResult interfaces for generateMockResearchResults
- questionsEvents.ts: Added Analytics interface and global Window type declaration replacing (window as any).analytics
- suggest-defaults/route.ts: Updated getAISuggestedStack signature to accept Record<string, string> instead of Question[]
- techStack.ts: Updated TECH_STACK_SUGGESTION_PROMPT to accept Record<string, string> instead of Question[]

**Impact:** All 5 code review issues from docs/errors/group-12.md resolved

#### Code Review Group-11 Issues

**Critical Logic Fixes:**
- setup/page.tsx: Fix inverted redirect logic (!=setup instead of ==setup) - users can now access setup page
- conversations.ts: Research progress now properly transitions to completed status based on category count

**UI/UX Improvements:**
- chart-area-interactive.tsx: Fix duplicate colors - mobile series now uses chart-2 for visual distinction
- chart-area-interactive.tsx: Time range now resets to 90d when switching from mobile to desktop view

**Code Quality:**
- progress.ts: Replace hardcoded totalSteps=5 with dynamic getAllSteps().length, add division-by-zero guard
- progress.ts: Extract all hardcoded steps arrays to use single getAllSteps() function
- prds.ts: Reduce PRD creation duplication by extracting shared createPrdData object

**Platform Compatibility:**
- sidebar.tsx: Add SSR guard for document.cookie access with try/catch for non-browser contexts

**AI Models:**
- ai-clients.ts: Update to latest Claude model versions (sonnet-4-5, haiku-4-5)

**Type Safety:**
- toggle-group.tsx: Fix fallback logic using nullish coalescing (??) instead of OR operator
- questionsEvents.ts: Add global Window interface declaration for proper analytics typing

**Documentation:**
- workflowConfig.ts: Add precedence comment explaining status resolution order (completed > current > future)

#### Code Review Group-6 Issues

**React Best Practices:**
- ValidationWarnings.tsx: Replace index-based keys with stable content-derived keys (message::technologies) to prevent React reconciliation issues

**Type Safety:**
- PRDCard.tsx: Replace `any` type with proper `PRDData` type from @/types for prdData prop
- types/index.ts: Add QuestionSemanticKey type and semanticKey optional field to Question interface

**Documentation & Clarity:**
- researching-features/SKILL.md: Fix grammar ("Build page and UI elements before backend functions")
- skill-creating/SKILL.md: Improve description clarity and fix folder structure instructions
- api-routes-guide.md: Add language specifier (text) to file structure code block

**Navigation:**
- nav-main.tsx: Implement proper navigation using Next.js Link component with asChild pattern

**Security & Input Validation:**
- extract-context/route.ts: Add message content sanitization (per-message 2K limit, total 10K limit, remove control chars, escape backticks)
- users.ts: Make email field optional in schema and use undefined instead of empty string fallback
- schema.ts: Change users.email from v.string() to v.optional(v.string())

**Code Organization & Maintainability:**
- suggest-defaults/route.ts: Extract DEFAULT_STACK constant to consolidate duplicate default values
- suggest-defaults/route.ts: Refactor fixStackErrors to use structured errors with direct field mapping
- suggest-defaults/route.ts: Normalize and trim stack values during validation to prevent whitespace-only entries
- lib/prompts/techStack.ts: Extract inline AI prompt to dedicated file (TECH_STACK_SUGGESTION_PROMPT)
- fill-defaults/route.ts: Add semanticKey-based mapping with fallback to keyword heuristics for robust question-to-context matching

**Impact:** All 15 code review issues from docs/errors/group-6.md resolved. Build passing with type-safe code and improved maintainability.

### Fixed - 2025-01-17

#### Code Review Group-2 Issues (827b116 - included in group-8 commit)

**Documentation Improvements:**
- frontend-architecture.md: Added language specifiers (text) to code blocks for proper syntax highlighting
- SETUP.md: Added language specifier (text) to project structure code block
- SETUP.md: Added blank lines after headings and around code blocks for markdownlint compliance
- SETUP.md: Converted emphasized footer text to proper heading (## Happy coding!)
- refactor.md: Added trailing newline for POSIX compliance
- convex-patterns.md: Fixed variable name error (users → idToUsername) in Record example
- context-extraction.md: Added top-level heading and trailing newline

**Code Quality & Maintainability:**
- constants.ts: Extracted sanitizeForFilename() helper to deduplicate filename sanitization logic
- TechStackCard.tsx: Replaced array index keys with content keys (key={pro} and key={con})
- PDFHeader.tsx: Added explicit locale (en-US) to toLocaleDateString for consistent date formatting across environments
- app-sidebar.tsx: Implemented real navigation URLs for Settings (/settings) and Help (/help) pages

**Type Safety & Validation:**
- tech-stack/page.tsx: Added runtime type guard (isValidTechOption) before type assertion to prevent runtime errors
- tech-stack/page.tsx: Documented MIN_SELECTIONS_FOR_VALIDATION constant (requires 2+ selections for compatibility validation)

**API Security & Monitoring:**
- conversation/message/route.ts: Added token usage monitoring with warnings when approaching 80% of TOKEN_LIMITS.CONVERSATION
- initial-message/route.ts: Added token usage monitoring with warnings when approaching 80% of TOKEN_LIMITS.CONVERSATION

**Impact:** All 15 code review issues from docs/errors/group-2.md resolved. Note: Full rate limiting requires infrastructure (Redis/Upstash) - implemented token monitoring as immediate improvement.

#### Code Review Group-5 Issues (Latest commit)

**UI/UX Fixes:**
- ClientBody.tsx: Use classList.add/remove instead of className assignment to preserve existing body classes
- ChatContainer.tsx: Only auto-scroll when user is near bottom (within 100px) to avoid disrupting scroll history review
- WorkflowStepLabel.tsx: Removed redundant font-weight declarations (font-medium now only on completed/future states)

**Type Safety & Code Quality:**
- ChatInput.tsx: Extract submission logic to avoid FormEvent/KeyboardEvent type mismatch
- ExportButtons.tsx: Removed unused prd and productName props
- export-utils.ts: Fixed const vs let for bytes variable

**Security & Validation:**
- initial-message/route.ts: Added input sanitization (control chars, whitespace collapse) and length validation (100 chars name, 2000 chars desc)
- ArchitecturePage.tsx: Added defensive checks for nested data structures (technicalArchitecture, dataModels, fields)

**Race Conditions:**
- page.tsx + message/route.ts: Fixed race condition by having API fetch authoritative message list from Convex instead of client passing stale messages

**Constants & Maintainability:**
- tech-stack/page.tsx + constants.ts: Extracted hardcoded 1500ms delay to TIMEOUTS.TOAST_BEFORE_NAVIGATION constant

**Filename Sanitization:**
- export-utils.ts: Improved sanitization with Unicode support (\\p{L}\\p{N}), Windows reserved names detection (CON, PRN, etc), and UTF-8 byte length limit (200 bytes)

**Documentation:**
- researching-features/SKILL.md: Fixed typos (explitly→explicitly, itnerviews→interviews, teh→the)
- skill-creating/SKILL.md: Fixed filename convention example (skill.md→SKILL.md)

**Impact:** All 12 code review issues from docs/errors/group-5.md resolved (skipped CLAUDE.md policy updates per agent instructions)

#### Code Review Group-1 Issues (bba3083)

**Environment & Configuration:**
- Pinned Node.js version to 20.10.0 in .tool-versions for reproducible dev environments
- Removed duplicate .claude/commands/push.md file (kept push-all.md)
- Added trailing newline to .claude/commands/pull.md for POSIX compliance

**Database & Migrations:**
- Added migrations table to Convex schema for tracking migration execution
- Implemented pagination (100 items/batch) in migrations to handle large datasets
- Added error handling, type guards, and idempotency checks to migration logic
- Migration now logs progress and prevents duplicate execution

**TypeScript & Type Safety:**
- Added TypeScript interfaces (AuthProvider, AuthConfig) to convex/auth.config.ts
- Fixed unused imports and variables across API routes
- Replaced type-only imports with `import type` for better tree-shaking
- Fixed parse-ai-json.ts unused variable errors

**React & UI:**
- Fixed SSR hydration mismatch in use-mobile hook (initialize with undefined, not window check)
- Fixed infinite re-render in use-store-user hook (removed storeUser from dependency array)
- Added ARIA attributes (role="status", aria-live, aria-busy) to loading.tsx for accessibility
- Fixed responsive col-span-2 class in DefaultStackPreview (now md:col-span-2)

**Code Quality:**
- Extracted repeated tech stack item structure in DefaultStackPreview (reduced duplication)
- Replaced String.replaceAll with regex (/_/g) for broader browser compatibility
- Removed redundant console.error in app/error.tsx (logger utility handles it)

**Impact:** All 14 code review issues from docs/errors/group-1.md resolved

### Fixed - 2025-01-17

#### Group-8 Code Review Issues (827b116)

Resolved 14 code quality and performance issues:
- Removed redundant Tailwind transform class in SearchBar
- Fixed React key usage (timestamp instead of index) in ChatContainer
- Made ClientBody extension attributes configurable with SSR guard
- Applied responsive CSS visibility (hidden/block md:) to WorkflowProgress
- Extracted WORKFLOW_STEPS constant to eliminate duplication
- Optimized array comparison with shallow equality check
- Added division by zero guard in AutoAdvance progressPercent
- Implemented countdown reset when AutoAdvance enabled changes
- Used ref pattern for AutoAdvance onAdvance to prevent dependency issues
- Added dynamic copyright year in landing page
- Removed router from useEffect deps (stable reference)
- Extracted complex boolean (isNextButtonDisabled) for readability
- Replaced any with proper RawAIResponse type in questions API
- Fixed ordered list numbering in agent-creating SKILL.md

### Changed - 2025-01-17

#### Next.js Structure Review & Best Practices Implementation

##### TypeScript Strict Mode Enforcement

- Fixed 14 `any` type violations in modified files
- Centralized API types in `/types/index.ts`
- Added types: `ResearchQuery`, `ResearchResultItem`, `SimpleTechStack`, `ValidationResult`
- Removed duplicate type definitions

##### Component Refactoring

- **PRDDocument.tsx**: 262 LOC → 24 LOC (90% reduction)
  - Extracted modular page components: Overview, TechStack, Features, Architecture, Timeline
  - Created reusable PDF components: PDFHeader, PDFFooter, centralized styles
- **WorkflowProgress.tsx**: 272 LOC → 37 LOC (86% reduction)
  - Eliminated 140 LOC duplication between desktop/mobile views
  - Extracted: DesktopWorkflow, MobileWorkflow, StepIcon, StepLabel, Connector
  - Centralized workflow config and utilities

##### Next.js 15 Best Practices

- Added `tailwind.config.ts` for explicit theme configuration
- Added error boundaries: root `app/error.tsx` with graceful recovery
- Added loading states: skeleton loaders for dashboard and chat routes
- Created custom error classes: `NotAuthenticatedError`, `UnauthorizedError`, `ResourceNotFoundError`, `ValidationError`, `APITimeoutError`, `RateLimitError`

##### Architecture Improvements
- All custom components now comply with <200 LOC rule
- Better separation of concerns with modular structure
- Improved maintainability and testability
- Type-safe error handling throughout

### Fixed - 2025-01-17

#### Fix: PRD Generation Validation Error (5e2645b)

##### Bug Fix
- Fixed 400 Bad Request error when generating PRDs from Generate page
- Generate page was sending `conversationData` but API expects `conversationId`
- API now correctly fetches conversation data server-side using conversationId

##### Type Safety
- Fixed TypeScript errors in tech-stack route and toggle-group component
- Improved nullable array access and const declarations

##### Impact
PRD generation now works correctly through full workflow (Discovery → Questions → Research → Selection → Generate)

### Changed - 2025-01-16

#### Refactor: Type Safety & Code Organization (8562799)

##### Type Safety Improvements


- Replaced `v.any()` with proper TechOption validator in Convex schema
- Added full type definition for tech stack research results with validation
- Improved database schema type safety while maintaining flexibility for dynamic content

##### Code Organization
- Created barrel exports for `lib/analytics`, `lib/prompts`, and `lib/workflow` modules
- Simplified imports across codebase with index.ts re-exports
- Improved code organization and module structure

##### Dependencies
- Updated 10 dependencies to latest minor/patch versions:
  - @anthropic-ai/sdk: 0.68.0 → 0.69.0
  - @clerk/nextjs: patch update
  - @clerk/themes: patch update
  - @types/react: patch update
  - @types/react-dom: patch update
  - convex: 1.29.0 → 1.29.1
  - openai: 6.8.1 → 6.9.0
  - vitest: 4.0.8 → 4.0.9
  - @vitest/ui: 4.0.8 → 4.0.9
- Zero security vulnerabilities after updates

#### Refactor: Logging Standardization (eeec14b)

##### Logging Infrastructure
- Replaced 70+ `console.log/error/warn` statements with centralized `logger` utility
- Implemented structured logging with context metadata throughout application
- Added proper log levels (debug, info, warn, error) for better log filtering
- Enhanced production observability with JSON-formatted logs

##### Files Modified
- 6 chat workflow pages (discovery, questions, research, selection, generate)
- 3 API routes (tech stack research, dashboard operations, PRD generation)
- 3 library utilities (analytics tracking, workflow persistence)
- 2 shared contexts and hooks (WorkflowContext, useStoreUser)

##### Benefits
- Production-ready logging with structured metadata
- Better debugging with contextual information (conversationId, component names)
- Consistent error tracking across the entire application
- No breaking changes - all functionality preserved

---

## Previous Changes

See git history for changes prior to changelog initialization.
