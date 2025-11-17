# Code Review: Api Routes

This file contains 15 review issues for api-routes files.

============================================================================

File: app/api/prd/generate/route.ts
Line: 62 to 83
Type: potential_issue

Comment:
Add proper types for mapped items to avoid any type.

Lines 64 and 68 use any type for mapped items (m and q), which bypasses TypeScript's type checking. Define or import proper types for messages and clarifying questions.


Consider adding type annotations:

// At the top of the file or in a types file
interface ConversationMessage {
  role: string;
  content: string;
}

interface ClarifyingQuestion {
  question: string;
  answer?: string;
}

// Then in the prompt building:
${conversationData.messages.map((m: ConversationMessage) => ${m.role}: ${m.content}).join("\n")}

${conversationData.clarifyingQuestions
  ?.map((q: ClarifyingQuestion) => Q: ${q.question}\nA: ${q.answer || "Not answered"})
  .join("\n\n")}


Alternatively, if these types are already defined in your Convex schema or types file, import and use them directly.

Prompt for AI Agent:
In app/api/prd/generate/route.ts around lines 62 to 83, the prompt construction uses map callbacks with implicit any for items (m and q) which disables TypeScript checks; update by importing or declaring proper interfaces (e.g., ConversationMessage and ClarifyingQuestion or the existing Convex types), annotate conversationData and the map callbacks with those types, and replace m: any and q: any with the correct type names so the compiler enforces role/content and question/answer shape when building the prompt.



============================================================================

File: app/api/conversation/initial-message/route.ts
Line: 22 to 23
Type: potential_issue

Comment:
Fix grammatical inconsistency in the context message.

The pronoun "their" doesn't match "My app" (should be "its" or "the user's").



Apply this diff:

-    const contextMessage = My app will be called "${projectName}". Here's their initial description: ${projectDescription};
+    const contextMessage = My app will be called "${projectName}". Here's the initial description: ${projectDescription};

Prompt for AI Agent:
In app/api/conversation/initial-message/route.ts around lines 22-23, the template string uses the plural pronoun "their" which is grammatically inconsistent with "My app"; change the pronoun to "its" (or "the user's" if you prefer) so the contextMessage becomes: My app will be called "{projectName}". Here's its initial description: {projectDescription} — update the string accordingly.



============================================================================

File: app/api/questions/fill-defaults/route.ts
Line: 120 to 178
Type: nitpick

Comment:
Fragile string matching for question types.

The getTextDefault function uses lowercase string matching (e.g., questionLower.includes("product name")) to determine which context field to use. This is brittle and could fail with slight variations in question phrasing.



Consider:
1. Using a more robust matching strategy (e.g., keyword scoring)
2. Adding a contextKey field to questions during generation
3. Using fuzzy matching or NLP for better question categorization

Example with explicit mapping:

// During question generation, add a contextKey
interface Question {
  question: string;
  contextKey?: 'productName' | 'description' | 'targetAudience' | ...;
  // ... other fields
}

// Then use direct mapping
function getTextDefault(question: Question, extractedContext: ExtractedContext | null): string {
  if (!extractedContext) return "";
  
  const key = question.contextKey;
  if (key && key in extractedContext) {
    const value = extractedContext[key];
    return Array.isArray(value) ? value.join(", ") : value ?? "";
  }
  
  // Fallback to current logic
  // ...
}

Prompt for AI Agent:
In app/api/questions/fill-defaults/route.ts around lines 120-178, the getTextDefault function uses brittle lowercase string includes checks to pick a context field; change it to first look for a new question.contextKey (add an optional contextKey union type to the Question interface), and if present map it directly to the corresponding extractedContext property, returning arrays as comma-joined strings or an empty string if undefined; only if contextKey is absent fall back to the existing keyword/includes logic. Ensure the function handles null extractedContext early and update types/usages where Questions are created so contextKey can be set during question generation.



============================================================================

