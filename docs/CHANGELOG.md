# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
