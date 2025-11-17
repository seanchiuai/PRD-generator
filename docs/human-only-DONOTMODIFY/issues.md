============================================================================
File: .tool-versions
Line: 1
Type: nitpick

Comment:
Consider pinning a specific Node.js version instead of "system".

Using nodejs system reduces environment reproducibility across developers and CI/CD systems. Different machines may have different Node.js versions installed, which can lead to inconsistent behavior and harder-to-debug compatibility issues.

Best practice is to pin a specific version (e.g., nodejs 20.10.0 or nodejs 18.17.0) to ensure consistent behavior across all development and deployment environments.



Are there specific reasons to use the system Node.js instead of a pinned version? If there's an established project convention, this recommendation may not apply. Alternatively, verify if there's a corresponding .nvmrc or package.json engines field that documents the required Node.js version.

Prompt for AI Agent:
In .tool-versions around line 1, the file currently uses "nodejs system" which prevents reproducible environments; replace "system" with a concrete Node.js version (e.g., nodejs 20.10.0 or the project’s chosen version) and ensure the chosen version matches any .nvmrc or package.json "engines" entry used by the project or CI so all developers and pipelines use the same Node.js release.



============================================================================
File: convex/migrations.ts
Line: 7 to 26
Type: nitpick

Comment:
Consider adding error handling and migration tracking.

The migration lacks error handling and a tracking mechanism to record whether it has been run. While the migration is idempotent, adding these features would improve robustness and observability.



Consider:
1. Wrapping the logic in try-catch to handle errors gracefully
2. Adding console logging for debugging
3. Creating a migrations table to track which migrations have been executed

Example structure:

export const migrateConversationStages = internalMutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Check if migration already ran
      const migrationRecord = await ctx.db
        .query("migrations")
        .withIndex("by_name", (q) => q.eq("name", "migrate_conversation_stages"))
        .first()
      
      if (migrationRecord) {
        console.log("Migration already executed")
        return { success: true, conversationsUpdated: 0, skipped: true }
      }

      // ... existing migration logic ...
      
      // Record migration completion
      await ctx.db.insert("migrations", {
        name: "migrate_conversation_stages",
        executedAt: Date.now(),
        conversationsUpdated: updated
      })
      
      console.log(Migration completed: ${updated} conversations updated)
      return { success: true, conversationsUpdated: updated }
    } catch (error) {
      console.error("Migration failed:", error)
      throw error
    }
  },
})

Prompt for AI Agent:
In convex/migrations.ts around lines 7 to 26, wrap the migration handler in a try/catch, add a migrations record lookup (e.g., query "migrations" by name) to skip if already executed, and log progress; run the existing conversation update loop only when no prior record exists, then insert a migration record with name, executedAt and conversationsUpdated, console.log the outcome, and on error console.error the error and rethrow so failures are visible and the migration remains idempotent.



============================================================================
File: .claude/commands/push-all.md
Line: 7 to 9
Type: potential_issue

Comment:
Note: Duplicate command documentation.

This file correctly documents the /push-all command with matching filename. However, .claude/commands/push.md also documents the same /push-all command, creating duplicate documentation.



Consider consolidating by removing the duplicate push.md file.

Prompt for AI Agent:
In .claude/commands/push-all.md around lines 7 to 9, this documents the /push-all command but a duplicate exists in .claude/commands/push.md; remove or consolidate the duplicate to avoid confusion. Delete .claude/commands/push.md (or merge its unique content into push-all.md), update any command index or README references to point to push-all.md, and run a quick repo search to ensure no remaining references to the removed file remain.



============================================================================
File: .claude/commands/push.md
Line: 7
Type: potential_issue

Comment:
Fix filename-command mismatch.

The file is named push.md but documents the /push-all command. This creates confusion between the filename and its content.



Either:
- Rename this file to push-all.md (recommended, since .claude/commands/push-all.md also exists and documents the same command)
- Or change the command name in line 7 to /push if this is meant to be a different command

Note: Since .claude/commands/push-all.md already exists documenting /push-all, this file appears to be a duplicate.

Prompt for AI Agent:
In .claude/commands/push.md around line 7, the document title shows the command "/push-all" while the filename is push.md, causing a filename-command mismatch and duplicating .claude/commands/push-all.md; either rename this file to push-all.md to match the command (recommended since push-all.md already exists) or change the command in line 7 to "/push" if the file is intended to document a different command; ensure the filename, the command header, and any internal references are consistent and remove one of the duplicate files if it's redundant.



============================================================================
File: components/techStack/DefaultStackPreview.tsx
Line: 49 to 52
Type: potential_issue

Comment:
Fix responsive class for proper mobile layout.

The col-span-2 class is applied unconditionally, but the grid only has 2 columns on md: breakpoint and above. On mobile (grid-cols-1), attempting to span 2 columns when only 1 exists is semantically incorrect. Use md:col-span-2 to apply the span only where appropriate.



Apply this diff to fix the responsive behavior:

-        
+        
           Hosting
           {stack.hosting}

Prompt for AI Agent:
In components/techStack/DefaultStackPreview.tsx around lines 49 to 52, the div unconditionally uses class "col-span-2" which is incorrect on mobile where the grid is single-column; change the class to apply the span only at medium screens by replacing "col-span-2" with "md:col-span-2" so it spans two columns only when the grid has two columns.



============================================================================
File: components/techStack/DefaultStackPreview.tsx
Line: 32 to 52
Type: nitpick

Comment:
Consider extracting repeated structure to reduce duplication.

The five tech stack rows follow an identical structure, which violates the DRY principle. While the current implementation is functional, refactoring to use a mapped array would improve maintainability.



Here's a refactored approach:

+      const stackItems = [
+        { label: 'Frontend', value: stack.frontend, fullWidth: false },
+        { label: 'Backend', value: stack.backend, fullWidth: false },
+        { label: 'Database', value: stack.database, fullWidth: false },
+        { label: 'Auth', value: stack.auth, fullWidth: false },
+        { label: 'Hosting', value: stack.hosting, fullWidth: true },
+      ]
+
       
-        
-          Frontend
-          {stack.frontend}
-        
-        
-          Backend
-          {stack.backend}
-        
-        
-          Database
-          {stack.database}
-        
-        
-          Auth
-          {stack.auth}
-        
-        
-          Hosting
-          {stack.hosting}
-        
+        {stackItems.map((item) => (
+          
+            {item.label}
+            {item.value}
+          
+        ))}

Prompt for AI Agent:
In components/techStack/DefaultStackPreview.tsx around lines 32 to 52, the five tech stack rows repeat identical markup for label and Badge; extract that repeated structure into a small array of {key,label} or similar and map over it to render each row. Replace the duplicated JSX blocks with a single map that reads the value from stack using the key (e.g., stack[key]) and preserves special props like col-span-2 for Hosting via a conditional on the key. Ensure types remain correct (narrow keys or cast if needed) and keep styling and Badge usage unchanged.



============================================================================
File: components/techStack/DefaultStackPreview.tsx
Line: 26 to 30
Type: potential_issue

Comment:
Consider using a regex replace for broader compatibility.

The replaceAll method is an ES2021 feature that may not be available in all target environments. While widely supported now, using a regex replacement ensures broader compatibility.



Apply this diff for better compatibility:

       {productType && (
         
-          Optimized for {productType.replaceAll('_', ' ')} applications
+          Optimized for {productType.replace(/_/g, ' ')} applications
         
       )}

Prompt for AI Agent:
In components/techStack/DefaultStackPreview.tsx around lines 26 to 30, the code uses String.prototype.replaceAll which may not exist in older environments; replace productType.replaceAll('_', ' ') with a regex-based replacement like productType.replace(/_/g, ' ') (or productType.split('_').join(' ')) to ensure broader compatibility while preserving the same behavior.



============================================================================
File: .claude/commands/pull.md
Line: 9
Type: potential_issue

Comment:
Add trailing newline.

The file should end with a single newline character per POSIX standards.



Apply this diff:

-fetch and pull all github changes from cloud to local. If there is conflict, explain what is going on and give me a few options including your recommended option.
+fetch and pull all github changes from cloud to local. If there is conflict, explain what is going on and give me a few options including your recommended option.
+

Prompt for AI Agent:
In .claude/commands/pull.md around line 9, the file is missing a trailing newline at EOF; add a single POSIX-compliant newline character at the end of the file so it ends with exactly one newline.



============================================================================
File: convex/migrations.ts
Line: 17 to 21
Type: nitpick

Comment:
Add type guard for currentStage field.

The code assumes conversation.currentStage exists and is a string, but doesn't validate this. Consider adding a type guard to handle cases where the field might be missing or have an unexpected type.



Apply this diff to add type safety:

       // Map old stages to new ones
