============================================================================
File: components/research/ResearchProgress.tsx
Line: 6 to 10
Type: nitpick

Comment:
Unused icon property in ResearchCategory.

The icon property is defined in the interface but never rendered in the component. Consider removing it if not needed, or implement its usage.

If the icon should be displayed, add it to the rendering:

 
+  {category.icon && {category.icon}}
   {/ status icons /}
   {category.name}
 


Otherwise, remove it from the interface:

 interface ResearchCategory {
   name: string;
   status: "pending" | "in_progress" | "completed" | "failed";
-  icon?: React.ReactNode;
 }




============================================================================
File: components/export/ExportButtons.tsx
Line: 30 to 44
Type: potential_issue

Comment:
Add error handling and user feedback for export failures.

The handleExport function doesn't handle errors from onExportJSON or onExportPDF. If these handlers throw, the user gets no feedback about the failure, and the loading state is simply reset.

Apply this diff to add error handling:

 const handleExport = async (type: "json" | "pdf") => {
   setIsExporting(true);
   setExportType(type);

   try {
     if (type === "json") {
       await onExportJSON();
     } else {
       await onExportPDF();
     }
   } catch (error) {
+    console.error(Export failed for ${type}:, error);
+    // Consider showing a toast notification here
+    // toast.error(Failed to export ${type.toUpperCase()})
+    throw error; // Re-throw to allow parent component to handle
   } finally {
     setIsExporting(false);
     setExportType(null);
   }
 };

Prompt for AI Agent:
In components/export/ExportButtons.tsx around lines 30-44, the handleExport function does not handle errors from onExportJSON/onExportPDF; wrap the await calls in a try/catch/finally so errors are caught, log the error (console.error or a logger), and surface user feedback by calling the app's toast/notification helper (or set a local error state and render an error message) with a clear message like "Export failed" plus the error message; keep resetting isExporting and exportType in finally so loading state is always cleared.



============================================================================
File: app/api/conversation/message/route.ts
Line: 38 to 41
Type: refactor_suggestion

Comment:
Improve error message specificity.

The error "Unexpected response type" doesn't provide enough context for debugging. Include details about what was received.

 const assistantMessage = response.content[0];
 if (!assistantMessage || assistantMessage.type !== "text") {
-  throw new Error("Unexpected response type");
+  throw new Error(
+    Unexpected response type: expected 'text', got '${assistantMessage?.type || 'undefined'}'
+  );
 }

Prompt for AI Agent:
In app/api/conversation/message/route.ts around lines 38 to 41, the thrown error "Unexpected response type" is too vague; update the throw to include the actual received value/type for easier debugging (e.g. inspect response.content[0] and include its type and JSON representation in the error message). Ensure the message clearly states what was expected (type === "text") and what was received, e.g. throw new Error(Unexpected response type: expected "text", received ${typeof value} - ${JSON.stringify(value)}).



============================================================================
File: components/nav-main.tsx
Line: 1
Type: nitpick

Comment:
Add missing semicolon for consistency.

Line 1 is missing a semicolon after "use client", which is inconsistent with the semicolon usage in the rest of the codebase.



Apply this diff:

-"use client"
+"use client";

Prompt for AI Agent:
In components/nav-main.tsx around line 1, add a semicolon after the "use client" directive (i.e., change "use client" to "use client";) to match the project's semicolon style and keep consistency with the rest of the codebase.



============================================================================
File: docs/styling-guide.md
Line: 197 to 203
Type: nitpick

Comment:
Add language identifier to fenced code block.

The breakpoints section uses a fenced code block without a language identifier. While this renders fine, specifying the language improves syntax highlighting and accessibility.



Apply this diff:

-
+ sm: 640px
 md: 768px
 lg: 1024px
 xl: 1280px
 2xl: 1536px
 
```

Prompt for AI Agent:
In docs/styling-guide.md around lines 197 to 203, the fenced code block showing breakpoints is missing a language identifier; update the block to use text as the opening fence (and keep the content lines as shown) so the block becomes text ... ``` to enable proper highlighting/accessibility.



============================================================================
File: lib/convex-client.ts
Line: 1 to 28
Type: nitpick

Comment:
LGTM! Well-structured client setup.

The environment variable validation at startup and comprehensive documentation are excellent. The deprecation notice for the unauthenticated client is clear in the comments.




Optional: If the unauthenticated convexClient export is truly deprecated, consider adding a runtime console.warn() when it's imported to encourage migration to getAuthenticatedConvexClient().

Prompt for AI Agent:
In lib/convex-client.ts around lines 1 to 28, the unauthenticated export convexClient is marked deprecated but currently gives no runtime signal; add a runtime warning to encourage migration to getAuthenticatedConvexClient() by emitting a single console.warn() (or process.warn) when this module is loaded/imported, ensuring the message clearly states the deprecation and recommends getAuthenticatedConvexClient(); keep the existing env check and export intact, and make the warning lightweight and safe for server-run API routes.