File: app/api/research/tech-stack/route.ts
Line: 177 to 205
Type: nitpick

Comment:
Fragile text parsing with regex.

The fallback text parsing relies on specific formatting patterns (numbered lists with ``, specific section headings). If Perplexity changes its response format, this will silently fail and return an empty array.



Consider:
1. Adding logging when fallback parsing is used vs JSON extraction
2. Documenting the expected text format
3. Adding validation that parsed options have the expected structure before returning

Prompt for AI Agent:
In app/api/research/tech-stack/route.ts around lines 177 to 205, the current regex-based fallback parsing is fragile and can silently return an empty array if Perplexity changes formats; update it to (1) emit a debug/info log whenever the code falls back to text parsing and also log when JSON extraction succeeds so you can monitor which path runs, (2) add a short in-code comment or top-level docstring describing the exact text structure the regex expects (numbered sections, bolded names, headings like Pros/Cons/Popularity) for future maintenance, and (3) validate each parsed option before returning (e.g., ensure name is non-empty and pros/cons are arrays), filter out invalid entries, and log a warning if validation removes items or yields zero results so failures are observable instead of silent.



============================================================================

File: app/api/conversation/extract-context/route.ts
Line: 84 to 91
Type: nitpick

Comment:
Consider moving ContextData to a shared types module.

The ContextData interface is defined locally but appears to represent a domain model that could be reused across the application.



Move this interface to a shared location like types/index.ts:

// types/index.ts
export interface ContextData {
  productName?: string;
  description?: string;
  targetAudience?: string;
  keyFeatures?: string[];
  problemStatement?: string;
  technicalPreferences?: string[];
}


Then import it in this file:

import { ContextData } from "@/types"

Prompt for AI Agent:
In app/api/conversation/extract-context/route.ts around lines 84 to 91, the ContextData interface is defined locally but should be moved to a shared types module; create or update types/index.ts with the exported ContextData interface (same shape as shown in the comment), remove the local interface from this file, and replace it with an import: import { ContextData } from "@/types"; ensure any references still compile and update any tsconfig/paths if necessary.



============================================================================

File: app/api/tech-stack/suggest-defaults/route.ts
Line: 74 to 87
Type: nitpick

Comment:
Consider transaction support for multi-step validation flow.

The pattern of saving, validating, then conditionally re-saving could leave the database in an inconsistent state if the second save fails or if concurrent operations read between saves.



Options to consider:
1. Validate before the first save
2. Use a transaction to ensure atomic updates
3. Use optimistic locking to detect concurrent modifications

Example (validate first):
// Validate the stack before saving
const validation = await validateDefaultStack(techStack)

if (validation.errors.length > 0) {
  techStack = await fixStackErrors(techStack, validation.errors)
}

// Save once with correct data
await convexClient.mutation(api.conversations.saveSelection, {
  conversationId,
  selection: techStack,
  autoSelected: true,
})

Prompt for AI Agent:
In app/api/tech-stack/suggest-defaults/route.ts around lines 74 to 87, the code saves the selection, then validates and potentially modifies it, causing a window where the DB can hold an inconsistent value if the second save fails or concurrent readers observe the intermediate state; change the flow to perform validation (and fix errors if any) before making a single save, or alternatively wrap both write operations in a single DB transaction or use optimistic locking to ensure atomicity; implement by moving validateDefaultStack and fixStackErrors to run before calling convexClient.mutation, or replace the two-point save with a transactional mutation that commits the final selection only when validation/fixes succeed.



============================================================================

File: app/api/tech-stack/suggest-defaults/route.ts
Line: 157 to 164
Type: potential_issue

Comment:
Implement actual validation or remove the stub.

The validateDefaultStack function is a stub that always returns valid, which creates a false sense of safety. Either implement real validation or remove the validation step entirely.




Would you like me to generate a validation implementation that checks:
- Required fields are present
- Technology choices are compatible
- Values match expected formats

