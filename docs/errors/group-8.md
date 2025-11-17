============================================================================
File: contexts/WorkflowContext.tsx
Line: 60 to 64
Type: nitpick

Comment:
Optimize array comparison for performance.

Using JSON.stringify to compare arrays creates temporary strings and has O(n) complexity on every Convex update. This is inefficient, especially since the arrays are typically small.



Use a shallow array equality check:

function arraysEqual(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx])
}

// Then in useEffect:
if (
  prev.currentStep === progress.currentStep &&
  arraysEqual(prev.completedSteps, progress.completedSteps) &&
  arraysEqual(prev.skippedSteps, progress.skippedSteps)
) {
  return prev
}




============================================================================
File: components/dashboard/SearchBar.tsx
Line: 15
Type: nitpick

Comment:
Remove redundant transform class.

The transform class is redundant when using Tailwind's translate utilities. The -translate-y-1/2 class already applies the transform.



Apply this diff:

-      
+

Prompt for AI Agent:
In components/dashboard/SearchBar.tsx around line 15, the JSX for the Search icon includes a redundant "transform" class alongside "-translate-y-1/2"; remove the standalone "transform" class so only the translate utility remains (e.g., delete "transform" from the className string) to avoid duplicate transform declarations.



============================================================================
File: components/chat/ChatContainer.tsx
Line: 38 to 40
Type: potential_issue

Comment:
Use timestamp or unique ID as key instead of index.

Using array index as key can cause React reconciliation issues when messages are added, especially with the typing indicator toggling. The Message interface includes a timestamp field that could serve as a unique identifier.



Apply this diff:

-          {messages.map((message, index) => (
-            
+          {messages.map((message) => (
+            


Note: Ensure timestamps are unique. If multiple messages can have the same timestamp, consider adding a unique ID field to the Message interface.

Prompt for AI Agent:
In components/chat/ChatContainer.tsx around lines 38 to 40, the list is using the array index as the React key which can break reconciliation when messages are inserted/removed (e.g., typing indicator). Replace the key with a stable unique identifier: use message.timestamp if it is guaranteed unique, otherwise add/use a unique id field on the Message interface (or combine timestamp+id). Update the JSX to pass that unique value as the key for each ChatMessage and ensure the Message type and creation sites produce that unique id/timestamp.



============================================================================
File: convex/schema.ts
Line: 124 to 213
Type: nitpick

Comment:
Consider consolidating selection and selectedTechStack fields.

The extensive comment (lines 124-141) explaining two fields that serve the same purpose suggests a design that could cause confusion. Having parallel fields for auto vs. manual selection increases complexity and the risk of bugs when both fields are populated.



Consider a unified structure that includes the selection source:

techStackSelection: v.optional(
  v.object({
    method: v.union(v.literal("auto"), v.literal("manual")),
    timestamp: v.number(),
    categories: v.object({
      frontend: v.object({
        name: v.string(),
        reasoning: v.optional(v.string()),
        selectedFrom: v.optional(v.array(v.string())),
      }),
      // ... other categories
    })
  })
)


This eliminates the need to check two separate fields and makes the data model clearer. The PRD generation logic would check a single field instead of selection first, then selectedTechStack.




============================================================================
File: components/ClientBody.tsx
Line: 19 to 25
Type: nitpick

Comment:
Consider making extension attribute cleanup configurable.

Hardcoding the list of extension attributes to remove may be fragile. If other browser extensions add different attributes, this won't handle them.

Consider accepting an optional prop for attributes to clean up, or document why specifically cz-shortcut-listen needs removal:

 interface ClientBodyProps {
   className?: string
   children: React.ReactNode
+  extensionAttributesToClean?: string[]
 }

-export default function ClientBody({ className, children }: ClientBodyProps) {
+export default function ClientBody({ 
+  className, 
+  children,
+  extensionAttributesToClean = ['cz-shortcut-listen']
+}: ClientBodyProps) {
   const bodyRef = useRef(null)

   useEffect(() => {
     // ... className logic ...

     // Clean up any browser extension attributes that might cause hydration issues
-    const extensionAttributes = ['cz-shortcut-listen']
-    extensionAttributes.forEach(attr => {
+    extensionAttributesToClean.forEach(attr => {
       if (document.body.hasAttribute(attr)) {
         document.body.removeAttribute(attr)
       }
     })
   }, [className])

Prompt for AI Agent:
In components/ClientBody.tsx around lines 19 to 25 the list of extension attributes to remove is hardcoded which is brittle; change the component to accept an optional prop (e.g., attributesToClean?: string[]) with a default of ['cz-shortcut-listen'] and use that array instead of the hardcoded value, keep the existing behavior when the prop is not provided, ensure the DOM access is guarded (document && document.body) so SSR doesn't break, and update the component's TypeScript props type and any call sites or tests to pass a custom list where needed or rely on the default.



============================================================================
File: contexts/WorkflowContext.tsx
Line: 138 to 205
Type: nitpick

Comment:
Extract workflow step definitions to a constant.

The workflow steps array ['discovery', 'questions', 'research', 'selection', 'generate'] is duplicated in advanceToNextStep (line 139) and canNavigateToStep (line 200).



Extract to a constant at the module level:

const WORKFLOW_STEPS: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']

// Then use it:
const advanceToNextStep = async () => {
  const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
  // ...
}

const canNavigateToStep = (targetStep: WorkflowStep): boolean => {
  // ...
  const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
  const targetIndex = WORKFLOW_STEPS.indexOf(targetStep)
  // ...
}

Prompt for AI Agent:
In contexts/WorkflowContext.tsx around lines 138 to 205, the workflow steps array is duplicated; extract the array to a module-level constant (e.g., WORKFLOW_STEPS of type WorkflowStep[]) and replace the inline arrays in advanceToNextStep and canNavigateToStep with references to that constant, updating any indexOf calls to use WORKFLOW_STEPS so both functions share the single source of truth.



============================================================================
File: .claude/skills/agent-creating/SKILL.md
Line: 13 to 19
Type: potential_issue

Comment:
Fix ordered list numbering sequence.

The numbered list skips from step 3 to step 5. The sequence should be 1, 2, 3, 4, 5, 6 instead of 1, 2, 3, 5, 6, 7.



Apply this diff:

 1. Create a new file in .claude/agents with the agent name xyz.md (ex: "stripe-implementor" or "code-reviewer")
 2. Take the requested input given to you to turn into a re-usable agent.
 3. Be sure to have the description field be precise and explain what it does and how to use it - 2-4 sentences max
-5. Make sure it has a clear persona and goal
-6. Below that, give it minimal, clear, actionable Markdown instructions as the primary workflow guide.
-7. Be sure it knows the convexGuidelines.md
+4. Make sure it has a clear persona and goal
+5. Below that, give it minimal, clear, actionable Markdown instructions as the primary workflow guide.
+6. Be sure it knows the convexGuidelines.md

Prompt for AI Agent:
In .claude/skills/agent-creating/SKILL.md around lines 13 to 19, the ordered list skips from step 3 to step 5; renumber the sequence so it reads 1, 2, 3, 4, 5, 6 (move the current "Make sure it has a clear persona and goal" to item 4, shift subsequent items down one) ensuring the final line about knowing the convexGuidelines.md becomes item 6.



============================================================================
File: app/page.tsx
Line: 260
Type: nitpick

Comment:
Consider using a dynamic year for the copyright.

The copyright year is hardcoded as "2024". Consider using new Date().getFullYear() to keep it current automatically.



Apply this diff:

               
-                © 2024 VIBED. AI-Powered PRD Generation.
+                © {new Date().getFullYear()} VIBED. AI-Powered PRD Generation.

Prompt for AI Agent:
In app/page.tsx around line 260, the footer has a hardcoded copyright "© 2024 VIBED. AI-Powered PRD Generation."; replace the literal year with a dynamic expression using new Date().getFullYear() so the rendered text reads something like © ${new Date().getFullYear()} VIBED. AI-Powered PRD Generation. ensuring the component renders the expression rather than the static string.



============================================================================
File: app/chat/[conversationId]/tech-stack/page.tsx
Line: 389 to 390
Type: nitpick

Comment:
Extract complex boolean to improve readability.

The nextButtonDisabled prop has five conditions ANDed together. Consider extracting to a named variable to improve readability and make the logic self-documenting.



+  const isNextDisabled = 
+    isResearching || 
+    isValidating || 
+    hasErrors || 
+    selectedCount  router.push(/chat/${conversationId}/questions)}
       onNext={handleContinue}
       nextButtonText={isValidating ? "Validating..." : "Generate PRD"}
-      nextButtonDisabled={isResearching || isValidating || hasErrors || selectedCount

Prompt for AI Agent:
In app/chat/[conversationId]/tech-stack/page.tsx around lines 389 to 390, the nextButtonDisabled expression chains five AND conditions which hurts readability; extract those conditions into a clearly named boolean (e.g., isNextButtonDisabled or canProceed) above the JSX, compute it from isResearching, isValidating, hasErrors, selectedCount < categories.length, and !hasExistingResults, then pass that variable into nextButtonDisabled to make the intent self-documenting.



============================================================================
File: app/page.tsx
Line: 26 to 28
Type: nitpick

Comment:
Consider removing router from the dependency array.

The Next.js router from useRouter() is a stable reference and doesn't need to be in the dependency array. An empty array would be more conventional and prevent potential unnecessary re-execution.



Apply this diff:

   useEffect(() => {
     router.push('/dashboard');
-  }, [router]);
+  }, []);

Prompt for AI Agent:
In app/page.tsx around lines 26 to 28, the useEffect currently lists router in the dependency array which is unnecessary; change the dependency array to be empty (useEffect(() => { router.push('/dashboard'); }, [])) so the redirect runs only once on mount and remove router from the array; ensure any linter exceptions are handled if required (e.g., add a comment to disable the exhaustive-deps rule for this line).



============================================================================
File: components/workflow/AutoAdvance.tsx
Line: 50
Type: potential_issue

Comment:
Potential division by zero if delaySeconds is 0.

If delaySeconds is set to 0, the progress calculation ((delaySeconds - countdown) / delaySeconds) * 100 will result in NaN. While the component likely won't render in this case (countdown would immediately trigger onAdvance), it's safer to guard against this edge case.



-  const progressPercent = ((delaySeconds - countdown) / delaySeconds) * 100
+  const progressPercent = delaySeconds > 0 ? ((delaySeconds - countdown) / delaySeconds) * 100 : 100

Prompt for AI Agent:
In components/workflow/AutoAdvance.tsx around line 50, the calculation for progressPercent does not guard against delaySeconds being 0 which can produce NaN; change the logic to check for delaySeconds <= 0 and assign a sensible fallback (for example 100 if countdown <= 0 or 0 otherwise) before performing the division so you never divide by zero; ensure the progressPercent stays bounded (0–100) and use that value where currently used.



============================================================================
File: components/workflow/WorkflowProgress.tsx
Line: 22 to 35
Type: nitpick

Comment:
Consider using responsive CSS instead of rendering both components.

Both DesktopWorkflow and MobileWorkflow are rendered unconditionally, which means both components are always in the DOM even when only one is visible. This can lead to:
- Unnecessary React reconciliation overhead
- Duplicate content for screen readers if not handled properly
- Potential state synchronization issues between the two components



Apply responsive CSS classes to control visibility:

  return (
    
-      
+        
+      
+      
+        
+      
-      
    
  );


Alternatively, if these components have expensive initialization or you want to avoid rendering both entirely, use a client-side media query hook to conditionally render only one component.

Prompt for AI Agent:
components/workflow/WorkflowProgress.tsx around lines 22-35: both DesktopWorkflow and MobileWorkflow are rendered unconditionally causing unnecessary DOM nodes and work; either apply responsive CSS visibility classes so only the appropriate component is visible (e.g., hide mobile on md+ and hide desktop on small screens) or use a client-side media-query hook (useMediaQuery/useEffect with window.matchMedia) to conditionally render only the matching component, and pass through the same props; choose CSS if components are cheap, or the media-query hook if you must avoid initializing both.



============================================================================
File: app/api/questions/generate/route.ts
Line: 76
Type: refactor_suggestion

Comment:
Replace  with proper type for parseAIResponse.

Using  defeats the purpose of TypeScript's type safety. The parsed response should conform to a specific schema before being normalized.



Define and use a proper type:

+// Define the raw AI response structure
+interface RawQuestionResponse {
+  questions: Array; // For nested structure
+  }>;
+}
+
  // Parse AI response using centralized utility
- const parsedResponse = parseAIResponse(content.text);
+ const parsedResponse = parseAIResponse(content.text);

Prompt for AI Agent:
In app/api/questions/generate/route.ts around line 76, the call parseAIResponse(content.text) uses any which removes TypeScript safety; define a concrete type (e.g., an interface or type alias matching the expected AI response schema: required fields, optional fields and their precise types) or a Zod schema that models the shape returned by the AI, replace  with that type (or z.infer), and ensure parseAIResponse is called with that type so the parsedResponse has correct typings before normalization; if parseAIResponse needs runtime validation, wire the Zod schema into it or validate the parsed object immediately after parsing and throw/log on mismatch.



============================================================================
File: components/workflow/AutoAdvance.tsx
Line: 24
Type: potential_issue

Comment:
Consider resetting countdown when enabled changes.

If enabled switches from false to true, the countdown won't reset to delaySeconds because the state is only initialized once. This could show a stale countdown value or immediately advance.



Add an effect to reset countdown when enabled changes:

  const [countdown, setCountdown] = useState(delaySeconds)
  const [isPaused, setIsPaused] = useState(false)
+
+  // Reset countdown when enabled changes to true
+  useEffect(() => {
+    if (enabled) {
+      setCountdown(delaySeconds)
+      setIsPaused(false)
+    }
+  }, [enabled, delaySeconds])

Prompt for AI Agent:
In components/workflow/AutoAdvance.tsx around line 24, the countdown state is only initialized once so when enabled flips from false to true the countdown can be stale; add a useEffect that watches enabled (and delaySeconds) and calls setCountdown(delaySeconds) when enabled becomes true (or whenever enabled/delaySeconds change) so the timer always starts at the correct value; ensure the effect dependency array includes enabled and delaySeconds.



============================================================================
File: components/workflow/AutoAdvance.tsx
Line: 27 to 41
Type: potential_issue

Comment:
Potential issue: onAdvance in dependency array may cause countdown resets.

The useEffect includes onAdvance in its dependency array (line 41). If the parent component doesn't wrap onAdvance with useCallback, it will create a new function reference on every render, causing the effect to re-run and potentially resetting the countdown unexpectedly.



Fix: Request that parent components memoize the callback, or remove it from dependencies with a ref pattern:

+'use client'
+
+import { useEffect, useState, useRef } from 'react'
+
 export function AutoAdvance({
   enabled,
   delaySeconds = 5,
   nextStepName,
   onAdvance,
   onCancel,
 }: AutoAdvanceProps) {
   const [countdown, setCountdown] = useState(delaySeconds)
   const [isPaused, setIsPaused] = useState(false)
+  const onAdvanceRef = useRef(onAdvance)
+
+  // Keep ref up to date
+  useEffect(() => {
+    onAdvanceRef.current = onAdvance
+  }, [onAdvance])

   useEffect(() => {
     if (!enabled || isPaused) return undefined

     if (countdown > 0) {
       const timer = setTimeout(() => {
         setCountdown(countdown - 1)
       }, 1000)

       return () => clearTimeout(timer)
     } else {
       // Countdown finished, advance
-      onAdvance()
+      onAdvanceRef.current()
     }
     return undefined
-  }, [enabled, countdown, isPaused, onAdvance])
+  }, [enabled, countdown, isPaused])

Prompt for AI Agent:
In components/workflow/AutoAdvance.tsx around lines 27 to 41, the effect lists onAdvance in the dependency array which can cause the countdown to reset whenever a new function reference is passed; either require parent components to wrap onAdvance in useCallback or make the callback stable inside this component by storing onAdvance in a ref and using ref.current when the countdown finishes, then remove onAdvance from the effect deps so the effect depends only on enabled, countdown and isPaused (and ensure the ref is kept up-to-date in a separate effect).



