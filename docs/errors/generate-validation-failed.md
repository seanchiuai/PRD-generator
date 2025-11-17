# Error: PRD Generation Validation Failed

**Date Found**: 2025-11-16
**Severity**: Critical
**Stage**: Generate
**Component**: PRD Generation API

## Description

When attempting to generate a PRD after selecting tech stack options, the generation fails with a validation error and the page gets stuck on "Generating your comprehensive PRD..." indefinitely.

## Error Messages

Console errors:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Generation error: Error: Request validation failed
```

## Root Cause

The validation failure is caused by the schema mismatch error from the Selection stage. Because "real-time-communication", "file-storage", and "hosting-deployment" selections couldn't be saved to the database (due to schema errors), the PRD generation validation fails when it expects all 7 tech stack categories to be selected.

## Expected Behavior

- All 7 tech stack selections should be saved successfully
- PRD generation should proceed with all selected technologies
- User should see the generated PRD document

## Actual Behavior

- Only 4 of 7 selections saved (frontend, backend, database, authentication)
- 3 selections failed silently (real-time-communication, file-storage, hosting-deployment)
- Generate button becomes disabled when page reloads (because only 4/7 selected)
- Clicking Generate anyway results in 400 Bad Request
- Page stuck on loading state: "Generating your comprehensive PRD..." with no error message shown to user

## Steps to Reproduce

1. Complete workflow through Research and Selection stages
2. Select all 7 tech stack categories
3. Click "Generate PRD"
4. Observe page navigates to Generate stage but shows "Generating..." indefinitely
5. Check console for validation errors

## Chain of Errors

This is a cascading failure:
1. **Root cause**: Schema missing fields for `real-time-communication` and `file-storage`
2. **Effect 1**: Selections for these categories fail to save
3. **Effect 2**: Selection count drops from 7/7 to 4/7 on page reload
4. **Effect 3**: PRD generation validation fails because not all required categories selected
5. **Effect 4**: User sees loading state but generation never completes

## Impact

- **Critical**: Users cannot complete the PRD generation workflow
- Blocks the entire application's core functionality
- Poor UX: No error message shown to user, just infinite loading
- Silent failures make debugging difficult for users

## Location

Files:
- API route: Likely `/api/generate/prd` or similar
- Schema: `convex/schema.ts` or schema definition (root cause)
- Selection handler: `convex/conversations.ts:319` (saveSelection mutation)

## Fix Required

### Immediate (P0)
1. **Fix Schema** - Update Convex schema to include all 7 tech stack categories (see schema-mismatch-tech-stack.md)
2. **Better Error Handling** - Show error message to user instead of infinite loading state

### Follow-up (P1)
3. **Client-side Validation** - Add validation before allowing navigation to Generate stage
4. **Retry Logic** - Implement retry for failed selections
5. **Graceful Degradation** - Allow PRD generation with partial tech stack if needed (or show clear error)

## Related Errors

- **Root Cause**: schema-mismatch-tech-stack.md
- **Related**: selection-validation-incomplete.md (validation warning that appeared)

## User Experience Impact

```
User Journey:
1. User completes entire workflow ✓
2. User selects all 7 tech stack options ✓
3. UI shows "7 of 7 selected" ✓
4. User clicks "Generate PRD" ✓
5. Page shows loading... ⏳
6. User waits... ⏳⏳⏳
7. Nothing happens ❌
8. User confused, no error shown ❌
```

This is a **critical UX failure** - user has no idea what went wrong.
