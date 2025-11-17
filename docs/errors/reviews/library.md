# Code Review: Library

This file contains 28 review issues for library files.

============================================================================

File: lib/api-error-handler.ts
Line: 24
Type: nitpick

Comment:
Consider structured logging for production.

The use of console.error is acceptable for development but may not provide sufficient observability in production. Consider using a structured logging library (e.g., winston, pino) to enable better log aggregation, filtering, and monitoring.




Also applies to: 60-60

Prompt for AI Agent:
In lib/api-error-handler.ts around lines 24 and 60, the current console.error usage emits unstructured logs; replace it with calls to a structured logger (e.g., pino or winston) by injecting or importing the logger instance and logging the context, error message, stack, and any relevant metadata as structured fields (e.g., logger.error({ ctx: context, err: error }, 'API error occurred')). Ensure the logger is configurable for environment (dev vs prod) and that these two locations use the same logger and field names for consistent aggregation and filtering.



============================================================================

File: lib/techStack/defaults.ts
Line: 129 to 199
Type: nitpick

Comment:
Mock data contains very generic descriptions.

The generated mock research results use placeholder descriptions (e.g., "is a modern, production-ready framework"). Consider whether these placeholders provide sufficient value or if they should be more descriptive/technology-specific.

Prompt for AI Agent:
In lib/techStack/defaults.ts around lines 129 to 199, the mock research objects use generic placeholder descriptions and pros/cons for every technology; replace these with technology-specific, informative text by mapping known stack values to tailored descriptions and realistic pros/cons (or at minimum include the stack name plus a concise, specific sentence about typical strengths/weaknesses), e.g., create a small lookup or helper that returns a descriptive string, pros, cons, and popularity for each supported frontend/backend/database/auth/hosting option and use that to populate the recommendation entries so mocks convey useful, technology-specific guidance rather than generic placeholders.



============================================================================

File: lib/techStack/defaults.ts
Line: 68 to 119
Type: nitpick

Comment:
Consider adding boundary checks for keyword matching.

The keyword detection uses simple substring matching which could produce false positives (e.g., "api" matching "rapid" or "therapy"). While acceptable for default suggestions, consider adding word boundary checks for more accurate detection.



Example improvement:

const hasKeyword = (text: string, keyword: string) => {
  return new RegExp(\\b${keyword}\\b, 'i').test(text)
}

if (mobileKeywords.some(kw => hasKeyword(allText, kw))) {
  return 'mobile_app'
}


This ensures "api" only matches as a complete word, not as part of "rapid".

Prompt for AI Agent:
In lib/techStack/defaults.ts around lines 68 to 119 the current substring checks can yield false positives (e.g., "api" matching "rapid"); replace the simple allText.includes checks with a word-boundary aware test: create a helper that escapes special regex chars in keywords and tests new RegExp(\\b${escapedKeyword}\\b, 'i').test(allText) (for multi-word phrases ensure spaces are preserved in the regex), then use that helper in every keywords.some(...) call so each keyword match is anchored to word boundaries and case-insensitive.



============================================================================

✅ RESOLVED - File: lib/prompts/markdowns/conversation.md
Line: 18
Type: potential_issue

Comment:
Add trailing newline.

Files should end with a single newline character for consistency with POSIX standards.

Resolution:
Added trailing newline to file.



============================================================================

✅ RESOLVED - File: lib/prompts/markdowns/conversation.md
Line: 1
Type: potential_issue

Comment:
Add a first-level heading for markdown structure.

Resolution:
Added "# PRD Discovery Conversation Prompt" heading at the beginning of the file.



============================================================================

✅ RESOLVED - File: lib/analytics/questionsEvents.ts
Line: 18 to 41
Type: potential_issue

Comment:
Prevent division by zero when calculating completion rate.

Resolution:
Added guard to check if totalCount > 0 before division. Returns 0 when totalCount is 0.