============================================================================
File: lib/workflow/guards.ts
Line: 4 to 63
Type: refactor_suggestion

Comment:
Eliminate code duplication for maintainability.

The steps array and route mappings are duplicated across multiple functions. This violates the DRY principle and can lead to inconsistencies if updated in one place but not others.



Apply this diff to extract shared constants:

 import { WorkflowStep } from '@/contexts/WorkflowContext'
 import { redirect } from 'next/navigation'

+const WORKFLOW_STEPS: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+
+const STEP_ROUTES: Record string> = {
+  discovery: (conversationId) => /chat/${conversationId},
+  questions: (conversationId) => /chat/${conversationId}/questions,
+  research: (conversationId) => /chat/${conversationId}/research,
+  selection: (conversationId) => /chat/${conversationId}/select,
+  generate: (conversationId) => /chat/${conversationId}/generate,
+}
+
 export function enforceWorkflowOrder(
   requestedStep: WorkflowStep,
   currentStep: WorkflowStep,
   completedSteps: WorkflowStep[],
   conversationId: string
 ): void {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']

   // Allow navigation to completed steps
   if (completedSteps.includes(requestedStep)) {
     return
   }

   // Allow navigation to current step
   if (requestedStep === currentStep) {
     return
   }

   // Allow navigation to next step only
-  const currentIndex = steps.indexOf(currentStep)
-  const requestedIndex = steps.indexOf(requestedStep)
+  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep)
+  const requestedIndex = WORKFLOW_STEPS.indexOf(requestedStep)

   if (requestedIndex === currentIndex + 1) {
     return
   }

   // Otherwise, redirect to current step
-  const stepRoutes: Record = {
-    discovery: /chat/${conversationId},
-    questions: /chat/${conversationId}/questions,
-    research: /chat/${conversationId}/research,
-    selection: /chat/${conversationId}/select,
-    generate: /chat/${conversationId}/generate,
-  }
-
-  redirect(stepRoutes[currentStep])
+  redirect(STEP_ROUTEScurrentStep)
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
+  return STEP_ROUTESstep
 }

 export function getNextStepRoute(currentStep: WorkflowStep, conversationId: string): string | null {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
-  const currentIndex = steps.indexOf(currentStep)
+  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep)

-  if (currentIndex < steps.length - 1) {
-    const nextStep = steps[currentIndex + 1]
+  if (currentIndex < WORKFLOW_STEPS.length - 1) {
+    const nextStep = WORKFLOW_STEPS[currentIndex + 1]
     return getStepRoute(nextStep as WorkflowStep, conversationId)
   }

   return null
 }

Prompt for AI Agent:
In lib/workflow/guards.ts around lines 4 to 63, the steps array and route mappings are duplicated across functions; extract a single top-level constant for the ordered steps (e.g., const STEPS: WorkflowStep[] = [...]) and a single top-level mapping for routes (e.g., const STEP_ROUTES: Record = {...}) and replace the local definitions inside enforceWorkflowOrder, getStepRoute, and getNextStepRoute to reference these shared constants; update getStepRoute to return STEP_ROUTES[step], getNextStepRoute to use STEPS for index math, and have enforceWorkflowOrder use STEPS and STEP_ROUTES for index lookups and redirect, ensuring types remain WorkflowStep and no duplicate arrays/mappings remain.



============================================================================
File: lib/errors.ts
Line: 5 to 49
Type: nitpick

Comment:
Ensure proper prototype chain for custom Error classes.

When extending built-in classes like Error in TypeScript (especially when targeting ES5 or lower), the prototype chain can break, causing instanceof checks to fail and losing prototype methods.



Add Object.setPrototypeOf(this, ClassName.prototype) after the super() call in each error class constructor:

 export class NotAuthenticatedError extends Error {
   constructor(message = "Not authenticated") {
     super(message);
     this.name = "NotAuthenticatedError";
+    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
   }
 }

 export class UnauthorizedError extends Error {
   constructor(resource: string) {
     super(Unauthorized access to ${resource});
     this.name = "UnauthorizedError";
+    Object.setPrototypeOf(this, UnauthorizedError.prototype);
   }
 }

 export class ResourceNotFoundError extends Error {
   constructor(resource: string, id?: string) {
     super(id ? ${resource} with ID ${id} not found : ${resource} not found);
     this.name = "ResourceNotFoundError";
+    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
   }
 }

 export class ValidationError extends Error {
   constructor(message: string, public details?: string) {
     super(message);
     this.name = "ValidationError";
+    Object.setPrototypeOf(this, ValidationError.prototype);
   }
 }

 export class APITimeoutError extends Error {
   constructor(service: string, timeout: number) {
     super(${service} request timed out after ${timeout}ms);
     this.name = "APITimeoutError";
+    Object.setPrototypeOf(this, APITimeoutError.prototype);
   }
 }

 export class RateLimitError extends Error {
   constructor(service: string, retryAfter?: number) {
     super(
       retryAfter
         ? Rate limit exceeded for ${service}. Retry after ${retryAfter}s
         : Rate limit exceeded for ${service}
     );
     this.name = "RateLimitError";
+    Object.setPrototypeOf(this, RateLimitError.prototype);
   }
 }

