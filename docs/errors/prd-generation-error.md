# PRD Generation Error

## Issue
PRD generation fails with "Request validation failed" error when attempting to generate a PRD from the Generate page.

## Location
- **Page**: `/chat/[conversationId]/generate`
- **API Endpoint**: `/api/prd/generate`

## Error Details
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
[ERROR] [2025-11-17T16:41:41.567Z] GeneratePage.generatePRD: {
  message: Request validation failed,
  stack: Error: Request validation failed at GeneratePage...,
  conversationId: jh7d17zyzxqrrd5bg5j4aez94x7vh97s
}
```

## Steps to Reproduce
1. Navigate to Dashboard
2. Click "Continue Workflow" on any PRD in "generating" status
3. Navigate through Discovery → Questions → Research → Selection
4. Click "Skip to Generate" on Selection page
5. Confirm skip dialog
6. Generate page loads and attempts to generate PRD
7. Error occurs with 400 Bad Request

## Current Behavior
- Generate page shows "Generating your comprehensive PRD..." with progress indicator
- Multiple 400 Bad Request errors logged to console
- Page remains stuck on "Generating..." state without completing
- No error message displayed to user

## Expected Behavior
- PRD should be generated successfully
- Progress indicator should complete
- User should see generated PRD content
- If validation fails, user should see clear error message

## Additional Notes
- Error occurs consistently across multiple PRD conversations
- Tested with "Test Project" conversation (ID: jh7d17zyzxqrrd5bg5j4aez94x7vh97s)
- Request validation appears to fail at API level before PRD generation begins
- UI does not handle error state gracefully