Apply this diff to add a guard:

 export function trackQuestionsSkip(data: QuestionsSkipData) {
   if (typeof window !== "undefined" && (window as any).analytics) {
+    const completionRate = data.totalCount > 0 
+      ? (data.answeredCount / data.totalCount) * 100 
+      : 0;
+
     // Track for debugging (can be replaced with actual analytics service)
     logger.debug("Analytics: Questions Skipped", "", {
       conversation_id: data.conversationId,
       answered_count: data.answeredCount,
       total_count: data.totalCount,
       auto_filled_count: data.autoFilledCount,
-      completion_rate: (data.answeredCount / data.totalCount) * 100,
+      completion_rate: completionRate,
       had_context: data.hasExtractedContext,
       timestamp: new Date().toISOString(),
     });

     // Track with analytics service
     (window as any).analytics.track('Questions Skipped', {
       conversation_id: data.conversationId,
       answered_count: data.answeredCount,
       total_count: data.totalCount,
       auto_filled_count: data.autoFilledCount,
-      completion_rate: (data.answeredCount / data.totalCount) * 100,
+      completion_rate: completionRate,
       had_context: data.hasExtractedContext,
     });
   }
 }

Prompt for AI Agent:
In lib/analytics/questionsEvents.ts around lines 18 to 41, the completion_rate calculation divides by data.totalCount and can produce Infinity/NaN when totalCount is 0; guard the division by computing completion_rate only if data.totalCount > 0 (e.g., const completionRate = data.totalCount > 0 ? (data.answeredCount / data.totalCount) * 100 : 0) and use that variable in both the logger.debug call and the analytics.track payload so you never send invalid numeric values.



============================================================================

✅ RESOLVED - File: lib/prompts/markdowns/question-generation.md
Line: 39
Type: nitpick

Comment:
Add trailing newline at end of file.

Resolution:
Added trailing newline after the final closing brace.



============================================================================

File: lib/parse-ai-json.ts
Line: 26
Type: nitpick

Comment:
Consider a more flexible regex pattern for markdown code blocks.

The current regex /json\n([\s\S]*?)\n/ is quite strict and may fail to match valid variations:
- Code blocks without newlines after opening/before closing backticks
- Variations with spaces ( json ) or different cases (JSON)
- Windows line endings (\r\n)



Consider this more flexible pattern:

diff
-    const jsonMatch = text.match(/json\n([\s\S]*?)\n/);
+    const jsonMatch = text.match(/json\s([\s\S]?)\s*/i);
``

