# Code Review: Convex

This file contains 15 review issues for convex files.

============================================================================

✅ RESOLVED - File: convex/auth.config.ts
Line: 1 to 12
Type: potential_issue
Priority: CRITICAL

Comment:
Add runtime validation for required environment variable.

The non-null assertion operator (!) on line 8 bypasses TypeScript's type checking. If CLERK_JWT_ISSUER_DOMAIN is undefined at runtime, the authentication configuration will silently accept an undefined domain, leading to authentication failures with unclear error messages.

RESOLUTION:
Added runtime validation that throws a descriptive error at module initialization if CLERK_JWT_ISSUER_DOMAIN is missing. Removed the non-null assertion operator. Configuration now fails fast with clear error message directing users to Convex Dashboard.



============================================================================

File: convex/workflow.ts
Line: 49 to 54
Type: refactor_suggestion

Comment:
Extract default workflow progress to a constant.

The default workflow progress object is duplicated three times. This violates DRY and could lead to inconsistencies.



Extract to a shared constant:

+const DEFAULT_WORKFLOW_PROGRESS = {
+  currentStep: "discovery" as const,
+  completedSteps: [],
+  skippedSteps: [],
+  lastUpdated: Date.now(),
+}
+
 export const getProgress = query({
   args: { conversationId: v.id("conversations") },
   handler: async (ctx, args) => {
     const identity = await ctx.auth.getUserIdentity()
     if (!identity) return null

     const conversation = await ctx.db.get(args.conversationId)
     if (!conversation || conversation.userId !== identity.subject) return null

-    return conversation.workflowProgress || {
-      currentStep: "discovery",
-      completedSteps: [],
-      skippedSteps: [],
-      lastUpdated: Date.now(),
-    }
+    return conversation.workflowProgress || DEFAULT_WORKFLOW_PROGRESS
   },
 })


Apply similar changes to completeStep and skipStep handlers.


Also applies to: 75-80, 116-121

Prompt for AI Agent:
In convex/workflow.ts around lines 49-54 (also apply to 75-80 and 116-121), the default workflowProgress object is duplicated; extract it to a single shared constant (e.g., DEFAULT_WORKFLOW_PROGRESS) at the top of the file, and replace the inline literal usages with references to that constant; when returning or assigning, shallow-clone the constant and set lastUpdated (and any per-call fields like completedSteps/skippedSteps) to avoid mutating the shared object (for example use an object spread to copy and then override lastUpdated), and update completeStep and skipStep handlers to use the same constant/clone pattern.



============================================================================

File: convex/schema.ts
Line: 28 to 34
Type: nitpick

Comment:
Consider extracting message schema for reusability.

The message object schema is defined inline. If messages are referenced in other parts of the application or if you need to validate message structures elsewhere, consider extracting this to a named schema definition.

Prompt for AI Agent:
In convex/schema.ts around lines 28 to 34, the message object schema is declared inline; extract it into a named reusable schema (e.g., const messageSchema = v.object({...})), replace the inline object in messages with v.array(messageSchema), and export the messageSchema if other modules need to import it; ensure any existing imports/exports are updated and types still align with current usage.



============================================================================

File: convex/prds.ts
Line: 109
Type: nitpick

Comment:
Consider strengthening type safety for prdData.

The prdData parameter uses v.any() which bypasses type validation. If the structure of PRD data is known (as suggested by types/index.ts mentioned in the summary), consider defining a more specific validator to catch data structure issues early.

Prompt for AI Agent:
In convex/prds.ts around line 109, prdData is currently validated with v.any(), which bypasses type checks; replace it with a concrete validator that matches the PRD shape (either import the existing PRD validator from types/index.ts or define a v.object(...) schema mirroring the PRD type), update imports to bring that validator into this file, and use that validator in place of v.any() so malformed PRD payloads are caught at validation time.



============================================================================

File: convex/prds.ts
Line: 5 to 29
Type: nitpick

Comment:
Consider adding pagination to prevent performance issues.

The list query fetches all PRDs for a user and performs client-side filtering. For users with many PRDs, this could cause performance issues and large data transfers. Consider adding pagination parameters (e.g., limit and cursor) to limit the result set size.

Prompt for AI Agent:
In convex/prds.ts around lines 5 to 29, the list query currently fetches all PRDs which can cause performance and transfer issues; add pagination by extending args to accept optional limit (number, enforce a safe default and max) and cursor (opaque string), use those to fetch only a page from the DB (apply the index and ordering, start the query at the cursor if provided, and limit results to the requested page size), apply the search filter only to the page (or, if possible, move simple filters into the DB query), and return a paginated response object { items: PRD[], nextCursor?: string } where nextCursor is derived from the last item so clients can request subsequent pages.



============================================================================

File: convex/schema.ts
Line: 239
Type: nitpick

Comment:
Consider defining a structured schema for prdData.