Prompt for AI Agent:
In lib/errors.ts around lines 5 to 49, the custom Error subclasses may break the prototype chain when compiled to older targets; after each super(...) call in every constructor add Object.setPrototypeOf(this, .prototype) (e.g., Object.setPrototypeOf(this, NotAuthenticatedError.prototype)) to restore the prototype chain and preserve instanceof checks and prototype methods while keeping the existing this.name assignments and constructor behavior.



============================================================================
File: .claude/skills/skill-creating/SKILL.md
Line: 23 to 49
Type: nitpick

Comment:
Address markdown formatting issues.

The static analysis tool identified valid formatting issues:
- Lines 23, 25: Use ATX-style headings (# Heading) instead of setext-style (underline with ---)
- Missing blank lines around headings
- Line 49: Missing trailing newline

These are minor formatting issues but improve consistency.

Prompt for AI Agent:
.in .claude/skills/skill-creating/SKILL.md around lines 23 to 49, the file uses setext-style underlined headings and lacks proper blank lines and a trailing newline; replace any setext-style headings (underlines with ---) with ATX-style headings (prefix with #), ensure there is a blank line above and below each heading, and add a final newline at EOF so the file ends with a trailing newline.



============================================================================
File: hooks/use-toast.ts
Line: 112 to 122
Type: potential_issue

Comment:
Potential memory leak: Clear timeout when removing toast.

When REMOVE_TOAST is dispatched, the corresponding timeout in the toastTimeouts Map should be cleared to prevent memory leaks and unnecessary timer callbacks.



Apply this diff to clear timeouts when removing toasts:

     case "REMOVE_TOAST":
       if (action.toastId === undefined) {
+        toastTimeouts.forEach((timeout) => clearTimeout(timeout))
+        toastTimeouts.clear()
         return {
           ...state,
           toasts: [],
         }
       }
+      const timeout = toastTimeouts.get(action.toastId)
+      if (timeout) {
+        clearTimeout(timeout)
+        toastTimeouts.delete(action.toastId)
+      }
       return {
         ...state,
         toasts: state.toasts.filter((t) => t.id !== action.toastId),
       }

Prompt for AI Agent:
In hooks/use-toast.ts around lines 112 to 122, the REMOVE_TOAST branch currently removes toasts from state but does not clear any associated timers in the toastTimeouts Map; update the reducer to clear the timeout for the removed toast (if action.toastId is undefined, iterate all timeouts and clear them and then clear the Map) and delete the specific toastId entry from toastTimeouts after calling clearTimeout, ensuring you avoid calling clearTimeout with undefined and keep toastTimeouts in sync with state.



============================================================================
File: components/export/pdf/TimelinePage.tsx
Line: 23 to 34
Type: nitpick

Comment:
Consider using stable identifiers instead of array indices as keys.

Similar to the FeaturesPage component, this uses array indices as React keys. While acceptable for static PDF rendering, stable IDs would be more robust.



If phase and deliverable objects have stable identifiers:

-        {prd.timeline.phases.map((phase, i) => (
-          
+        {prd.timeline.phases.map((phase) => (
+          
             
               {phase.name} ({phase.duration})
             
-            {phase.deliverables.map((deliverable, j) => (
-              
+            {phase.deliverables.map((deliverable, index) => (
+              
                 • {deliverable}
               
             ))}

Prompt for AI Agent:
In components/export/pdf/TimelinePage.tsx around lines 23 to 34, the map uses array indices as React keys which is fragile; replace those indices with stable identifiers. If phase and deliverable objects have IDs, use them (e.g. phase.id and deliverable.id) as the key; if they lack IDs, derive a stable key from immutable fields (e.g. combine phase.name and phase.startDate or deliverable text with parent phase id) rather than the loop index. Update both the phase and deliverable key props accordingly to ensure keys remain stable across renders.



============================================================================
File: app/chat/[conversationId]/select/page.tsx
Line: 14 to 20
Type: nitpick

Comment:
Consider removing toast from dependencies.

Including toast in the dependency array may cause the effect to re-run unnecessarily if the toast function reference changes. Since this is a one-time redirect on mount, the effect should only depend on values that affect the redirect URL.



Apply this diff:

  useEffect(() => {
    toast({
      title: "Page Updated",
      description: "Research and Selection have been merged into a single Tech Stack page.",
    });
    router.replace(/chat/${conversationId}/tech-stack);
- }, [conversationId, router, toast]);
+ }, [conversationId, router]);
+ // eslint-disable-next-line react-hooks/exhaustive-deps


Alternatively, if you want to keep the linter happy without the disable comment, you can safely include toast but be aware it may cause extra renders if the function isn't memoized by the hook.

Prompt for AI Agent:
In app/chat/[conversationId]/select/page.tsx around lines 14 to 20, the useEffect currently lists toast in its dependency array which can cause unnecessary re-runs if the toast function reference changes; remove toast from the dependencies so the effect only depends on conversationId and router (i.e., change the deps to [conversationId, router]) to ensure the one-time redirect on mount is stable and won’t re-trigger due to a non-memoized toast reference.



============================================================================
File: components/prd/GenerationProgress.tsx
Line: 36 to 44
Type: nitpick

Comment:
Consider extracting status icon rendering to a helper function.

The repeated conditional rendering of status icons could be simplified with a helper function.

+const getStatusIcon = (status: GenerationStep['status']) => {
+  switch (status) {
+    case 'completed':
+      return 
+    case 'in_progress':
+      return 
+    case 'pending':
+      return 
+  }
+}
+
 export function GenerationProgress({ steps }: GenerationProgressProps) {
   // ...
   {steps.map((step) => (
     
-      {step.status === "completed" && (
-        
-      )}
-      {step.status === "in_progress" && (
-        
-      )}
-      {step.status === "pending" && (
-        
-      )}
+      {getStatusIcon(step.status)}
       
         {step.name}
       
     
   ))}

Prompt for AI Agent:
In components/prd/GenerationProgress.tsx around lines 36 to 44, the JSX repeats conditional rendering for each step.status ("completed", "in_progress", "pending"); extract that logic into a small helper function (e.g., renderStatusIcon(status): JSX.Element) located in the same file or above the component, map statuses to the correct icon/props (CheckCircle2 for completed, Loader2 with animate-spin for in_progress, a div for pending) and replace the three conditional blocks with a single call to that helper passing step.status; keep types (union or string) for the status param and ensure any required imports remain available.



============================================================================
File: app/chat/new/page.tsx
Line: 14 to 36
Type: nitpick

Comment:
LGTM with suggestions for improvement.

The cleanup pattern with the mounted flag prevents state updates after unmount, which is good. However, note that this doesn't cancel the in-flight Convex mutation—it will still complete on the server even if the user navigates away.

The dependencies array is correct. Convex's useMutation returns a stable function reference, so this effect will only run once on mount.




Optional improvements:
1. Consider adding a short delay/loading state before showing the error to handle transient network issues
2. The auto-trigger pattern on mount means this page can't be bookmarked or directly accessed without creating a new conversation each time, which appears intentional

Prompt for AI Agent:
In app/chat/new/page.tsx around lines 14 to 36, the effect immediately forwards to creating a conversation and sets error state immediately on failure; add a brief "show loading" state and delay showing the error to avoid flashing transient network blips, and ensure any timers are cleared in the cleanup; specifically, set a loading boolean before calling createConversation, on catch start a short timeout (e.g. 300–500ms) before calling setError, store the timeout id so you can clear it in the return cleanup along with the mounted flag, and keep the mounted guard when pushing or setting state; optionally make the auto-create behavior conditional (e.g. only auto-create when a query param or flag is present) so the page can be bookmarked without always creating a new conversation.



============================================================================
File: components/export/ExportButtons.tsx
Line: 55
Type: nitpick

Comment:
Guard against null in export type display.

Although exportType uses optional chaining, it could theoretically display "Exporting NULL..." if exportType is null. However, this is protected by the isExporting check in practice.

For defensive coding, make the logic more explicit:

-{isExporting ? Exporting ${exportType?.toUpperCase()}... : "Export PRD"}
+{isExporting && exportType ? Exporting ${exportType.toUpperCase()}... : isExporting ? "Exporting..." : "Export PRD"}

Prompt for AI Agent:
In components/export/ExportButtons.tsx around line 55, the displayed string uses exportType?.toUpperCase() which could render "Exporting NULL..." if exportType is null; update the conditional rendering to defensively handle null/undefined by providing a safe fallback (e.g., compute a displayType from exportType that uses a default like "EXPORT" or an empty string when nullish) and use that safe displayType in the ternary so "Exporting ..." never shows "NULL".