This change:
- Uses \s* to allow optional whitespace (including any line endings)
- Adds i` flag for case-insensitive matching
- Handles more AI response variations while still being specific to JSON blocks

Prompt for AI Agent:
In lib/parse-ai-json.ts around line 26, the current regex is too strict and misses valid markdown JSON code blocks; replace the pattern with a case-insensitive, whitespace-tolerant one (allow optional spaces/newlines after the opening backticks and before the closing backticks and accept different line endings) by updating the match call to use a regex with \s* around the capture and the i flag so it robustly captures JSON blocks like json,  json, or different case variants.



============================================================================

File: lib/export-utils.ts
Line: 18 to 32
Type: refactor_suggestion

Comment:
Replace any type, add error handling, and ensure cleanup.

Line 18 uses any for the documentComponent parameter. Additionally, URL cleanup won't happen if an error occurs during PDF generation.



Apply this diff:

-export async function exportPDF(documentComponent: any, filename: string) {
+export async function exportPDF(
+  documentComponent: React.ReactElement,
+  filename: string
+): Promise {
+  let url: string | null = null;
+  try {
     // Generate PDF blob from React component
     const blob = await pdf(documentComponent).toBlob();
 
     // Create download link
-    const url = URL.createObjectURL(blob);
+    url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = ${filename}.pdf;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
-
+  } catch (error) {
+    console.error("Failed to export PDF:", error);
+    throw new Error("Failed to export PDF file");
+  } finally {
+    if (url) {
-    URL.revokeObjectURL(url);
+      URL.revokeObjectURL(url);
+    }
+  }
 }

Prompt for AI Agent:
In lib/export-utils.ts around lines 18 to 32, the exportPDF function uses the unsafe any type for documentComponent and lacks robust error handling and cleanup (URL.revokeObjectURL and removing the link may not run on failure). Change the documentComponent parameter to a proper React type (e.g., React.ReactElement or React.ReactNode/JSX.Element depending on usage), wrap the PDF generation and DOM manipulation in try/catch/finally, handle/log or rethrow errors from pdf(...).toBlob(), and perform cleanup (remove appended link and revokeObjectURL) inside finally so they always run even if an error occurs.



============================================================================

File: lib/export-utils.ts
Line: 3 to 16
Type: refactor_suggestion

Comment:
Replace any type and add error handling.

Line 3 uses any for the data parameter, reducing type safety. Additionally, the function lacks error handling for blob creation and DOM operations.



Apply this diff to improve type safety and error handling:

-export async function exportJSON(data: any, filename: string) {
+export async function exportJSON(data: unknown, filename: string): Promise {
+  try {
     const jsonString = JSON.stringify(data, null, 2);
     const blob = new Blob([jsonString], { type: "application/json" });
     const url = URL.createObjectURL(blob);
 
     const link = document.createElement("a");
     link.href = url;
     link.download = ${filename}.json;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
-
     URL.revokeObjectURL(url);
+  } catch (error) {
+    console.error("Failed to export JSON:", error);
+    throw new Error("Failed to export JSON file");
+  }
 }

Prompt for AI Agent:
In lib/export-utils.ts around lines 3 to 16, the exportJSON function uses any for data and has no error handling; replace the any with a generic or unknown type (e.g., function exportJSON(data: T, filename: string)) to improve type safety, then wrap the blob creation, DOM link operations, and URL.createObjectURL/revokeObjectURL calls in a try/catch/finally block to catch and log or rethrow errors; ensure URL.revokeObjectURL is called in finally, validate/normalize the filename before using it, and handle missing document or append/click/remove failures gracefully (returning a boolean or throwing a clear error).



============================================================================

✅ RESOLVED - File: lib/prompts/markdowns/prd-generation.md
Line: 151
Type: nitpick

Comment:
Add trailing newline.

Resolution:
Added trailing newline at end of file.



============================================================================

File: lib/constants.ts
Line: 130 to 145
Type: nitpick

Comment:
Consider increasing minimum product name length.

MIN_PRODUCT_NAME_LENGTH: 1 allows single-character product names, which are unlikely to be meaningful or useful. Consider increasing to at least 2 or 3 characters for better data quality.



   / Minimum product name length */
-  MIN_PRODUCT_NAME_LENGTH: 1,
+  MIN_PRODUCT_NAME_LENGTH: 3,

Prompt for AI Agent:
In lib/constants.ts around lines 130 to 145, the MIN_PRODUCT_NAME_LENGTH is set to 1 which allows single-character product names; change MIN_PRODUCT_NAME_LENGTH to a stricter value (e.g., 3) to improve data quality, update any related validation messages/tests that assume the old minimum, and run the test suite and manual validation flows to ensure nothing else depends on the single-character allowance.



============================================================================

✅ RESOLVED - File: lib/constants.ts
Line: 53 to 68
Type: potential_issue

Comment:
Critical inconsistency between question count range and category totals.

Resolution:
Changed "Core Features" max from 4 to 3. Sum now equals 15 (3+3+3+2+2+2).



Apply this diff to align the category maximums with the overall range:

 export const QUESTION_CATEGORIES = {
-  "Core Features": { min: 3, max: 4 },
+  "Core Features": { min: 3, max: 3 },
   "User Types & Personas": { min: 2, max: 3 },
   "Data Requirements": { min: 2, max: 3 },
   "Scalability & Performance": { min: 2, max: 2 },
   "Integrations & Third-party Services": { min: 2, max: 2 },
   "Technical Constraints": { min: 1, max: 2 },
 } as const;


This ensures the sum of maximums (3+3+3+2+2+2 = 15) matches QUESTION_COUNT_RANGE.MAX.

Prompt for AI Agent:
In lib/constants.ts around lines 53 to 68, the sum of category maximums (4+3+3+2+2+2=16) exceeds QUESTION_COUNT_RANGE.MAX (15); change the "Core Features" category max from 4 to 3 so the category maximums sum to 15 (3+3+3+2+2+2) and remain consistent with QUESTION_COUNT_RANGE.MAX.



============================================================================

✅ RESOLVED - File: lib/constants.ts
Line: 154 to 162
Type: potential_issue

Comment:
Inadequate filename sanitization in export patterns.

Resolution:
Updated filename generators to handle empty/undefined names (fallback to "unnamed_product"), sanitize with regex [^a-zA-Z0-9_-] to allow only safe characters, collapse consecutive underscores, and trim leading/trailing underscores.



Apply this diff to improve filename sanitization:

 export const EXPORT_PATTERNS = {
   / JSON file name pattern: {productName}_PRD_{timestamp}.json */
   JSON_FILENAME: (productName: string) =>
-    ${productName.replace(/\s+/g, "_")}_PRD_${Date.now()}.json,
+    ${(productName || "Untitled").replace(/[^a-zA-Z0-9_-]/g, "_")}_PRD_${Date.now()}.json,

   / PDF file name pattern: {productName}_PRD_{timestamp}.pdf */
   PDF_FILENAME: (productName: string) =>
-    ${productName.replace(/\s+/g, "_")}_PRD_${Date.now()}.pdf,
+    ${(productName || "Untitled").replace(/[^a-zA-Z0-9_-]/g, "_")}_PRD_${Date.now()}.pdf,
 } as const;


This regex [^a-zA-Z0-9_-] replaces all characters except alphanumeric, underscore, and hyphen, ensuring cross-platform compatibility.

Prompt for AI Agent:
In lib/constants.ts around lines 154 to 162, the export filename generators only replace spaces and don't sanitize other invalid filename characters or handle empty/undefined product names; update both JSON_FILENAME and PDF_FILENAME to first coerce productName to a safe string (e.g., fallback to 'unnamed_product' when empty/undefined), then normalize by trimming, lowercasing or preserving case as desired, replace all characters not matching [a-zA-Z0-9_-] with an underscore (using regex /[^a-zA-Z0-9_-]/g), collapse consecutive underscores to a single underscore, and ensure no leading/trailing underscores before appending _PRD_{Date.now()}.extension so filenames are cross-platform safe.



============================================================================

✅ RESOLVED - File: lib/prompts/loader.ts
Line: 16 to 19
Type: potential_issue

Comment:
Add error handling for missing or unreadable prompt files.

Resolution:
Wrapped fs.readFileSync in try/catch block with descriptive error message including filename and path.



Apply this diff to add error handling with a descriptive message:

 export function loadPrompt(filename: string): string {
   const promptPath = path.join(process.cwd(), "lib", "prompts", "markdowns", ${filename}.md);
-  return fs.readFileSync(promptPath, "utf-8");
+  try {
+    return fs.readFileSync(promptPath, "utf-8");
+  } catch (error) {
+    throw new Error(Failed to load prompt "${filename}" from ${promptPath}: ${error instanceof Error ? error.message : String(error)});
+  }
 }

Prompt for AI Agent:
In lib/prompts/loader.ts around lines 16 to 19, loadPrompt currently reads the file synchronously without handling errors; wrap the fs.readFileSync call in try/catch and handle missing/unreadable files by throwing or returning a clear, descriptive error (e.g., include filename and original error.message). Ensure the function does not crash silently: either rethrow a new Error with context or return a safe fallback string and log the original error; keep the signature but document behavior for callers.



============================================================================

File: lib/logger.ts
Line: 71 to 92
Type: nitpick

Comment:
Consider using appropriate console methods in production.

The logging implementation is correct. However, in production mode, all logs use console.log() regardless of level. Consider using console.error(), console.warn(), and console.log() based on the level to enable better log filtering in production environments.



     } else {
-      console.log(JSON.stringify({
+      const logFn = level === "error" ? console.error :
+                    level === "warn" ? console.warn : console.log;
+      logFn(JSON.stringify({
         level,
         timestamp,
         context,
         message,
         ...metadata,
       }));
     }


This allows log aggregation services to filter by severity more easily.

Prompt for AI Agent:
In lib/logger.ts around lines 71 to 92, the production branch always writes JSON logs with console.log regardless of level; change it to select console.error for "error", console.warn for "warn", and console.log for others while still outputting the same JSON payload (level, timestamp, context, message, metadata). Implement a small switch/conditional to pick the console method, call that method with the JSON stringified object, and keep a fallback to console.log to avoid losing logs if an unexpected level appears.



============================================================================

File: lib/prompts/loader.ts
Line: 17
Type: nitpick

Comment:
Consider using import.meta.url for more reliable path resolution.

Using process.cwd() assumes the process is started from the project root, which can break if the process is launched from a different directory. Using import.meta.url provides path resolution relative to the module file itself, making it more robust.



Apply this diff to use import.meta.url:

+import { fileURLToPath } from "url";
+
+const __dirname = path.dirname(fileURLToPath(import.meta.url));
+
 export function loadPrompt(filename: string): string {
-  const promptPath = path.join(process.cwd(), "lib", "prompts", "markdowns", ${filename}.md);
+  const promptPath = path.join(__dirname, "markdowns", ${filename}.md);
   try {
     return fs.readFileSync(promptPath, "utf-8");

Prompt for AI Agent:
In lib/prompts/loader.ts around line 17, the code builds promptPath using process.cwd(), which is fragile; replace it by resolving the current module directory using fileURLToPath(import.meta.url) and path.dirname, then join that directory with "markdowns" and ${filename}.md so the path is calculated relative to the loader module itself (import fileURLToPath from "url", compute const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); then build promptPath via path.join(__dirname, "markdowns", ${filename}.md)).



============================================================================

File: lib/workflow/persistence.ts
Line: 34 to 37
Type: nitpick

Comment:
Consider validation of snapshot structure.

The function parses JSON but doesn't validate the structure of the snapshot object before using it. A malformed snapshot could cause issues downstream.



Consider adding type validation:

const snapshot: WorkflowSnapshot = JSON.parse(stored)

// Validate structure
if (!snapshot.conversationId || !snapshot.currentStep || !snapshot.timestamp) {
  logger.warn('loadWorkflowSnapshot', 'Invalid snapshot structure', { conversationId })
  return null
}

// Only return if it's for the same conversation and recent (< 24 hours)
const isRecent = Date.now() - snapshot.timestamp < 24  60  60 * 1000
const isSameConversation = snapshot.conversationId === conversationId

return isRecent && isSameConversation ? snapshot : null

Prompt for AI Agent:
In lib/workflow/persistence.ts around lines 34 to 37, the code returns the parsed snapshot without validating its shape; add validation and error handling: wrap JSON.parse in a try/catch to handle malformed JSON, verify required fields exist and have expected types (e.g., conversationId is a string, timestamp is a number, currentStep exists), call logger.warn with context and conversationId and return null if validation fails, then keep the existing recency and conversation checks and only return the snapshot when validation passes and it is recent/same conversation.



============================================================================

✅ RESOLVED - File: lib/ai-clients.ts
Line: 15 to 26
Type: nitpick

Comment:
Missing API key validation.

Resolution:
Added validation checks for ANTHROPIC_API_KEY and PERPLEXITY_API_KEY before client instantiation. Throws clear error messages if keys are missing.



Add validation:

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error("PERPLEXITY_API_KEY environment variable is required");
}

export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

Prompt for AI Agent:
In lib/ai-clients.ts around lines 15 to 26, the Anthropic and Perplexity clients are created without validating their API keys; add explicit checks for process.env.ANTHROPIC_API_KEY and process.env.PERPLEXITY_API_KEY before instantiating the clients, and throw clear errors like "ANTHROPIC_API_KEY environment variable is required" and "PERPLEXITY_API_KEY environment variable is required" so the process fails fast at startup if a key is missing, then instantiate and export the clients only after the validations pass.



============================================================================

File: lib/workflow/guards.ts
Line: 31 to 37
Type: refactor_suggestion

Comment:
Eliminate duplicate route mapping.

The step-to-route mapping is defined twice (lines 31-37 and 43-49). This is a DRY violation that increases maintenance burden.



Extract the route mapping to a constant and reuse it:

+const STEP_ROUTES: Record = {
+  discovery: /chat/{conversationId},
+  questions: /chat/{conversationId}/questions,
+  research: /chat/{conversationId}/research,
+  selection: /chat/{conversationId}/select,
+  generate: /chat/{conversationId}/generate,
+}
+
 export function enforceWorkflowOrder(
   requestedStep: WorkflowStep,
   currentStep: WorkflowStep,
   completedSteps: WorkflowStep[],
   conversationId: string
 ): void {
   // ... validation logic ...
-  const stepRoutes: Record = {
-    discovery: /chat/${conversationId},
-    questions: /chat/${conversationId}/questions,
-    research: /chat/${conversationId}/research,
-    selection: /chat/${conversationId}/select,
-    generate: /chat/${conversationId}/generate,
-  }
-  redirect(stepRoutes[currentStep])
+  redirect(STEP_ROUTES[currentStep].replace('{conversationId}', conversationId))
 }

 export function getStepRoute(step: WorkflowStep, conversationId: string): string {
-  const routes: Record = {
-    discovery: /chat/${conversationId},
-    questions: /chat/${conversationId}/questions,
-    research: /chat/${conversationId}/research,
-    selection: /chat/${conversationId}/select,
-    generate: /chat/${conversationId}/generate,
-  }
-  return routes[step]
+  return STEP_ROUTES[step].replace('{conversationId}', conversationId)
 }



Also applies to: 43-49

Prompt for AI Agent:
In lib/workflow/guards.ts around lines 31-37 and 43-49, the step-to-route mapping is duplicated; extract that object into a single constant (e.g., STEP_ROUTES or a helper function) defined once at module scope and replace both inline maps with references to that constant, ensuring it accepts or closes over conversationId as needed (pass conversationId to a function or build the routes when conversationId is available) so both usages reuse the same source of truth.



============================================================================

File: lib/workflow/guards.ts
Line: 10
Type: refactor_suggestion

Comment:
Extract hardcoded steps array to a shared constant.

The workflow steps array is duplicated on lines 10 and 54. This violates DRY and could lead to inconsistencies if the workflow sequence changes.



Extract to a shared constant at the top of the file:

+const WORKFLOW_STEPS: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+
 export function enforceWorkflowOrder(
   requestedStep: WorkflowStep,
   currentStep: WorkflowStep,
   completedSteps: WorkflowStep[],
   conversationId: string
 ): void {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+  const steps = WORKFLOW_STEPS
   // ...
 }

 export function getNextStepRoute(currentStep: WorkflowStep, conversationId: string): string | null {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+  const steps = WORKFLOW_STEPS
   // ...
 }



Also applies to: 54-54

Prompt for AI Agent:
In lib/workflow/guards.ts around lines 10 and 54, the workflow steps array is duplicated; extract the array into a single shared constant at the top of the file (e.g., const WORKFLOW_STEPS = [...] ) and replace the hardcoded arrays at lines 10 and 54 with references to that constant; keep the same type annotation (WorkflowStep[]) and export it if other modules need access, run tests/types to ensure no type errors.



============================================================================

File: lib/analytics/techStackEvents.ts
Line: 17
Type: nitpick

Comment:
Improve type safety for analytics integration.

The repeated use of (window as any).analytics bypasses TypeScript's type checking. This could lead to runtime errors if the analytics object doesn't have the expected shape.



Define proper types and create a typed helper:

// Add at the top of the file
interface AnalyticsWindow extends Window {
  analytics?: {
    track(event: string, properties: Record): void;
  };
}

declare const window: AnalyticsWindow;

// Create a helper function
function trackEvent(eventName: string, properties: Record) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(eventName, properties);
  }
}

// Then use it in your functions:
export function trackTechStackSkip(data: { / ... / }) {
  trackEvent('Tech Stack Skipped', {
    conversation_id: data.conversationId,
    // ...
  });
}



Also applies to: 37-37, 59-59, 79-79

Prompt for AI Agent:
In lib/analytics/techStackEvents.ts around lines 17, 37, 59 and 79, replace the repeated unsafe (window as any).analytics casts by adding a typed Window interface (e.g., AnalyticsWindow with optional analytics { track(event: string, properties: Record): void }) and declaring window as that type at the top of the file, implement a small helper function trackEvent(eventName: string, properties: Record) that checks typeof window !== 'undefined' && window.analytics before calling window.analytics.track, and update all existing calls to use trackEvent with properly typed property objects so TypeScript validates the shape instead of using any casts.



============================================================================

File: lib/workflow/guards.ts
Line: 4 to 9
Type: nitpick

Comment:
Document that enforceWorkflowOrder throws via redirect.

The function signature returns void, but redirect() on line 39 throws an error. This behavior should be documented so callers understand the function may not return normally.



Add a JSDoc comment:

+/
+ * Enforces workflow navigation order by validating the requested step.
+ * Throws a Next.js redirect error if navigation is not allowed.
+ * @throws {RedirectError} When navigation to requested step is not permitted
+ */
 export function enforceWorkflowOrder(
   requestedStep: WorkflowStep,
   currentStep: WorkflowStep,
   completedSteps: WorkflowStep[],
   conversationId: string
 ): void {

Prompt for AI Agent:
In lib/workflow/guards.ts around lines 4 to 9, document that enforceWorkflowOrder may not return normally because it calls redirect(), which throws; add a JSDoc block above the function stating the function throws (via redirect) when the workflow is out of order and indicate the circumstances and the type/behavior of the thrown redirect so callers know it can throw instead of returning void.



============================================================================

File: lib/analytics/techStackEvents.ts
Line: 73 to 87
Type: nitpick

Comment:
Clarify unused parameters in trackDefaultStackModified.

The function accepts originalStack and modifiedStack parameters but doesn't emit them in the analytics event. This could be confusing to callers who might expect these values to be tracked.



Either:
1. Remove the unused parameters if they're not needed:

 export function trackDefaultStackModified(data: {
   conversationId: string
-  originalStack: any
-  modifiedStack: any
   changedFields: string[]
 }) {


2. Or emit them if they're useful for analytics:

     (window as any).analytics.track('Default Stack Modified', {
       conversation_id: data.conversationId,
+      original_stack: data.originalStack,
+      modified_stack: data.modifiedStack,
       changed_fields: data.changedFields,
       changes_count: data.changedFields.length,
       timestamp: new Date().toISOString(),
     })

Prompt for AI Agent:
In lib/analytics/techStackEvents.ts around lines 73 to 87, the function signature includes originalStack and modifiedStack but they are not used which is confusing; either remove those parameters from the signature (and update any callers) if stack snapshots are not needed, or include them in the analytics payload by adding sanitized/serialized fields (e.g., original_stack and modified_stack) to the object passed to analytics.track; if you emit them, ensure you redact sensitive fields and limit size (serialize to JSON or extract only the fields needed) before adding to the event.



============================================================================

✅ RESOLVED - File: lib/ai-clients.ts
Line: 31 to 35
Type: potential_issue

Comment:
Update AI model identifiers to current Anthropic models.

Resolution:
Updated CLAUDE_SONNET to "claude-sonnet-4-20250514" and CLAUDE_HAIKU to "claude-3-5-haiku-20241022" to match current Anthropic model identifiers.



============================================================================

File: lib/workflow/progress.ts
Line: 102 to 105
Type: refactor_suggestion

Comment:
Use dynamic step count instead of hardcoded value.

The progress percentage calculation uses a hardcoded totalSteps = 5. If workflow steps are added or removed, this could become inconsistent with the actual steps array. Consider deriving this value from the steps array.



Apply this diff:

 export function getProgressPercentage(completedSteps: WorkflowStep[]): number {
-  const totalSteps = 5
+  const totalSteps = getAllSteps().length
   return Math.round((completedSteps.length / totalSteps) * 100)
 }

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 102-105, the function currently uses a hardcoded totalSteps = 5; change it to derive the total from the actual steps array by updating the function signature to accept the full steps array (e.g., getProgressPercentage(completedSteps: WorkflowStep[], allSteps: WorkflowStep[])) and compute const totalSteps = allSteps.length, then use that length in the percentage calculation; update all call-sites to pass the full steps array (or alternatively import the canonical steps list and use its length) so the calculation stays correct when steps are added or removed.



============================================================================

File: lib/workflow/progress.ts
Line: 77 to 83
Type: nitpick

Comment:
Consider more precise path matching.

The current implementation uses .includes() which could match substrings incorrectly (e.g., '/regenerate' would match 'generate'). Consider using more precise path matching or regex patterns to avoid false positives.



Apply this diff for more precise matching:

 export function getStepFromPath(pathname: string): WorkflowStep {
-  if (pathname.includes('/generate')) return 'generate'
-  if (pathname.includes('/select')) return 'selection'
-  if (pathname.includes('/research')) return 'research'
-  if (pathname.includes('/questions')) return 'questions'
+  if (pathname.endsWith('/generate') || pathname.includes('/generate/')) return 'generate'
+  if (pathname.endsWith('/select') || pathname.includes('/select/')) return 'selection'
+  if (pathname.endsWith('/research') || pathname.includes('/research/')) return 'research'
+  if (pathname.endsWith('/questions') || pathname.includes('/questions/')) return 'questions'
   return 'discovery'
 }

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 77 to 83, the function uses pathname.includes(...) which can produce false positives (e.g. '/regenerate' matches 'generate'); replace each includes check with a boundary-aware test such as a regex that matches whole path segments (e.g. /(^|\/)generate(\/|$)/.test(pathname)) or split pathname by '/' and check segments equality (pathname.split('/').some(seg => seg === 'generate')). Update all four checks (generate, select, research, questions) to use the same precise matching approach and keep the final default return as 'discovery'.



============================================================================

File: lib/workflow/progress.ts
Line: 65 to 71
Type: nitpick

Comment:
Consider handling edge case of invalid completed steps.

The logic uses Math.max(...completedSteps.map(step => steps.indexOf(step))) to find the last completed step index. If completedSteps contains a step that doesn't exist in the steps array, indexOf returns -1, which could lead to incorrect navigation permissions. Consider adding validation to filter out invalid steps.



Apply this diff:

  const lastCompletedIndex = Math.max(
-   ...completedSteps.map(step => steps.indexOf(step))
+   ...completedSteps
+     .map(step => steps.indexOf(step))
+     .filter(index => index !== -1)
  )
+ if (lastCompletedIndex === -Infinity) {
+   // No valid completed steps
+   return targetStep === 'discovery'
+ }
  const targetIndex = steps.indexOf(targetStep)

  // Can navigate to the next step
  return targetIndex === lastCompletedIndex + 1

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 65 to 71, completedSteps may contain entries not present in steps so steps.indexOf can return -1 and skew Math.max; map completedSteps to their indices, filter out any index < 0, then compute lastCompletedIndex as Math.max(...) of the filtered indices with a safe fallback of -1 when the filtered list is empty, and keep the existing targetIndex comparison (targetIndex === lastCompletedIndex + 1).



