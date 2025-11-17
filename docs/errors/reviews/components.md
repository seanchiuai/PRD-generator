# Code Review: Components

This file contains 61 review issues for components files.

============================================================================

File: components/ui/toggle-group.tsx
Line: 43 to 71
Type: refactor_suggestion

Comment:
Missing React.forwardRef for ref forwarding.

Similar to ToggleGroup, ToggleGroupItem should support ref forwarding for consistency and flexibility in parent components.



Apply this diff to add ref forwarding:

-function ToggleGroupItem({
+const ToggleGroupItem = React.forwardRef,
+  React.ComponentProps &
+    VariantProps
+>(({
   className,
   children,
   variant,
   size,
   ...props
-}: React.ComponentProps &
-  VariantProps) {
+}, ref) => {
   const context = React.useContext(ToggleGroupContext)
 
   return (
     
       {children}
     
   )
-}
+})
+ToggleGroupItem.displayName = "ToggleGroupItem"

Prompt for AI Agent:
In components/ui/toggle-group.tsx around lines 43 to 71, ToggleGroupItem currently lacks ref forwarding; wrap the component with React.forwardRef, change the function signature to accept (props, ref) where props keep the existing React.ComponentProps & VariantProps, and pass the received ref into the rendered ; update the exported identifier to the forwarded result (and adjust types to use React.Ref or the appropriate element type via React.ComponentPropsWithRef to preserve correct typing).



============================================================================

File: components/ui/toggle-group.tsx
Line: 17 to 41
Type: refactor_suggestion

Comment:
Missing React.forwardRef for ref forwarding.

UI primitives typically need to support ref forwarding for parent components to access the underlying DOM element. Radix UI primitives accept a ref prop, but without forwardRef, users cannot pass refs to ToggleGroup.



Apply this diff to add ref forwarding:

-function ToggleGroup({
+const ToggleGroup = React.forwardRef,
+  React.ComponentProps &
+    VariantProps
+>(({
   className,
   variant,
   size,
   children,
   ...props
-}: React.ComponentProps &
-  VariantProps) {
+}, ref) => {
   return (
     
       
         {children}
       
     
   )
-}
+})
+ToggleGroup.displayName = "ToggleGroup"

Prompt for AI Agent:
In components/ui/toggle-group.tsx around lines 17 to 41, the ToggleGroup component does not forward refs so parent components cannot get the underlying DOM node; wrap the component with React.forwardRef, accept a ref parameter (e.g., ref: React.Ref or the appropriate element type), change the function signature to use the forwarded ref and the same props type, and pass that ref to ToggleGroupPrimitive.Root (ref={ref}); ensure the component is exported as the forwarded-ref result and keep all existing props, context provider and className logic intact.



============================================================================

File: components/ui/toggle.tsx
Line: 31 to 45
Type: refactor_suggestion

Comment:
Missing React.forwardRef for ref forwarding.

Like the toggle-group components, the base Toggle component should support ref forwarding for consistency and to allow parent components to access the underlying DOM element.



Apply this diff to add ref forwarding:

-function Toggle({
+const Toggle = React.forwardRef,
+  React.ComponentProps &
+    VariantProps
+>(({
   className,
   variant,
   size,
   ...props
-}: React.ComponentProps &
-  VariantProps) {
+}, ref) => {
   return (
     
   )
-}
+})
+Toggle.displayName = "Toggle"

Prompt for AI Agent:
In components/ui/toggle.tsx around lines 31 to 45, the Toggle component is missing ref forwarding; wrap the component with React.forwardRef, add a ref parameter (e.g. ref: React.ForwardedRef or the specific element type for TogglePrimitive.Root), update the props typing to accept ComponentPropsWithRef (or keep the existing union and allow forwarded refs), and pass the ref through to  so parent components can access the underlying DOM element.



============================================================================

File: components/ui/checkbox.tsx
Line: 9 to 30
Type: nitpick

Comment:
Consider adding ref forwarding support.

The component doesn't use React.forwardRef, which prevents refs from being forwarded to the underlying Radix primitive. This can limit integration with form libraries (React Hook Form, Formik) and imperative focus management.



Apply this diff to add ref forwarding:

-function Checkbox({
+const Checkbox = React.forwardRef,
+  React.ComponentPropsWithoutRef
+>(({
   className,
   ...props
-}: React.ComponentProps) {
+}, ref) => {
   return (
     
       
         
       
     
   )
-}
+})
+Checkbox.displayName = CheckboxPrimitive.Root.displayName

Prompt for AI Agent:
In components/ui/checkbox.tsx around lines 9 to 30, the Checkbox component does not forward refs to the underlying Radix CheckboxPrimitive.Root; change it to use React.forwardRef with the correct typing (React.forwardRef>) so the ref is accepted, and pass the forwarded ref into  while keeping all existing props and className merging intact; ensure you export the forwarded component (and update the function to a const) so form libraries and imperative focus management can access the underlying DOM node.



============================================================================

File: components/auth-buttons.tsx
Line: 14 to 20
Type: potential_issue

Comment:
Layout shift: skeleton width doesn't match actual content.

The loading skeleton uses w-16 (64px), but the actual content is much wider in the unauthenticated state (two buttons with gap) and potentially narrower in the authenticated state (single UserButton). This causes noticeable layout shift when loading completes.



Consider adjusting the skeleton to better match the expected content width:

-        
+        


Or use two skeleton elements to match the unauthenticated state more closely:

       
-        
+        
+

Prompt for AI Agent:
In components/auth-buttons.tsx around lines 14–20, the loading skeleton uses a single w-16 block which causes layout shift because the unauthenticated UI renders two buttons (wider) and the authenticated UI renders a different size; replace the single small skeleton with a placeholder that matches the actual layout — render the same flex container with gap and two skeleton blocks sized to match the unauthenticated buttons (or a single skeleton plus spacer that matches the authenticated UserButton width), or set a fixed container width equal to the larger unauthenticated width so the layout remains stable when isLoading toggles off.



============================================================================

File: components/ui/toggle-group.tsx
Line: 10 to 15
Type: nitpick

Comment:
Consider using toggleVariants defaults instead of hardcoded values.

The context defaults are hardcoded as "default", but if the toggleVariants configuration in toggle.tsx ever changes its defaultVariants, these will be out of sync. Consider importing and using those defaults directly.



Apply this diff to use the toggle variants defaults:

+import { toggleVariants } from "@/components/ui/toggle"
+
 const ToggleGroupContext = React.createContext
 >({
-  size: "default",
-  variant: "default",
+  size: toggleVariants.defaultVariants?.size,
+  variant: toggleVariants.defaultVariants?.variant,
 })

Prompt for AI Agent:
In components/ui/toggle-group.tsx around lines 10 to 15, the context is using hardcoded defaults ("default") which can drift from toggleVariants; import the toggleVariants object from the toggle file and pass toggleVariants.defaultVariants (or a shallow copy of it) into React.createContext> so the context defaults come from the variant definition instead of hardcoded values.



============================================================================

File: components/research/ResearchProgress.tsx
Line: 6 to 10
Type: refactor_suggestion

Comment:
Remove unused icon property.

The icon property in the ResearchCategory interface is never used in the component. All status icons are determined by the status field via conditional rendering (lines 31-42), making this prop redundant.



Apply this diff to remove the unused property:

 interface ResearchCategory {
   name: string;
   status: "pending" | "in_progress" | "completed" | "failed";
-  icon?: React.ReactNode;
 }

Prompt for AI Agent:
In components/research/ResearchProgress.tsx around lines 6 to 10, the ResearchCategory interface includes an unused optional icon property; remove the icon?: React.ReactNode from the interface definition and update any references (if present elsewhere) to rely solely on the status field for rendering so that the interface matches actual usage and eliminates the redundant prop.



============================================================================

File: components/techStack/DefaultStackPreview.tsx
Line: 26 to 30
Type: potential_issue

Comment:
Use replaceAll to replace all underscores in product type.

