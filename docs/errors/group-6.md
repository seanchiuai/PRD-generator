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




