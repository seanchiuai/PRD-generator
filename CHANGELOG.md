# Changelog

## 2025-11-17

### Fixed
- **Question Generation**: AI response flattening logic added to handle nested category structure. Questions now save to Convex without schema validation errors.
- **React Key Warning**: Changed QuestionCard option keys from array index to option value.
- **Multiselect Support**: Added "multiselect" question type to schema, types, and UI. Multiselect questions render as checkboxes allowing multiple selections.

## 2025-11-16

### Fixed
- **Setup Page Route**: Created missing `/app/chat/[conversationId]/setup/page.tsx` to fix 404 error when navigating to Setup tab in workflow navigation. Page displays project name and description in read-only view.
