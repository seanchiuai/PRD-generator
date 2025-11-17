# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed - 2025-01-17

#### Code Review Group-6 Issues (Latest commit)

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
