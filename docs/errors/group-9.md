============================================================================
File: components/section-cards.tsx
Line: 13 to 102
Type: nitpick

Comment:
Consider making this component data-driven.

This component contains hardcoded demo data for all metrics. For production use, consider accepting data via props to make it reusable across different dashboards.



Example refactor:

+interface SectionCardsProps {
+  cards: Array;
+}
+
-export function SectionCards() {
+export function SectionCards({ cards }: SectionCardsProps) {
   return (
     
-      
-        
-          Total Revenue
-          
-            $1,250.00
-          
-          
-            
-              
-              +12.5%
-            
-          
-        
-        
-          
-            Trending up this month 
-          
-          
-            Visitors for the last 6 months
-          
-        
-      
+      {cards.map((card, index) => (
+        
+          
+            {card.description}
+            
+              {card.value}
+            
+            
+              
+                {card.trend.direction === 'up' ?  : }
+                {card.trend.percentage}
+              
+            
+          
+          
+            
+              {card.footer.primary}
+            
+            {card.footer.secondary}
+          
+        
+      ))}
     
   )
 }

Prompt for AI Agent:
In components/section-cards.tsx around lines 13 to 102, the component currently renders four cards with hardcoded metric data; refactor it to be data-driven by accepting a prop (e.g., metrics: Array) and mapping over that array to render Card instances, generate stable keys (id or index), and forward any className or container props for layout; validate/typify the props (TS interface or PropTypes), provide sensible defaults or a fallback demo dataset for backward compatibility, and update any consuming code to pass the metrics array rather than relying on hardcoded values.



============================================================================
File: app/api/conversation/extract-context/route.ts
Line: 29 to 36
Type: nitpick

Comment:
Optimize ensureArray helper.

Line 35 maps filtered strings to String(el), which is redundant since the filter already ensures elements are strings.



Apply this diff:

 const ensureArray = (value: unknown): string[] => {
   if (!Array.isArray(value)) {
     return [];
   }
-  return value
-    .filter((el) => typeof el === "string")
-    .map((el) => String(el));
+  return value.filter((el): el is string => typeof el === "string");
 };

Prompt for AI Agent:
In app/api/conversation/extract-context/route.ts around lines 29 to 36, the ensureArray helper unnecessarily maps filtered strings to String(el); remove the .map call and return the filtered array directly (cast or let TypeScript infer it as string[]). Update the function to: if not an array return [], otherwise return value.filter((el) => typeof el === "string") as string[] (or equivalent) so you avoid redundant conversions.



============================================================================
File: components/research/ResearchResults.tsx
Line: 34 to 35
Type: nitpick

Comment:
Use a stable unique key instead of index.

Using array index as a key can cause React reconciliation issues if the options array is reordered, filtered, or items are added/removed. Consider using option.name or adding a unique id field to TechOption.



Apply this diff:

-          {options.map((option, index) => (
-            
+          {options.map((option) => (
+

Prompt for AI Agent:
In components/research/ResearchResults.tsx around lines 34-35, the code uses the array index as the React key for AccordionItem which can break reconciliation when the options list changes; replace the index key with a stable unique identifier from each option (preferably a dedicated id like option.id, or fallback to a stable field such as option.name or a composite key like ${option.name}-${option.someOtherStableField}), and update the AccordionItem value to use the same stable identifier so keys remain consistent across renders.



============================================================================
File: components/workflow/PageTransition.tsx
Line: 12 to 27
Type: nitpick

Comment:
Consider making pageKey required or provide a default value.

The pageKey prop is optional but used as the key for motion.div. If pageKey is undefined, all transitions will use the same key, which means AnimatePresence won't trigger animations between different pages. Consider either making it required or providing a default value.



Option 1: Make it required:
 interface PageTransitionProps {
   children: ReactNode
   className?: string
-  pageKey?: string
+  pageKey: string
 }


Option 2: Provide a default:
-export function PageTransition({ children, className, pageKey }: PageTransitionProps) {
+export function PageTransition({ children, className, pageKey = 'default' }: PageTransitionProps) {

Prompt for AI Agent:
In components/workflow/PageTransition.tsx around lines 12 to 27, pageKey is optional but used as the React key for motion.div which can prevent AnimatePresence from detecting page changes when undefined; make pageKey required on PageTransitionProps or ensure a stable default (for example derive from location/path or fallback to a unique string like children-specific id) and update the component signature and props type accordingly so the key is always defined; adjust any call sites to pass the new required prop or rely on the provided default.



============================================================================
File: app/api/questions/generate/route.ts
Line: 36 to 49
Type: potential_issue

Comment:
Unsafe access to optional array fields in extractedContext.

Lines 42 and 43 access keyFeatures and technicalPreferences with .join() without checking if they exist or are arrays. If extractedContext is malformed or these fields are undefined, this will throw a runtime error.



Add null-safe access:

  if (extractedContext) {
    contextSection = 
PRODUCT CONTEXT (extracted from discovery):
- Product: ${extractedContext.productName}
- Description: ${extractedContext.description}
- Target Audience: ${extractedContext.targetAudience}
-- Key Features: ${extractedContext.keyFeatures.join(", ")}
+- Key Features: ${extractedContext.keyFeatures?.join(", ") || "None specified"}
- Problem: ${extractedContext.problemStatement}
-- Technical Preferences: ${extractedContext.technicalPreferences.join(", ")}
+- Technical Preferences: ${extractedContext.technicalPreferences?.join(", ") || "None specified"}

Use this context to generate highly relevant questions.
;

Prompt for AI Agent:
In app/api/questions/generate/route.ts around lines 36 to 49, the template uses extractedContext.keyFeatures.join(...) and extractedContext.technicalPreferences.join(...) without null/type checks which will throw if those fields are missing or not arrays; update the code to safely handle missing or non-array values by using Array.isArray(...) checks (or casting to an array) and defaulting to an empty array or a safe string before joining (e.g., const keyFeatures = Array.isArray(extractedContext.keyFeatures) ? extractedContext.keyFeatures.join(', ') : ''; then use keyFeatures in the template), ensuring no runtime errors when fields are undefined or malformed.



============================================================================
File: components/export/pdf/TechStackPage.tsx
Line: 23 to 25
Type: nitpick

Comment:
Consider more robust key formatting.

The capitalization logic key.charAt(0).toUpperCase() + key.slice(1) works for simple keys but won't properly format camelCase keys like "frontendFramework" (would show "FrontendFramework" instead of "Frontend Framework").


Consider a helper to convert camelCase to title case:

const formatKey = (key: string) => 
  key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

Prompt for AI Agent:
In components/export/pdf/TechStackPage.tsx around lines 23 to 25, the current capitalization logic key.charAt(0).toUpperCase() + key.slice(1) fails for camelCase keys (e.g., "frontendFramework" → "FrontendFramework"); add a small helper function (e.g., formatKey) that converts camelCase to title case by inserting spaces before capital letters and capitalizing the first character, then replace the existing inline expression with a call to this helper to render user-friendly section titles.



============================================================================
File: convex/workflow.ts
Line: 67 to 71
Type: potential_issue

Comment:
Add validation for step parameter.

The completeStep and skipStep mutations accept v.string() for the step parameter but don't validate it against the known workflow steps. This allows arbitrary strings to be added to completedSteps and skippedSteps, creating data inconsistency.



Apply this diff to add validation:

 export const completeStep = mutation({
   args: {
     conversationId: v.id("conversations"),
-    step: v.string(),
+    step: v.union(
+      v.literal("discovery"),
+      v.literal("questions"),
+      v.literal("tech-stack"),
+      v.literal("generate")
+    ),
   },


Apply the same change to skipStep at lines 108-112.




============================================================================
File: components/dashboard/ProfileMenu.tsx
Line: 33 to 42
Type: nitpick

Comment:
Simplify initials calculation.

The initials logic is overly complex with multiple chained operations. Consider simplifying:



Apply this diff for a more readable implementation:

-  // Safely compute initials with proper fallbacks
-  const nameParts = userName
-    .trim()
-    .split(/\s+/)
-    .filter(part => part.length > 0)
-    .map(part => part[0])
-    .filter(char => char !== undefined);
-
-  const initials = nameParts.length > 0
-    ? nameParts.join('').toUpperCase().slice(0, 2)
-    : (userEmail[0]?.toUpperCase() || "U");
+  // Safely compute initials with proper fallbacks
+  const nameParts = userName.trim().split(/\s+/);
+  const initials = nameParts.length > 0 && nameParts[0]
+    ? nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2)
+    : (userEmail[0]?.toUpperCase() || "U");

Prompt for AI Agent:
In components/dashboard/ProfileMenu.tsx around lines 33 to 42, the initials calculation is over‑complicated with multiple chained operations; simplify it by trimming and splitting the userName into words, take the first character of the first two words (if present), join and uppercase them, and if no name parts exist fall back to the first character of userEmail uppercased or "U". Implement this as a small, clear sequence: get words = userName.trim().split(/\s+/).filter(Boolean), build initials from words[0][0] and words[1][0] when available, uppercase and slice(0,2), otherwise use userEmail[0]?.toUpperCase() || "U".



============================================================================
File: lib/analytics/techStackEvents.ts
Line: 73 to 87
Type: potential_issue

Comment:
Remove unused parameters or emit them in the event.

The trackDefaultStackModified function accepts originalStack and modifiedStack parameters but never uses them in the tracked event. This suggests either an incomplete implementation or parameters that should be removed.



Choose one of these fixes:

Option 1: Remove unused parameters (if the data isn't needed):
 export function trackDefaultStackModified(data: {
   conversationId: string
-  originalStack: any
-  modifiedStack: any
   changedFields: string[]
 }) {


Option 2: Include the data in the event (if it should be tracked):
 (window as any).analytics.track('Default Stack Modified', {
   conversation_id: data.conversationId,
   changed_fields: data.changedFields,
   changes_count: data.changedFields.length,
+  original_stack: data.originalStack,
+  modified_stack: data.modifiedStack,
   timestamp: new Date().toISOString(),
 })

Prompt for AI Agent:
In lib/analytics/techStackEvents.ts around lines 73–87, the function signature accepts originalStack and modifiedStack but never uses them; either remove these unused parameters from the function signature and update any call sites to stop passing them, or (if stack snapshots should be tracked) include them in the analytics payload (e.g., add original_stack and modified_stack fields, serializing safely or redacting sensitive parts) and ensure payload size is reasonable; pick one approach and apply it consistently across callers and tests.



============================================================================
File: components/ui/button.tsx
Line: 7 to 35
Type: nitpick

Comment:
Consider breaking up the long base className string.

Line 8 contains a very long className string (300+ characters) that's difficult to read and maintain. Consider splitting it across multiple lines or extracting shared utilities.


Example:

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium",
    "transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    "hover:scale-105 active:scale-95"
  ].join(" "),
  {
    variants: {
      // ...

Prompt for AI Agent:
components/ui/button.tsx around lines 7 to 35: the base className string passed to cva is extremely long and hard to read; split it into multiple readable parts (e.g., an array of logical groups such as layout, spacing, svg rules, focus/aria states, and interaction states) and join them when calling cva, or extract shared utility strings into named constants and concatenate them so the final cva call remains identical but each piece is short and maintainable.



============================================================================
File: components/workflow/WorkflowConnector.tsx
Line: 22 to 26
Type: nitpick

Comment:
Magic number in vertical positioning.

The -mt-6 (negative margin-top) in the desktop variant appears to be a magic number for aligning the connector with workflow step icons. This creates brittle coupling to the surrounding layout - if step icon sizing changes, this will misalign.


Consider using flexbox alignment or CSS Grid to achieve vertical centering without hardcoded margins.

Prompt for AI Agent:
In components/workflow/WorkflowConnector.tsx around lines 22 to 26, remove the hardcoded negative margin (-mt-6) used to vertically position the connector; instead rely on layout alignment (e.g., make the parent a flex container with items-center or use CSS Grid place-items:center) so the connector is vertically centered relative to the step icons; adjust the connector's container height or use transform: translateY(-50%) with top:50% if necessary to keep visual alignment without brittle magic numbers.



============================================================================
File: components/data-table.tsx
Line: 725 to 796
Type: nitpick

Comment:
Drawer form has no submission logic.

The form in the TableCellViewer (lines 725-796) uses defaultValue for all inputs and has no onSubmit handler. The "Submit" button (line 799) doesn't trigger any action, so changes made in the drawer won't be saved.



For production use, this form needs:
1. Controlled inputs with state management
2. Form submission handler
3. Data persistence logic (API call or parent state update)
4. Validation and error handling

Do you want me to generate a complete implementation with form handling?

Prompt for AI Agent:
In components/data-table.tsx around lines 725 to 796, the drawer form is present but uses uncontrolled inputs (defaultValue) and has no submit handler so edits are never saved; change the inputs to controlled components tied to local state (useState or form library), add an onSubmit handler on the form that validates inputs, calls a prop callback or API to persist the changes, and closes the drawer on success; wire the existing Submit button to trigger the form submit (e.g., type="submit" or call submit handler), handle and display validation/errors, and ensure the parent list/table is updated (via callback or refetch) after a successful save.



============================================================================
File: components/workflow/WorkflowLayout.tsx
Line: 59 to 86
Type: nitpick

Comment:
Refactor: Extract SkipButton rendering to reduce duplication.

The SkipButton component is rendered twice with identical props (lines 61-69 for desktop, 76-84 for mobile), differing only in the wrapper className.



Consider extracting the props to reduce duplication:

+      const skipButtonProps = {
+        onSkip,
+        buttonText: skipButtonText,
+        loading: skipButtonLoading,
+        disabled: skipButtonDisabled,
+        disabledMessage: skipButtonDisabledMessage,
+        confirmMessage: skipConfirmMessage,
+        confirmTitle: skipConfirmTitle,
+      }
+
       {showSkipButton && onSkip && (
         
           
           {showSkipButton && onSkip && (
             
-              
+              
             
           )}
         
       )}
       {/ Mobile skip button /}
       {showSkipButton && onSkip && (
         
-          
+          
         
       )}

Prompt for AI Agent:
In components/workflow/WorkflowLayout.tsx around lines 59 to 86, the SkipButton is rendered twice with identical props differing only by wrapper className; extract the shared props into a single const (e.g., skipButtonProps) and render SkipButton twice passing that const, keeping the two different wrapper divs for desktop and mobile classes to preserve layout; ensure TypeScript/JSX typing matches the SkipButton prop shape and remove the duplicated prop list from both render sites.



============================================================================
File: components/questions/QuestionCard.tsx
Line: 172 to 182
Type: potential_issue

Comment:
Fix accessibility issues on multiselect options.

The interactive div on line 172 lacks keyboard support, and the label on lines 178-180 is not properly associated with the checkbox control.



Apply this diff to fix the accessibility issues:

-          {question.suggestedOptions.map((option) => (
-             handleMultiselectToggle(option)}>
-               handleMultiselectToggle(option)}
-                className="mt-0.5"
-              />
-              
-                {option}
-              
-            
-          ))}
+          {question.suggestedOptions.map((option) => (
+            
+               handleMultiselectToggle(option)}
+                className="mt-0.5"
+              />
+              
+                {option}
+              
+            
+          ))}


Based on static analysis hints.

Prompt for AI Agent:
In components/questions/QuestionCard.tsx around lines 172 to 182, the clickable option is a div without keyboard support and the label isn't associated with the checkbox; change the outer interactive element to a semantic button (or add role="button" and tabIndex if you must keep a div), move the onClick to that element, add onKeyDown to handle Enter/Space to call handleMultiselectToggle(option), and ensure the Checkbox has a stable id and the label uses htmlFor to associate with that id so screen readers and keyboard users can toggle the checkbox correctly.



============================================================================
File: convex/conversations.ts
Line: 387 to 435
Type: potential_issue

Comment:
Contradictory workflow step status for "discovery".

Lines 418 and 427 mark "discovery" as both completed and skipped simultaneously:

completedSteps: ["discovery"]  // Line 418 via mergeCompletedSteps
skippedSteps: ["discovery"],   // Line 427


This is semantically contradictory. Clarify the intent:
- If extraction means discovery is complete, remove it from skippedSteps
- If discovery can be bypassed via extraction, don't add it to completedSteps



Recommended fix:

     const completedSteps = mergeCompletedSteps(
       conversation.workflowProgress?.completedSteps,
       ["discovery"]
     );

     await ctx.db.patch(args.conversationId, {
       extractedContext: args.context,
       currentStage: "clarifying",
       workflowProgress: {
         currentStep: "questions",
         completedSteps,
-        skippedSteps: ["discovery"],
+        skippedSteps: [],
         lastUpdated: Date.now(),
       },
       updatedAt: Date.now(),
     });