Line 28 uses replace('_', ' ') which only replaces the first underscore. For product types with multiple underscores (e.g., web_mobile_app), this would result in incomplete replacement (web mobile_app instead of web mobile app).



Apply this diff to fix:

       {productType && (
         
-          Optimized for {productType.replace('_', ' ')} applications
+          Optimized for {productType.replaceAll('_', ' ')} applications
         
       )}

Prompt for AI Agent:
In components/techStack/DefaultStackPreview.tsx around lines 26 to 30, the productType string is being transformed with productType.replace('_', ' ') which only replaces the first underscore; update the transformation to replace all underscores (e.g., use productType.replaceAll('_', ' ') or productType.split('_').join(' ')) so multi-underscore values like "web_mobile_app" become "web mobile app"; ensure the chosen method is supported in target environments or polyfilled.



============================================================================

File: components/chat/ChatContainer.tsx
Line: 38 to 40
Type: refactor_suggestion

Comment:
Use stable key instead of array index.

Using index as the key can cause React reconciliation issues if messages are reordered, inserted, or deleted. Since each message has a timestamp field, use it for a more stable key.


Apply this diff:

-          {messages.map((message, index) => (
-            
+          {messages.map((message) => (
+            
           ))}

Prompt for AI Agent:
In components/chat/ChatContainer.tsx around lines 38 to 40, the list is using the array index as the React key which can break reconciliation; replace key={index} with a stable unique key such as key={message.timestamp} (or key={${message.timestamp}-${message.id}} if message may not have a unique timestamp) and ensure the timestamp is serialized to a string if necessary.



============================================================================

File: components/ui/tooltip.tsx
Line: 21 to 29
Type: potential_issue

Comment:
Inefficient provider pattern: each Tooltip creates its own provider.

Creating a TooltipProvider for every Tooltip instance adds unnecessary React context overhead. The Radix UI recommended pattern is to have a single TooltipProvider at the app root, with multiple Tooltip.Root instances as children.




Consider refactoring to:

 function Tooltip({
   ...props
 }: React.ComponentProps) {
   return (
-    
-      
-    
+    
   )
 }


Then ensure a single TooltipProvider wraps your app (e.g., in the root layout):

// In app/layout.tsx or similar

  {children}

Prompt for AI Agent:
In components/ui/tooltip.tsx around lines 21 to 29, the component currently mounts a TooltipProvider per Tooltip instance which is inefficient; remove the TooltipProvider wrapper so the Tooltip component simply renders TooltipPrimitive.Root with the incoming props, and export TooltipProvider (or document using the existing one) so a single TooltipProvider can be mounted at the app root (e.g., in app/layout.tsx) with desired props like delayDuration={0}; update any usages/tests to rely on the root-level provider rather than the component creating its own.



============================================================================

File: components/ui/input.tsx
Line: 5 to 19
Type: refactor_suggestion

Comment:
Add ref forwarding for form library compatibility.

The Input component should use React.forwardRef to properly forward refs to the underlying input element. This is essential for form libraries (e.g., React Hook Form) and imperative focus management.


Apply this diff:

-function Input({ className, type, ...props }: React.ComponentProps) {
+const Input = React.forwardRef>(
+  ({ className, type, ...props }, ref) => {
-  return (
-    
-  )
-}
+    return (
+      
+    )
+  }
+)
+Input.displayName = "Input"

Prompt for AI Agent:
In components/ui/input.tsx around lines 5 to 19, the Input component does not forward refs which breaks integration with form libraries and imperative focus control; convert it to use React.forwardRef by changing the function to accept (props, ref) with the correct forwarded ref type (HTMLInputElement), pass that ref to the rendered , and export the forwarded component (optionally set displayName for debugging). Ensure TypeScript prop typing is preserved (use React.ComponentProps for props) and that className and other props are spread as before.



============================================================================

File: components/ui/alert.tsx
Line: 35 to 44
Type: potential_issue

Comment:
Fix ref type mismatch in AlertTitle.

The ref type is declared as HTMLParagraphElement but the component renders an h5 element, which should use HTMLHeadingElement. This mismatch can cause type errors when accessing heading-specific properties on the ref.



Apply this diff:

 const AlertTitle = React.forwardRef
 >(({ className, ...props }, ref) => (

Prompt for AI Agent:
In components/ui/alert.tsx around lines 35 to 44, the forwardRef generic incorrectly declares the ref as HTMLParagraphElement while rendering an h5; change the first generic type to HTMLHeadingElement so the ref type matches the rendered heading element (i.e., use React.forwardRef>).



============================================================================

File: components/workflow/SkipButton.tsx
Line: 55 to 58
Type: potential_issue

Comment:
Add error handling for async onSkip call.

The onSkip callback is awaited without error handling. If onSkip throws or rejects, this will result in an unhandled promise rejection and potentially leave the dialog in an inconsistent state.



Apply this diff to add error handling:

 const handleConfirmedSkip = async () => {
   setShowConfirmDialog(false)
-  await onSkip()
+  try {
+    await onSkip()
+  } catch (error) {
+    console.error('Error during skip:', error)
+    // Consider re-opening dialog or showing error feedback
+  }
 }

Prompt for AI Agent:
In components/workflow/SkipButton.tsx around lines 55-58, the async onSkip() is awaited without error handling which can cause unhandled rejections and inconsistent dialog state; wrap the await in a try/catch, keep or ensure setShowConfirmDialog(false) is called so the dialog is closed even on error (use finally or call it before/after as appropriate), and in the catch log the error and surface a user-facing message (e.g., via console.error or a toast/notification) so failures are handled gracefully.



============================================================================

File: components/section-cards.tsx
Line: 77
Type: potential_issue

Comment:
Fix grammar error.

"Engagement exceed targets" should be "Engagement exceeds targets" (subject-verb agreement).



Apply this diff:

-          Engagement exceed targets
+          Engagement exceeds targets

Prompt for AI Agent:
In components/section-cards.tsx around line 77, the text "Engagement exceed targets" has incorrect subject-verb agreement; change it to "Engagement exceeds targets" by editing the string in that JSX element so the verb matches the singular subject.



============================================================================

File: components/ui/alert.tsx
Line: 47 to 56
Type: potential_issue

Comment:
Fix ref type mismatch in AlertDescription.

The ref type is declared as HTMLParagraphElement but the component renders a div element, which should use HTMLDivElement.



Apply this diff:

 const AlertDescription = React.forwardRef
 >(({ className, ...props }, ref) => (

Prompt for AI Agent:
In components/ui/alert.tsx around lines 47 to 56, the forwardRef declares the ref as HTMLParagraphElement but the component renders a div; change the forwardRef generic and prop types to use HTMLDivElement (and corresponding React.HTMLAttributes) so the ref type matches the rendered element, and ensure any consumers expecting a paragraph are updated if necessary.



============================================================================

File: components/ui/chart.tsx
Line: 72 to 103
Type: potential_issue

Comment:
Validate ChartConfig values to prevent CSS injection.

The dangerouslySetInnerHTML usage injects CSS custom properties from ChartConfig without sanitization. If config contains untrusted data (user input or external sources), malicious CSS could be injected.



Consider these mitigations:

1. Document that ChartConfig must be app-controlled: Add a comment that config must come from trusted sources only.

2. Sanitize color values: Validate that colors match expected formats (hex, rgb, hsl):

 const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
+  const isValidColor = (color: string) => /^(#[0-9A-Fa-f]{3,8}|rgb|hsl|var\()/.test(color)
+
   const colorConfig = Object.entries(config).filter(
     ([, config]) => config.theme || config.color
   )
 
   if (!colorConfig.length) {
     return null
   }
 
   return (
      
 ${prefix} [data-chart=${id}] {
 ${colorConfig
   .map(([key, itemConfig]) => {
     const color =
       itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
       itemConfig.color
-    return color ?   --color-${key}: ${color}; : null
+    return color && isValidColor(color) ?   --color-${key}: ${color}; : null
   })
   .join("\n")}
 }
 
           )
           .join("\n"),
       }}
     />
   )
 }


3. Sanitize keys: Ensure config keys are safe CSS identifiers:

+  const isSafeKey = (key: string) => /^[a-zA-Z][\w-]*$/.test(key)
+
   const colorConfig = Object.entries(config).filter(
-    ([, config]) => config.theme || config.color
+    ([key, config]) => isSafeKey(key) && (config.theme || config.color)
   )


Based on static analysis hints.

Prompt for AI Agent:
In components/ui/chart.tsx around lines 72 to 103, the component builds a style block via dangerouslySetInnerHTML using keys and color values from ChartConfig without validation, allowing CSS injection; update the implementation to (1) add a clear comment that ChartConfig must be controlled/trusted, (2) validate/sanitize each color value to only allow safe formats (hex #RGB/#RRGGBB, rgb(), rgba(), hsl(), hsla()) and skip any values that don't match the regex, (3) validate/sanitize keys to safe CSS custom-property identifiers (allow only letters, digits, hyphens and underscores, normalize or skip invalid keys), and (4) only include entries that pass both checks when building the CSS string (do not insert raw user input into the style block). Ensure invalid entries are omitted and consider logging or throwing on developer-mode violations.



============================================================================

File: components/dashboard/ProfileMenu.tsx
Line: 32 to 42
Type: nitpick

Comment:
Consider removing redundant filter.

The filter at line 38 is redundant since part[0] will always be defined when part.length > 0 (checked at line 36).



Apply this diff:

   const nameParts = userName
     .trim()
     .split(/\s+/)
     .filter(part => part.length > 0)
-    .map(part => part[0])
-    .filter(char => char !== undefined);
+    .map(part => part[0]);

Prompt for AI Agent:
In components/dashboard/ProfileMenu.tsx around lines 32 to 42, remove the redundant .filter(char => char !== undefined) after mapping parts to their first character since you already filtered out empty parts with part.length > 0; update the code to map parts to part[0] directly and rely on the prior filter, leaving the initials fallback logic unchanged (use userEmail[0]?.toUpperCase() || "U").



============================================================================

File: components/ui/toast.tsx
Line: 81
Type: nitpick

Comment:
Consider using a data attribute or removing the empty attribute.

The toast-close="" attribute is unconventional. If it's used for CSS targeting, consider using data-toast-close instead for better semantics. If it's not needed, it can be removed.



-    toast-close=""
+    data-toast-close
     {...props}

Prompt for AI Agent:
In components/ui/toast.tsx around line 81, there is an unconventional empty attribute toast-close=""; remove it if unused, or replace it with a semantic data attribute such as data-toast-close (and update any CSS/JS selectors accordingly) so the markup is valid and clearer for styling/behavior targeting.



============================================================================

File: components/selection/SelectionProgress.tsx
Line: 11 to 13
Type: potential_issue

Comment:
Handle division by zero when calculating percentage.

Line 12 divides by total without checking if it's zero, resulting in NaN when no categories exist. This will break the Progress component.



Apply this diff to add zero-check:

 export function SelectionProgress({ total, selected }: SelectionProgressProps) {
-  const percentage = (selected / total) * 100;
+  const percentage = total > 0 ? (selected / total) * 100 : 0;

Prompt for AI Agent:
In components/selection/SelectionProgress.tsx around lines 11 to 13, the percentage calculation divides by total without guarding against zero which produces NaN and breaks the Progress component; modify the calculation to check if total is truthy (or > 0) before dividing, e.g. set percentage to 0 when total is 0 (and optionally clamp the result between 0 and 100) so no division-by-zero or NaN can occur.



============================================================================

File: components/nav-secondary.tsx
Line: 29
Type: nitpick

Comment:
Consider using item.url as the key for better uniqueness.

While item.title might work, titles can potentially be duplicated or changed for display purposes. Using item.url as the key is more reliable since URLs should be unique within a navigation list.



Apply this diff:

-            
+

Prompt for AI Agent:
In components/nav-secondary.tsx around line 29, change the SidebarMenuItem key from item.title to item.url to ensure a more stable and unique key; if item.url may be missing, use a fallback like ${item.url ?? item.title}-${index} (or similar) to avoid collisions and keep React keys stable.



============================================================================

File: components/prd/PRDDisplay.tsx
Line: 73 to 110
Type: potential_issue

Comment:
Silent null return for string tech stack values may hide data.

Line 76 returns null when a tech stack value is a string, silently omitting it from the display. If the data model legitimately includes string values, users won't see them or know they exist.



Consider logging or handling string values explicitly:

           .map(([key, value]) => {
-            if (typeof value === "string") return null;
+            if (typeof value === "string") {
+              console.warn(Tech stack key "${key}" has string value, expected object:, value);
+              return null;
+            }
             return (


Alternatively, if strings are never expected, add runtime validation earlier in the data flow.

Prompt for AI Agent:
In components/prd/PRDDisplay.tsx around lines 73 to 110, the mapping over prd.techStack silently returns null for entries whose value is a string which causes valid string data to be omitted; either render string values explicitly (e.g., show a Card or simple list item with the string and a label) or add an explicit guard/log when encountering unexpected string types so they are visible (or throw/validate earlier if strings are truly invalid); implement one of these fixes and ensure keys and ARIA/text semantics remain consistent.



============================================================================

File: components/prd/PRDDisplay.tsx
Line: 62 to 66
Type: refactor_suggestion

Comment:
Avoid using array index as React key.

Line 64 uses array index i as the key for list items. If objectives are reordered or modified, React won't correctly track which elements changed, potentially causing rendering bugs.



If objectives have unique identifiers, use those. Otherwise, use the content itself:

               {prd.purposeAndGoals.keyObjectives.map((obj, i) => (
-                  {obj}
+                  {obj}
               ))}


Note: This pattern repeats throughout the file at lines 92, 102, 136, 169, 200, and applies to similar list renderings. Consider the same fix for those locations if the items are unique or stable.

Prompt for AI Agent:
In components/prd/PRDDisplay.tsx around lines 62 to 66, the list items use the array index i as the React key which can break reconciliation; replace the index key with a stable unique key (preferably an id property on each objective, e.g., obj.id) and if no id exists use a stable unique string (e.g., the objective text) as a fallback; apply the same change to the other similar list renderings at lines 92, 102, 136, 169, and 200 so all lists use stable keys instead of array indices.



============================================================================

File: components/workflow/AutoAdvance.tsx
Line: 24
Type: potential_issue

Comment:
Reset countdown when delaySeconds changes.

The countdown state is initialized with delaySeconds but never resets if the prop changes. This could cause incorrect countdown behavior if the component is reused with different delay values.


Apply this diff to reset countdown when delaySeconds changes:

 export function AutoAdvance({
   enabled,
   delaySeconds = 5,
   nextStepName,
   onAdvance,
   onCancel,
 }: AutoAdvanceProps) {
   const [countdown, setCountdown] = useState(delaySeconds)
   const [isPaused, setIsPaused] = useState(false)
+
+  // Reset countdown when delaySeconds changes
+  useEffect(() => {
+    setCountdown(delaySeconds)
+  }, [delaySeconds])

Prompt for AI Agent:
In components/workflow/AutoAdvance.tsx around line 24, the countdown state is initialized with delaySeconds but never reset when the prop changes; add a useEffect that listens for changes to delaySeconds and calls setCountdown(delaySeconds) (and also reset/clear any running timers or interval refs used for the countdown) so the component restarts with the new delay value whenever the prop updates.



============================================================================

File: components/chart-area-interactive.tsx
Line: 133 to 141
Type: potential_issue

Comment:
Both desktop and mobile areas use identical colors.

Lines 135 and 139 both set color: "var(--primary)", causing the stacked areas to be indistinguishable. This defeats the purpose of showing separate desktop vs. mobile data.



Apply this diff to use distinct colors:

   desktop: {
     label: "Desktop",
     color: "var(--primary)",
   },
   mobile: {
     label: "Mobile",
-    color: "var(--primary)",
+    color: "hsl(var(--chart-2))",
   },

Prompt for AI Agent:
In components/chart-area-interactive.tsx around lines 133 to 141, both the desktop and mobile series use color: "var(--primary)", making stacked areas indistinguishable; change one of them (e.g., mobile) to a distinct CSS variable such as "var(--secondary)" or "var(--accent)" so the two series render in different colors, and ensure the chosen variable exists in the stylesheet (or add it) and provides sufficient contrast for accessibility.



============================================================================

File: components/nav-secondary.tsx
Line: 31
Type: potential_issue

Comment:
Use Next.js Link instead of anchor tags for client-side navigation.

Using  causes full page reloads and loses the benefits of Next.js client-side navigation. This impacts performance and user experience.



Apply this diff to use Next.js Link:

+import Link from "next/link"
+
 import {
   SidebarGroup,


Then update the anchor tag:

               
-                
+                
                   
                   {item.title}
-                
+

Prompt for AI Agent:
In components/nav-secondary.tsx around line 31, replace the raw anchor tag  with Next.js client-side navigation: import Link from 'next/link' at the top of the file and render the link using the Link component (e.g. …), preserving any className, target, rel, and child content; if your project uses an older Next.js version that requires an anchor inside Link, wrap the anchor as a child of Link and keep attributes on the anchor (or use legacyBehavior), otherwise place styling and attributes directly on Link to avoid full page reloads.



============================================================================

File: components/prd/GenerationProgress.tsx
Line: 16 to 18
Type: potential_issue

Comment:
Handle empty steps array to prevent NaN progress.

If steps is an empty array, the progress calculation on line 18 will result in NaN (division by zero), which will be passed to the Progress component.



Apply this diff to safely handle the edge case:

 export function GenerationProgress({ steps }: GenerationProgressProps) {
   const completedSteps = steps.filter((s) => s.status === "completed").length;
-  const progress = (completedSteps / steps.length) * 100;
+  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

Prompt for AI Agent:
In components/prd/GenerationProgress.tsx around lines 16 to 18, the progress calculation divides by steps.length which will produce NaN for an empty steps array; change the logic to guard against an empty array by setting progress to 0 when steps.length === 0 (e.g., compute completedSteps as before, then set progress = steps.length ? (completedSteps / steps.length) * 100 : 0) and ensure the final value is a finite number clamped to 0-100 before passing it to the Progress component.



============================================================================

File: components/selection/TechStackCard.tsx
Line: 66 to 68
Type: nitpick

Comment:
Consider using content as keys instead of array indices.

While using array indices as keys is acceptable for static lists, using the content itself provides better stability if the lists are ever reordered or modified.



-                    {option.pros.map((pro, i) => (
-                      {pro}
+                    {option.pros.map((pro) => (
+                      {pro}


Apply the same pattern for cons on lines 77-79.


Also applies to: 77-79

Prompt for AI Agent:
In components/selection/TechStackCard.tsx around lines 66-68 and 77-79, the list items use array indices as keys; replace these with stable keys using the content (e.g., use the pro/cons string as the key) and if duplicates are possible combine content with the index (e.g., ${pro}-${i}) to guarantee uniqueness; update both the pros and cons map callbacks accordingly so keys are stable when items are reordered or modified.



============================================================================

File: components/nav-user.tsx
Line: 94 to 97
Type: potential_issue

Comment:
Implement Settings action handler.

The Settings menu item lacks an onClick handler. Either implement the settings functionality or remove this item if not needed in the current scope.

Prompt for AI Agent:
In components/nav-user.tsx around lines 94-97, the Settings DropdownMenuItem has no onClick handler; either remove it or implement navigation/handler. Add an onClick that performs the intended action (for example, navigate to '/settings' via the router: obtain router (useRouter or useNavigation depending on framework version) and call router.push('/settings')), or call an existing openSettingsModal() function if a modal is used; also ensure the dropdown is closed after the action (call the menu close callback or ensure default behavior). Finally, add any necessary imports for the router/modal helper and keep TypeScript types consistent.



============================================================================

File: components/dashboard/PRDCard.tsx
Line: 21
Type: refactor_suggestion

Comment:
Replace any type with a proper interface.

The prdData: any type bypasses type safety. Define an interface that captures the expected structure (e.g., projectOverview, techStack) to enable compile-time checks and better IDE support.



Example interface:

interface PRDData {
  projectOverview?: {
    description?: string;
  };
  techStack?: Record;
}


Then update line 21:

-    prdData: any;
+    prdData: PRDData;

Prompt for AI Agent:
In components/dashboard/PRDCard.tsx around line 21, the prop declaration prdData: any disables type safety; define a proper TypeScript interface (e.g., PRDData) that models the expected shape (projectOverview?: { description?: string }, techStack?: Record, plus any other required fields) and replace prdData: any with prdData: PRDData in the component props; export the interface if used elsewhere and mark optional properties as optional to match runtime data.



============================================================================

File: components/nav-documents.tsx
Line: 66 to 78
Type: potential_issue

Comment:
Implement action handlers for dropdown menu items.

The Open, Share, and Delete menu items have no onClick handlers, making them non-functional. Wire up the appropriate actions or pass handlers via props.




Do you want me to generate a complete implementation with handlers passed via props?

Prompt for AI Agent:
In components/nav-documents.tsx around lines 66 to 78, the DropdownMenuItems for Open, Share and Delete have no onClick handlers and therefore do nothing; add props to the component (e.g. onOpen, onShare, onDelete) that accept (documentId: string) or appropriate context, wire each DropdownMenuItem to call the corresponding prop (onOpen/onShare/onDelete) in its onClick handler passing the current document id or item, and ensure the component's prop types/defaults are updated (provide safe no-op defaults if needed) so the menu closes or performs the action when clicked.



============================================================================

File: components/chart-area-interactive.tsx
Line: 153 to 165
Type: potential_issue

Comment:
Hardcoded reference date limits chart to historical data.

Line 155 hardcodes "2024-06-30" as the reference date for filtering, meaning the chart will never display data beyond June 2024. For a production application, this should use the current date or the latest available data point.



Apply this diff to use dynamic date calculation:

   const filteredData = chartData.filter((item) => {
     const date = new Date(item.date)
-    const referenceDate = new Date("2024-06-30")
+    const referenceDate = new Date(chartData[chartData.length - 1].date)
     let daysToSubtract = 90

Prompt for AI Agent:
In components/chart-area-interactive.tsx around lines 153 to 165, the filter uses a hardcoded referenceDate ("2024-06-30") which prevents showing data newer than that date; replace the hardcoded date with a dynamic reference such as new Date() or the latest date from chartData; compute referenceDate = new Date() (or derive the max date from chartData), then subtract days based on timeRange (90/30/7) and compare item dates against that computed startDate so the chart shows current/latest data.



============================================================================

File: components/nav-main.tsx
Line: 25 to 33
Type: potential_issue

Comment:
Add functionality or remove the non-functional "Add Task" button.

The "Add Task" button has no onClick handler or navigation target, so it won't perform any action when clicked. This appears to be placeholder code.




Do you want me to suggest a pattern for making this button functional (e.g., accepting an onAddTask prop)?

Prompt for AI Agent:
In components/nav-main.tsx around lines 25 to 33 the "Add Task" SidebarMenuButton is rendered without any onClick handler or navigation target, so it is non-functional; add an onClick prop (e.g., accept an onAddTask function prop and pass it to SidebarMenuButton) or replace it with a Link/navigation component, or remove the button entirely if it's just a placeholder; ensure props are typed in the component's props interface and that the handler triggers the intended action (open modal, navigate, or dispatch) when invoked.



============================================================================

File: components/data-table.tsx
Line: 278 to 281
Type: potential_issue

Comment:
Inconsistent reviewer options between inline select and drawer form.

The inline reviewer select (lines 278-281) offers only "Eddie Lake" and "Jamik Tashpulatov", while the drawer form's reviewer select (lines 788-792) includes a third option "Emily Whalen". This inconsistency could cause confusion.



Ensure both selects have the same options. Extract the reviewer list to a shared constant:

+const REVIEWERS = [
+  { value: "Eddie Lake", label: "Eddie Lake" },
+  { value: "Jamik Tashpulatov", label: "Jamik Tashpulatov" },
+  { value: "Emily Whalen", label: "Emily Whalen" },
+] as const
+
 // In the inline select (line 277):
 
-  Eddie Lake
-  
-    Jamik Tashpulatov
-  
+  {REVIEWERS.map((reviewer) => (
+    
+      {reviewer.label}
+    
+  ))}
 
 
 // In the drawer form (line 787):
 
-  Eddie Lake
-  
-    Jamik Tashpulatov
-  
-  Emily Whalen
+  {REVIEWERS.map((reviewer) => (
+    
+      {reviewer.label}
+    
+  ))}
 



Also applies to: 788-792

Prompt for AI Agent:
In components/data-table.tsx around lines 278-281 and 788-792, the inline reviewer Select only includes "Eddie Lake" and "Jamik Tashpulatov" while the drawer form also includes "Emily Whalen", causing inconsistent options; create a shared constant array (e.g., REVIEWERS = ['Eddie Lake', 'Jamik Tashpulatov', 'Emily Whalen']) exported in the same file or a nearby constants module and replace the hard-coded SelectItem elements in both places with a map over that constant to render identical SelectItem entries for each reviewer.



============================================================================

File: components/app-sidebar.tsx
Line: 23 to 37
Type: potential_issue

Comment:
Replace placeholder URLs with actual routes.

The Settings and Help links use "#" as placeholder URLs, which won't navigate anywhere. Update these with actual route paths or make the sidebar data configurable via props.



Consider either:
1. Adding actual routes (e.g., url: "/settings", url: "/help")
2. Making the sidebar data configurable: export function AppSidebar({ navData, ...props }: { navData?: typeof data } & React.ComponentProps)

Prompt for AI Agent:
In components/app-sidebar.tsx around lines 23 to 37, the navSecondary entries use "#" placeholder URLs which don't navigate; replace them with real routes (e.g., url: "/settings" and url: "/help") or refactor the component to accept configurable nav data via props (export function AppSidebar({ navData, ...props }: { navData?: typeof data } & React.ComponentProps)) and fall back to the existing data constant so consumers can supply routes.



============================================================================

File: components/workflow/PageTransition.tsx
Line: 11 to 25
Type: potential_issue

Comment:
AnimatePresence requires a key prop for exit animations to work.

The AnimatePresence component needs a unique key on its child to detect when content changes and trigger exit animations. Without it, the exit animation defined on line 17 will never play.



Consider updating the component to accept a key prop:

 interface PageTransitionProps {
   children: ReactNode
   className?: string
+  pageKey?: string
 }

-export function PageTransition({ children, className }: PageTransitionProps) {
+export function PageTransition({ children, className, pageKey }: PageTransitionProps) {
   return (
     
       
         {children}
       
     
   )
 }


Then, consumers should pass a unique key that changes when content changes (e.g., route path or step identifier).

Prompt for AI Agent:
In components/workflow/PageTransition.tsx around lines 11 to 25, the child of AnimatePresence lacks a unique key so exit animations never run; update the PageTransitionProps to accept a key-like prop (e.g., pageKey or id), add that prop to the function signature, forward it as the React key on the motion.div (and update the TypeScript type), and adjust callers to pass a stable unique value (route path, step id, etc.) that changes when content should animate out.



============================================================================

File: components/nav-user.tsx
Line: 44
Type: nitpick

Comment:
Improve initials calculation robustness.

The initials calculation may produce unexpected results if userName contains consecutive spaces, leading/trailing whitespace, or empty parts. Filter out empty strings for safety.



Apply this diff:

-  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
+  const initials = userName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().slice(0, 2)

Prompt for AI Agent:
In components/nav-user.tsx around line 44, the initials calculation uses userName.split(' ') which can include empty parts from extra whitespace; trim the userName, split on spaces, filter out empty strings, then map each remaining part to its first character, join, uppercase and slice(0,2). Also guard for falsy userName (return '' or a fallback) to avoid runtime errors.



============================================================================

File: components/research/LoadingSkeleton.tsx
Line: 4 to 24
Type: nitpick

Comment:
Consider making the skeleton count configurable.

The component works correctly but hardcodes 3 skeleton cards. For improved reusability across different loading states, consider accepting a count prop.




-export function LoadingSkeleton() {
+export function LoadingSkeleton({ count = 3 }: { count?: number } = {}) {
   return (
     
-      {[1, 2, 3].map((i) => (
+      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (

Prompt for AI Agent:
In components/research/LoadingSkeleton.tsx around lines 4 to 24, the component hardcodes rendering 3 skeleton cards; make it configurable by adding a count prop with a default of 3 (e.g., function LoadingSkeleton({ count = 3 }: { count?: number })), then replace the fixed [1,2,3].map with a dynamic array based on count (e.g., Array.from({ length: count }, (_, i) => ...)) and keep the existing structure and key usage; update any call sites if they rely on the old behavior only when they need a different number.



============================================================================

File: components/workflow/SkipButton.tsx
Line: 86 to 96
Type: refactor_suggestion

Comment:
Tooltip provider pattern aligns with issue in tooltip.tsx.

This usage creates a TooltipProvider per disabled button instance. Once the architectural issue in components/ui/tooltip.tsx is resolved (single provider at app root), update this to:

 {disabled && disabledMessage ? (
-  
-    
-      
-        {buttonContent}
-      
-      
-        {disabledMessage}
-      
-    
-  
+  
+    
+      {buttonContent}
+    
+    
+      {disabledMessage}
+    
+  
 ) : (
   buttonContent
 )}

Prompt for AI Agent:
In components/workflow/SkipButton.tsx around lines 86-96, the code instantiates a TooltipProvider per disabled button which duplicates providers; remove the local TooltipProvider wrapper and render Tooltip (with TooltipTrigger asChild and TooltipContent) directly so the app-level TooltipProvider (once added in components/ui/tooltip.tsx) supplies context; also remove any now-unused TooltipProvider import and verify imports for Tooltip, TooltipTrigger, TooltipContent remain.



============================================================================

File: components/site-header.tsx
Line: 13
Type: nitpick

Comment:
Consider making the title configurable.

The title "Tasks" is hardcoded. If this header component might be reused in different contexts, consider accepting the title as a prop for better reusability.



Optional refactor to make it configurable:

-export function SiteHeader() {
+export function SiteHeader({ title = "Tasks" }: { title?: string }) {
   return (
     
       
         
         
-        Tasks
+        {title}
       
     
   )

Prompt for AI Agent:
In components/site-header.tsx around line 13, the header currently renders a hardcoded  with the text "Tasks"; make the title configurable by adding a prop (e.g., title: string) to the component props and render that prop instead of the literal "Tasks", providing a sensible default (either via defaultProps or a default parameter) to preserve existing behavior when no prop is passed.



============================================================================

File: components/data-table.tsx
Line: 258
Type: refactor_suggestion

Comment:
Use a more robust check for reviewer assignment.

The current check row.original.reviewer !== "Assign reviewer" relies on an exact string match, which is fragile and could break if the placeholder text changes or if there's a localization effort.



Consider using a more robust approach:

-const isAssigned = row.original.reviewer !== "Assign reviewer"
+const isAssigned = row.original.reviewer && row.original.reviewer.trim() !== "" && row.original.reviewer !== "Assign reviewer"


Or better yet, use a sentinel value in your schema (e.g., null or empty string) to represent unassigned reviewers:

 export const schema = z.object({
   id: z.number(),
   header: z.string(),
   type: z.string(),
   status: z.string(),
   target: z.string(),
   limit: z.string(),
-  reviewer: z.string(),
+  reviewer: z.string().nullable(),
 })


Then check:

-const isAssigned = row.original.reviewer !== "Assign reviewer"
+const isAssigned = row.original.reviewer !== null && row.original.reviewer !== ""

Prompt for AI Agent:
In components/data-table.tsx around line 258, the code uses a fragile exact string match ("Assign reviewer") to detect unassigned reviewers; replace this with a robust check that treats null/undefined/empty string as unassigned (e.g., use row.original.reviewer == null or !row.original.reviewer) and update any data creation/schema to use a sentinel like null for unassigned reviewers so the component can reliably detect assignment without relying on display text or localization.



============================================================================

File: components/nav-documents.tsx
Line: 43 to 44
Type: potential_issue

Comment:
Potential non-unique key in map.

Using item.name as the key may cause React reconciliation issues if multiple documents share the same name. Consider using item.url (if guaranteed unique) or a composite key.



Apply this diff if url is unique:

-        {items.map((item) => (
-          
+        {items.map((item) => (
+

Prompt for AI Agent:
In components/nav-documents.tsx around lines 43 to 44, the mapped SidebarMenuItem uses item.name as the React key which may not be unique; update the key to a unique identifier (preferably item.url if it’s guaranteed unique) or a composite key (e.g., ${item.url}-${item.id} or ${item.name}-${item.url}) so React can reliably reconcile list items; ensure the chosen property exists on item and fall back to a composite if necessary.



============================================================================

File: components/ClientBody.tsx
Line: 13 to 26
Type: nitpick

Comment:
Consider className merging instead of replacement.

Directly assigning document.body.className (line 16) replaces all existing classes on the body element. This could conflict with classes added by other scripts, libraries, or browser extensions.

Consider using classList methods for safer manipulation:



   useEffect(() => {
-    // Apply the className to the actual body element after hydration
     if (className) {
-      document.body.className = className
+      // Clear existing classes and add new ones
+      const classes = className.split(' ').filter(Boolean)
+      document.body.className = '' // Clear first
+      classes.forEach(cls => document.body.classList.add(cls))
     }
 
     // Clean up any browser extension attributes that might cause hydration issues


Or, if you need to preserve certain classes:

if (className) {
  // Preserve classes you want to keep, replace the rest
  const preservedClasses = Array.from(document.body.classList)
    .filter(cls => cls.startsWith('preserve-'))
  document.body.className = className
  preservedClasses.forEach(cls => document.body.classList.add(cls))
}

Prompt for AI Agent:
In components/ClientBody.tsx around lines 13 to 26, the code directly assigns document.body.className which wipes out existing classes; instead merge classes using document.body.classList: add each class from the incoming className (split on whitespace) and remove any classes that should no longer be present, or if you must replace most classes first capture preserved classes (e.g., Array.from(document.body.classList).filter(cls => cls.startsWith('preserve-'))) then set document.body.className = className and re-add preserved classes via classList.add; keep the existing cleanup of extension attributes after the class merging logic.



============================================================================

File: components/data-table.tsx
Line: 725 to 796
Type: potential_issue

Comment:
Form submission has no handler.

The form element (line 725) doesn't have an onSubmit handler, so clicking the "Submit" button (line 799) won't trigger any action.



Add an onSubmit handler to process the form data:

-
+ {
+    e.preventDefault()
+    const formData = new FormData(e.currentTarget)
+    // TODO: Implement save logic
+    toast.promise(
+      saveItemDetails(item.id, Object.fromEntries(formData)),
+      {
+        loading: "Saving changes...",
+        success: "Changes saved!",
+        error: "Failed to save changes",
+      }
+    )
+  }}
+>


Also ensure all inputs have name attributes matching their field names.

Prompt for AI Agent:
In components/data-table.tsx around lines 725 to 796, the  has no onSubmit handler and several controls lack name attributes so submission does nothing; add an onSubmit prop that prevents default, collects the form data (using FormData or controlled state keyed by input name), validates/normalizes values, and calls the existing submit logic or a new handler; ensure every Input and Select has a proper name attribute matching the data model (header, type, status, target, limit, reviewer, etc.), change the submit button to type="submit" if needed, and wire the handler to update state or dispatch the save action.



============================================================================

File: components/export/ExportButtons.tsx
Line: 14 to 26
Type: refactor_suggestion

Comment:
Remove unused props from component signature.

The prd and productName props are destructured but never used (indicated by the _ prefix). If the export handlers receive these values via closure, these props should be removed from the interface.



Apply this diff:

 interface ExportButtonsProps {
-  prd: PRDData;
-  productName: string;
   onExportJSON: () => Promise;
   onExportPDF: () => Promise;
 }
 
 export function ExportButtons({
-  prd: _prd,
-  productName: _productName,
   onExportJSON,
   onExportPDF,
 }: ExportButtonsProps) {

Prompt for AI Agent:
In components/export/ExportButtons.tsx around lines 14 to 26, the PRDData and productName props are destructured but unused (prefixed with underscores); remove prd and productName from the ExportButtonsProps interface and from the component parameter list so only onExportJSON and onExportPDF remain, update any call sites to stop passing those props, and remove any now-unused imports/types (e.g., PRDData) to keep the file type-clean.



============================================================================

File: components/research/ResearchResults.tsx
Line: 34 to 35
Type: nitpick

Comment:
Consider using a more stable key.

Using key={index} can cause React reconciliation issues if the options array is reordered or filtered. If option.name is unique within a category, prefer using it as the key.



Apply this diff if option names are unique:

-            
+

Prompt for AI Agent:
In components/research/ResearchResults.tsx around lines 34-35, the list uses key={index} which can break React reconciliation when items are reordered; replace the numeric index with a stable unique key such as option.name (assuming names are unique) by changing the AccordionItem key and value to use option.name (or another unique id) so React can track items reliably.



============================================================================

File: components/chart-area-interactive.tsx
Line: 147 to 151
Type: potential_issue

Comment:
useEffect overrides user's timeRange selection on mobile.

The effect unconditionally sets timeRange to "7d" whenever isMobile is true, even if the user explicitly selected a different range. This creates a poor UX where selections don't persist and the component's state becomes unpredictable.



Apply this diff to only set the initial mobile default:

+  const [timeRange, setTimeRange] = React.useState(isMobile ? "7d" : "90d")
-  const [timeRange, setTimeRange] = React.useState("90d")
-
-  React.useEffect(() => {
-    if (isMobile) {
-      setTimeRange("7d")
-    }
-  }, [isMobile])




============================================================================

File: components/ConvexClientProvider.tsx
Line: 7
Type: potential_issue

Comment:
Add environment variable validation to prevent runtime errors.

The code uses a non-null assertion on process.env.NEXT_PUBLIC_CONVEX_URL without validation. If this environment variable is missing or undefined, the app will fail with a cryptic error. Add explicit validation with a clear error message.



Apply this diff:

+if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
+  throw new Error(
+    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please check your .env configuration."
+  );
+}
+
 const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


Or use a more defensive approach:

-const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
+const convex = new ConvexReactClient(
+  process.env.NEXT_PUBLIC_CONVEX_URL ?? (() => {
+    throw new Error(
+      "Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please check your .env configuration."
+    );
+  })()
+);

Prompt for AI Agent:
In components/ConvexClientProvider.tsx around line 7, the code non-null-asserts process.env.NEXT_PUBLIC_CONVEX_URL when constructing ConvexReactClient which will throw a cryptic runtime error if the env var is missing; replace the direct instantiation with a defensive check that reads the env var into a const, validates it's a non-empty string, and if missing throws a clear Error with a descriptive message (or returns a safe fallback/does not render the provider) before calling new ConvexReactClient; ensure the validation runs at module initialization or before first render so failures surface with the explicit message instead of a non-null assertion crash.



============================================================================

File: components/research/ResearchResults.tsx
Line: 51 to 70
Type: refactor_suggestion

Comment:
Use semantic color variables for consistency.

The Pros/Cons sections use hardcoded Tailwind colors (text-green-700, text-red-700, etc.) rather than the semantic color variables defined in the styling guide. This deviates from the project's Macaron palette approach.



As per the styling guide (docs/styling-guide.md), prefer semantic color variables. Consider using:

-                    
+                    
                       Pros
                     


-                    
+                    
                       Cons
                     


Alternatively, if specific green/red semantics are important for Pros/Cons, consider adding semantic color variables like --success and --warning to your theme configuration.

Based on learnings (styling guide).




============================================================================

File: components/data-table.tsx
Line: 639 to 648
Type: refactor_suggestion

Comment:
Chart areas use identical colors.

Both desktop and mobile chart areas use var(--primary), making them indistinguishable in the stacked area chart. This defeats the purpose of having two separate data series.



Use distinct colors for each data series:

 const chartConfig = {
   desktop: {
     label: "Desktop",
     color: "var(--primary)",
   },
   mobile: {
     label: "Mobile",
-    color: "var(--primary)",
+    color: "var(--secondary)",
   },
 } satisfies ChartConfig


Or use chart-specific color variables:

 const chartConfig = {
   desktop: {
     label: "Desktop",
-    color: "var(--primary)",
+    color: "hsl(var(--chart-1))",
   },
   mobile: {
     label: "Mobile",
-    color: "var(--primary)",
+    color: "hsl(var(--chart-2))",
   },
 } satisfies ChartConfig

Prompt for AI Agent:
In components/data-table.tsx around lines 639 to 648, the chartConfig assigns the same color (var(--primary)) to both desktop and mobile, making the stacked areas indistinguishable; update the config so each series uses a distinct color (for example keep desktop as var(--primary) and change mobile to var(--secondary) or to dedicated chart variables like var(--chart-desktop) and var(--chart-mobile)), ensure the new values conform to the ChartConfig type and update any corresponding CSS variables if they don't exist.



============================================================================

File: components/nav-main.tsx
Line: 35 to 44
Type: potential_issue

Comment:
Add navigation functionality to menu items.

The menu items display titles and icons but have no navigation target. Compare with components/app-sidebar.tsx lines 45-49, where SidebarMenuButton uses asChild with an  element to enable navigation.



Apply this diff:

         
           {items.map((item) => (
             
-              
-                {item.icon && }
-                {item.title}
-              
+              
+                
+                  {item.icon && }
+                  {item.title}
+                
+              
             
           ))}

Prompt for AI Agent:
In components/nav-main.tsx around lines 35 to 44, the SidebarMenu items render titles/icons but lack navigation; update each SidebarMenuButton to use asChild and render an anchor (or your routing Link) with the item's href (e.g., ) so clicks navigate. Ensure you pass the key on SidebarMenuItem, keep the existing icon/title children inside the anchor, and fallback to a button or noop href if item.href is missing; this mirrors components/app-sidebar.tsx lines 45-49.



============================================================================

File: components/data-table.tsx
Line: 393 to 402
Type: nitpick

Comment:
Consider performance optimization for large datasets.

The handleDragEnd function uses dataIds.indexOf() twice, which has O(n) complexity. For large datasets (hundreds or thousands of rows), this could cause drag-and-drop lag.



For better performance with large datasets, consider using a Map for O(1) lookups:

+const dataIdMap = React.useMemo(() => {
+  return new Map(data.map((item, index) => [item.id, index]))
+}, [data])
+
 function handleDragEnd(event: DragEndEvent) {
   const { active, over } = event
   if (active && over && active.id !== over.id) {
     setData((data) => {
-      const oldIndex = dataIds.indexOf(active.id)
-      const newIndex = dataIds.indexOf(over.id)
+      const oldIndex = dataIdMap.get(active.id)!
+      const newIndex = dataIdMap.get(over.id)!
       return arrayMove(data, oldIndex, newIndex)
     })
   }
 }

Prompt for AI Agent:
In components/data-table.tsx around lines 393–402, the handler calls dataIds.indexOf twice which is O(n) and will cause lag on large datasets; replace these linear lookups with O(1) lookups by maintaining an id->index Map (created with useMemo or kept in a ref and updated whenever dataIds changes) and use map.get(active.id) and map.get(over.id) to obtain oldIndex/newIndex inside handleDragEnd; ensure the map is recomputed or updated whenever rows are reordered so it stays in sync with the current data.



============================================================================

File: components/ClientBody.tsx
Line: 19 to 25
Type: nitpick

Comment:
Extend browser extension attribute cleanup.

Currently only removing cz-shortcut-listen. Consider adding other common extension attributes that can cause hydration issues, such as those from Grammarly, LastPass, password managers, etc.



Apply this diff to extend the list:

     // Clean up any browser extension attributes that might cause hydration issues
-    const extensionAttributes = ['cz-shortcut-listen']
+    const extensionAttributes = [
+      'cz-shortcut-listen',        // Catch shortcuts extension
+      'data-new-gr-c-s-check-loaded', // Grammarly
+      'data-gr-ext-installed',     // Grammarly
+      'data-lastpass-icon-root',   // LastPass
+      'data-1p-ignore',            // 1Password
+    ]
     extensionAttributes.forEach(attr => {

Prompt for AI Agent:
In components/ClientBody.tsx around lines 19 to 25, extend the single-item extensionAttributes array to include other common extension attributes that can cause hydration issues (for example: data-grammarly-editor, data-grammarly-shadow-root, grammarly-ignore, lpignore, lastpass, autofill, password-manager, pwmanager) and keep the same removal loop; update the array to include those attribute names and leave the existing document.body.hasAttribute/removeAttribute logic unchanged so all listed attributes are removed on mount.



============================================================================

File: components/ClientBody.tsx
Line: 11
Type: nitpick

Comment:
Remove unused ref.

The bodyRef is declared but never used in the component logic. It should be removed to clean up the code.



Apply this diff:

 export default function ClientBody({ className, children }: ClientBodyProps) {
-  const bodyRef = useRef(null)
-
   useEffect(() => {


   }, [className])
 
   // Return a div that will contain the app content
   // This avoids hydration issues with the body element
-  return {children}
+  return {children}
 }

Prompt for AI Agent:
In components/ClientBody.tsx around line 11, the declaration const bodyRef = useRef(null) is unused; remove this line and any related unused import (e.g., useRef) from the file so there are no unused variables or imports remaining.



============================================================================

File: components/export/PRDDocument.tsx
Line: 119 to 144
Type: nitpick

Comment:
Improve type safety for tech stack rendering.

The typeof value === "string" check and silent return null suggest the tech stack data structure isn't well-typed. This makes the code fragile and harder to maintain.



Consider defining a proper TypeScript type for tech stack entries and filtering with type guards:

type TechStackEntry = {
  name: string;
  purpose: string;
  pros: string[];
  cons: string[];
};

// Then in the rendering:
{Object.entries(prd.techStack)
  .filter(([key]) => key !== "reasoning")
  .map(([key, value]) => {
    if (typeof value === "string") return null;
    const entry = value as TechStackEntry;
    return (
      
        {/ ... render with entry.name, entry.purpose, etc. /}
      
    );
  })}

Prompt for AI Agent:
In components/export/PRDDocument.tsx around lines 119 to 144, the render assumes tech stack entries are objects but currently checks only typeof value === "string" and silently returns null, which is fragile; define a proper TypeScript interface (e.g., name, purpose, pros: string[], cons: string[]) for tech stack entries, add a type guard function that asserts an entry matches that interface, filter Object.entries(prd.techStack) using that guard (and still exclude "reasoning"), then in the map confidently use the narrowed type (entry.name, entry.purpose, entry.pros, entry.cons) so pros/cons are arrays before mapping and eliminate the typeof string check and unsafe casts.



============================================================================

File: components/export/PRDDocument.tsx
Line: 129
Type: refactor_suggestion

Comment:
Use StyleSheet for consistency.

Lines 129 and 136 use inline style objects instead of the StyleSheet pattern used throughout the rest of the component. This reduces performance and makes styles harder to maintain.



Apply this diff to move styles to the StyleSheet:

 const styles = StyleSheet.create({
   // ... existing styles
+  prosTitle: {
+    fontSize: 13,
+    fontWeight: "bold",
+    marginBottom: 6,
+    marginTop: 8,
+    color: "#059669",
+  },
+  consTitle: {
+    fontSize: 13,
+    fontWeight: "bold",
+    marginBottom: 6,
+    marginTop: 8,
+    color: "#DC2626",
+  },
 });

 // Then use:
-Pros
+Pros
 // and
-Cons
+Cons



Also applies to: 136-136

Prompt for AI Agent:
In components/export/PRDDocument.tsx around lines 129 and 136, replace the inline style objects on the "Pros" and "Cons" Text elements with named entries in the existing StyleSheet: add new style keys (e.g., subsectionTitlePros and subsectionTitleCons or a single subsectionTitle with a colorVariant) that extend styles.subsectionTitle and set color ("#059669" and the cons color), update the Text components to use style={styles.subsectionTitlePros} / styles.subsectionTitleCons, and remove the inline style objects; ensure StyleSheet.create is used and imports remain correct.



============================================================================

File: components/export/PRDDocument.tsx
Line: 101 to 105
Type: potential_issue

Comment:
Add defensive null checks for array iterations.

Multiple sections iterate over arrays without checking if they exist. This could cause runtime errors if the PRD data is incomplete.



Add null-safe checks before mapping, for example:

-{prd.purposeAndGoals.keyObjectives.map((obj, i) => (
+{(prd.purposeAndGoals.keyObjectives || []).map((obj, i) => (


Apply similar checks to:
- prd.features.mvpFeatures (line 159)
- prd.technicalArchitecture.dataModels (line 199)
- model.fields (line 203)
- prd.timeline.phases (line 229)
- prd.risks (line 245)


Also applies to: 159-178, 199-209, 229-240, 245-253

Prompt for AI Agent:
In components/export/PRDDocument.tsx around lines 101-105 (and similarly 159-178, 199-209, 229-240, 245-253), several map iterations assume arrays exist and will throw if the PRD data is incomplete; add defensive null/undefined checks before each map (e.g., guard with Array.isArray(...) or prd?.X?.length checks) and render nothing or a fallback when the array is missing, apply the same pattern to prd.purposeAndGoals.keyObjectives, prd.features.mvpFeatures, prd.technicalArchitecture.dataModels and each model.fields, prd.timeline.phases, and prd.risks so every .map is only called when the target is a valid array.



============================================================================

File: components/questions/QuestionCard.tsx
Line: 64 to 77
Type: nitpick

Comment:
Edge case in "Other" toggle logic.

When unchecking "Other", the handler clears otherText and calls onAnswerChange(""). However, if a user toggles "Other" off and then on again, any previously entered text is lost because line 74 clears it.



Consider preserving the other text when toggling off, so users can recover their input:

   const handleOtherToggle = () => {
     const newValue = !isOtherSelected;
     setIsOtherSelected(newValue);
     if (newValue) {
       setSelectedOption(null);
       // If there's text, keep it; otherwise clear
       if (otherText.trim()) {
         onAnswerChange(otherText);
       }
     } else {
-      setOtherText("");
+      // Don't clear otherText to allow recovery if toggled back on
       onAnswerChange("");
     }
   };

Prompt for AI Agent:
In components/questions/QuestionCard.tsx around lines 64 to 77, the current handleOtherToggle clears otherText and calls onAnswerChange("") when unchecking "Other", which loses user input; change the toggle so that when turning "Other" off you only update selection state (and optionally selectedOption) but do NOT clear otherText or call onAnswerChange, so the typed text is preserved for when the user re-enables "Other"; ensure any other branch that switches to a different non-"Other" option still clears or overrides otherText/onAnswerChange as appropriate.



============================================================================

File: components/ui/breadcrumb.tsx
Line: 52 to 63
Type: potential_issue

Comment:
Fix accessibility: Remove role="link" or add tabIndex.

The BreadcrumbPage component has role="link" but is not focusable, creating a keyboard navigation barrier. Since this represents the current page (non-interactive), the role should be removed.



Based on learnings. As per coding guidelines.

Apply this diff:

   return (
     
   )


Alternatively, if you want to keep it focusable for screen readers:

   return (
     
   )

Prompt for AI Agent:
In components/ui/breadcrumb.tsx around lines 52 to 63, the BreadcrumbPage sets role="link" but represents the current, non-interactive page; remove the role="link" attribute (and remove aria-disabled since it's non-interactive) so the element is not misrepresented as a focusable control; keep aria-current="page" and existing className/props intact; alternatively, if you intend it to be focusable, add tabIndex={0} and keep role="link", but prefer removing the role for accessibility.



============================================================================

File: components/workflow/WorkflowProgress.tsx
Line: 25 to 32
Type: potential_issue

Comment:
Fix duplicate paths for "setup" and "discovery" steps.

Both the "setup" and "discovery" steps map to the same path "/chat/[id]", which will prevent proper navigation between these distinct workflow stages.



Ensure each step has a unique path. For example:

 const WORKFLOW_STEPS: WorkflowStep[] = [
-  { id: "setup", label: "Setup", path: "/chat/[id]", icon: Settings },
+  { id: "setup", label: "Setup", path: "/chat/[id]/setup", icon: Settings },
   { id: "discovery", label: "Discovery", path: "/chat/[id]", icon: MessageSquare },
   { id: "questions", label: "Questions", path: "/chat/[id]/questions", icon: HelpCircle },
   { id: "research", label: "Research", path: "/chat/[id]/research", icon: Search },
   { id: "selection", label: "Selection", path: "/chat/[id]/select", icon: CheckSquare },
   { id: "generate", label: "Generate", path: "/chat/[id]/generate", icon: FileText },
 ]

Prompt for AI Agent:
components/workflow/WorkflowProgress.tsx around lines 25 to 32: the "setup" and "discovery" steps share the same path ("/chat/[id]") which prevents distinct routing; update the WORKFLOW_STEPS array so each step has a unique path (e.g., change discovery to a dedicated route like "/chat/[id]/discovery" or another appropriate unique segment) and ensure any callers/links that rely on these step paths are updated to use the new discovery path.



============================================================================

File: components/ui/card.tsx
Line: 31 to 39
Type: nitpick

Comment:
Consider semantic HTML for CardTitle.

CardTitle renders a div which loses semantic meaning. For better accessibility and SEO, consider using a heading element (h1-h6) or allowing consumers to specify the heading level.



Example refactor to support heading levels:

-function CardTitle({ className, ...props }: React.ComponentProps) {
+function CardTitle({ 
+  className, 
+  as: Component = "h3",
+  ...props 
+}: React.ComponentProps & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }) {
   return (
-    
   )
 }

Prompt for AI Agent:
In components/ui/card.tsx around lines 31 to 39, CardTitle currently renders a non-semantic ; change it to render a semantic heading by accepting either an "as" prop (or a "level" prop that maps to h1-h6) with a sensible default (e.g., "h3"), update the component's props typing to allow a React element type or union of heading tags, render that element instead of a div while preserving data-slot, className (cn("leading-none font-semibold", className)) and spreading remaining props, and ensure ARIA/role attributes are not lost.



============================================================================

File: components/ui/sidebar.tsx
Line: 85 to 87
Type: nitpick

Comment:
Add security attributes to cookie.

The sidebar state cookie is set without security attributes. While this is client-side state and not sensitive, consider adding SameSite=Lax to prevent potential CSRF issues and Secure flag for HTTPS contexts.



Apply this diff:

-     document.cookie = ${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}
+     const secure = window.location.protocol === 'https:' ? '; Secure' : ''
+     document.cookie = ${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax${secure}

Prompt for AI Agent:
In components/ui/sidebar.tsx around lines 85 to 87, the cookie is set without security attributes; update the cookie string to include SameSite=Lax and add the Secure flag when running in an HTTPS context (e.g., check location.protocol === 'https:' or window.isSecureContext) so the cookie becomes "...; path=/; max-age=...; SameSite=Lax; Secure" for secure contexts; do not attempt HttpOnly since this is client-side.



