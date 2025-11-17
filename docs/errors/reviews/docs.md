# Code Review: Docs

This file contains 7 review issues for docs files.

============================================================================

File: docs/errors/research-empty-pros-cons.md
Line: 36 to 38
Type: potential_issue

Comment:
Add blank line before fenced code block.

Markdown linting requires a blank line before fenced code blocks for proper rendering.



Apply this diff:

 ## Technical Details
 
 JavaScript evaluation shows:
+
 javascript
 {
```

Prompt for AI Agent:
In docs/errors/research-empty-pros-cons.md around lines 36 to 38, there is no blank line immediately before the fenced code block starting with "javascript"; add a single blank line above that fenced block so the markdown linter and renderers recognize it as a proper code block (i.e., insert one empty line between the preceding paragraph/line and the "javascript" fence).



============================================================================

File: docs/errors/code-review.md
Line: 231 to 340
Type: potential_issue

Comment:
Review suggestions are inconsistent with actual code.

The suggestions for components/ui/label.tsx reference issues that don't exist in the current implementation:
- Lines 231-340 suggest removing select-none, but the current code doesn't include this class
- Lines 306-340 suggest adding React.forwardRef, but the component already uses it correctly

These inconsistencies suggest this review documentation is outdated or was generated against a different version of the code.



Please verify the accuracy of these review prompts and update or remove outdated suggestions to avoid confusion.

Prompt for AI Agent:
In docs/errors/code-review.md around lines 231 to 340, the review suggestions for components/ui/label.tsx are outdated or inconsistent with the current code (they reference a non-existent select-none class and claim forwardRef is missing when it is present); please verify the current components/ui/label.tsx source and either update the prompts to match the actual implementation (remove the select-none suggestion if the class is absent, remove the forwardRef suggestion if the component already forwards refs, and correct line references) or remove these stale suggestions entirely so the documentation reflects the current codebase and does not confuse reviewers.



============================================================================

File: docs/errors/code-review.md
Line: 1
Type: potential_issue

Comment:
Add a top-level heading.

The file should start with a top-level heading (H1) to provide context about the document's purpose.



Apply this diff:

+# Code Review Prompts
+
 ============================================================================

File: docs/api-routes-guide.md
Line: 9 to 26
Type: nitpick

Comment:
Add language identifier to code block.

The file structure example should specify a language identifier for proper syntax highlighting and accessibility.


Apply this diff:

-
+ /app/api
   /conversation
     /message/route.ts              # Handle chat messages

Prompt for AI Agent:
In docs/api-routes-guide.md around lines 9 to 26, the code block showing the /app/api file tree lacks a language identifier; update the opening fence to include a language identifier (use plaintext) so the block becomes fenced with plaintext at the start (leave the closing ``` intact) to enable proper syntax highlighting and accessibility.



============================================================================

File: docs/errors/schema-mismatch-tech-stack.md
Line: 14 to 18
Type: potential_issue

Comment:
Add language specifier to code fence.

The error message code block should specify a language for better syntax highlighting and markdown compliance.



Apply this diff:

 ## Error Message
 
-
+ [CONVEX M(conversations:saveSelection)] [Request ID: dc37c6eba0cd4e7a] Server Error
 Uncaught Error: Failed to insert or update a document in table "conversations" because it does not match the schema: Object contains extra field real-time-communication that is not in the validator.
 Path: .selectedTechStack

Prompt for AI Agent:
In docs/errors/schema-mismatch-tech-stack.md around lines 14 to 18, the fenced code block lacks a language specifier; update the opening fence from  to text so the block is text ... to enable proper syntax highlighting/markdown compliance and replace the existing fence accordingly.



============================================================================

File: docs/frontend-architecture.md
Line: 7
Type: nitpick

Comment:
Add language specifiers to fenced code blocks.

Multiple code blocks are missing language specifiers, which reduces syntax highlighting and accessibility.



Apply language specifiers:
- Line 7: Add plaintext or text to the route structure block
- Line 64: Add plaintext to the workflow progression
- Line 74: Add plaintext to the component structure

-
+ /app
   page.tsx                          # Home/Auth landing page



Also applies to: 64-64, 74-74

Prompt for AI Agent:
In docs/frontend-architecture.md around lines 7, 64, and 74, several fenced code blocks lack language specifiers; update the opening fence for the route structure block at line 7 and the workflow progression and component structure blocks at lines 64 and 74 to include a language tag (use "text" or "plaintext" as suggested) so the fences become text (or plaintext) instead of just ```, leaving the block contents unchanged.



============================================================================

File: docs/frontend-architecture.md
Line: 284
Type: nitpick

Comment:
Minor grammar issue flagged by linter.

The sentence starting "Can be Server Components:" is missing a subject. While this is acceptable in documentation bullet points, you could make it more grammatically complete.



Consider:
These Can be Server Components:


or

Components that can be Server Components:

Prompt for AI Agent:
In docs/frontend-architecture.md around line 284, the heading "Can be Server Components:" lacks a subject; update the sentence to be grammatically complete by replacing it with a subjectful alternative such as "These Can be Server Components:" or "Components that can be Server Components:" (choose one and apply consistently), then run the linter to confirm the grammar warning is resolved.