Using v.any() for prdData bypasses Convex's type validation. If the PRD data structure is defined (as suggested by types/index.ts in the summary), consider using a more specific validator to catch schema violations early and provide better type safety.

Prompt for AI Agent:
In convex/schema.ts around line 239, prdData is currently v.any(), which bypasses Convex validation; replace it with a structured validator that matches the PRD type declared in types/index.ts (e.g., use v.object({ ...fields... }) with the exact field names and validators (v.string(), v.number(), v.optional(...), v.array(...), etc.), import any nested validators needed, and ensure optional/nullable fields mirror the TypeScript definitions; update related types/imports and run typechecks/tests to confirm the schema and runtime validator stay in sync.



============================================================================

File: convex/prds.ts
Line: 145 to 149
Type: nitpick

Comment:
Consider implementing version increment logic.

The version field is always set to 1 when creating a new PRD. If PRDs support versioning (as suggested by the field name), consider incrementing the version number when updating an existing PRD instead of always using 1.



Apply this diff to implement version incrementing:

      } else {
        // PRD was deleted or doesn't exist - create new one
        prdId = await ctx.db.insert("prds", {
          conversationId: args.conversationId,
          userId: identity.subject,
          productName: args.productName,
          prdData: args.prdData,
-         version: 1,
+         version: existingPrd?.version ? existingPrd.version + 1 : 1,
          status: "completed",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }) as Id;


For the update path (lines 131-136), add version increment:

        await ctx.db.patch(conversation.prdId, {
          productName: args.productName,
          prdData: args.prdData,
+         version: existingPrd.version + 1,
          status: "completed",
          updatedAt: Date.now(),
        });



Also applies to: 163-167

Prompt for AI Agent:
In convex/prds.ts around lines 131-136 and 163-167, implement version incrementing for the update path: when updating an existing PRD, read the current record's version and set the new version to currentVersion + 1 (instead of always using 1), update updatedAt to Date.now(), and persist the incremented version; for the create path continue to set version to 1. Ensure you handle the case where currentVersion is missing (treat as 1) and only increment on the update branch.



============================================================================

✅ RESOLVED - File: convex/users.ts
Line: 59 to 71
Type: potential_issue
Priority: CRITICAL

Comment:
Authorization comment is misleading—query allows any authenticated user to fetch any user by Clerk ID.

The comment on Line 65 states "Only allow users to query their own data or this specific user," but the implementation doesn't enforce this. Any authenticated user can query any other user's data by providing their clerkId.

RESOLUTION:
Added proper authorization check that compares identity.subject to args.clerkId and returns null when they differ. Users can now only query their own data. Updated comment to reflect enforcement. Authorization check happens before database query.



============================================================================

File: convex/conversations.ts
Line: 415 to 466
Type: nitpick

Comment:
PRD creation and conversation update should be transactional.

Lines 437-446 insert a PRD record, and Lines 450-462 update the conversation. If the second operation fails (e.g., due to network issues or validation), the PRD record is orphaned.

Convex mutations are transactional within the same function, so if the handler throws, both operations roll back. However, explicitly documenting this or adding error handling improves clarity.



The current implementation is correct (Convex handles transactions), but you could add explicit error context:

    // Create PRD record with status "generating"
    const prdId = await ctx.db.insert("prds", {
      conversationId: args.conversationId,
      userId: identity.subject,
      productName: args.projectName,
      prdData: null,
      version: 1,
      status: "generating",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update conversation with project info and PRD link
-   // Note: Initial discovery message will be generated by API call
+   // Note: This and the PRD insert above are atomic within this mutation.
+   // If this patch fails, the PRD insert will be rolled back automatically.
    await ctx.db.patch(args.conversationId, {

Prompt for AI Agent:
In convex/conversations.ts around lines 415 to 466, wrap the PRD insert and conversation patch in a try/catch so any failure surfaces with explicit context and still triggers Convex's rollback; on catch, log or attach the original error and rethrow a new Error (or rethrow the original) with a descriptive message like "Failed to save project setup for conversationId=..." so callers and logs include the underlying error; ensure the handler throws after logging so the mutation is rolled back.



============================================================================

✅ RESOLVED - File: convex/users.ts
Line: 28 to 29
Type: potential_issue
Priority: HIGH

Comment:
Inconsistent email handling may cause data loss.

Line 28 uses identity.email || existing.email as a fallback, but Line 37 during user creation uses identity.email || "". This means if identity.email is undefined/null during creation, an empty string is stored. However, on subsequent updates, if identity.email becomes undefined, the existing email is preserved.

RESOLUTION:
Changed both update and create paths to use nullish coalescing (??) instead of logical OR (||) for consistent handling. Updates preserve existing.email when identity.email is nullish, and creation defaults to empty string when identity.email is nullish. This ensures consistent behavior across both paths.



============================================================================

File: convex/conversations.ts
Line: 4 to 15
Type: nitpick

Comment:
Enhance mergeCompletedSteps with validation.

The helper function merges steps without validating that the input steps are valid workflow steps. Invalid step names could enter the completedSteps array.



Add validation:

 function mergeCompletedSteps(
   existingSteps: string[] | undefined,
   newSteps: string[]
 ): string[] {
+  const stepOrder = ["setup", "discovery", "questions", "research", "selection", "generate"];
+  // Filter out invalid steps
+  const validNewSteps = newSteps.filter(step => stepOrder.includes(step));
+  
-  const allSteps = [...(existingSteps || []), ...newSteps];
+  const allSteps = [...(existingSteps || []), ...validNewSteps];
-  const stepOrder = ["setup", "discovery", "questions", "research", "selection", "generate"];
   const uniqueSteps = Array.from(new Set(allSteps));
   return uniqueSteps.sort((a, b) => stepOrder.indexOf(a) - stepOrder.indexOf(b));
 }

Prompt for AI Agent:
In convex/conversations.ts around lines 4 to 15, mergeCompletedSteps currently accepts any strings and can introduce invalid workflow steps; update it to validate inputs against the canonical step order before merging: create a Set or array of allowed steps (the stepOrder already defined), filter existingSteps (if present) and newSteps to only include items present in stepOrder, optionally console.warn or processLogger.warn for any discarded invalid names, then merge the filtered arrays, deduplicate and sort by stepOrder as before so only valid, ordered steps end up in the returned array.



============================================================================

File: convex/schema.ts
Line: 238
Type: nitpick

Comment:
Document the userId denormalization rationale.

The userId field duplicates information from the linked conversation. This appears to be intentional denormalization for query performance (enabling the by_user index). Consider adding a comment explaining this design decision to prevent future confusion.



  prds: defineTable({
    conversationId: v.id("conversations"),
+   // Denormalized from conversation for efficient by_user queries
    userId: v.string(),

Prompt for AI Agent:
In convex/schema.ts around line 238, the userId field duplicates data from the linked conversation but lacks a comment explaining the denormalization; add a brief inline comment on that line stating that userId is intentionally denormalized from the conversation for query/indexing performance (supports the by_user index), and mention the tradeoff (redundancy vs faster queries) so future maintainers understand the rationale.



============================================================================

File: convex/schema.ts
Line: 123 to 212
Type: nitpick

Comment:
Document the precedence order for tech stack fields.

The schema includes both selection and selectedTechStack fields for tech stack information. While the comment explains their different origins and detail levels, it would be helpful to explicitly document which field takes precedence when both are present, especially for consumers of this data.



Consider adding to the comment:

  * PRD generation checks both fields (selection first, then selectedTechStack)
+ * Precedence order: selection (auto) > selectedTechStack (manual)
+ * Consumers should check selection first, fallback to selectedTechStack

Prompt for AI Agent:
convex/schema.ts around lines 123-212: the comment describes the two tech-stack fields but doesn't state which one wins when both exist; update the top comment to explicitly document precedence and usage — add a clear sentence like "Precedence: use selection if present; otherwise fall back to selectedTechStack (i.e., PRD generation checks selection first, then selectedTechStack), and note that selection is the auto-selected minimal representation while selectedTechStack contains manual detailed choices and reasoning."



============================================================================

✅ RESOLVED - File: convex/conversations.ts
Line: 264 to 333
Type: potential_issue
Priority: HIGH

Comment:
Race condition: concurrent saveSelection calls may cause inconsistent state.

The saveSelection mutation reads conversation.selectedTechStack (Line 319) and then patches with merged data (Lines 320-326). If two concurrent calls occur for different categories, one may overwrite the other's changes.

Convex mutations are atomic within a single document patch, but the read-then-write pattern creates a race window.

RESOLUTION:
Added documentation comment explaining that Convex serializes mutations, so concurrent saveSelection calls for different categories will be applied sequentially. The final state will contain all selections as each mutation is atomic and isolated. This is the expected Convex behavior and does not require code changes.




============================================================================

✅ RESOLVED - File: convex/conversations.ts
Line: 196 to 205
Type: potential_issue
Priority: HIGH

Comment:
Complex validation logic may silently accept empty objects.

Line 203 checks if results is an empty object, but the condition is complex and could be bypassed. An empty object {} passes typeof results === 'object' and results !== null and !Array.isArray(results), so only Object.keys(results).length === 0 catches it.

However, the error message says "must contain data," but the validation doesn't check if nested arrays/objects are empty.

RESOLUTION:
Strengthened validation logic to check for empty objects AND validate that at least one category has non-empty data. Validation now checks if values are null/undefined/empty arrays/empty objects and ensures at least one category contains actual data. Separated error messages for better clarity: "Research results are required", "Research results must contain at least one category", and "Research results are required and must contain data".



