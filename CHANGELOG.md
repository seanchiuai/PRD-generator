# Changelog

## 2025-11-17

### Added
- **Skip Button Protection**: Skip button now disabled during message processing to prevent race conditions.
- **Merge Plan**: Created plan to merge research/selection phases for streamlined workflow.

### Fixed
- **PRD Generation**: Fixed API payload structure - removed incorrect `researchData` wrapper causing generation failures.
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
