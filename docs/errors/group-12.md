============================================================================
File: components/ui/toggle.tsx
Line: 9 to 29
Type: nitpick

Comment:
Improve readability of long className string.

The base className string on line 10 is over 400 characters and difficult to read/maintain. Consider using an array with .join(' ') for better readability:



Apply this diff to improve maintainability:

 const toggleVariants = cva(
-  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
+  [
+    "inline-flex items-center justify-center gap-2 rounded-md",
+    "text-sm font-medium whitespace-nowrap",
+    "hover:bg-muted hover:text-muted-foreground",
+    "disabled:pointer-events-none disabled:opacity-50",
+    "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
+    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
+    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+    "outline-none transition-[color,box-shadow]",
+    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
+    "aria-invalid:border-destructive",
+  ].join(" "),
   {

Prompt for AI Agent:
In components/ui/toggle.tsx around lines 9 to 29, the long base className string passed to cva is hard to read and maintain; refactor it by replacing the single long string with an array of smaller class string segments (grouped logically, e.g., layout, state, svg rules, focus, accessibility, transitions) and call .join(' ') to produce the final string; ensure you preserve all original classes and spacing, leave the variants and defaultVariants block unchanged, and keep comments or grouping inline as needed for readability.



============================================================================
File: lib/api-error-handler.ts
Line: 50 to 62
Type: nitpick

Comment:
Same logging consistency issue.

This function also uses console.error (Line 60) instead of the logger utility. Apply the same fix as suggested for handleAPIError.



 export function handleValidationError(
   message: string,
   details?: string
 ): NextResponse {
   const apiError: APIError = {
     error: message,
     details: details || "Request validation failed",
     code: "VALIDATION_ERROR",
   };
 
-  console.error("Validation Error:", apiError);
+  logger.error("Validation Error", "validation", apiError);
   return NextResponse.json(apiError, { status: 400 });
 }

Prompt for AI Agent:
In lib/api-error-handler.ts around lines 50 to 62, the function handleValidationError is using console.error for logging instead of the shared logger utility; replace the console.error call with the project logger (e.g., import logger from the logger module if not already imported) and log the same message and object (logger.error("Validation Error:", apiError)) to maintain consistent structured logging, then keep returning NextResponse.json(apiError, { status: 400 }).



============================================================================
File: lib/techStack/defaults.ts
Line: 68 to 119
Type: nitpick

Comment:
Consider validating input shape and documenting priority order.

The detection logic is generally sound, but a few improvements would enhance robustness:

1. Early return logic (Line 72): The function returns 'general' when both inputs are falsy, but proceeds if only one is truthy. Consider if this is the intended behavior or if additional validation is needed.

2. Priority order: The keyword matching follows an undocumented priority (mobile → e-commerce → AI → dashboard → API → SaaS → web_app). Consider adding a comment explaining this ordering, as it affects which product type is detected when multiple keyword sets match.

3. Type safety: The function accepts any types for both parameters. Consider defining proper interfaces for extractedContext and answers to catch shape mismatches at compile time.



Apply this diff to add type safety and documentation:

+/
+ * Detects the product type based on extracted context and user answers.
+ * Priority order: mobile_app → ecommerce → ai_app → dashboard → api_service → saas_platform → web_app (default)
+ * @param extractedContext - Context extracted from user input
+ * @param answers - User's answers to questions
+ * @returns Product type key for DEFAULT_STACKS
+ */
+interface ExtractedContext {
+  description?: string;
+  productName?: string;
+  keyFeatures?: string[];
+  technicalPreferences?: string[];
+}
+
 export function detectProductType(
-  extractedContext: any,
-  answers: any
+  extractedContext: ExtractedContext | null | undefined,
+  answers: any
 ): keyof typeof DEFAULT_STACKS {

Prompt for AI Agent:
In lib/techStack/defaults.ts around lines 68 to 119, add explicit TypeScript interfaces for the expected shape of extractedContext (fields: description?, productName?, keyFeatures?: string[], technicalPreferences?: string[]) and answers to replace the any types, validate incoming objects at the top (e.g., coerce missing arrays to [] and strings to ''), and clarify the early-return: return 'general' only when both inputs are null/undefined/empty after normalization otherwise continue detection; also add a short comment above the keyword checks documenting the detection priority order (mobile → e-commerce → AI → dashboard → API → SaaS → web_app) so the precedence is explicit.



============================================================================
File: lib/analytics/questionsEvents.ts
Line: 18 to 45
Type: nitpick

Comment:
Improve type safety for analytics tracking.

The function correctly guards against SSR issues, but uses unsafe type casting:

1. Type casting (Lines 19, 36): (window as any).analytics bypasses TypeScript safety. Consider defining a proper type:



+declare global {
+  interface Window {
+    analytics?: {
+      track: (event: string, properties: Record) => void;
+    };
+  }
+}
+
 export function trackQuestionsSkip(data: QuestionsSkipData) {
-  if (typeof window !== "undefined" && (window as any).analytics) {
+  if (typeof window !== "undefined" && window.analytics) {
     const completionRate = data.totalCount > 0
       ? (data.answeredCount / data.totalCount) * 100
       : 0;
 
     logger.debug("Analytics: Questions Skipped", "", {
       // ... existing code ...
     });
 
-    (window as any).analytics.track('Questions Skipped', {
+    window.analytics.track('Questions Skipped', {


2. Division by zero: Good defensive check on line 20-22 preventing division by zero.

Prompt for AI Agent:
In lib/analytics/questionsEvents.ts around lines 18 to 45, the code uses unsafe (window as any).analytics casts at the guard and when calling track; replace these with a proper typed Analytics interface and extend the global Window type (or declare a local type like AnalyticsType with a track(method:string, payload:Record):void signature) so TypeScript can validate usage, then use optional chaining or a typed window union (e.g., (window as Window & { analytics?: AnalyticsType })) instead of any and update both the guard and the analytics.track call to use the typed property.



============================================================================
File: lib/api-error-handler.ts
Line: 18 to 41
Type: nitpick

Comment:
Use consistent logger and improve type safety.

The error handling logic is generally sound, but has a few areas for improvement:

1. Inconsistent logging (Line 24): Uses console.error while other modules (e.g., lib/analytics/questionsEvents.ts) use the logger utility imported from @/lib/logger. Consider using the same logger for consistency.

2. Unsafe type assertion (Line 37): The pattern (error as Error & { code: string }) assumes the code property exists if the in check passes, but TypeScript doesn't narrow the type automatically. This is generally safe but could be more explicit:



+import { logger } from '@/lib/logger'
 import { NextResponse } from "next/server";
 import { APIError } from "@/types";
 
 export function handleAPIError(
   error: unknown,
   context: string,
   statusCode: number = 500
 ): NextResponse {
-  // Log the full error for debugging
-  console.error(${context} Error:, error);
+  logger.error(${context} Error:, context, error);
 
   // Extract error message
   const errorMessage = error instanceof Error ? error.message : "Unknown error";
 
   // Create standardized error response
   const apiError: APIError = {
     error: Failed to ${context},
     details: errorMessage,
   };
 
   // Add error code if available
-  if (error instanceof Error && "code" in error) {
-    apiError.code = (error as Error & { code: string }).code;
+  if (error instanceof Error && "code" in error && typeof (error as any).code === "string") {
+    apiError.code = (error as any).code;
   }

Prompt for AI Agent:
In lib/api-error-handler.ts around lines 18 to 41, replace the console.error call with the project logger (import logger from '@/lib/logger' if not already imported) to keep logging consistent, and tighten the code extraction by guarding the code property before assigning it to apiError (e.g., check "code" in error && typeof (error as any).code === 'string' then set apiError.code = (error as any).code) instead of the unchecked cast; ensure the logger import is added if missing and keep the rest of the response construction unchanged.