-      if (newStage === "researching" || newStage === "selecting") {
+      if (
+        typeof newStage === "string" &&
+        (newStage === "researching" || newStage === "selecting")
+      ) {
         newStage = "tech-stack"
         await ctx.db.patch(conversation._id, { currentStage: newStage })
         updated++
       }

Prompt for AI Agent:
In convex/migrations.ts around lines 17 to 21, the code assumes conversation.currentStage exists and is a string; add a type guard that verifies typeof conversation.currentStage === "string" (and optionally that it is one of the expected stage values) before assigning newStage or comparing values; if the guard fails, skip the transition logic for that conversation (or set a safe default) so you only call ctx.db.patch when currentStage is valid, thereby preventing runtime errors from missing or malformed fields.



============================================================================
File: convex/migrations.ts
Line: 10 to 22
Type: potential_issue

Comment:
Consider pagination for large datasets.

Querying all conversations in a single transaction could hit memory or time limits if the dataset is large. Consider processing conversations in batches using pagination.



Apply this diff to add pagination:

 export const migrateConversationStages = internalMutation({
   args: {},
   handler: async (ctx) => {
-    const conversations = await ctx.db.query("conversations").collect()
-    let updated = 0
+    let updated = 0
+    let hasMore = true
+    let cursor = null
 
-    for (const conversation of conversations) {
-      let newStage = conversation.currentStage
-
-      // Map old stages to new ones
-      if (newStage === "researching" || newStage === "selecting") {
-        newStage = "tech-stack"
-        await ctx.db.patch(conversation._id, { currentStage: newStage })
-        updated++
+    while (hasMore) {
+      const page = await ctx.db
+        .query("conversations")
+        .paginate({ cursor, numItems: 100 })
+      
+      for (const conversation of page.page) {
+        let newStage = conversation.currentStage
+
+        // Map old stages to new ones
+        if (newStage === "researching" || newStage === "selecting") {
+          newStage = "tech-stack"
+          await ctx.db.patch(conversation._id, { currentStage: newStage })
+          updated++
+        }
       }
+      
+      hasMore = page.continueCursor !== null
+      cursor = page.continueCursor
     }
 
     return { success: true, conversationsUpdated: updated }

Prompt for AI Agent:
In convex/migrations.ts around lines 10 to 22, the migration currently collects all conversations into memory then iterates them, which can OOM or time out on large datasets; change this to paginate through conversations in batches (e.g., set a pageSize like 100–1000), fetch one page at a time using the query pagination mechanism or cursor/offset, process and patch each conversation in that page (counting updates), then fetch the next page until no more results, ensuring each batch is handled and committed before loading the next to avoid holding the entire dataset in memory.



============================================================================
File: convex/auth.config.ts
Line: 9 to 20
Type: nitpick

Comment:
Consider adding TypeScript types for the auth config.

The authConfig object lacks type annotations, which reduces type safety and IDE support.

Consider defining an interface:

interface AuthProvider {
  domain: string;
  applicationID: string;
}

interface AuthConfig {
  providers: AuthProvider[];
}

const authConfig: AuthConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

Prompt for AI Agent:
In convex/auth.config.ts around lines 9 to 20, the authConfig object is untyped; add TypeScript interfaces for the provider and the config (e.g. AuthProvider and AuthConfig) and annotate the exported authConfig as AuthConfig, ensuring the provider fields (domain and applicationID) have appropriate types (use union to allow undefined for process.env if needed) so the file gains full type safety and IDE support.



============================================================================
File: hooks/use-mobile.ts
Line: 6 to 8
Type: potential_issue

Comment:
Fix potential SSR hydration mismatch.

The hook initializes state with a client-side calculation (window.innerWidth (
-    typeof window !== "undefined" ? window.innerWidth (undefined)
 
   React.useEffect(() => {
     const mql = window.matchMedia((max-width: ${MOBILE_BREAKPOINT - 1}px))
     const onChange = () => {
       setIsMobile(mql.matches)
     }
     mql.addEventListener("change", onChange)
     setIsMobile(mql.matches)
     return () => mql.removeEventListener("change", onChange)
   }, [])
 
-  return isMobile ?? false
+  return !!isMobile
 }


This ensures consistent behavior during SSR/hydration: the hook returns false until the client-side effect runs and sets the actual viewport state.


Also applies to: 20-20

Prompt for AI Agent:
In hooks/use-mobile.ts around lines 6-8 (and also line 20), the state is initialized using a client-only window check which can cause SSR hydration mismatches; change the initial useState to always start as undefined (no window calculation), move the viewport check into a useEffect that runs client-side to set isMobile based on window.innerWidth, add a resize event listener inside that effect to update state on resize and remove the listener in the cleanup, and ensure any consumer sees a consistent falsey/placeholder value until the effect runs to avoid hydration warnings.



============================================================================
File: app/loading.tsx
Line: 1 to 10
Type: potential_issue

Comment:
Add accessibility attributes for screen readers.

The loading spinner lacks accessibility attributes. Screen reader users won't receive feedback that content is loading.

Apply this diff to improve accessibility:

 export default function Loading() {
   return (
     
       
-        
+        
         Loading...
       
     
   );
 }

Prompt for AI Agent:
In app/loading.tsx around lines 1 to 10, the spinner lacks accessibility attributes for screen readers; add ARIA attributes and a hidden readable text node so assistive tech announces loading: wrap the visual spinner and text in an element with role="status" and aria-live="polite" (and aria-busy="true" while loading), ensure the visible "Loading..." text is accessible or add an additional visually-hidden/sr-only text node that reads "Loading…" for screen readers, and add an aria-hidden="true" to the purely decorative animated div if you keep it separate from the status text.



============================================================================
File: app/error.tsx
Line: 15 to 18
Type: nitpick

Comment:
Consider removing redundant console.error.

Both logger.error and console.error are called, which duplicates error logging. If the logger already handles client-side logging appropriately, the additional console.error may be unnecessary.

If the logger utility already logs to the console in development, consider removing the redundant call:

   useEffect(() => {
     logger.error("App error boundary", error);
-    console.error("Application error:", error); // Fallback for client-side
   }, [error]);


Keep the console.error only if there's a specific reason to have both (e.g., the logger doesn't output to console in certain environments).

Prompt for AI Agent:
In app/error.tsx around lines 15 to 18, there is a redundant console.error call directly after logger.error; remove the console.error("Application error:", error) to avoid duplicate logging, or if you need the console fallback in specific environments, wrap the console.error in an environment check (e.g., process.env.NODE_ENV === "development" or !loggerOutputsToConsole flag) so the logger remains the single source of truth for error output.



============================================================================
File: hooks/use-store-user.ts
Line: 15 to 24
Type: potential_issue

Comment:
Remove storeUser from the dependency array to prevent excessive API calls.

The useMutation hook returns a new function reference on every render, causing the effect to re-run continuously. This leads to unnecessary mutations being sent to Convex on every render.

Apply this diff:

   useEffect(() => {
     // Only store user once Clerk has loaded and user is authenticated
     if (!isLoaded) return;
     if (!user) return;
 
     // Store/update user in Convex
     storeUser().catch((error) => {
       logger.error("useStoreUser", error, { userId: user.id });
     });
-  }, [user, isLoaded, storeUser]);
+  }, [user?.id, isLoaded]);
 

Note: Changed to user?.id to track identity changes rather than the entire user object reference.

Prompt for AI Agent:
In hooks/use-store-user.ts around lines 15 to 24, the effect is re-running too often because storeUser (a new function reference from useMutation) is included in the dependency array; remove storeUser from the dependencies and instead depend on isLoaded and user?.id so the effect only runs when Clerk finishes loading or the authenticated user's identity changes, and keep the same error handling inside the effect.



============================================================================
File: docs/frontend-architecture.md
Line: 7 to 70
Type: nitpick

Comment:
Add language specifiers to fenced code blocks.

Several fenced code blocks are missing language specifiers, which helps with syntax highlighting and clarity. Based on static analysis hints, add language specifiers to blocks at lines 7, 66, and 75.



Example fix for line 7:

-
+ /app
   page.tsx                          # Home/Auth landing page

Prompt for AI Agent:
docs/frontend-architecture.md around lines 7 to 70: several fenced code blocks lack language specifiers; update each fenced block (the main directory tree at the top and the smaller blocks identified by reviewer around lines 66 and 75) to include an appropriate language tag (use "text" for directory trees or "bash" if you prefer shell context) by changing  to text at the opening fence and leaving the closing fence as-is so syntax highlighting and clarity are enabled.



============================================================================
File: SETUP.md
Line: 252 to 266
Type: nitpick

Comment:
Add language specifier to the code block.

The project structure code block is missing a language identifier, which affects syntax highlighting and accessibility.



Apply this diff:

-
+ ├── app/                 # Next.js pages and layouts (App Router)
 │   ├── layout.tsx       # Root layout with ClerkProvider


Based on static analysis hints.

Prompt for AI Agent:
In SETUP.md around lines 252 to 266, the fenced code block showing the project structure lacks a language specifier; update the opening fence to include a plain text specifier (e.g., change  to plaintext) so the block becomes ```plaintext and leave the closing fence unchanged, ensuring the code block renders with the specified language for proper highlighting/accessibility.



============================================================================
File: components/app-sidebar.tsx
Line: 23 to 37
Type: nitpick

Comment:
Implement Settings and Help navigation URLs.

The Settings and Help menu items currently use placeholder "#" URLs. These should be updated with actual routes once those pages are implemented.



Would you like me to help identify the appropriate routes for these menu items based on the routing structure?

Prompt for AI Agent:
In components/app-sidebar.tsx around lines 23 to 37, the Settings and Help nav items use placeholder "#" URLs; replace them with the real route paths (e.g., "/settings" and "/help" or the app's canonical routes) and, if your project has a central routes/constants file, import and use those constants instead of hardcoded strings to avoid duplication and make future refactors easier. Ensure the updated URLs match the routing convention used in the app (Next.js pages, React Router paths, or app route constants) and that any Link/NavLink components still receive the new values.



============================================================================
File: SETUP.md
Line: 62
Type: nitpick

Comment:
Fix markdown formatting for better readability.

Multiple formatting issues flagged by markdownlint:
1. Code blocks should be surrounded by blank lines (lines 62, 194, 222)
2. Headings should have blank lines below them (lines 164, 168, 173, 179, 184)

These improve document readability and comply with markdown best practices.



Add blank lines after headings and around code blocks throughout the troubleshooting section and deployment instructions.

Based on static analysis hints.


Also applies to: 164-187, 194-196, 222-224

Prompt for AI Agent:
In SETUP.md around lines 62, 164-187, 194-196, and 222-224, several Markdown formatting issues need fixing: add a blank line before and after each fenced code block (e.g., lines 62, 194, 222) and add a blank line immediately below each heading at lines 164, 168, 173, 179, and 184 so headings are separated from following content; update the file by inserting the necessary single blank lines at those exact locations so code blocks are surrounded by blank lines and each heading has one blank line beneath it throughout the troubleshooting and deployment sections.



============================================================================
File: .claude/commands/refactor.md
Line: 18
Type: nitpick

Comment:
Add trailing newline for markdown consistency.

The file is missing a newline character at the end, which is a markdown best practice.



Apply this diff:

-- Output all changes as diffs and highlight anything risky or needing follow-up tests
+- Output all changes as diffs and highlight anything risky or needing follow-up tests
+

Prompt for AI Agent:
In .claude/commands/refactor.md at line 18, the file is missing a trailing newline; add a single newline character at the end of the file so it ends with a blank line (ensuring the file terminates with '\n') and save the file to satisfy markdown and POSIX text-file conventions.



============================================================================
File: app/api/conversation/message/route.ts
Line: 28 to 36
Type: nitpick

Comment:
Consider implementing rate limiting for conversation endpoints.

The endpoint processes user messages without rate limiting, which could lead to abuse or excessive API costs.

Consider implementing rate limiting using:
- IP-based rate limiting for anonymous users
- User-based rate limiting for authenticated users (since userId is available from withAuth)
- Token budget tracking per user/session

Example libraries: express-rate-limit, upstash-ratelimit, or Next.js middleware-based solutions.

Prompt for AI Agent:
In app/api/conversation/message/route.ts around lines 28-36 the conversation endpoint calls the Anthropics API without any rate limiting; add a pre-request rate limiter that triggers before anthropic.messages.create to prevent abuse and runaway costs. Implement IP-based limits for anonymous requests and userId-based limits for authenticated requests (use the userId from withAuth), and add optional per-user/token budget tracking for max tokens per minute/day; use a shared store like Redis/Upstash or a Next.js middleware solution and an existing library (express-rate-limit, upstash-ratelimit, or similar) to increment/check counters and return HTTP 429 with a clear error when limits are exceeded, and ensure limits are enforced prior to forwarding the request to the external API.



============================================================================
File: lib/constants.ts
Line: 154 to 162
Type: refactor_suggestion

Comment:
Extract and deduplicate filename sanitization logic.

The regex chain for sanitizing product names is duplicated and complex. Extract it to a testable helper function to improve maintainability and reduce duplication.



/
 * Sanitizes a product name for use in filenames
 * - Removes special characters
 * - Collapses multiple underscores
 * - Trims leading/trailing underscores
 */
function sanitizeForFilename(productName: string): string {
  return (productName || "unnamed_product")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export const EXPORT_PATTERNS = {
  / JSON file name pattern: {productName}_PRD_{timestamp}.json */
  JSON_FILENAME: (productName: string) =>
    ${sanitizeForFilename(productName)}_PRD_${Date.now()}.json,

  / PDF file name pattern: {productName}_PRD_{timestamp}.pdf */
  PDF_FILENAME: (productName: string) =>
    ${sanitizeForFilename(productName)}_PRD_${Date.now()}.pdf,
} as const;


This also makes the logic unit-testable independently.

Prompt for AI Agent:
In lib/constants.ts around lines 154 to 162, the product-name sanitization regex chain is duplicated and hard to test; extract it into a small reusable helper named sanitizeForFilename(productName: string) that returns (productName || "unnamed_product").trim() with the same replace sequence (.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")), replace both JSON_FILENAME and PDF_FILENAME to call that helper, and export the helper so it can be unit-tested independently while keeping EXPORT_PATTERNS as const.



============================================================================
File: SETUP.md
Line: 299
Type: nitpick

Comment:
Convert emphasized text to proper heading.

Line 299 uses emphasis (Happy coding! 🎉) instead of a proper heading. While this works visually, using a heading would be more semantically correct.



-Happy coding! 🎉
+## Happy coding! 🎉


Based on static analysis hints.

Prompt for AI Agent:
In SETUP.md around line 299, the footer currently uses bold emphasis ("Happy coding! 🎉") instead of a semantic heading; replace the emphasized text with an appropriate Markdown heading (e.g., prefix with one or more # characters) so the line becomes a proper heading while preserving the text and emoji, and ensure surrounding spacing follows Markdown heading conventions.



============================================================================
File: app/chat/[conversationId]/tech-stack/page.tsx
Line: 224 to 225
Type: nitpick

Comment:
Add runtime validation before type assertion.

The type assertion as TechOption[] assumes the data matches the expected structure but doesn't validate it. If the data format is incorrect, this could cause runtime errors downstream.



Consider adding a type guard or runtime check:

// In a utils file or inline
function isValidTechOption(obj: unknown): obj is TechOption {
  return typeof obj === 'object' && obj !== null && 'name' in obj;
}

// Then in handleSelection:
const options = (Array.isArray(categoryData) ? categoryData : (categoryData?.options || []))
  .filter(isValidTechOption);

if (options.length === 0) {
  logger.warn("TechStackPage.handleSelection", "No valid options found", { category });
  return;
}

Prompt for AI Agent:
In app/chat/[conversationId]/tech-stack/page.tsx around lines 224-225, the code casts categoryData to TechOption[] without runtime validation which can cause runtime errors; add a type guard (either in a utils file or inline) to check each item is a valid TechOption (e.g., object non-null and has required properties like name), replace the direct type assertion by building options as Array.isArray(categoryData) ? categoryData.filter(isValidTechOption) : (Array.isArray(categoryData?.options) ? categoryData.options.filter(isValidTechOption) : []), and if options.length === 0 log a warning with context (category and conversationId) and return early to avoid downstream failures.



============================================================================
File: components/export/pdf/PDFHeader.tsx
Line: 17 to 21
Type: nitpick

Comment:
Consider explicit locale for consistent date formatting.

The toLocaleDateString() method without arguments uses the user's default locale, which may produce inconsistent date formats across different environments (e.g., "MM/DD/YYYY" vs "DD/MM/YYYY"). For PDF exports that may be shared across regions, consider using an explicit locale and options.



Apply this diff for consistent formatting:

  const getFormattedDate = () => {
-   if (!generatedAt) return new Date().toLocaleDateString();
+   if (!generatedAt) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (typeof generatedAt === 'string') return generatedAt;
-   return generatedAt.toLocaleDateString();
+   return generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

Prompt for AI Agent:
In components/export/pdf/PDFHeader.tsx around lines 17 to 21, the current getFormattedDate uses toLocaleDateString() with no locale which yields inconsistent formats across environments; change it to format dates with an explicit locale and options (e.g., specify a constant locale like 'en-GB' or 'en-US' and options such as { year: 'numeric', month: 'short', day: '2-digit' }) and apply that when generatedAt is a Date; leave string values untouched but document/normalize if needed.



============================================================================
File: app/chat/[conversationId]/tech-stack/page.tsx
Line: 99 to 100
Type: potential_issue

Comment:
Clarify or remove the arbitrary threshold for validation.

The validation short-circuits if fewer than 2 selections exist. This magic number is unexplained and may prevent useful validation feedback for users who have made their first selection.



Consider:
- Removing the threshold if not necessary
- Documenting why 2 selections minimum is required for meaningful validation
- Extracting to a named constant if the threshold is intentional




============================================================================
File: components/selection/TechStackCard.tsx
Line: 65 to 69
Type: nitpick

Comment:
Array index used as React key.

Lines 67 and 78 use array indices as keys for list items. While this works for static lists that don't reorder, it's not ideal if the pros/cons arrays could be modified dynamically.



If pros/cons are stable strings, consider using the string content as the key:

-                    {option.pros.map((pro, i) => (
-                      {pro}
+                    {option.pros.map((pro) => (
+                      {pro}
                     ))}


Apply the same pattern to cons. Only refactor if the strings are guaranteed to be unique within each array.


Also applies to: 76-80

Prompt for AI Agent:
In components/selection/TechStackCard.tsx around lines 65-69 (and similarly 76-80 for cons), the code uses array indices as React keys for list items; change keys to use the string values (e.g., key={pro} and key={con}) when those strings are guaranteed unique within each array. If uniqueness cannot be guaranteed, use a stable fallback that combines the string and index (e.g., key={${pro}-${i}}) to avoid pure index keys. Ensure both pros and cons list items are updated accordingly.



============================================================================
File: app/api/conversation/initial-message/route.ts
Line: 26 to 54
Type: nitpick

Comment:
Consider monitoring token usage and rate limiting.

The endpoint returns token usage but doesn't validate or alert on high consumption. Additionally, there's no visible rate limiting for this authenticated endpoint.



Questions to verify:
1. Is rate limiting handled by the withAuth middleware or another layer?
2. Should there be alerting/logging when token usage is unusually high?
3. Are there per-user quotas that should be checked?



Consider adding:
// After receiving the response
if (response.usage.output_tokens > TOKEN_LIMITS.CONVERSATION * 0.8) {
  logger.warn("High token usage", "Approaching token limit", {
    userId,
    usage: response.usage,
    limit: TOKEN_LIMITS.CONVERSATION,
  });
}

Prompt for AI Agent:
In app/api/conversation/initial-message/route.ts around lines 26 to 54, the code returns token usage but does not validate or act on high token consumption nor enforce rate/quota checks; update the handler to (1) verify whether rate limiting is enforced by withAuth or add an explicit per-request rate/quota check tied to the authenticated user (reject requests that exceed per-user daily or per-minute quotas with a 429), (2) after receiving the Anthropic response inspect response.usage and log a warning when output_tokens (or total tokens) exceed a threshold (e.g., 80% of TOKEN_LIMITS.CONVERSATION) including userId, usage and limit, and (3) ensure any quota consumption is recorded (increment user usage counters) before returning the response so subsequent requests are rate-limited; use structured logger.warn for high usage and respond with appropriate HTTP status for quota/rate violations.



============================================================================
File: docs/convex-patterns.md
Line: 354 to 374
Type: potential_issue

Comment:
Variable name error in TypeScript example.

Line 367 uses the wrong variable name. The code declares idToUsername: Record, string> but then assigns to users[user._id] which doesn't exist.



Apply this diff:

  export const exampleQuery = query({
    args: { userIds: v.array(v.id("users")) },
    handler: async (ctx, args) => {
      const idToUsername: Record, string> = {};
        for (const userId of args.userIds) {
          const user = await ctx.db.get(userId);
            if (user) {
-             users[user._id] = user.username;
+             idToUsername[user._id] = user.username;
            }
          }

        return idToUsername;
    },
  });

Prompt for AI Agent:
In docs/convex-patterns.md around lines 354 to 374, the TypeScript example declares idToUsername: Record, string> but mistakenly assigns to users[user._id]; replace that incorrect variable reference with idToUsername[user._id] so assignments use the declared map, ensuring the function populates and returns idToUsername correctly.



============================================================================
File: lib/prompts/markdowns/context-extraction.md
Line: 1 to 25
Type: nitpick

Comment:
Add a top-level heading and trailing newline.

Two minor issues flagged by static analysis:
1. Missing level-1 heading at the start of the file
2. Missing trailing newline at end of file



Apply this diff:

+# Context Extraction Prompt
+
 Analyze the following product discovery conversation and extract key information about the product being discussed.

 Even if the conversation is very brief, make your best attempt to extract whatever information is available.
 
 Conversation:
 {messages}
 
 Extract and return ONLY a JSON object (no markdown, no explanation) with this exact structure:
 
 {
   "productName": "Name of the product (or generate a descriptive name if not mentioned)",
   "description": "Brief 1-2 sentence description of what the product does",
   "targetAudience": "Who will use this product (be specific if mentioned, otherwise infer)",
   "keyFeatures": ["Feature 1", "Feature 2", ...],
   "problemStatement": "What problem does this product solve",
   "technicalPreferences": ["Any tech mentioned like 'mobile app', 'web', 'AI-powered', etc."]
 }
 
 Guidelines:
 - If information is not explicitly mentioned, make reasonable inferences
 - Be concise but specific
 - Extract all features mentioned, even if briefly
 - Include any technical requirements or preferences mentioned
 - If the conversation is very short, still provide your best interpretation
-- Product name: if not mentioned, create a descriptive name based on the concept
+- Product name: if not mentioned, create a descriptive name based on the concept
+


Based on static analysis hints.

Prompt for AI Agent:
In lib/prompts/markdowns/context-extraction.md around lines 1 to 25, the file is missing a level-1 heading at the top and lacks a trailing newline at the end; add a single top-level heading (e.g., "# Context Extraction Prompt") as the very first line, ensure the existing prompt content follows below it unchanged, and make sure the file ends with a newline character so the last line is terminated.



============================================================================
File: components/dashboard/ProfileMenu.tsx
Line: 62 to 77
Type: nitpick

Comment:
Extract duplicate Avatar rendering logic.

The Avatar with AvatarFallback is rendered twice (lines 62-67 and 73-77) with slightly different sizes. Consider extracting to a helper component or function to reduce duplication.



Example refactor:

const UserAvatar = ({ size = "h-10 w-10" }: { size?: string }) => (
  
    
    
      {initials}
    
  
);


Then use  and  in the two locations.

Prompt for AI Agent:
In components/dashboard/ProfileMenu.tsx around lines 62 to 77, the Avatar + AvatarImage + AvatarFallback block is duplicated with only size differing; extract this into a small presentational component (e.g., UserAvatar) that accepts a size prop (defaulting to the smaller class) and re-use it in both places, passing "h-10 w-10" and "h-12 w-12" as needed; ensure the new component uses the same userAvatar, userName and initials variables and preserves the AvatarFallback classes and content.



============================================================================
File: app/chat/[conversationId]/select/page.tsx
Line: 8 to 12
Type: nitpick

Comment:
Type assertion may be unsafe.

The conversationId is cast directly to Id without validation. If the route parameter is malformed or missing, this could cause runtime issues.



Consider adding validation:

  const params = useParams();
  const router = useRouter();
- const conversationId = params.conversationId as Id;
  const { toast } = useToast();
+ 
+ const conversationId = params.conversationId as Id;
+ 
+ if (!conversationId) {
+   router.replace('/dashboard');
+   return null;
+ }

Prompt for AI Agent:
In app/chat/[conversationId]/select/page.tsx around lines 8 to 12, the code unsafely casts params.conversationId to Id; instead, validate the param at runtime before asserting its type: check that params?.conversationId exists and matches your expected ID shape (e.g. regex or a small validator / zod schema), if invalid show the toast error and redirect/router.replace to a safe route (or render a fallback) and only then narrow the type or cast; ensure all code paths handle the missing/ malformed case to avoid runtime errors.



============================================================================
File: components/dashboard/PRDCard.tsx
Line: 76 to 81
Type: potential_issue

Comment:
"Export" menu item only navigates instead of exporting.

The menu item is labeled "Export" with a Download icon, but it only routes to the PRD detail page. Users will expect an immediate export action (e.g., PDF download).



Consider either:
1. Renaming to "View & Export" or "Export Options" to clarify the navigation
2. Implementing direct export functionality here (if export utilities are available)

Prompt for AI Agent:
In components/dashboard/PRDCard.tsx around lines 76 to 81, the DropdownMenuItem labeled "Export" only navigates to the PRD detail page which is misleading; either rename the menu item to something like "View & Export" or "Export Options" to reflect navigation, or implement direct export: replace the router.push call with a handler that calls the existing export utility (e.g., generate PDF/CSV) for prd._id, triggers download (or shows export modal), and handle errors/loading state; ensure the icon and label match the chosen behavior and keep the navigation option separate if needed.



============================================================================
File: app/api/conversation/message/route.ts
Line: 23 to 25
Type: potential_issue

Comment:
Add validation for individual message structure.

The code validates that messages is an array but doesn't validate the structure of individual messages (required fields, valid role values, etc.).

Apply this diff to add comprehensive validation:

 if (!messages || !Array.isArray(messages)) {
   return handleValidationError("Messages array required");
 }

+// Validate each message structure
+const validRoles = ['user', 'assistant'];
+for (const msg of messages) {
+  if (!msg.role || !validRoles.includes(msg.role)) {
+    return handleValidationError(Invalid message role: ${msg.role});
+  }
+  if (!msg.content || typeof msg.content !== 'string') {
+    return handleValidationError("Each message must have content");
+  }
+}

Prompt for AI Agent:
In app/api/conversation/message/route.ts around lines 23 to 25, the code only checks that messages is an array but does not validate each message's shape; update the validation to iterate over messages and verify each item is an object with required fields (e.g., id optional, role required and one of allowed values like "user"|"assistant"|"system", content required and a non-empty string), check types and reasonable length limits, and collect/return a descriptive handleValidationError when any item fails (or return the first failing message index and reason). Implement this using your project's validation approach (e.g., Zod schema or explicit checks), and ensure the function returns before proceeding when validation fails.



============================================================================
File: lib/logger.ts
Line: 20 to 43
Type: refactor_suggestion

Comment:
Refactor to reduce duplication with the internal log method.

The error method duplicates logic already present in the log method (timestamp generation, environment checking, console selection). This creates maintenance overhead and potential inconsistencies.



Consider refactoring to delegate to the internal log method:

  error(context: string, error: unknown, metadata?: LogMetadata): void {
-   const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
-
-   if (this.isDevelopment) {
-     console.error([ERROR] [${timestamp}] ${context}:, {
-       message: errorMessage,
-       stack: errorStack,
-       ...metadata,
-     });
-   } else {
-     // In production, send to logging service
-     // Example: Sentry.captureException(error, { tags: { context }, extra: metadata });
-     console.error(JSON.stringify({
-       level: "error",
-       timestamp,
-       context,
-       message: errorMessage,
-       stack: errorStack,
-       ...metadata,
-     }));
-   }
+   
+   this.log("error", context, errorMessage, {
+     stack: errorStack,
+     ...metadata,
+   });
  }

Prompt for AI Agent:
In lib/logger.ts around lines 20 to 43, the error method duplicates timestamp creation, environment branching, and console output logic already handled by the internal log method; update error to build an appropriate payload (context, level="error", message and optional stack and metadata) and call the internal log(...) instead of reimplementing the logic so all formatting, environment handling and output are centralized in log; ensure error still accepts unknown, extracts message/stack when Error, preserves metadata, and passes a clear level or options to the internal method.



============================================================================
File: components/nav-main.tsx
Line: 26 to 32
Type: potential_issue

Comment:
The "Add Task" button has no click handler.

The button renders but doesn't perform any action when clicked. This appears to be incomplete functionality.




Do you want me to help implement the click handler, or should this button be wired to a specific route/action?

Prompt for AI Agent:
In components/nav-main.tsx around lines 26–32 the SidebarMenuButton for "Add Task" renders without an onClick, so it does nothing when clicked; add an onClick handler that either calls a prop callback (e.g., props.onAddTask) if provided or falls back to client-side navigation to the task creation route (e.g., useRouter().push('/tasks/new')), and export/accept the onAddTask prop in the component props so callers can override behavior; ensure you import useRouter from 'next/router' or 'next/navigation' depending on app router usage and keep the button styling unchanged.



============================================================================
File: README.md
Line: 1 to 231
Type: potential_issue

Comment:
Address markdown formatting issues.

Static analysis identified several formatting issues that should be corrected:

1. Missing blank lines around fenced code blocks (lines 36, 38, 40, 42, 44, 46, 93, 95)
2. Missing language specifiers on code blocks (lines 93, 157)
3. Repeated word "only" in line 150
4. Missing final newline at end of file

These don't affect functionality but should be fixed for consistency and proper rendering.



Key fixes needed:
- Add blank lines before and after all code blocks
- Add language specifiers:  bash  or  env  or  `text 
- Rephrase line 150 to avoid repetition: "Start only Next.js frontend" → "Start Next.js frontend only" or "Start frontend only"
- Add a newline at the end of the file




============================================================================
File: components/tech-stack/CategorySection.tsx
Line: 74 to 80
Type: nitpick

Comment:
Consider matching skeleton count to expected options.

The loading state renders exactly 3 CategorySkeleton components, but the actual options count may vary. This could cause layout shift when the loading completes and actual options are rendered. Consider either:
1. Passing expected count as a prop
2. Using a single skeleton that spans the full width
3. Accepting the minor layout shift as acceptable UX



If you want to improve this:

{isLoading && (
  
    {Array.from({ length: 3 }).map((_, i) => (
      
    ))}
  
)}


Or pass expectedOptionsCount as a prop for more accurate loading states.

Prompt for AI Agent:
In components/tech-stack/CategorySection.tsx around lines 74-80, the loading state currently renders exactly three CategorySkeletons causing layout shifts when the actual options count differs; update the component to accept an optional expectedOptionsCount prop (default to 3) and render that many skeletons (e.g., map over Array.from({ length: expectedOptionsCount }) to produce CategorySkeleton elements with stable keys), and ensure the skeleton container uses the same grid classes used for the real options so the loading layout matches the final layout.



============================================================================
File: components/workflow/SkipButton.tsx
Line: 55 to 62
Type: nitpick

Comment:
Use the centralized logger instead of console.error.

The PR introduces a new structured logger utility (lib/logger.ts) that should be used consistently across the codebase for better observability and structured error tracking.



Apply this diff:

+"use client"
+
+import { logger } from "@/lib/logger"
 import { useState } from "react"
 // ... other imports

 const handleConfirmedSkip = async () => {
   setShowConfirmDialog(false)
   try {
     await onSkip()
   } catch (error) {
-    console.error('Error during skip:', error)
+    logger.error('SkipButton', error)
   }
 }

Prompt for AI Agent:
In components/workflow/SkipButton.tsx around lines 55 to 62, replace the use of console.error with the centralized logger: import the logger from lib/logger (e.g. import logger from 'lib/logger') at the top of the file, then change the catch block to call logger.error with a descriptive message and include the caught error (and any relevant context such as the action name or task id) so the error is recorded in the structured logger instead of console.



============================================================================
File: components/tech-stack/TechStackCard.tsx
Line: 19
Type: nitpick

Comment:
Consider making the minimum height responsive.

The fixed min-h-[400px] might not work well on smaller screens or with varying content lengths. Consider using a responsive approach or allowing the content to determine the height naturally.



       className={cn(
-        "cursor-pointer transition-all hover:shadow-md relative min-h-[400px] flex flex-col",
+        "cursor-pointer transition-all hover:shadow-md relative flex flex-col",
         isSelected && "ring-2 ring-primary shadow-lg"
       )}


Or use responsive min-height:

-        "cursor-pointer transition-all hover:shadow-md relative min-h-[400px] flex flex-col",
+        "cursor-pointer transition-all hover:shadow-md relative min-h-[300px] sm:min-h-[400px] flex flex-col",

Prompt for AI Agent:
In components/tech-stack/TechStackCard.tsx around line 19, the hardcoded class "min-h-[400px]" makes the card too tall on small screens; remove the fixed min-height or make it responsive (for example use no min-height on small viewports and apply the 400px minimum at md/sm breakpoints, or replace with a viewport-relative value like an arbitrary Tailwind min-h using min(...) such as min-h-[min(40vh,400px)]). Update the class string accordingly so small screens allow natural height while larger screens retain the intended minimum.



============================================================================
File: app/api/research/tech-stack/route.ts
Line: 156 to 293
Type: nitpick

Comment:
Consider refactoring for maintainability.

The parseResponse function contains complex parsing logic with multiple patterns. While the implementation handles various response formats, the cognitive complexity is high. Consider extracting each pattern into separate named functions for better readability and maintainability.



Example structure:

function parseResponse(content: string, category: string): TechOption[] {
  try {
    return tryParseJson(content) 
      || tryParseNumberedList(content)
      || tryParseMarkdownHeaders(content)
      || tryParseInlineBold(content)
      || tryParseBoldText(content)
      || [];
  } catch (error) {
    logger.error("Research Parse Error", error);
    return [];
  }
}


This would improve testability and make it easier to add new parsing patterns in the future.




============================================================================
File: app/chat/[conversationId]/generate/page.tsx
Line: 27
Type: refactor_suggestion

Comment:
Replace any type with proper PRD type.

Line 27 uses any for the PRD state, which bypasses TypeScript's type safety. Use the PRDData type from @/types instead.



-  const [prd, setPrd] = useState(null);
+  const [prd, setPrd] = useState(null);


Don't forget to import PRDData:

+import { PRDData } from "@/types";

Prompt for AI Agent:
In app/chat/[conversationId]/generate/page.tsx around line 27, the PRD state is declared with useState(null), which bypasses TypeScript safety; change it to use useState(null) and import PRDData from "@/types" at the top of the file (ensure the import is added if missing), and update any places that assume a different shape to reflect the PRDData type.



============================================================================
File: components/dashboard/SortControls.tsx
Line: 12
Type: nitpick

Comment:
Consider exporting SortOption type.

The SortOption type is defined locally but may be needed by parent components that use SortControls. If this type is used elsewhere in the codebase, consider moving it to a shared types file or exporting it from this module.



Apply this diff if the type should be exported:

-type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";
+export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

Prompt for AI Agent:
In components/dashboard/SortControls.tsx around line 12, the SortOption type is declared but not exported; export it (or move it to a shared types file and export from there) so parent components can import and reuse the type. Update the file to export the type (or create/extend a shared types module and export from that module) and update any imports in other files to reference the exported SortOption.



============================================================================
File: lib/parse-ai-json.ts
Line: 27 to 37
Type: potential_issue

Comment:
Critical logic error: startChar never assigned in fallback branch.

Lines 29 and 33 use TypeScript type assertions (startChar as '{' and startChar as '[') which don't modify the startChar variable. The variable remains null throughout this branch, causing incorrect behavior in the brace-matching logic below.



Apply this diff to fix the logic:

     if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
       startIndex = objectStart;
-      startChar as '{';
+      const startChar = '{';
       endChar = '}';
     } else if (arrayStart !== -1) {
       startIndex = arrayStart;
-      startChar as '[';
+      const startChar = '[';
       endChar = ']';
     } else {
       return null;
     }


Note: You'll also need to remove the outer startChar declaration on line 18 since it should be scoped to each branch.

Prompt for AI Agent:
In lib/parse-ai-json.ts around lines 27 to 37, the branch code uses TypeScript assertions (startChar as '{' / startChar as '[') which do not assign startChar, leaving it null and breaking the brace-matching logic; replace those assertions with actual assignments (startChar = '{' and startChar = '['), and scope startChar inside each branch by removing the outer declaration on line 18 and declaring startChar locally in each branch so it is correctly set before use.



============================================================================
File: components/export/pdf/FeaturesPage.tsx
Line: 19 to 38
Type: nitpick

Comment:
Consider using stable identifiers instead of array indices as keys.

Lines 20 and 32 use array indices as React keys. While this works for static PDF rendering, using stable identifiers from the data (if available) would be more robust and align with React best practices.



If your Feature type includes an id field, use it instead:

-        {prd.features.mvpFeatures.map((feature, i) => (
-          
+        {prd.features.mvpFeatures.map((feature) => (
+          
             
-              {i + 1}. {feature.name}
+              {prd.features.mvpFeatures.indexOf(feature) + 1}. {feature.name}
             
             {feature.description}
             
               User Story: {feature.userStory}
             

             
               Acceptance Criteria:
             
-            {feature.acceptanceCriteria.map((criteria, j) => (
-              
+            {feature.acceptanceCriteria.map((criteria, index) => (
+              
                 • {criteria}
               
             ))}


Or continue using indices if features don't have stable IDs and the order is guaranteed not to change during rendering.

Prompt for AI Agent:
In components/export/pdf/FeaturesPage.tsx around lines 19 to 38, the map callbacks use array indices as React keys which is brittle; update the JSX to use stable unique identifiers (e.g. feature.id for the outer map and criteria.id for the inner map) instead of i and j; if only a single id exists on feature and not on criteria, compose a stable key like ${feature.id}-${j} for each criterion; ensure keys are strings and unique across siblings; if the data truly has no stable ids and ordering is guaranteed immutable, leave indices but add a brief comment explaining the reason.



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



============================================================================
File: components/ClientBody.tsx
Line: 13 to 17
Type: potential_issue

Comment:
Overwriting document.body.className breaks existing classes.

Using assignment (document.body.className = className) replaces all existing body classes, including those from server-side rendering, third-party libraries, or browser extensions. This could break styling or functionality that depends on body classes.

Apply this diff to safely add classes without removing existing ones:

   useEffect(() => {
     // Apply the className to the actual body element after hydration
     if (className) {
-      document.body.className = className
+      // Split and add each class individually to preserve existing classes
+      className.split(' ').forEach(cls => {
+        if (cls.trim()) {
+          document.body.classList.add(cls.trim())
+        }
+      })
     }

+    // Cleanup function to remove added classes
+    return () => {
+      if (className) {
+        className.split(' ').forEach(cls => {
+          if (cls.trim()) {
+            document.body.classList.remove(cls.trim())
+          }
+        })
+      }
+    }
   }, [className])

Prompt for AI Agent:
In components/ClientBody.tsx around lines 13 to 17, do not overwrite document.body.className; instead split the incoming className into tokens and add each token to document.body.classList (using classList.add) so existing classes are preserved, and return a cleanup function that removes those added tokens (using classList.remove) when the component unmounts or className changes; ensure you guard with the existing if (className) check and handle trimming/empty tokens.



============================================================================
File: components/chat/ChatInput.tsx
Line: 24 to 29
Type: potential_issue

Comment:
Type mismatch in keyboard event handler.

The handleKeyDown function receives a React.KeyboardEvent but passes it to handleSubmit(e) on line 27, which expects a FormEvent. While this may work at runtime, it's a TypeScript type inconsistency.



Consider this fix:

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
-     handleSubmit(e);
+     handleSubmit(e as unknown as FormEvent);
    }
  };


Or better, extract the submission logic to avoid the type cast:

+ const submitMessage = () => {
+   if (input.trim() && !disabled) {
+     onSendMessage(input.trim());
+     setInput("");
+   }
+ };
+
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
-   if (input.trim() && !disabled) {
-     onSendMessage(input.trim());
-     setInput("");
-   }
+   submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
-     handleSubmit(e);
+     submitMessage();
    }
  };

Prompt for AI Agent:
In components/chat/ChatInput.tsx around lines 24 to 29, the keyboard handler passes a React.KeyboardEvent into handleSubmit which expects a FormEvent, causing a TypeScript mismatch; fix by extracting the submission logic into a parameterless function (e.g., submitMessage) that performs the same work handleSubmit does, call that from both the form onSubmit and from handleKeyDown (without passing the keyboard event), and update handleSubmit/onSubmit to delegate to this new function so types remain correct.



============================================================================
File: components/workflow/WorkflowStepLabel.tsx
Line: 13 to 17
Type: nitpick

Comment:
Simplify font-weight declarations to avoid redundancy.

Line 13 applies font-medium as a base style, but line 16 also applies font-semibold for the current status. While Tailwind CSS will apply the more specific weight, having both declarations is redundant and may cause confusion.



Consider one of these approaches:

Option 1: Remove font-medium from the base and apply it conditionally:

     className={cn(
-      "text-xs font-medium text-center transition-colors",
+      "text-xs text-center transition-colors",
       variant === "mobile" && "whitespace-nowrap",
-      status === "completed" && "text-green-700 dark:text-green-400",
-      status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
-      status === "future" && "text-gray-400 dark:text-gray-600"
+      status === "completed" && "text-green-700 dark:text-green-400 font-medium",
+      status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
+      status === "future" && "text-gray-400 dark:text-gray-600 font-medium"
     )}


Option 2: Keep the base font-medium and only override for current:

     className={cn(
       "text-xs font-medium text-center transition-colors",
       variant === "mobile" && "whitespace-nowrap",
       status === "completed" && "text-green-700 dark:text-green-400",
-      status === "current" && "text-blue-700 dark:text-blue-400 font-semibold",
+      status === "current" && "text-blue-700 dark:text-blue-400 !font-semibold",
       status === "future" && "text-gray-400 dark:text-gray-600"
     )}

Prompt for AI Agent:
In components/workflow/WorkflowStepLabel.tsx around lines 13 to 17, the base class includes "font-medium" while the "current" status also adds "font-semibold", creating redundant font-weight declarations; remove "font-medium" from the base class list and instead add "font-medium" to the conditional classes for the non-current statuses (e.g., completed and future) so that current exclusively uses "font-semibold" and other statuses use "font-medium".



============================================================================
File: app/chat/[conversationId]/page.tsx
Line: 48 to 106
Type: potential_issue

Comment:
Potential race condition when building messages array.

Lines 79-82 build the messages array by spreading conversation.messages and adding the new user message. However, since addMessage (line 66-70) is asynchronous and updates Convex, there's a possibility that the API call at line 75 races with the Convex update, potentially causing the new message to be sent twice or in the wrong order.



Consider waiting for Convex to confirm the message addition before calling the API:

     try {
       // Add user message to Convex
       await addMessage({
         conversationId,
         role: "user",
         content: trimmedContent,
       });

       setIsTyping(true);

+      // Refetch conversation to get updated messages
+      // or build from the confirmed add result
       // Call API for Claude response
       const response = await fetch("/api/conversation/message", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
-          messages: [
-            ...conversation.messages,
-            { role: "user", content: trimmedContent, timestamp: Date.now() },
-          ],
+          conversationId,
         }),
       });


Alternatively, modify the API to accept conversationId and fetch messages server-side to ensure consistency.

Prompt for AI Agent:
In app/chat/[conversationId]/page.tsx around lines 48 to 106, building the messages array from conversation.messages before the Convex addMessage completes can race with the DB update and send inconsistent or duplicated messages; fix by either awaiting Convex confirmation and using the returned/updated conversation/messages to construct the payload for the API call, or change the API to accept only conversationId + the new user message (server fetches the authoritative message list), and ensure the client or server enforces idempotency/ordering (e.g., use server timestamps or message IDs) so the assistant request uses a consistent message history.



============================================================================
File: components/export/pdf/ArchitecturePage.tsx
Line: 17 to 37
Type: potential_issue

Comment:
Add defensive checks for nested data structures.

The component accesses deeply nested properties without validation:
- prd.technicalArchitecture (line 20)
- prd.technicalArchitecture.dataModels (line 26)
- model.fields (line 30)

If any of these are undefined or not the expected type, PDF generation will fail with a runtime error.



Apply this diff to add defensive checks:

   
     System Design
     
-      {prd.technicalArchitecture.systemDesign}
+      {prd.technicalArchitecture?.systemDesign || 'Not specified'}
     
   
 
   
     Data Models
-    {prd.technicalArchitecture.dataModels.map((model) => (
+    {prd.technicalArchitecture?.dataModels?.map((model) => (
       
         {model.entityName}
         {model.description}
-        {model.fields.map((field) => (
+        {model.fields?.map((field) => (
           
             - {field.name}: {field.type} {field.required ? "*" : ""}
           
         ))}
       
     ))}

Prompt for AI Agent:
In components/export/pdf/ArchitecturePage.tsx around lines 17 to 37, the code assumes prd.technicalArchitecture, prd.technicalArchitecture.dataModels, and each model.fields exist and are arrays; add defensive checks and safe defaults: verify prd.technicalArchitecture exists before rendering System Design, check dataModels is an array before mapping (use Array.isArray or default to []), and for each model ensure model.fields is an array before mapping (default to []). Also guard access to model.entityName and model.description with safe fallbacks to avoid undefined values in the rendered PDF.



============================================================================
File: components/export/ExportButtons.tsx
Line: 21 to 26
Type: refactor_suggestion

Comment:
Remove unused props or document why they're accepted.

The prd and productName props are prefixed with underscores, indicating they're intentionally unused. If they're not needed by this component, remove them from the interface. If they're reserved for future use, document why.

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
In components/export/ExportButtons.tsx around lines 21 to 26, the props prd and productName are intentionally unused (prefixed with underscores); either remove them from the ExportButtonsProps interface and the function signature to eliminate dead/unused props and update all call sites and type imports accordingly, or if they are intentionally reserved for future use, add a clear JSDoc comment above the prop definitions and keep them in the interface and signature (remove the underscore prefix if they should be considered part of the public API) so their purpose is documented for future maintainers.



============================================================================
File: .claude/skills/researching-features/SKILL.md
Line: 22
Type: potential_issue

Comment:
Fix typo.

"tell teh user" should be "tell the user"



Apply this diff:

-   - DO NOT use web_search - tell teh user to get context7
+   - DO NOT use web_search - tell the user to get context7

Prompt for AI Agent:
In .claude/skills/researching-features/SKILL.md around line 22, fix the typo in the diff text: change "tell teh user" to "tell the user" so the line reads "- DO NOT use web_search - tell the user to get context7". Update the file accordingly preserving backticks and spacing.



============================================================================
File: .claude/skills/researching-features/SKILL.md
Line: 3
Type: potential_issue

Comment:
Fix typos in description.

The description contains two typos:
- "explitly" should be "explicitly"
- "itnerviews" should be "interviews"



Apply this diff:

-description: "Use this whenever a user wants to add a new feature or explitly states to research a feature/API or building a plan for a new feature. It itnerviews the user for feature details (if not provided), research the best API/service for their needs, confirm choice, then gather all implementation notes for their request and save them as a .claude/plans file. "
+description: "Use this whenever a user wants to add a new feature or explicitly states to research a feature/API or building a plan for a new feature. It interviews the user for feature details (if not provided), researches the best API/service for their needs, confirms choice, then gathers all implementation notes for their request and saves them as a .claude/plans file."

Prompt for AI Agent:
.claude/skills/researching-features/SKILL.md around line 3: the description contains typos; replace "explitly" with "explicitly" and "itnerviews" with "interviews" so the sentence reads correctly (and optionally run a quick spellcheck to catch any other minor mistakes).



============================================================================
File: app/api/conversation/initial-message/route.ts
Line: 15 to 23
Type: potential_issue

Comment:
Add input sanitization and length validation.

User-provided projectName and projectDescription are directly interpolated into the AI prompt without sanitization or length limits. This creates risks:
1. Prompt injection: Malicious input could manipulate the AI's behavior
2. Resource exhaustion: Extremely long inputs could consume excessive tokens



Add input validation:

     const body = await request.json();
     const { projectName, projectDescription } = body;
 
     if (!projectName || !projectDescription) {
       return handleValidationError("Project name and description are required");
     }
+
+    // Validate input lengths
+    if (projectName.length > 200) {
+      return handleValidationError("Project name must be 200 characters or less");
+    }
+    if (projectDescription.length > 2000) {
+      return handleValidationError("Project description must be 2000 characters or less");
+    }
+
+    // Basic sanitization (trim and remove control characters)
+    const sanitizedName = projectName.trim().replace(/[\x00-\x1F\x7F]/g, '');
+    const sanitizedDescription = projectDescription.trim().replace(/[\x00-\x1F\x7F]/g, '');
 
     // Create a user message that provides the project context
-    const contextMessage = My app will be called "${projectName}". Here's the initial description: ${projectDescription};
+    const contextMessage = My app will be called "${sanitizedName}". Here's the initial description: ${sanitizedDescription};

Prompt for AI Agent:
In app/api/conversation/initial-message/route.ts around lines 15 to 23, the user inputs are used raw in the prompt; trim and sanitize both projectName and projectDescription, collapse multiple whitespace, remove control characters, and escape or remove quote/backtick characters to avoid injection; enforce length limits (e.g., projectName max 100 chars, projectDescription max 2000 chars) and return handleValidationError if either is empty after trimming or exceeds the limit (alternatively safely truncate with ellipsis if you prefer); finally use the sanitized values when constructing contextMessage.



============================================================================
File: components/chat/ChatContainer.tsx
Line: 22 to 27
Type: nitpick

Comment:
Consider checking user scroll position before auto-scrolling.

The current implementation always scrolls to the bottom when new messages arrive, even if the user has scrolled up to read message history. Consider checking if the user is near the bottom before auto-scrolling.



Example enhancement:

useEffect(() => {
  if (scrollRef.current) {
    const container = scrollRef.current.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
}, [messages, isTyping]);

Prompt for AI Agent:
In components/chat/ChatContainer.tsx around lines 22 to 27, the effect always scrolls to bottom on new messages which disrupts users who have scrolled up; modify the effect to first get the scrolling container (e.g., scrollRef.current.parentElement), compute whether the user is near the bottom (e.g., container.scrollHeight - container.scrollTop - container.clientHeight < 100), and only call scrollRef.current.scrollIntoView({ behavior: "smooth" }) when that condition is true; ensure null checks and proper types are used and make the threshold a small constant so it’s easy to adjust.



============================================================================
File: CLAUDE.md
Line: 52
Type: nitpick

Comment:
Verify the "no backwards compatibility" policy aligns with your deployment strategy.

This guideline could lead to frequent breaking changes. Ensure this aligns with your versioning strategy, user communication plan, and deployment model (especially if you have external users or APIs).

Prompt for AI Agent:
In CLAUDE.md around line 52, the rule "Never add backwards compatibility" is too absolute and may conflict with your versioning, deployment, and user-communication plans; review and update this line to a more precise policy that aligns with your deployment strategy by clarifying scope (internal vs external APIs), defining expected versioning/compatibility guarantees (e.g., semantic versioning or major-version breaks), requiring a documented migration/communication plan for breaking changes, and adding an exception path for cases where maintaining compatibility is required.



============================================================================
File: CLAUDE.md
Line: 54 to 55
Type: nitpick

Comment:
Consider balancing commit frequency with meaningful commit messages.

While frequent commits can be beneficial, committing "after finishing the smallest fix" might create a noisy git history. Consider using feature branches with frequent local commits, then squashing or organizing commits before merging to main.

Prompt for AI Agent:
In CLAUDE.md around lines 54 to 55, the guidance to "Always constantly commit changes after finishing the smallest fix" and to always update CHANGELOG.md is too prescriptive and will produce noisy history; change the guidance to recommend committing frequently on feature branches but organizing/squashing/rebasing before merging to main, write meaningful commit messages (subject, short description, ticket/PR reference), and update CHANGELOG.md only with release-worthy or critical changes using a concise template (date, version, key changes) rather than every local commit. Ensure the doc instructs: use frequent local commits for work-in-progress, then squash/rebase/clean up commits before merge and keep changelog entries concise and curated.



============================================================================
File: app/chat/[conversationId]/tech-stack/page.tsx
Line: 292 to 293
Type: refactor_suggestion

Comment:
Extract hardcoded delay to constants.

The 1.5-second delay before navigation is hardcoded. Extract this to lib/constants.ts in the TIMEOUTS group for maintainability and consistency.



In lib/constants.ts, add:
 export const TIMEOUTS = {
   / Debounce delay for search inputs */
   SEARCH_DEBOUNCE: 300,
 
   / Typing indicator display duration */
   TYPING_INDICATOR: 1000,
 
   / Toast notification duration */
   TOAST_DURATION: 5000,
+
+  / Delay before navigation to show toast */
+  TOAST_BEFORE_NAVIGATION: 1500,
 } as const;


Then update this file:
+import { TIMEOUTS } from "@/lib/constants";
+
 // ...
-        await new Promise(resolve => setTimeout(resolve, 1500));
+        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.TOAST_BEFORE_NAVIGATION));

Prompt for AI Agent:
In app/chat/[conversationId]/tech-stack/page.tsx around lines 292-293, the 1.5 second hardcoded delay (1500) should be extracted to lib/constants.ts under a TIMEOUTS export (e.g., TIMEOUTS.NAVIGATION_TOAST or similar); add the constant in lib/constants.ts and then import and use that constant here in place of the literal 1500 in the setTimeout call so the delay is maintained via the shared constant.



============================================================================
File: .claude/skills/skill-creating/SKILL.md
Line: 23
Type: potential_issue

Comment:
Use consistent filename convention.

The example shows skill.md but based on the repository structure, the file should be named SKILL.md (uppercase) to match the convention used in .claude/skills/skill-creating/SKILL.md and other skill files.



Apply this diff:

-skill.md
+SKILL.md

Prompt for AI Agent:
In .claude/skills/skill-creating/SKILL.md around line 23 the example references "skill.md" using lowercase; update the example to use the repository's consistent uppercase filename "SKILL.md" so it matches the actual file and convention used across .claude/skills; replace the lowercase filename occurrences with "SKILL.md" in that line (and any nearby examples if present) to ensure consistency.



============================================================================
File: lib/export-utils.ts
Line: 36 to 42
Type: nitpick

Comment:
Consider internationalization and add length validation.

The current implementation strips all non-ASCII characters, which may lose meaningful information for international users. Additionally, consider:
1. Adding maximum length validation (filesystem limits are typically 255 bytes)
2. Handling reserved filenames on Windows (CON, PRN, AUX, etc.)



Example enhancement:

export function sanitizeFilename(name: string): string {
  const MAX_LENGTH = 200; // Leave room for extension
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LENGTH);
  
  return sanitized || "export"; // Fallback if empty
}

Prompt for AI Agent:
In lib/export-utils.ts around lines 36 to 42, the current sanitizer strips all non-ASCII chars and lacks length and reserved-name checks; update it to (1) normalize the input to NFC and preserve Unicode letters/digits while replacing sequences of non-letter/digit characters with a single hyphen (use Unicode-aware regex \p{L}\p{N} with the u flag), (2) trim leading/trailing hyphens and collapse repeats, (3) enforce a max byte length (e.g. 200 bytes) by truncating on byte length after UTF-8 encoding so extensions remain safe, (4) detect and avoid Windows reserved filenames (CON, PRN, AUX, NUL, COM1..COM9, LPT1..LPT9) by appending a suffix if matched, and (5) return a safe fallback like "export" if the result is empty after sanitization.



============================================================================
File: components/selection/ValidationWarnings.tsx
Line: 41 to 57
Type: nitpick

Comment:
Same key stability concern applies here.

Similar to the error rendering, using warning-${index} as a key can cause React reconciliation issues. Consider using a stable identifier or deriving a key from the warning content.



Apply the same fix pattern as suggested for errors:

-        
+

Prompt for AI Agent:
In components/selection/ValidationWarnings.tsx around lines 41 to 57, the list items currently use unstable keys like warning-${index} which can break React reconciliation; change the key to a stable unique identifier (for example warning.id if the warning object includes an id, or a deterministic derived key such as a hash or string combining warning.message and warning.affectedTechnologies.join(",")) and fall back to index only as a last resort; update the Alert key to use that stable value so each warning retains identity across renders.



============================================================================
File: components/selection/ValidationWarnings.tsx
Line: 25 to 39
Type: nitpick

Comment:
Consider using stable identifiers for keys instead of array indices.

Using error-${index} as a key can cause issues if the warnings array is reordered, filtered, or updated. If the ValidationWarning objects don't have unique IDs, consider deriving a more stable key from the content (e.g., combining message and affected technologies).



Example approach:

-        
+        


Alternatively, if warnings have unique identifiers, use those instead.

Prompt for AI Agent:
In components/selection/ValidationWarnings.tsx around lines 25 to 39, the list is using unstable keys (error-${index}) which can break rendering when the array is reordered or updated; change the key to a stable, unique string derived from the error (preferably an explicit unique id if the ValidationWarning has one, otherwise compose a deterministic key such as ${error.message}::${error.affectedTechnologies.join('|')}) and ensure the resulting key is a string and unique for each entry.



============================================================================
File: components/dashboard/PRDCard.tsx
Line: 21
Type: potential_issue

Comment:
Replace any type with proper PRDData type.

Using any for prdData eliminates type safety and can hide runtime errors. The AI summary indicates PRDData is defined in @/types.



Apply this diff to use proper typing:

+import type { PRDData } from "@/types";
+
 interface PRDCardProps {
   prd: {
     _id: Id;
     conversationId: Id;
     productName: string;
-    prdData: any;
+    prdData: PRDData;
     createdAt: number;
     updatedAt: number;
     version: number;
     status: "generating" | "completed" | "failed";
   };
   onDelete: (prdId: Id) => void;
 }

Prompt for AI Agent:
In components/dashboard/PRDCard.tsx around line 21, replace the loose any typing for prdData with the proper PRDData type from your types file: add an import for PRDData from '@/types' and change the prop declaration from prdData: any to prdData: PRDData; if the component uses a props interface or React.FC generic, update that to reference PRDData as well and fix any downstream property accesses that TypeScript now flags by adjusting field names/types accordingly.



============================================================================
File: .claude/skills/researching-features/SKILL.md
Line: 35
Type: nitpick

Comment:
Improve grammar.

The sentence "Have page and UI elements to be built first before backend functions etc." is grammatically awkward.



Apply this diff:

-     - Have page and UI elements to be built first before backend functions etc.
+     - Start with page and UI elements before backend functions

Prompt for AI Agent:
.claude/skills/researching-features/SKILL.md around line 35: replace the awkward sentence "Have page and UI elements to be built first before backend functions etc." with a grammatically correct version such as "Ensure page and UI elements are built before backend functions are implemented." to improve clarity and grammar.



============================================================================
File: components/nav-main.tsx
Line: 36 to 42
Type: potential_issue

Comment:
Navigation items don't navigate - missing href or onClick.

The component receives item.url in props but doesn't use it. SidebarMenuButton needs either:
- An asChild prop with a Link component
- An onClick handler to navigate programmatically



Apply this diff to fix navigation:

+import Link from "next/link";
+
 export function NavMain({
   items,
 }: {
   items: {
     title: string
     url: string
     icon?: LucideIcon
   }[]
 }) {
   return (
     
       
         {/ Add Task button /}
         
           {items.map((item) => (
             
-              
+              
+                
                   {item.icon && }
                   {item.title}
+                
               
             
           ))}
         
       
     
   )
 }

Prompt for AI Agent:
In components/nav-main.tsx around lines 36 to 42, the rendered navigation items ignore item.url so clicks do not navigate; update SidebarMenuButton to use item.url by either adding an onClick that calls router.push(item.url) or (preferred) pass asChild to SidebarMenuButton and wrap its children with a Link component (Link href={item.url}) so the button becomes the link; ensure to only render the Link when item.url exists and keep current icon/title structure.



============================================================================
File: docs/api-routes-guide.md
Line: 9 to 26
Type: nitpick

Comment:
Add language specifier to fenced code block.

The code block starting at line 9 lacks a language identifier, which reduces syntax highlighting and readability in rendered documentation.



-
+ /app/api
   /conversation

Prompt for AI Agent:
In docs/api-routes-guide.md around lines 9 to 26, the fenced code block is missing a language specifier; update the opening fence from  to text (or another appropriate language like bash) so the block becomes text and ensure the closing fence remains  to enable proper syntax highlighting and improved readability in rendered docs.



============================================================================
File: .claude/skills/skill-creating/SKILL.md
Line: 3
Type: nitpick

Comment:
Improve description clarity.

The description is repetitive with "Used to create a new skill. Used when..." Consider revising for better clarity.



Apply this diff:

-description: "Used to create a new skill. Used when a user wants to create a new skill "
+description: "Creates new reusable skills. Use when a user wants to define a new skill workflow or capability."

Prompt for AI Agent:
In .claude/skills/skill-creating/SKILL.md around line 3, the description text is repetitive ("Used to create a new skill. Used when..."); replace it with a concise, single-sentence description that removes redundancy and clearly states the purpose (for example: "Create a new skill for a user" or "Creates a new skill when a user requests it"), keeping tone consistent with other skill descriptions.



============================================================================
File: .claude/skills/skill-creating/SKILL.md
Line: 14
Type: potential_issue

Comment:
Clarify folder structure instructions.

The instruction states "Create a new folder in .claude/skills with the skill name xyz.md" which is confusing. Based on the context, it appears you should create a folder (not a file with .md extension) and then create a SKILL.md file inside it.



Apply this diff:

-1. Create a new folder in .claude/skills with the skill name xyz.md (make name gerund form)
+1. Create a new folder in .claude/skills/ with the skill name (e.g., skill-name/) in gerund form, then create SKILL.md inside it

Prompt for AI Agent:
In .claude/skills/skill-creating/SKILL.md around line 14, the instruction "Create a new folder in .claude/skills with the skill name xyz.md" is misleading; update the text to say to create a new folder named for the skill (use the gerund form, e.g., "writing") under .claude/skills/ and then create a SKILL.md file inside that folder (e.g., .claude/skills/writing/SKILL.md), making clear the folder is the skill container and the SKILL.md is the file placed within it.



============================================================================
File: app/api/conversation/extract-context/route.ts
Line: 68 to 70
Type: nitpick

Comment:
Consider sanitizing message content before sending to Claude.

Message content is directly interpolated into the prompt without sanitization. While Claude is generally robust, very long messages or messages with special characters could affect prompt quality or token limits.



Consider:
1. Truncating very long messages to stay within context limits
2. Escaping or removing special characters that might confuse the prompt structure
3. Adding a total character limit with truncation

Example:
const messageHistory = conversation.messages
  .map((m) => {
    const role = m.role === "user" ? "User" : "Assistant";
    const content = m.content.slice(0, 2000); // Truncate long messages
    return ${role}: ${content};
  })
  .join("\n\n");

Prompt for AI Agent:
In app/api/conversation/extract-context/route.ts around lines 68 to 70, message content is interpolated directly into the prompt which can lead to enormous payloads or confusing special characters; fix by sanitizing each message before joining: trim whitespace, truncate content to a per-message max (e.g. 2000 chars) and enforce a total history character limit (drop or summarize oldest messages when exceeded), and normalize/escape or remove control characters (nulls, excessive newlines, backticks or other prompt-breaking tokens) so the final messageHistory string is safe and bounded for Claude.



============================================================================
File: app/api/tech-stack/suggest-defaults/route.ts
Line: 66 to 73
Type: nitpick

Comment:
Consolidate default values with fixStackErrors.

The default values on lines 68-72 duplicate those in fixStackErrors (lines 217-229). This creates a maintenance risk if defaults need to change.



Extract to a shared constant:

const DEFAULT_STACK: SimpleTechStack = {
  frontend: "Next.js",
  backend: "Node.js with Express",
  database: "PostgreSQL",
  auth: "Clerk",
  hosting: "Vercel",
};

// Then use it:
const completeStack = {
  ...DEFAULT_STACK,
  ...techStack,
};

// And in fixStackErrors:
async function fixStackErrors(
  stack: SimpleTechStack,
  errors: StackError[]
): Promise {
  return { ...DEFAULT_STACK, ...stack };
}

Prompt for AI Agent:
In app/api/tech-stack/suggest-defaults/route.ts around lines 66 to 73, the literal default tech values are duplicated elsewhere (fixStackErrors lines ~217-229); extract those defaults into a single exported constant (e.g., DEFAULT_STACK: SimpleTechStack) and replace the inline defaults with spread merges using that constant (const completeStack = { ...DEFAULT_STACK, ...techStack }); also update fixStackErrors to return { ...DEFAULT_STACK, ...stack } so both places share the same source of truth.



============================================================================
File: convex/users.ts
Line: 36 to 43
Type: potential_issue

Comment:
Avoid empty string fallback for missing email.

When creating a new user (line 38), if identity.email is null, the code falls back to an empty string. This creates several issues:
- Empty string is not a valid email address
- Inconsistent with the update logic (line 29) which preserves the existing email
- May violate email uniqueness constraints if multiple users are created without emails



Consider one of these approaches:

Option 1: Make email nullable and handle appropriately
     // Create new user
     return await ctx.db.insert("users", {
       clerkId: identity.subject,
-      email: identity.email ?? "",
+      email: identity.email ?? null,
       name: identity.name,
       imageUrl: identity.pictureUrl,
       createdAt: Date.now(),
       lastSeenAt: Date.now(),
     });


Option 2: Throw an error if email is required
+    if (!identity.email) {
+      throw new Error("Email is required for user creation");
+    }
+
     // Create new user
     return await ctx.db.insert("users", {
       clerkId: identity.subject,
-      email: identity.email ?? "",
+      email: identity.email,
       name: identity.name,
       imageUrl: identity.pictureUrl,
       createdAt: Date.now(),
       lastSeenAt: Date.now(),
     });

Prompt for AI Agent:
In convex/users.ts around lines 36 to 43, avoid falling back to an empty string when identity.email is null; instead either (A) make the users.email field nullable and insert email: identity.email (which may be null), update the TypeScript types and DB schema/constraints to allow null and ensure uniqueness handles nulls correctly, and keep the create behavior consistent with the update logic that preserves existing email, or (B) enforce email as required by throwing a clear error when identity.email is null and ensure callers provide an email before insert; pick one approach and implement the corresponding code + type/schema changes so no empty string is stored.



============================================================================
File: app/api/tech-stack/suggest-defaults/route.ts
Line: 103 to 135
Type: nitpick

Comment:
Extract inline prompt to prompts directory.

The AI prompt on lines 103-135 is defined inline within the route handler. For consistency with other routes in the codebase (which use prompts from lib/prompts/), this should be extracted.



Create a new file lib/prompts/techStack.ts:

export const TECH_STACK_SUGGESTION_PROMPT = (
  extractedContext: ExtractedContext,
  answers: Question[] | null
) => 
Suggest an optimal tech stack for this product:

PRODUCT CONTEXT:
${JSON.stringify(extractedContext, null, 2)}

ANSWERS:
${JSON.stringify(answers, null, 2)}

// ... rest of prompt
;


Then import and use it:
const response = await anthropic.messages.create({
  model: AI_MODELS.CLAUDE_SONNET,
  max_tokens: TOKEN_LIMITS.TECH_STACK,
  temperature: 0.3,
  messages: [{ 
    role: 'user', 
    content: TECH_STACK_SUGGESTION_PROMPT(extractedContext, answers)
  }],
});

Prompt for AI Agent:
In app/api/tech-stack/suggest-defaults/route.ts around lines 103 to 135 the prompt is inlined; extract it to lib/prompts/techStack.ts as a named export TECH_STACK_SUGGESTION_PROMPT that is a function accepting (extractedContext, answers) and returns the template string (use same JSON.stringify formatting and full prompt body), export with appropriate TypeScript types (Imported types: ExtractedContext, Question[] | null or any if types unavailable). Replace the inline prompt in the route with an import: call TECH_STACK_SUGGESTION_PROMPT(extractedContext, answers) and pass its result as the messages content to anthropic.messages.create, keeping existing model, token limit, temperature settings; ensure the new file is imported with the correct relative path and that the project compiles (adjust exports/imports or types if needed).



============================================================================
File: app/api/questions/fill-defaults/route.ts
Line: 107 to 172
Type: potential_issue

Comment:
Keyword-based matching is fragile and may fail with question variations.

The getTextDefault function relies on case-insensitive substring matching (e.g., questionLower.includes("product name")) to map questions to context fields. This approach has several weaknesses:

- Language-dependent: Only works for English questions
- Brittle: Slight wording changes break the mapping (e.g., "name of your product" vs "product name")
- Order-dependent: First match wins, which could map incorrectly if multiple conditions match
- No fuzzy matching: Typos or synonyms won't match




Consider these more robust alternatives:

Option 1: Use question IDs or structured metadata
// In question generation, include a semantic key
interface Question {
  question: string;
  semanticKey?: 'productName' | 'targetAudience' | 'description' | ...;
  // ...
}

// Then map directly:
function getTextDefault(question: Question, extractedContext: ExtractedContext | null): string {
  if (!extractedContext || !question.semanticKey) return "";
  return extractedContext[question.semanticKey] ?? "";
}


Option 2: Use AI-based semantic matching
If questions are generated dynamically, use an LLM to match questions to context fields based on semantic similarity rather than keywords.

Would you like me to generate an implementation for either approach?

Prompt for AI Agent:
In app/api/questions/fill-defaults/route.ts around lines 107-172, replace the fragile keyword-based matching in getTextDefault with semanticKey-based mapping: add a semanticKey to the Question type (e.g., 'productName'|'targetAudience'|'description'|'problemStatement'|'keyFeatures'|'technicalPreferences'), update getTextDefault to return extractedContext[semanticKey] when present (handling arrays by joining), and only fall back to the current keyword heuristic if semanticKey is missing; ensure null checks and type-safe access to the extractedContext fields.



============================================================================
File: app/api/tech-stack/suggest-defaults/route.ts
Line: 207 to 234
Type: refactor_suggestion

Comment:
Refactor error-fixing logic to be more maintainable.

The fixStackErrors function uses string matching on error messages (e.g., error.includes("Frontend")), which is brittle and could break if error message text changes. This creates tight coupling between validation and fixing logic.



Consider using error codes or structured errors:

type StackError = {
  field: keyof SimpleTechStack;
  message: string;
};

function validateDefaultStack(stack: SimpleTechStack): {
  isValid: boolean;
  errors: StackError[];
  warnings: string[];
} {
  const errors: StackError[] = [];
  // ...
  if (!stack.frontend || stack.frontend.trim() === "") {
    errors.push({ field: 'frontend', message: "Frontend framework is required" });
  }
  // ...
}

async function fixStackErrors(
  stack: SimpleTechStack,
  errors: StackError[]
): Promise {
  const fixedStack = { ...stack };
  const defaults = {
    frontend: "Next.js",
    backend: "Node.js with Express",
    database: "PostgreSQL",
    auth: "Clerk",
    hosting: "Vercel",
  };
  
  errors.forEach((error) => {
    fixedStack[error.field] = defaults[error.field];
  });
  
  return fixedStack;
}

Prompt for AI Agent:
In app/api/tech-stack/suggest-defaults/route.ts around lines 207 to 234, replace brittle string-matching in fixStackErrors with structured errors: change the errors parameter to an array of StackError objects (type StackError = { field: keyof SimpleTechStack; message: string }) produced by your validator, introduce a defaults map keyed by SimpleTechStack fields (frontend, backend, database, auth, hosting) and iterate errors setting fixedStack[error.field] = defaults[error.field]; update the function signature and any callers to accept StackError[] and ensure types are safe (use keyof SimpleTechStack) so fixes are driven by the field key rather than fragile message text.



============================================================================
File: app/api/tech-stack/suggest-defaults/route.ts
Line: 157 to 171
Type: potential_issue

Comment:
Trim strings before validating emptiness.

The validation checks for empty strings with .trim() === "", but doesn't trim the actual values before saving. This means values with only whitespace would pass validation but contain meaningless data.



Consider validating and normalizing in one step:

// Validate required fields exist and are non-empty
const fields: Array = ['frontend', 'backend', 'database', 'auth', 'hosting'];

fields.forEach(field => {
  const value = stack[field]?.trim();
  if (!value) {
    errors.push(${field.charAt(0).toUpperCase() + field.slice(1)} is required);
  } else {
    // Normalize: trim and assign back
    stack[field] = value;
  }
});




============================================================================
File: app/api/conversation/extract-context/route.ts
Line: 51
Type: potential_issue

Comment:
Unsafe type assertion on conversationId.

The type assertion as Id assumes the input is valid without runtime validation. If an invalid ID format is passed, this could cause issues downstream.



Consider validating the ID format before the assertion, or let Convex handle the validation and catch the error:

try {
  const conversation = await convexClient.query(api.conversations.get, {
    conversationId: conversationId as Id,
  });
} catch (error) {
  return handleAPIError(
    new Error("Invalid conversation ID format"),
    "validate conversation ID",
    400
  );
}

Prompt for AI Agent:
In app/api/conversation/extract-context/route.ts around line 51, the code unsafely asserts conversationId as Id; validate the ID before asserting or catch validation errors from Convex: either run a runtime check (e.g., ensure conversationId matches the expected format/length/regex) and only then cast to Id, returning a 400 with handleAPIError on invalid input, or wrap the convexClient.query call in a try/catch and translate any Convex ID validation error into a 400 response via handleAPIError.



============================================================================
File: components/questions/QuestionCard.tsx
Line: 26 to 62
Type: nitpick

Comment:
Consider useReducer for complex state management.

The component manages four interdependent state variables (selectedOptions, selectedOption, isOtherSelected, otherText) with complex initialization logic. This increases the risk of state inconsistencies.



Consider using useReducer to consolidate the state and ensure atomic updates:

type State = {
  selectedOption: string | null;
  selectedOptions: string[];
  isOtherSelected: boolean;
  otherText: string;
};

type Action = 
  | { type: 'TOGGLE_MULTISELECT'; option: string }
  | { type: 'SELECT_OPTION'; option: string }
  | { type: 'TOGGLE_OTHER' }
  | { type: 'UPDATE_OTHER_TEXT'; text: string };


This would make state transitions more predictable and easier to test.

Prompt for AI Agent:
In components/questions/QuestionCard.tsx around lines 26 to 62, the component currently uses four interdependent useState hooks (selectedOptions, selectedOption, isOtherSelected, otherText) with complex initialization logic that can lead to inconsistencies; replace these with a single useReducer to centralize state and make updates atomic: create a State type { selectedOption: string | null; selectedOptions: string[]; isOtherSelected: boolean; otherText: string } and an Action union (e.g., TOGGLE_MULTISELECT, SELECT_OPTION, TOGGLE_OTHER, UPDATE_OTHER_TEXT), derive an initialState from the incoming question prop (correctly handling multiselect vs single and whether question.answer is in suggestedOptions), implement a reducer to handle each action and update related fields together (e.g., selecting an option clears otherText/isOtherSelected as appropriate; toggling a multiselect option adds/removes from selectedOptions), replace the existing setters with dispatch calls in handlers, and ensure you call onAnswerChange from the reducer side-effect or from handlers after dispatch to emit the normalized answer string/selection.



============================================================================
File: components/ConvexClientProvider.tsx
Line: 8 to 14
Type: potential_issue

Comment:
Move environment check and client instantiation inside the component.

The module-level environment variable check and ConvexReactClient instantiation can cause issues in Next.js:

1. Build-time failures: The throw at lines 8-12 will terminate the build process if NEXT_PUBLIC_CONVEX_URL isn't available during build, even though it might be injected at runtime.
2. SSR/hydration concerns: Module-level client instantiation (line 14) can lead to hydration mismatches or stale client instances across requests.



Apply this diff to move the logic into the component:

 "use client";
 
 import { ReactNode } from "react";
 import { ConvexReactClient } from "convex/react";
 import { ConvexProviderWithClerk } from "convex/react-clerk";
 import { useAuth } from "@clerk/nextjs";
-
-if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
-  throw new Error(
-    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please check your .env configuration."
-  );
-}
-
-const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
 
 export default function ConvexClientProvider({
   children,
 }: {
   children: ReactNode;
 }) {
+  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
+    throw new Error(
+      "Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please check your .env configuration."
+    );
+  }
+
+  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
+
   return (
     
       {children}
     
   );
 }


Note: If the Convex URL never changes at runtime, consider using useMemo to cache the client instance.

Prompt for AI Agent:
In components/ConvexClientProvider.tsx around lines 8 to 14, the module-level environment check and new ConvexReactClient instantiation should be moved into the component to avoid build-time throws and SSR/hydration issues; remove the top-level throw and client creation, instead read process.env.NEXT_PUBLIC_CONVEX_URL inside the component, guard for a missing URL there (return fallback UI or throw during render/runtime rather than at build), and create the ConvexReactClient with useMemo (or useRef) keyed on the URL so the client is cached per render but not shared incorrectly across requests.



============================================================================
File: lib/analytics/workflowEvents.ts
Line: 42 to 45
Type: potential_issue

Comment:
Review skip rate calculation logic.

The skip rate formula (skippedSteps.length / completedSteps.length) * 100 has semantic issues. This calculates the ratio of skipped to completed steps, which could exceed 100% and doesn't represent a meaningful "skip rate."



Consider one of these alternatives:

1. Skip rate as percentage of total steps:
const totalSteps = data.skippedSteps.length + data.completedSteps.length;
const skipRate = totalSteps > 0
  ? (data.skippedSteps.length / totalSteps) * 100
  : 0;


2. Skip rate as percentage of all possible steps:
// If you know the total number of workflow steps
const TOTAL_WORKFLOW_STEPS = 5; // Define this constant
const skipRate = (data.skippedSteps.length / TOTAL_WORKFLOW_STEPS) * 100;


The current formula produces unintuitive results (e.g., 2 skipped / 1 completed = 200% skip rate).

Prompt for AI Agent:
In lib/analytics/workflowEvents.ts around lines 42 to 45, the skip rate is currently computed as skippedSteps.length / completedSteps.length which can exceed 100% and is semantically incorrect; change it to compute skippedSteps as a percentage of total steps by computing totalSteps = skippedSteps.length + completedSteps.length and then skipRate = totalSteps > 0 ? (skippedSteps.length / totalSteps)  100 : 0, making sure to guard against division by zero; alternatively, if there is a known constant TOTAL_WORKFLOW_STEPS, compute skipRate = (skippedSteps.length / TOTAL_WORKFLOW_STEPS)  100 and validate TOTAL_WORKFLOW_STEPS > 0 before dividing.



============================================================================
File: app/chat/[conversationId]/research/page.tsx
Line: 8 to 12
Type: potential_issue

Comment:
Add validation for conversationId parameter.

The type assertion on line 11 assumes conversationId is always present and valid, but useParams() can return undefined for route parameters. This could cause runtime issues or incorrect redirects.



Apply this diff to add validation:

 export default function ResearchRedirectPage() {
   const params = useParams();
   const router = useRouter();
-  const conversationId = params.conversationId as Id;
   const { toast } = useToast();
+
+  if (!params.conversationId) {
+    router.replace('/');
+    return null;
+  }
+
+  const conversationId = params.conversationId as Id;

Prompt for AI Agent:
In app/chat/[conversationId]/research/page.tsx around lines 8 to 12, the code force-casts params.conversationId to Id without checking it exists; update the function to validate params and conversationId before the type assertion: get params, if params or params.conversationId is falsy then call toast.error with a helpful message and redirect (router.replace) to a safe route (e.g., '/chat' or a 404 route) and return null to avoid further execution; only perform the type assertion after confirming the value is present.



============================================================================
File: components/chat/ChatMessage.tsx
Line: 18 to 39
Type: nitpick

Comment:
Consider adding accessibility labels for screen readers.

The message bubbles don't indicate to screen reader users who sent the message. Consider adding aria-label to provide better context.



Apply this diff:

Prompt for AI Agent:
In components/chat/ChatMessage.tsx around lines 18 to 39, the message bubble lacks screen reader context; add an accessible label to the message container (the inner div with the message content) using aria-label that states the sender and timestamp (e.g., "Message from You at 10:34 AM: " or "Message from Assistant at ..."), compute the formatted time with toLocaleTimeString as currently used, and mark the visible text (the ) as aria-hidden="true" to avoid duplicate reading; keep the label concise (trim long message content) and ensure aria-label updates based on isUser and message.timestamp.



============================================================================
File: convex/workflow.ts
Line: 54 to 59
Type: nitpick

Comment:
Refactor: Extract default progress object to a constant.

The default progress object { currentStep: "discovery", completedSteps: [], skippedSteps: [], lastUpdated: Date.now() } is repeated in three places (lines 54-59, 80-85, 121-126).



Extract to a function:

function getDefaultProgress() {
  return {
    currentStep: "discovery" as const,
    completedSteps: [],
    skippedSteps: [],
    lastUpdated: Date.now(),
  }
}

Prompt for AI Agent:
In convex/workflow.ts around lines 54-59, 80-85 and 121-126 the same default progress object is duplicated; extract it into a single function getDefaultProgress() that returns the default object with currentStep typed as "discovery" as const and lastUpdated set to Date.now(), then replace each inline literal with a call to getDefaultProgress(); ensure imports/exports remain consistent and update any typing if necessary.



============================================================================
File: convex/workflow.ts
Line: 20 to 26
Type: nitpick

Comment:
Refactor: Extract auth and ownership validation into a shared helper.

The authentication and authorization logic is duplicated across all four handler functions. This creates maintenance burden and increases the risk of inconsistent security checks.



Consider extracting a shared helper:

async function validateConversationAccess(
  ctx: MutationCtx | QueryCtx,
  conversationId: Id
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthorized")

  const conversation = await ctx.db.get(conversationId)
  if (!conversation) throw new Error("Conversation not found")
  if (conversation.userId !== identity.subject) throw new Error("Unauthorized")

  return conversation
}


Then use it in handlers:

handler: async (ctx, args) => {
  const conversation = await validateConversationAccess(ctx, args.conversationId)
  // ... rest of handler logic
}

Prompt for AI Agent:
In convex/workflow.ts around lines 20 to 26, the auth and ownership checks are duplicated across handlers; extract them into a shared helper function (e.g., validateConversationAccess) that accepts ctx and conversationId, performs ctx.auth.getUserIdentity(), verifies identity, loads the conversation via ctx.db.get, checks existence and ownership against identity.subject, throws the same errors on failure, and returns the conversation; then replace each handler’s duplicated logic with a single call to this helper and proceed with the handler logic using the returned conversation.



============================================================================
File: app/chat/[conversationId]/questions/page.tsx
Line: 76
Type: potential_issue

Comment:
Add runtime validation for type assertion.

Line 76 uses a type assertion as Question[] without validating the structure. If the database schema changes or data is corrupted, this could cause runtime errors in child components.



Add validation before the assertion:

if (conversation.clarifyingQuestions) {
  const questions = conversation.clarifyingQuestions
  // Basic validation
  if (Array.isArray(questions) && questions.every(q => 
    q && typeof q === 'object' && 'id' in q && 'question' in q
  )) {
    setQuestions(questions as Question[])
  } else {
    logger.error('QuestionsPage.invalidQuestionsStructure', 
      new Error('Invalid questions structure'), 
      { conversationId }
    )
    toast({
      title: "Error",
      description: "Invalid questions data. Please try regenerating.",
      variant: "destructive",
    })
  }
}

Prompt for AI Agent:
In app/chat/[conversationId]/questions/page.tsx around line 76, the code unconditionally asserts conversation.clarifyingQuestions as Question[] which can throw at runtime if the data shape changes; validate that conversation.clarifyingQuestions exists, is an array, and each item is an object with required fields (e.g., id and question) before calling setQuestions; if validation passes cast and call setQuestions, otherwise log an error with logger.error including conversationId and the invalid payload and surface a destructive toast to the user (or setQuestions([]) as a safe fallback).



============================================================================
File: docs/CHANGELOG.md
Line: 62
Type: potential_issue

Comment:
Fix markdown formatting for fenced code blocks.

Static analysis detected that line 62 should have blank lines around the fenced code block per markdown best practices.



Based on coding guidelines.

Prompt for AI Agent:
In docs/CHANGELOG.md around line 62, the fenced code block lacks required blank lines; add a single blank line immediately before the opening triple-backtick fence and a single blank line immediately after the closing triple-backtick fence so the block is separated from surrounding text and conforms to markdown best practices.



============================================================================
File: components/dashboard/PRDCard.tsx
Line: 103 to 114
Type: nitpick

Comment:
Tech stack filtering relies on hardcoded structure assumptions.

The filter logic at line 106 hardcodes "reasoning" as a special key and assumes value?.name structure. This is fragile if the techStack schema evolves.



Consider a more defensive approach:

           {prd.prdData?.techStack && (
             
-              {Object.entries(prd.prdData.techStack).slice(0, 3).map(([key, value]: [string, any]) => {
-                if (key === "reasoning" || !value?.name) return null;
+              {Object.entries(prd.prdData.techStack)
+                .filter(([key, value]: [string, any]) => 
+                  key !== "reasoning" && value && typeof value === "object" && "name" in value
+                )
+                .slice(0, 3)
+                .map(([key, value]: [string, any]) => {
                 return (
                   
                     {value.name}
                   
                 );
               })}
             
           )}

Prompt for AI Agent:
In components/dashboard/PRDCard.tsx around lines 103 to 114, the techStack rendering currently hardcodes the "reasoning" key and assumes each entry has value.name, which is fragile; change the filter to be defensive: replace the hardcoded key check with a configurable or data-driven condition (e.g., skip entries where value is falsy, not an object, or value.name is missing or not a string), validate the shape before rendering, map over filtered safe entries (or Object.values/entries after filtering) and then slice(0,3) to limit badges; ensure any special exclusions (like "reasoning") come from a constant or from the data (e.g., value.type === 'reasoning') rather than a magic string.



============================================================================
File: convex/schema.ts
Line: 245
Type: potential_issue

Comment:
Replace v.any() with structured type definition.

Using v.any() for prdData eliminates all type safety and validation. This is particularly risky for a critical field like the PRD document data.



Based on the types/index.ts context (from the AI summary mentioning PRDData type), define a proper validator:

- prdData: v.any(),
+ prdData: v.object({
+   overview: v.object({
+     productName: v.string(),
+     description: v.string(),
+     targetAudience: v.string(),
+     problemStatement: v.string(),
+   }),
+   features: v.array(v.object({
+     title: v.string(),
+     description: v.string(),
+     priority: v.string(),
+   })),
+   techStack: v.object({
+     frontend: v.string(),
+     backend: v.string(),
+     database: v.string(),
+     // ... other tech stack fields
+   }),
+   // ... other PRD sections
+ }),


If the structure needs to remain flexible initially, at least use a typed record or provide validation:

prdData: v.record(v.string(), v.union(v.string(), v.number(), v.array(v.any()), v.object({}))),

Prompt for AI Agent:
In convex/schema.ts around line 245, replace the permissive prdData: v.any() with a structured validator that matches the PRDData shape from types/index.ts (or, if PRDData isn't available as a validator yet, create one): either import/use a PRDData validator that validates the known fields, or at minimum change prdData to a typed record/union-based validator (e.g. a record of string keys to specific allowed value types or an object with optional known fields) so the field is validated and provides type safety instead of v.any().



============================================================================
File: components/ui/badge.tsx
Line: 7 to 26
Type: nitpick

Comment:
Consider formatting the base className for better readability.

The base className on line 8 is over 300 characters long, making it difficult to read and maintain. Consider breaking it into multiple lines.



Apply this diff:

 const badgeVariants = cva(
-  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-all duration-300 overflow-hidden",
+  [
+    "inline-flex items-center justify-center rounded-full border",
+    "px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0",
+    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
+    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
+    "transition-all duration-300 overflow-hidden"
+  ].join(" "),
   {

Prompt for AI Agent:
In components/ui/badge.tsx around lines 7 to 26, the long single-line base className string (line 8) is hard to read and maintain; split that long class list into multiple concatenated strings or template literal lines (group related utility classes per line such as layout, spacing, typography, focus/aria, svg modifiers, and effects) while preserving the exact class order and content, ensure tooling/linter string style is respected, and keep the cva call structure unchanged.



============================================================================
File: lib/export-utils.ts
Line: 5 to 18
Type: refactor_suggestion

Comment:
Remove unnecessary async modifier.

The exportJSON function doesn't use await and doesn't return a Promise, so the async modifier is unnecessary and misleading.



Apply this diff:

-export async function exportJSON(data: PRDData, filename: string) {
+export function exportJSON(data: PRDData, filename: string) {

Prompt for AI Agent:
In lib/export-utils.ts around lines 5 to 18, the exportJSON function is declared async but does not use await or return a Promise; remove the unnecessary async modifier from the function declaration so it becomes a plain synchronous function (export function exportJSON(...)) to avoid misleading callers and tooling.



============================================================================
File: components/questions/QuestionCard.tsx
Line: 82 to 95
Type: nitpick

Comment:
Review the "Other" toggle logic for single-select questions.

When unchecking "Other" (line 92-93), the handler clears otherText and calls onAnswerChange(""), which clears the answer entirely. However, if the user had previously selected an option button before checking "Other", that selection is lost (line 86 sets selectedOption to null). This means the user cannot simply uncheck "Other" to return to their previous selection.



Consider one of these approaches:
1. Restore the previous selectedOption when unchecking "Other"
2. Keep "Other" checked when it has text, requiring the user to select an option button to switch away
3. Document this as intended behavior if clearing the answer is the desired UX

Current behavior may confuse users who accidentally check "Other" and want to return to their previous selection.




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




============================================================================
File: components/data-table.tsx
Line: 208 to 226
Type: nitpick

Comment:
Form submission is simulated and doesn't persist data.

The target field form (lines 208-226) and limit field form (lines 233-251) use defaultValue instead of controlled inputs and simulate saving with a 1-second timeout. Changes won't persist across re-renders, and there's no actual data persistence logic.



If this is placeholder/demo code, consider adding a TODO comment. For production use, these forms should:
1. Use controlled inputs with proper state management
2. Make actual API calls or state updates
3. Handle errors appropriately

Do you want me to generate a production-ready implementation?




============================================================================
File: convex/conversations.ts
Line: 37 to 70
Type: nitpick

Comment:
LGTM with operational consideration.

The ownership validation and message append logic are correct.




Consider implementing a message count limit or pagination strategy to prevent unbounded array growth in long conversations, which could impact database performance and read latency.




============================================================================
File: components/ui/chart.tsx
Line: 72 to 106
Type: potential_issue

Comment:
Potential XSS vulnerability: Sanitize color values more strictly.

The isValidColor regex validation (line 73) only checks if the color string starts with a valid pattern, but doesn't validate the entire string. This allows injection of arbitrary CSS:

// Would pass validation but contains malicious CSS:
color: "var(--x); } body { display: none; } .x {"




To fix this, either:
1. Use a CSS sanitization library like DOMPurify
2. Strengthen the validation to match the entire string and reject any characters that could break out of the CSS context

Apply this diff for stricter validation:

-  const isValidColor = (color: string) => /^(#[0-9A-Fa-f]{3,8}|rgb|hsl|var\()/.test(color)
+  const isValidColor = (color: string) => {
+    // Only allow hex, rgb/rgba, hsl/hsla, or CSS variables - no semicolons or braces
+    return /^(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|var\(--[\w-]+\))$/.test(color)
+  }


This ensures the entire color value matches a safe pattern and prevents CSS injection.

Prompt for AI Agent:
In components/ui/chart.tsx around lines 72 to 106, the isValidColor regex only anchors the start and allows CSS injection by letting values break out of the CSS rule; replace it with a strict validation that matches the entire string (use ^...$) and limits allowed characters/patterns to safe color formats (e.g. full hex #RGB/A, #RRGGBB(/AA), exact rgb(...) and rgba(...), hsl(...) and hsla(...), and only allow CSS custom properties like var(--name) where name matches a safe identifier), or alternatively pass color values through a trusted CSS sanitizer (e.g. DOMPurify) before embedding; ensure you only emit --color-... declarations when the new isValidColor returns true so no untrusted text can break out of the style block.



============================================================================
File: contexts/WorkflowContext.tsx
Line: 175 to 193
Type: potential_issue

Comment:
Inconsistent state update pattern creates race condition risk.

The goToStep function updates local state immediately (line 177) before the remote update completes, unlike advanceToNextStep (lines 161-166) and markStepComplete (lines 127-132) which update local state only after successful remote updates. This creates inconsistency and risks showing incorrect state if the remote update fails.



Apply this diff to match the pattern used in other functions:

 const goToStep = async (step: WorkflowStep) => {
   if (canNavigateToStep(step)) {
-    setState(prev => ({ ...prev, currentStep: step }))

     if (conversationId) {
       try {
         await updateProgress({
           conversationId,
           currentStep: step,
           completedSteps: state.completedSteps,
           skippedSteps: state.skippedSteps,
         })
+        
+        // Update local state only after successful remote update
+        setState(prev => ({ ...prev, currentStep: step }))
       } catch (error) {
         logger.error('WorkflowContext.goToStep', error, { conversationId, step })
       }
     }
   }
 }

Prompt for AI Agent:
In contexts/WorkflowContext.tsx around lines 175 to 193, the function currently sets local state immediately before the remote update, creating a race; change it to follow the other functions by only updating local state after a successful updateProgress call: if conversationId is present, call updateProgress with the intended new currentStep and await it inside a try/catch, and only inside the try (after successful remote return) call setState(prev => ({ ...prev, currentStep: step })); on error log and do not modify local state; if conversationId is not present, you may set local state directly as before.



============================================================================
File: components/export/pdf/TechStackPage.tsx
Line: 17 to 21
Type: nitpick

Comment:
Consider explicit filtering over null returns in map.

Returning null inside .map() works but is less idiomatic than filtering beforehand. Consider refactoring to filter out string values before mapping.


Apply this diff:

-      {Object.entries(prd.techStack)
-        .filter(([key]) => key !== "reasoning")
-        .map(([key, value]) => {
-          if (typeof value === "string") return null;
+      {Object.entries(prd.techStack)
+        .filter(([key]) => key !== "reasoning")
+        .filter(([, value]) => typeof value !== "string")
+        .map(([key, value]) => {
           return (

Prompt for AI Agent:
In components/export/pdf/TechStackPage.tsx around lines 17 to 21, the current code filters only the "reasoning" key then uses .map that returns null for string values; change this to first filter out both the "reasoning" key and any entries whose value is a string (e.g., Object.entries(prd.techStack).filter(([k, v]) => k !== "reasoning" && typeof v !== "string")) and then map over the resulting entries to render items so no nulls are produced inside map.



============================================================================
File: lib/workflow/progress.ts
Line: 77 to 83
Type: nitpick

Comment:
Path matching could have false positives with substring matching.

The getStepFromPath function uses pathname.includes() which could match unintended paths. For example, /chat/123/regenerate would match 'generate', and /chat/123/select-something would match 'selection'. If this could be an issue in your routing structure, consider using more precise pattern matching (e.g., checking path segments or using regex).

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 77 to 83, the current use of pathname.includes(...) can produce false positives (e.g., "/chat/123/regenerate" matching 'generate'); replace the loose substring checks with precise segment matching — split the pathname by '/' (filtering empty segments) and compare individual segments for exact matches (or use a regex that matches '/generate' as a full segment, e.g. /(^|\/)generate(\/|$)/) for each step; update the function to return the correct WorkflowStep based on exact path-segment or regex matches instead of includes().



============================================================================
File: convex/prds.ts
Line: 48 to 63
Type: nitpick

Comment:
Consider cleaning up the conversation reference when deleting a PRD.

When a PRD is deleted, the associated conversation's prdId field is not cleared. This could lead to orphaned references. Based on the create function logic (lines 126-155), which handles the case where a PRD was deleted, this appears intentional. However, explicitly documenting this behavior or adding a comment would improve maintainability.

Prompt for AI Agent:
In convex/prds.ts around lines 48 to 63, the deletePRD handler removes the PRD but does not clear any conversation.prdId references, leaving orphaned links; either explicitly clear the prdId on the related conversation(s) during deletion or add a clear comment explaining the deliberate decision to leave references for the create logic to handle. To fix: after fetching and authorizing the PRD and before/after ctx.db.delete, query for any conversation records with prdId === args.prdId and update their prdId to null (or perform both the delete and conversation update in the same transaction if supported), or alternatively add a short inline comment above the delete explaining why conversation.prdId is intentionally left untouched and reference the create() logic lines 126-155.



============================================================================
File: convex/prds.ts
Line: 131 to 136
Type: nitpick

Comment:
Status is always set to "completed" - verify this is intentional.

The create mutation always sets the PRD status to "completed", regardless of whether the PRD data is actually complete or still being generated. Based on the AI summary mentioning "generating" and "failed" statuses in getStats, there appears to be a workflow where PRDs can have different statuses. Ensure this immediate "completed" status aligns with your intended workflow.




Would you like me to search for other code that sets PRD status to understand the complete workflow?




============================================================================
File: components/nav-user.tsx
Line: 41 to 44
Type: nitpick

Comment:
Consider more defensive initials calculation.

The initials logic userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) assumes space-separated names and doesn't handle edge cases where a name part could be empty.


Consider a more defensive approach:

-  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
+  const initials = userName
+    .split(' ')
+    .filter(n => n.length > 0)
+    .map(n => n[0])
+    .join('')
+    .toUpperCase()
+    .slice(0, 2) || 'U'

Prompt for AI Agent:
In components/nav-user.tsx around lines 41 to 44, the initials calculation is fragile because it assumes space-separated non-empty name parts; update it to be defensive by trimming userName, splitting on whitespace, filtering out empty parts, taking the first character of up to the first two non-empty parts (falling back to the first one’s first two letters if only one part), uppercasing the result, and ensuring non-alphabetic characters are handled by falling back to userEmail’s local-part or a default "U"; implement these checks in a few small, readable steps so initials never throw and always produce 0–2 characters.



============================================================================
File: convex/prds.ts
Line: 19 to 25
Type: nitpick

Comment:
Consider performance implications of client-side filtering.

Filtering PRDs after fetching all user PRDs could be inefficient as the dataset grows. While Convex doesn't have full-text search, consider pagination or limit the number of PRDs fetched if the list could become large.

Prompt for AI Agent:
In convex/prds.ts around lines 19 to 25, the code does client-side filtering of all PRDs which will scale poorly; change the resolver to accept pagination (limit and cursor) and a limit cap (e.g., 50) and apply those when querying Convex so you only fetch a page rather than all items, move the simple case-insensitive filter into the server query if possible (or implement a prefix/substring filter supported by Convex) and return paging metadata (nextCursor/hasMore); if you need true full-text search, wire an external search service instead.



============================================================================
File: components/ui/progress.tsx
Line: 18 to 21
Type: nitpick

Comment:
Consider clamping value to valid range.

The transform calculation doesn't constrain value to the 0-100 range. Values outside this range will cause incorrect visual rendering (e.g., value=150 would show translateX(50%), extending beyond the container).


Apply this diff to clamp the value:

Prompt for AI Agent:
In components/ui/progress.tsx around lines 18 to 21, the transform uses value directly which can be outside 0–100; clamp the value first (e.g., const v = Math.max(0, Math.min(100, value ?? 0))) and then use that clamped v to compute the translateX style so the indicator never renders outside the container. Ensure undefined/null falls back to 0 and update the transform to use the clamped variable.



============================================================================
File: app/api/prd/generate/route.ts
Line: 62 to 84
Type: potential_issue

Comment:
Potential runtime error if messages or clarifyingQuestions are undefined.

Lines 64 and 67-69 call .map() on conversationData.messages and conversationData.clarifyingQuestions without verifying they exist. If these fields are undefined or null in the conversation, this will throw a runtime error.



Add null-safe handling:

  const userPrompt = 
# Product Discovery Conversation
-${conversationData.messages.map((m: Message) => ${m.role}: ${m.content}).join("\n")}
+${conversationData.messages?.map((m: Message) => ${m.role}: ${m.content}).join("\n") || "No messages"}

# Clarifying Questions & Answers
 ${conversationData.clarifyingQuestions
-  ?.map((q: Question) => Q: ${q.question}\nA: ${q.answer || "Not answered"})
-  .join("\n\n")}
+  ?.map((q: Question) => Q: ${q.question}\nA: ${q.answer || "Not answered"}`)
+  .join("\n\n") || "No questions answered"}

Prompt for AI Agent:
In app/api/prd/generate/route.ts around lines 62 to 84, the template builds userPrompt by calling .map() on conversationData.messages and conversationData.clarifyingQuestions which can be undefined and cause a runtime error; update the code to treat both fields as optional arrays (e.g., default to empty arrays or use optional chaining with fallback) before mapping, and ensure the join operations handle empty lists by returning an empty string or a safe placeholder so the template never calls .map() on null/undefined.



============================================================================
File: convex/conversations.ts
Line: 5 to 15
Type: potential_issue

Comment:
Potential sorting issue with unlisted steps.

If a step name not present in stepOrder is passed, indexOf returns -1, which will cause those steps to sort before all defined steps in an unpredictable order.



Consider adding a fallback or validation:

 function mergeCompletedSteps(
   existingSteps: string[] | undefined,
   newSteps: string[]
 ): string[] {
   const allSteps = [...(existingSteps || []), ...newSteps];
   // Define step order for proper sequencing
   const stepOrder = ["setup", "discovery", "questions", "research", "selection", "generate"];
   // Remove duplicates and sort by defined order
   const uniqueSteps = Array.from(new Set(allSteps));
-  return uniqueSteps.sort((a, b) => stepOrder.indexOf(a) - stepOrder.indexOf(b));
+  return uniqueSteps.sort((a, b) => {
+    const aIndex = stepOrder.indexOf(a);
+    const bIndex = stepOrder.indexOf(b);
+    // Handle steps not in stepOrder by placing them at the end
+    if (aIndex === -1 && bIndex === -1) return 0;
+    if (aIndex === -1) return 1;
+    if (bIndex === -1) return -1;
+    return aIndex - bIndex;
+  });
 }

Prompt for AI Agent:
In convex/conversations.ts around lines 5 to 15, mergeCompletedSteps currently sorts unique steps using stepOrder.indexOf which returns -1 for any step not listed, causing those steps to be sorted before defined steps unpredictably; change the sort to handle unlisted steps by mapping indexOf results to a large fallback (e.g., Infinity or stepOrder.length) so unknown steps sort after known ones, or validate/filter unknown steps out (and optionally log or throw), and ensure stable ordering for unknown steps by falling back to string comparison when indices are equal.



============================================================================
File: app/chat/[conversationId]/questions/page.tsx
Line: 134 to 195
Type: potential_issue

Comment:
Clear auto-save timeout before skip operation.

The handleSkip function doesn't clear the auto-save timeout before initiating the skip operation. If a user types an answer and immediately clicks skip, the auto-save (line 102-111) could race with the skip logic, potentially causing data inconsistency.



Apply this diff:

 const handleSkip = async () => {
+  // Clear any pending auto-save
+  if (saveTimeoutRef.current) {
+    clearTimeout(saveTimeoutRef.current)
+    saveTimeoutRef.current = null
+  }
+
   setIsSkipping(true)
   try {

Prompt for AI Agent:
In app/chat/[conversationId]/questions/page.tsx around lines 134 to 195, before starting the skip workflow you must clear the auto-save debounce to avoid a race with the skip operation: call clearTimeout on whatever timer/ref holds the auto-save timeout (e.g. clearTimeout(autoSaveTimerRef.current) and then set that ref to null or undefined) immediately when handleSkip begins (before sending the API request or saving/redirecting); optionally, if there is a pending autosave promise/exposed function, trigger/await a final immediate save before continuing so no typed answer is lost.



============================================================================
File: app/chat/[conversationId]/questions/page.tsx
Line: 72 to 88
Type: potential_issue

Comment:
Fix useEffect dependency to prevent potential re-generation loops.

The useEffect includes generateQuestions in its dependency array (line 88), but generateQuestions is recreated whenever conversation changes (line 69). This could cause unintended re-executions.



The exhaustive-deps rule likely flags this. Use useCallback dependencies more carefully or restructure the effect:

  // Generate questions on mount if not already generated
  useEffect(() => {
    if (!conversation) return

    if (conversation.clarifyingQuestions) {
      setQuestions(conversation.clarifyingQuestions as Question[])
    } else if (!hasGeneratedRef.current) {
      hasGeneratedRef.current = true
      generateQuestions()
    }

    // Cleanup: clear timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
-  }, [conversation, generateQuestions])
+  }, [conversation]) // eslint-disable-line react-hooks/exhaustive-deps


Add an eslint disable comment with explanation that generateQuestions should not be in deps to avoid loops.

Prompt for AI Agent:
In app/chat/[conversationId]/questions/page.tsx around lines 72 to 88, the useEffect lists generateQuestions in its dependency array but generateQuestions is recreated when conversation changes, causing potential re-generation loops; fix by memoizing generateQuestions with useCallback so it only changes when its true dependencies change (or move the logic into the effect), then update the dependency array to include the stable memoized function; if you intentionally want to ignore generateQuestions changes, add a focused ESLint disable comment (// eslint-disable-next-line react-hooks/exhaustive-deps) with a brief explanation above the effect to document why generateQuestions is excluded.



============================================================================
File: app/chat/[conversationId]/setup/page.tsx
Line: 26 to 30
Type: potential_issue

Comment:
Critical: Inverted redirect logic.

The comment states "If still in setup stage, redirect to main chat page", but this appears to be the setup review page (based on the URL /setup/page.tsx and content showing "View your project information"). The redirect logic seems inverted:

- Current: redirects when currentStage === "setup" (still in setup)
- Expected: should redirect when setup is NOT complete yet, or allow viewing when past setup

This will cause users in the setup stage to be redirected away from the setup page, making it inaccessible.


Verify the intended behavior and correct the condition:

-  // If still in setup stage, redirect to main chat page
-  if (conversation.currentStage === "setup") {
+  // If not yet past setup stage, redirect to main chat page
+  if (conversation.currentStage !== "setup") {
     router.push(/chat/${conversationId});
     return null;
   }

Prompt for AI Agent:
In app/chat/[conversationId]/setup/page.tsx around lines 26 to 30, the redirect is inverted: the code currently redirects when conversation.currentStage === "setup" which kicks users off the setup page while they should be allowed to view it; change the condition to redirect only when the conversation is NOT in the "setup" stage (e.g., if (conversation.currentStage !== "setup") { router.push(/chat/${conversationId}); return null; }) so the setup page is accessible during setup and users are redirected away once setup is complete.



============================================================================
File: components/chart-area-interactive.tsx
Line: 129 to 141
Type: potential_issue

Comment:
Both series use the same color, making them indistinguishable.

Lines 135 and 139 both set the color to "var(--primary)", which means the desktop and mobile series will be rendered with the same color. This makes the chart difficult to read and defeats the purpose of having separate series.



Apply this diff to use distinct colors:

 const chartConfig = {
   visitors: {
     label: "Visitors",
   },
   desktop: {
     label: "Desktop",
     color: "var(--primary)",
   },
   mobile: {
     label: "Mobile",
-    color: "var(--primary)",
+    color: "hsl(var(--chart-2))",
   },
 } satisfies ChartConfig

Prompt for AI Agent:
components/chart-area-interactive.tsx around lines 129 to 141: desktop and mobile series both use "var(--primary)" so they are indistinguishable; update one of the series (e.g., mobile) to use a different CSS color variable or literal (for example "var(--secondary)" or a distinct hex) so each series has a unique color, keeping the object shape and the trailing "satisfies ChartConfig" intact.



============================================================================
File: convex/conversations.ts
Line: 244 to 281
Type: potential_issue

Comment:
Research progress status is always set to "in_progress".

Line 276 always sets status: "in_progress", even when marking a category as completed. This means the overall research status never reaches "completed" through this mutation.



Consider updating the status based on progress:

+    // Determine overall status
+    const allCategories = conversation.researchMetadata?.totalCategories || 0;
+    const overallStatus = 
+      newCompleted.length === allCategories ? "completed" :
+      newCompleted.length > 0 ? "in_progress" :
+      "pending";
+
     await ctx.db.patch(args.conversationId, {
       researchMetadata: {
         startedAt: conversation.researchMetadata?.startedAt || Date.now(),
         categoriesCompleted: newCompleted,
-        status: "in_progress",
+        status: overallStatus,
+        ...(overallStatus === "completed" && { completedAt: Date.now() }),
       },
       updatedAt: Date.now(),
     });


Alternatively, if saveResearchResults is always called to finalize, document that this mutation only tracks intermediate progress.




============================================================================
File: components/chart-area-interactive.tsx
Line: 147 to 151
Type: potential_issue

Comment:
Time range doesn't reset when switching from mobile to desktop.

The useEffect sets timeRange to "7d" when isMobile becomes true, but doesn't reset it when isMobile becomes false. This means if a user starts on mobile (or resizes to mobile width), then switches to desktop, they'll still see the 7-day view instead of the default 90-day view.



If you want to reset to the default when switching to desktop, apply this diff:

   React.useEffect(() => {
     if (isMobile) {
       setTimeRange("7d")
+    } else {
+      setTimeRange("90d")
     }
   }, [isMobile])


Alternatively, if the current behavior is intentional (preserving user's last selection), consider adding a comment to clarify this design decision.

Prompt for AI Agent:
In components/chart-area-interactive.tsx around lines 147 to 151, the effect only sets timeRange to "7d" when isMobile becomes true but does not reset it when isMobile becomes false; update the useEffect to set timeRange to the mobile default ("7d") when isMobile is true and reset to the desktop default (e.g., "90d") when isMobile is false, or if preserving the user's selection is intentional, replace the effect with a clarifying comment explaining that behavior instead.



============================================================================
File: lib/workflow/progress.ts
Line: 102 to 104
Type: refactor_suggestion

Comment:
Use dynamic step count instead of hardcoded value.

The totalSteps is hardcoded as 5, but this should be derived from getAllSteps().length to maintain consistency and reduce maintenance burden if workflow steps change in the future.



Apply this diff:

 export function getProgressPercentage(completedSteps: WorkflowStep[]): number {
-  const totalSteps = 5
+  const totalSteps = getAllSteps().length
   return Math.round((completedSteps.length / totalSteps) * 100)
 }

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 102 to 104, replace the hardcoded totalSteps = 5 with a dynamic count derived from getAllSteps().length (import getAllSteps if not already imported) so the percentage reflects the current workflow definition; also guard against division by zero by treating totalSteps === 0 as 100% or returning 0 as appropriate for your app, then compute and return Math.round((completedSteps.length / totalSteps) * 100).



============================================================================
File: convex/prds.ts
Line: 139 to 173
Type: refactor_suggestion

Comment:
Reduce code duplication in PRD creation logic.

Lines 140-149 and 158-167 contain nearly identical PRD insertion logic. Consider extracting this into a helper function or variable to improve maintainability.



Apply this refactor pattern:

    let prdId: Id;
+
+   const createPrdData = {
+     conversationId: args.conversationId,
+     userId: identity.subject,
+     productName: args.productName,
+     prdData: args.prdData,
+     version: 1,
+     status: "completed" as const,
+     createdAt: Date.now(),
+     updatedAt: Date.now(),
+   };

    // Check if PRD already exists (created during setup) and verify it still exists
    if (conversation.prdId) {
      const existingPrd = await ctx.db.get(conversation.prdId);

      if (existingPrd && existingPrd.userId === identity.subject) {
        // Update existing PRD
        await ctx.db.patch(conversation.prdId, {
          productName: args.productName,
          prdData: args.prdData,
          status: "completed",
          updatedAt: Date.now(),
        });
        prdId = conversation.prdId;
      } else {
        // PRD was deleted or doesn't exist - create new one
-       prdId = await ctx.db.insert("prds", {
-         conversationId: args.conversationId,
-         userId: identity.subject,
-         productName: args.productName,
-         prdData: args.prdData,
-         version: 1,
-         status: "completed",
-         createdAt: Date.now(),
-         updatedAt: Date.now(),
-       }) as Id;
+       prdId = await ctx.db.insert("prds", createPrdData) as Id;

        // Update conversation with new PRD link
        await ctx.db.patch(args.conversationId, {
          prdId: prdId,
        });
      }
    } else {
      // Create new PRD (fallback for legacy conversations)
-     prdId = await ctx.db.insert("prds", {
-       conversationId: args.conversationId,
-       userId: identity.subject,
-       productName: args.productName,
-       prdData: args.prdData,
-       version: 1,
-       status: "completed",
-       createdAt: Date.now(),
-       updatedAt: Date.now(),
-     }) as Id;
+     prdId = await ctx.db.insert("prds", createPrdData) as Id;

      // Link PRD to conversation
      await ctx.db.patch(args.conversationId, {
        prdId: prdId,
      });
    }

Prompt for AI Agent:
In convex/prds.ts around lines 139 to 173 the PRD insertion and conversation patch logic is duplicated; extract that repeated block into a single helper (e.g., createPrdAndLink or buildPrdRecord) that accepts ctx, args, and identity, constructs the PRD payload (productName, prdData, conversationId, userId, version:1, status:"completed", createdAt/updatedAt: Date.now()), calls ctx.db.insert to create the PRD, patches the conversation with the returned prdId, and returns the prdId; replace both duplicated sections with a call to this helper to reduce duplication and improve maintainability.



============================================================================
File: components/data-table.tsx
Line: 339 to 402
Type: potential_issue

Comment:
Data table doesn't sync with prop updates after initial mount.

The DataTable initializes its data state from initialData prop (line 344) but never updates when initialData changes. Additionally, local changes (like drag-and-drop reordering) aren't propagated back to the parent component.

This means:
- If the parent passes new data, it will be ignored
- Changes made by drag-and-drop are lost if the component re-mounts
- The component can't be used in a controlled manner



For a reusable component, consider one of these approaches:

Option 1: Fully controlled (recommended for reusable components):
 export function DataTable({
-  data: initialData,
+  data,
+  onDataChange,
 }: {
   data: z.infer[]
+  onDataChange?: (data: z.infer[]) => void
 }) {
-  const [data, setData] = React.useState(() => initialData)
+  // data is now controlled by parent


Option 2: Sync with prop changes:
 export function DataTable({
   data: initialData,
 }: {
   data: z.infer[]
 }) {
   const [data, setData] = React.useState(() => initialData)
+  
+  React.useEffect(() => {
+    setData(initialData)
+  }, [initialData])


Option 3: Document that it's uncontrolled (if intentional for this use case).




============================================================================
File: components/ui/sidebar.tsx
Line: 85 to 87
Type: nitpick

Comment:
Potential SSR issue with document.cookie access.

The code accesses document.cookie directly without checking if we're in a browser environment. While the "use client" directive ensures this runs client-side in Next.js, consider adding a guard to make the code more defensive and portable.



Consider this pattern:

      // This sets the cookie to keep the sidebar state.
-     document.cookie = ${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}
+     if (typeof document !== "undefined") {
+       document.cookie = ${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}
+     }

Prompt for AI Agent:
In components/ui/sidebar.tsx around lines 85 to 87, the code writes document.cookie directly which can error in non-browser contexts; add a defensive guard before accessing document (e.g., check typeof document !== "undefined" and typeof window !== "undefined" or similar) and only set the cookie when the guard passes, optionally wrapping the cookie set in a try/catch to swallow or log errors so the component remains safe and portable.



============================================================================
File: convex/conversations.ts
Line: 174 to 242
Type: nitpick

Comment:
Potential type checking issue with arrays.

The check on Line 208 typeof results === 'object' && !Array.isArray(results) is correct, but the validation logic could be clearer.



Consider extracting validation to a helper function for clarity:

+function validateResearchResults(results: any): void {
+  if (!results) {
+    throw new Error("Research results are required");
+  }
+  
+  if (typeof results !== 'object' || Array.isArray(results)) {
+    throw new Error("Research results must be an object");
+  }
+  
+  const keys = Object.keys(results);
+  if (keys.length === 0) {
+    throw new Error("Research results must contain at least one category");
+  }
+  
+  const hasData = keys.some(key => {
+    const value = results[key];
+    if (value === null || value === undefined) return false;
+    if (Array.isArray(value)) return value.length > 0;
+    if (typeof value === 'object') return Object.keys(value).length > 0;
+    return true;
+  });
+  
+  if (!hasData) {
+    throw new Error("Research results are required and must contain data");
+  }
+}
+
 export const saveResearchResults = mutation({
   // ... args
   handler: async (ctx, args): Promise => {
     // ... auth checks
     
     const results = args.researchResults || args.results;
-    // Validate results are present and not empty
-    if (!results) {
-      throw new Error("Research results are required");
-    }
-
-    if (typeof results === 'object' && !Array.isArray(results)) {
-      const keys = Object.keys(results);
-      if (keys.length === 0) {
-        throw new Error("Research results must contain at least one category");
-      }
-      // Validate that at least one category has non-empty data
-      const hasData = keys.some(key => {
-        const value = results[key];
-        if (value === null || value === undefined) return false;
-        if (Array.isArray(value)) return value.length > 0;
-        if (typeof value === 'object') return Object.keys(value).length > 0;
-        return true;
-      });
-      if (!hasData) {
-        throw new Error("Research results are required and must contain data");
-      }
-    }
+    validateResearchResults(results);
     
     // ... rest of handler
   }
 });




============================================================================
File: lib/ai-clients.ts
Line: 42 to 46
Type: potential_issue

Comment:
I need to verify the more recent model versions mentioned in the code. Let me search for current information on these specific model identifiers.

Update hardcoded Claude model versions to latest available releases.

Claude Haiku 4.5 was released October 15, 2025 and is accessed via claude-haiku-4-5, but the code uses the older claude-3-5-haiku-20241022 from October 2024. Similarly, Claude Sonnet 4.5 is available via claude-sonnet-4-5, yet the code references claude-sonnet-4-20250514 from May 2025. The Perplexity model sonar-pro is current and requires no change.

Update lines 43–44 to use the latest model identifiers:
- CLAUDE_SONNET: "claude-sonnet-4-5"
- CLAUDE_HAIKU: "claude-haiku-4-5"

Prompt for AI Agent:
In lib/ai-clients.ts around lines 42 to 46, the CLAUDE_SONNET and CLAUDE_HAIKU constants reference older model identifiers; update those two values to the latest released identifiers: set CLAUDE_SONNET to "claude-sonnet-4-5" and CLAUDE_HAIKU to "claude-haiku-4-5", leaving PERPLEXITY_SONAR unchanged.



============================================================================
File: components/ui/toggle-group.tsx
Line: 40 to 67
Type: potential_issue

Comment:
Fix fallback logic to handle falsy values correctly.

The ToggleGroupItem has a subtle bug in its fallback logic:

Issue: Lines 51-52 and 54-57 use || operator for fallbacks, which will use the local prop even when context provides falsy-but-valid values (like 0 or empty string):

data-variant={context.variant || variant}  // Wrong!


If context.variant is an empty string, it will fallback to variant even though the context intentionally provided the empty string.



Apply this diff to fix the fallback logic:

       data-slot="toggle-group-item"
-      data-variant={context.variant || variant}
-      data-size={context.size || size}
+      data-variant={context.variant ?? variant}
+      data-size={context.size ?? size}
       className={cn(
         toggleVariants({
-          variant: context.variant || variant,
-          size: context.size || size,
+          variant: context.variant ?? variant,
+          size: context.size ?? size,
         }),


The nullish coalescing operator (??) only falls back when the value is null or undefined, not for other falsy values.

Prompt for AI Agent:
In components/ui/toggle-group.tsx around lines 40 to 67, the fallback logic uses the || operator which treats valid falsy values (e.g., empty string or 0) as absent; change those fallbacks to nullish coalescing so context values are respected when they are falsy but defined: replace occurrences of context.variant || variant and context.size || size with context.variant ?? variant and context.size ?? size (apply to data- attributes and the toggleVariants call).



============================================================================
File: lib/techStack/defaults.ts
Line: 129 to 199
Type: nitpick

Comment:
Mock data is too generic and may not be useful for testing.

The generateMockResearchResults function creates placeholder data with several limitations:

1. Single recommendation per category: Real research typically provides multiple options for comparison. Consider generating 2-3 recommendations per category.

2. Generic pros/cons: Each category uses identical generic text ("Fast development", "Learning curve", etc.) that doesn't reflect actual technology characteristics.

3. All marked as recommended: Every option has recommended: true and popularity: 'High', which doesn't reflect realistic scenarios where tradeoffs exist.

4. Template string descriptions: Descriptions like "${stack.frontend} is a modern, production-ready framework" are too generic to be useful.




Consider these improvements:
- Generate multiple options per category (e.g., if frontend is "Next.js", also include "React", "Vue.js" as alternatives)
- Use technology-specific pros/cons based on a lookup table
- Vary popularity and recommended flags to create realistic scenarios

Do you want me to generate an enhanced implementation with more realistic mock data?




============================================================================
File: lib/workflow/progress.ts
Line: 27 to 42
Type: refactor_suggestion

Comment:
Extract the hardcoded steps array to avoid duplication.

The steps array ['discovery', 'questions', 'research', 'selection', 'generate'] is duplicated across multiple functions (lines 28, 38, 54, 89, 121). Consider extracting it as a constant at the module level or using the getAllSteps() function defined at line 120.



Apply this refactor:

+const WORKFLOW_STEPS: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+
 /
  * Get the next step in the workflow
  */
 export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+  const steps = WORKFLOW_STEPS
   const currentIndex = steps.indexOf(currentStep)
   const nextStep = steps[currentIndex + 1]
   return nextStep !== undefined ? nextStep : null
 }

 /
  * Get the previous step in the workflow
  */
 export function getPreviousStep(currentStep: WorkflowStep): WorkflowStep | null {
-  const steps: WorkflowStep[] = ['discovery', 'questions', 'research', 'selection', 'generate']
+  const steps = WORKFLOW_STEPS
   const currentIndex = steps.indexOf(currentStep)
   const prevStep = steps[currentIndex - 1]
   return prevStep !== undefined ? prevStep : null
 }


And similarly update the other functions that use this array.

Prompt for AI Agent:
In lib/workflow/progress.ts around lines 27 to 42, the steps array ['discovery','questions','research','selection','generate'] is hardcoded and duplicated across multiple functions; extract that array to a single module-level constant or call the existing getAllSteps() (defined around line 120) and replace the in-function hardcoded arrays with that single source of truth; update getNextStep, getPreviousStep and any other functions that reference the hardcoded array (also at lines ~54, ~89, ~121) to use the shared constant or getAllSteps(), keeping behavior identical and ensuring index lookups still return null when out of range.



============================================================================
File: lib/analytics/questionsEvents.ts
Line: 57 to 75
Type: nitpick

Comment:
Same type safety issue as trackQuestionsSkip.

This function has the same unsafe type casting pattern as trackQuestionsSkip. Apply the same global Window interface declaration (from the previous comment) to fix the type safety here as well.



 export function trackQuestionsCompleted(data: QuestionsCompletedData) {
-  if (typeof window !== "undefined" && (window as any).analytics) {
+  if (typeof window !== "undefined" && window.analytics) {
     logger.debug("Analytics: Questions Completed", "", {
       // ... existing code ...
     });
 
-    (window as any).analytics.track('Questions Completed', {
+    window.analytics.track('Questions Completed', {

Prompt for AI Agent:
In lib/analytics/questionsEvents.ts around lines 57 to 75, the function uses unsafe casts like (window as any).analytics which breaks type safety; add the same global Window interface declaration used to fix trackQuestionsSkip (declare global { interface Window { analytics?: { track: (event: string, props?: Record) => void } } }) in a shared typings file or at top of this module, then replace (window as any).analytics with window.analytics (guarding with typeof window !== "undefined" && window.analytics) so TypeScript knows the analytics shape and the casts are removed.



============================================================================
File: components/workflow/workflowConfig.ts
Line: 25 to 29
Type: nitpick

Comment:
Consider documenting status precedence logic.

The function has an implicit precedence: completed > current > future. If a step is both in completedSteps and matches currentStep, it returns "completed". This might be intentional behavior, but consider adding a comment to clarify:



+/
+ * Determines the status of a workflow step.
+ * Precedence: completed > current > future
+ * (A step marked as completed takes precedence over being the current step)
+ */
 export const getStepStatus = (stepId: string, currentStep: string, completedSteps: string[]) => {

Prompt for AI Agent:
In components/workflow/workflowConfig.ts around lines 25 to 29, the getStepStatus function implicitly prioritizes statuses as completed > current > future; add an inline comment above the function explaining this precedence (i.e., if a step appears in completedSteps and equals currentStep it will be considered "completed") so intent is explicit and future readers understand the resolution order.



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