Prompt for AI Agent:
In app/api/tech-stack/suggest-defaults/route.ts around lines 157 to 164, the validateDefaultStack stub always returns isValid: true; replace it with real validation or remove its usage: implement checks that required fields (name, components array, language/runtime, database, frontend/backend flags) exist and are non-empty; validate formats (strings, enums, version patterns using simple regex), enforce basic compatibility rules (e.g., if frontend is React then ensure language/runtime supports it, disallow incompatible DB/ORM combinations), and collect errors/warnings into the returned shape { isValid: boolean, errors: string[], warnings: string[] } where isValid is false if errors array is non-empty; ensure the function accepts the same input type and does not throw, only returns structured validation results so callers can handle failures, or remove calls to this validator if you opt to drop validation entirely.



============================================================================

File: app/api/conversation/extract-context/route.ts
Line: 96 to 108
Type: nitpick

Comment:
Consider a helper for array field validation.

The array validation pattern is repeated twice and could be extracted to reduce duplication.



Example helper:

const ensureArray = (value: unknown): string[] => 
  Array.isArray(value) ? value : []

const validatedContext = {
  productName: contextData.productName || "Untitled Product",
  description: contextData.description || "",
  targetAudience: contextData.targetAudience || "General users",
  keyFeatures: ensureArray(contextData.keyFeatures),
  problemStatement: contextData.problemStatement || "",
  technicalPreferences: ensureArray(contextData.technicalPreferences),
  extractedAt: Date.now(),
}

Prompt for AI Agent:
In app/api/conversation/extract-context/route.ts around lines 96 to 108, the Array.isArray checks for keyFeatures and technicalPreferences are duplicated; create a small helper (e.g., ensureArray) that takes an unknown and returns a string[] (returning [] when not an array) and replace both inline Array.isArray branches with calls to that helper so the validatedContext construction is shorter and DRY.



============================================================================

File: app/api/tech-stack/suggest-defaults/route.ts
Line: 166 to 175
Type: potential_issue

Comment:
fixStackErrors doesn't actually fix errors.

The function ignores its parameters and returns a hardcoded default stack regardless of the specific errors encountered. This means validation errors aren't being addressed meaningfully.




Do you want me to implement error-specific fix logic, or should this function simply return the default stack directly without validation?




============================================================================

File: app/api/conversation/extract-context/route.ts
Line: 25 to 123
Type: nitpick

Comment:
Consider adding rate limiting for AI operations.

This route invokes Claude's API, which incurs costs per call. Without rate limiting, authenticated users could abuse the endpoint and generate unexpected bills.



Consider implementing:
- Per-user rate limits (e.g., X context extractions per hour)
- Global rate limits to protect against coordinated abuse
- Request deduplication to avoid re-extracting context unnecessarily

Example middleware integration:
import { rateLimit } from "@/lib/middleware/rate-limit"

export const POST = rateLimit({ 
  max: 10, 
  window: "1h" 
})(withAuth(async (request, { userId, token }) => {
  // ... existing logic
}))




============================================================================

File: app/api/questions/fill-defaults/route.ts
Line: 59 to 76
Type: potential_issue

Comment:
All questions marked as autoCompleted regardless of success.

Line 74 marks a question as autoCompleted: true even if getDefaultAnswer returns an empty string. This could be misleading in the UI.



Apply this diff to only mark questions with actual default values:

     const questions = conversation.clarifyingQuestions as Question[];
 
     // Fill defaults for unanswered questions
     const filledQuestions = questions.map((question) => {
       // Skip if already answered
       if (question.answer && question.answer.trim()) {
         return { ...question, autoCompleted: false };
       }
 
       // Determine default based on question type
       const defaultAnswer = getDefaultAnswer(question, extractedContext);
 
       return {
         ...question,
         answer: defaultAnswer,
-        autoCompleted: true,
+        autoCompleted: defaultAnswer.trim() !== "",
       };
     });

