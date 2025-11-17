# PRD Generation Failure - 2025-11-17

## Critical Error: AI Response Not JSON

**Status:** 🔴 BLOCKING - PRD generation completely fails

**Error Logs:**
```
POST /api/prd/generate 500 in 33775ms
POST /api/prd/generate 500 in 36144ms

generate PRD Error: Error: Failed to parse AI response as JSON.
Preview: I'll create a comprehensive PRD based on the discovery conversation and selected technologies. I'll ...
Original error: Unexpected token 'I', "I'll creat"... is not valid JSON
    at parseAIResponse (lib/parse-ai-json.ts:37:11)
    at <unknown> (app/api/prd/generate/route.ts:104:36)

generate PRD Error: Error: Failed to parse AI response as JSON.
Preview: I'll prepare a comprehensive PRD based on the details provided. I'll make some strategic technology ...
Original error: Unexpected token 'I', "I'll prepa"... is not valid JSON
    at parseAIResponse (lib/parse-ai-json.ts:37:11)
    at <unknown> (app/api/prd/generate/route.ts:104:36)
```

**Location:**
- `app/api/prd/generate/route.ts:104`
- `lib/parse-ai-json.ts:37`

**Root Cause:**
The AI (Claude) is returning **plain text explanation** instead of **JSON format**. The response starts with "I'll create a comprehensive PRD..." which is conversational text, not the expected JSON structure.

**Expected vs Actual:**

Expected:
```json
{
  "title": "Product Name",
  "overview": {
    "description": "...",
    "targetAudience": "...",
    ...
  },
  ...
}
```

Actual:
```
I'll create a comprehensive PRD based on the discovery conversation and selected technologies. I'll...
```

**Fix Required:**
The prompt sent to Claude in `/api/prd/generate` needs to:
1. Explicitly instruct Claude to return ONLY JSON with no preamble/explanation
2. Use system message or strong prompt constraints
3. Consider using `response_format: { type: "json_object" }` if API supports it
4. Add JSON schema validation before parsing

---

## Secondary Error: Questions Fill Defaults 404

**Status:** 🟡 WARNING - Fallback works but logs errors

**Error Log:**
```
POST /api/questions/fill-defaults 404 in 1993ms

find questions Error: Error: Questions not found
    at <unknown> (app/api/questions/fill-defaults/route.ts:44:9)
  42 |     if (!conversation.clarifyingQuestions) {
  43 |       return handleAPIError(
> 44 |         new Error("Questions not found"),
     |         ^
  45 |         "find questions",
  46 |         404
  47 |       );
```

**Location:** `app/api/questions/fill-defaults/route.ts:44`

**Root Cause:**
When users skip the questions phase, `conversation.clarifyingQuestions` is undefined, causing this endpoint to fail.

**Impact:**
Low - the app handles this gracefully, but it creates noise in logs and unnecessary API calls.

**Fix Required:**
Frontend should check if questions exist before calling fill-defaults, OR backend should return default empty array instead of 404.

---

## Tertiary Error: Validation Errors (Earlier Session)

**Status:** 🟢 RESOLVED - These were from previous session with missing conversation ID

**Error Log:**
```
POST /api/prd/generate 400 in 901ms
POST /api/prd/generate 400 in 1033ms

Validation Error: {
  error: 'Conversation ID required',
  details: 'Request validation failed',
  code: 'VALIDATION_ERROR'
}
```

**Root Cause:**
User navigated to generate page without completing previous steps. Validation correctly blocked the request.

**Status:** Working as intended - validation caught bad requests.

---

## Recommended Fix Priority

### 1. **CRITICAL: Fix PRD Generation JSON Parsing**
**File:** `app/api/prd/generate/route.ts`

**Action Required:**
Update the Claude prompt to enforce JSON-only responses:

```typescript
const systemPrompt = `You are a PRD generation assistant.

CRITICAL: You MUST respond with ONLY valid JSON.
Do NOT include any explanatory text, preamble, or commentary.
Do NOT say "I'll create..." or "Here's the PRD...".
Output ONLY the JSON object starting with { and ending with }.

The JSON must follow this exact schema:
{
  "title": string,
  "overview": { ... },
  "problemStatement": { ... },
  ...
}`;
```

**OR** use structured output:
```typescript
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [
    {
      role: "user",
      content: `Generate PRD as JSON only (no preamble): ${JSON.stringify(context)}`
    }
  ],
  // Force JSON output
  temperature: 0.3,
  stop_sequences: ["\n\nHuman:"]
});
```

**Alternative:** Add JSON extraction fallback:
```typescript
// In lib/parse-ai-json.ts
function extractJSON(text: string): string {
  // Try to find JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  throw new Error("No JSON object found in response");
}
```

### 2. **MINOR: Fix Questions Fill Defaults**
**File:** `app/api/questions/fill-defaults/route.ts`

**Option A - Frontend check:**
```typescript
// In questions page
if (conversation.clarifyingQuestions) {
  await fetch('/api/questions/fill-defaults', { ... });
}
```

**Option B - Backend graceful handling:**
```typescript
// In fill-defaults route
if (!conversation.clarifyingQuestions) {
  return NextResponse.json({
    answers: {},
    message: "No questions to fill"
  }, { status: 200 });
}
```

---

## Test Scenarios to Verify Fix

1. **Full Flow:** Discovery → Questions → Research → Select → Generate
   - Expected: PRD generates successfully with valid JSON

2. **Skip Research:** Discovery → Questions → Skip → Select (auto) → Generate
   - Expected: PRD generates with default tech stack

3. **Skip Questions:** Discovery → Skip → Research → Select → Generate
   - Expected: No 404 error, PRD uses defaults

4. **Skip Everything:** Discovery → Skip all → Generate
   - Expected: PRD generates with all defaults

---

## Additional Observations

### Build Manifest Errors (Non-blocking)
```
Error: ENOENT: no such file or directory, open '.next/server/app/page/app-build-manifest.json'
Error: ENOENT: no such file or directory, open '.next/static/development/_buildManifest.js.tmp...'
```

**Status:** 🟢 Non-blocking - Turbopack development artifacts, doesn't affect functionality

**Action:** None required - normal dev server behavior with Turbopack

---

## Steps to Reproduce

1. Start new conversation
2. Answer discovery questions
3. Generate questions (or skip)
4. Complete research (or skip)
5. Make tech selections (or skip)
6. Click "Generate PRD"
7. **Result:** 500 error - "Failed to parse AI response as JSON"

---

## Related Files

- `app/api/prd/generate/route.ts` - Main PRD generation endpoint
- `lib/parse-ai-json.ts` - JSON parsing utility
- `app/api/questions/fill-defaults/route.ts` - Questions default filler
- `convex/conversations.ts` - Conversation schema and queries