Prompt for AI Agent:
In app/api/questions/fill-defaults/route.ts around lines 59 to 76, the code currently sets autoCompleted: true even when getDefaultAnswer returns an empty string; change the mapping so you only set answer and autoCompleted: true when defaultAnswer is non-empty (truthy after trimming). If defaultAnswer is empty, return the original question (or return { ...question, autoCompleted: false } to be explicit) so you do not overwrite the answer with an empty string or mark it as autoCompleted.



============================================================================

File: app/api/research/tech-stack/route.ts
Line: 258 to 278
Type: refactor_suggestion

Comment:
Duplicate logging during retry.

Lines 260-266 and 265 both log the retry attempt with similar messages. This creates redundant log entries.



Apply this diff to remove the duplicate:

     if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
       if (retryCount  setTimeout(resolve, RETRY_DELAY));

Prompt for AI Agent:
In app/api/research/tech-stack/route.ts around lines 258 to 278, there are duplicate logger.warn calls logging the same retry and max-retries messages (one generic call and a near-identical "researchCategory" call); remove the redundant logger.warn lines (the secondary "researchCategory" variants) so each event is logged once, keeping the primary logger.warn that includes the message and metadata.



============================================================================

File: app/api/research/tech-stack/route.ts
Line: 169
Type: nitpick

Comment:
Remove unused parameter.

The _category parameter is prefixed with underscore indicating it's intentionally unused, but consider removing it entirely if it serves no purpose.



Apply this diff:

-function parseResponse(content: string, _category: string): any[] {
+function parseResponse(content: string): any[] {


And update the call site at line 246:

-    const options = parseResponse(content, researchQuery.category);
+    const options = parseResponse(content);

Prompt for AI Agent:
In app/api/research/tech-stack/route.ts around line 169, the parseResponse function declares an unused second parameter named _category; remove this parameter from the function signature and adjust any JSDoc/types accordingly, then update the call site at line 246 to call parseResponse with only the content argument (remove the second argument passed there). Ensure TypeScript signatures and any references are updated so there are no leftover unused-parameter warnings.



============================================================================

File: app/api/questions/generate/route.ts
Line: 56 to 59
Type: potential_issue

Comment:
Add bounds checking for response content array.

Accessing response.content[0] without checking array length could throw if the array is empty.



Apply this diff to add bounds checking:

     const content = response.content[0];
-    if (!content || content.type !== "text") {
+    if (!response.content.length || !content || content.type !== "text") {
       throw new Error("Unexpected response type");
     }

Prompt for AI Agent:
In app/api/questions/generate/route.ts around lines 56 to 59, the code reads response.content[0] without verifying the content array exists or has elements; add a guard that ensures response.content is an array and has length > 0 before accessing index 0, and if not, throw a clear Error (or handle the empty case) indicating the response content was empty or malformed; then only access content[0] and validate its .type === "text" as before.



============================================================================

File: app/api/questions/generate/route.ts
Line: 22
Type: potential_issue

Comment:
Add input validation for request body.

The request body is parsed without validation. Malformed or missing fields could cause runtime errors or unexpected behavior downstream.



Apply this diff to add basic validation:

-    const { productContext, extractedContext } = await request.json();
+    const body = await request.json();
+    const { productContext, extractedContext } = body;
+    
+    if (!productContext && !extractedContext) {
+      return NextResponse.json(
+        { error: "Either productContext or extractedContext is required" },
+        { status: 400 }
+      );
+    }

Prompt for AI Agent:
In app/api/questions/generate/route.ts around line 22, the code destructures productContext and extractedContext straight from request.json() without validating them; add basic input validation by first safely parsing the JSON (wrap in try/catch or check request.json() result), verify that productContext and extractedContext are present and of the expected types (e.g., objects or strings as your API expects), and if validation fails return a 400 response with a clear error message; if valid, proceed to use the validated values (optionally narrow types/interfaces) so downstream logic cannot receive undefined or malformed data.



