# Frontend Architecture

## App Router Structure

### Route Organization

```text
/app
  page.tsx                          # Home/Auth landing page
  layout.tsx                        # Root layout with providers
  globals.css                       # Global styles

  /dashboard
    page.tsx                        # Main dashboard - PRD listing

  /chat
    /new
      page.tsx                      # Create new conversation (intermediary)
    /[conversationId]
      page.tsx                      # Discovery chat interface
      /questions
        page.tsx                    # Clarifying questions form
      /tech-stack
        page.tsx                    # Tech stack research & selection
      /research
        page.tsx                    # 🗑️ Deprecated - redirects to tech-stack
      /select
        page.tsx                    # 🗑️ Deprecated - redirects to tech-stack
      /generate
        page.tsx                    # PRD generation & display

  /prd
    /[prdId]
      page.tsx                      # PRD view & export

  /api                              # API routes (server-side)
    /conversation
      /message/route.ts             # Chat message endpoint
      /extract-context/route.ts     # Context extraction
      /initial-message/route.ts     # First message generation
    /questions
      /generate/route.ts            # Generate questions
      /fill-defaults/route.ts       # Fill default answers
    /research
      /tech-stack/route.ts          # Research tech options
    /validate
      /tech-stack/route.ts          # Validate selections
    /tech-stack
      /suggest-defaults/route.ts    # Suggest defaults
    /prd
      /generate/route.ts            # Generate PRD
```

### Routing Patterns

**Protected Routes:**
- All routes except `/`, `/sign-in(.*)`, `/sign-up(.*)` require authentication
- Middleware redirects unauthenticated users to Clerk sign-in
- See `middleware.ts` for route protection config

**Dynamic Routes:**
- `[conversationId]`: Conversation-specific pages
- `[prdId]`: PRD-specific pages

**Workflow Progression (4 steps):**
```text
/ → /dashboard → /chat/new → /chat/[id] (Discovery)
  → /chat/[id]/questions → /chat/[id]/tech-stack → /chat/[id]/generate
  → /prd/[prdId]

Steps: Discovery → Questions → Tech Stack → Generate
```

**Deprecated Routes:**
- `/chat/[id]/research` → Redirects to `/chat/[id]/tech-stack`
- `/chat/[id]/select` → Redirects to `/chat/[id]/tech-stack`

## Component Organization

### Feature-Based Structure

```text
/components
  /chat                   # Discovery chat UI
    ChatContainer.tsx
    ChatMessage.tsx
    ChatInput.tsx
    TypingIndicator.tsx

  /questions              # Questions phase UI
    QuestionCategory.tsx
    QuestionCard.tsx
    ProgressIndicator.tsx

  /tech-stack             # Tech stack research & selection UI
    CategorySection.tsx
    TechStackCard.tsx
    SelectionStatus.tsx

  /research               # Deprecated (redirects to tech-stack)
  /selection              # Deprecated (redirects to tech-stack)

  /prd                    # PRD display & generation
    GenerationProgress.tsx
    PRDDisplay.tsx

  /export                 # Export functionality
    ExportButtons.tsx
    PRDDocument.tsx       # React-PDF template

  /dashboard              # Dashboard UI
    PRDCard.tsx
    SearchBar.tsx
    SortControls.tsx
    EmptyState.tsx

  /workflow               # Workflow orchestration
    AutoAdvance.tsx
    PageTransition.tsx
    WorkflowLayout.tsx

  /ui                     # shadcn/ui primitives
    button.tsx
    card.tsx
    dialog.tsx
    tabs.tsx
    ... (all shadcn components)

  # Root-level provider components
  ConvexClientProvider.tsx
  StoreUserProvider.tsx
  ClientBody.tsx
  app-sidebar.tsx
  auth-buttons.tsx
  nav-user.tsx
```

### Component Naming Conventions

- **PascalCase** for component files: `ChatMessage.tsx`, `PRDDisplay.tsx`
- **Kebab-case** for shadcn/ui primitives: `button.tsx`, `alert-dialog.tsx`
- **Prefixes:**
  - No prefix for components (not `ComponentName`)
  - Feature-based folders organize by domain

## Context Providers

### Provider Hierarchy

Located in `app/layout.tsx`:

```tsx
<html>
  <body>
    <ClientBody>                    {/* Client-side body wrapper */}
      <ClerkProvider>               {/* Authentication */}
        <ConvexClientProvider>      {/* Real-time database */}
          <StoreUserProvider>       {/* Auto-store user in Convex */}
            <WorkflowProvider>      {/* Workflow state management */}
              {children}
              <Toaster />           {/* Toast notifications */}
            </WorkflowProvider>
          </StoreUserProvider>
        </ConvexClientProvider>
      </ClerkProvider>
    </ClientBody>
  </body>
</html>
```

### Provider Details

**ClerkProvider** (`@clerk/nextjs`):
- Provides authentication context
- Configured with custom appearance/theming
- Handles sign-in/sign-up flows

**ConvexClientProvider** (`components/ConvexClientProvider.tsx`):
- Wraps `ConvexProviderWithClerk`
- Integrates Clerk JWT with Convex
- Provides real-time database hooks

**StoreUserProvider** (`components/StoreUserProvider.tsx`):
- Auto-syncs authenticated user to Convex `users` table
- Updates `lastSeenAt` on sign-in
- Located: `components/StoreUserProvider.tsx`

**WorkflowProvider** (`contexts/WorkflowContext.tsx`):
- Global workflow state (current step, completed steps)
- Syncs with Convex & localStorage
- Navigation guards & auto-advance logic

## API Routes Structure

### Route Patterns

All API routes follow this structure:

```typescript
// app/api/[feature]/[action]/route.ts
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse & validate input
  const body = await req.json();

  // 3. Perform action (call AI, query Convex, etc.)

  // 4. Return response
  return Response.json({ data });
}
```

### API Categories

**Conversation APIs:** (Rate limited: 20 req/min, 100k tokens/min)
- `/api/conversation/message` - Handle chat messages (Claude AI)
- `/api/conversation/extract-context` - Extract product context
- `/api/conversation/initial-message` - Generate first message

**Questions APIs:**
- `/api/questions/generate` - Generate tailored questions (Claude)
- `/api/questions/fill-defaults` - Fill default answers

**Tech Stack APIs:**
- `/api/research/tech-stack` - Research technologies (Perplexity)
- `/api/validate/tech-stack` - Validate tech stack compatibility (Claude)
- `/api/tech-stack/suggest-defaults` - Suggest default stack

**PRD APIs:**
- `/api/prd/generate` - Generate comprehensive PRD (Claude)

## File Location Patterns

### Where to Create New Files

**New page:**
- `app/[route]/page.tsx`

**New API endpoint:**
- `app/api/[feature]/[action]/route.ts`

**New component:**
- Feature-specific: `components/[feature]/ComponentName.tsx`
- Shared UI: `components/ui/component-name.tsx`

**New context:**
- `contexts/ContextName.tsx`

**New utility:**
- `lib/[category]/utility-name.ts`

### Import Aliases

Use `@/*` for all imports:

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/convex/_generated/api"

// ❌ Incorrect
import { Button } from "../../components/ui/button"
import { cn } from "../lib/utils"
```

## Client vs Server Components

### When to Use "use client"

**Require "use client":**
- Using React hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Convex hooks (`useQuery`, `useMutation`)
- Context consumers (`useContext`, `useWorkflow`)

**Can be Server Components:**
- Static content pages
- Layouts without interactivity
- Pages that only fetch data (no user interaction)

### Pattern

```typescript
// components/InteractiveComponent.tsx
"use client";  // ← Add this directive

import { useState } from "react";
import { useQuery } from "convex/react";

export function InteractiveComponent() {
  const [state, setState] = useState();
  const data = useQuery(api.something.get);

  return <div onClick={() => setState(...)}>...</div>;
}
```

## Navigation Patterns

### Router Usage

```typescript
"use client";
import { useRouter } from "next/navigation";

export function MyComponent() {
  const router = useRouter();

  // Navigate programmatically
  router.push("/dashboard");
  router.push(`/chat/${conversationId}`);
  router.back();
}
```

### Link Usage

```typescript
import Link from "next/link";

<Link href="/dashboard" className="...">
  Go to Dashboard
</Link>
```

## State Management Patterns

### Local State (Component-Level)

```typescript
const [isLoading, setIsLoading] = useState(false);
const [selections, setSelections] = useState<string[]>([]);
```

### Server State (Convex)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query
const prds = useQuery(api.prds.list);

// Mutation
const createPRD = useMutation(api.prds.create);
await createPRD({ conversationId, data });
```

### Global State (Context)

```typescript
import { useWorkflow } from "@/contexts/WorkflowContext";

const { state, advanceToNextStep, markStepComplete } = useWorkflow();
```

## Performance Patterns

### Parallel Data Fetching

```typescript
// Server component - fetch in parallel
const [prds, stats] = await Promise.all([
  convex.query(api.prds.list),
  convex.query(api.prds.getStats)
]);
```

### Optimistic Updates

```typescript
// Update UI immediately, then sync
setSelections([...selections, newSelection]);
await updateSelection({ id, selection: newSelection });
```

### Caching Strategy

- Research results cached in Convex (never regenerated)
- PRD data persisted permanently
- Workflow state backed up to localStorage

## Error Handling

### Page-Level Errors

```typescript
"use client";
import { useToast } from "@/components/ui/use-toast";

export function MyPage() {
  const { toast } = useToast();

  try {
    await somethingRisky();
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}
```

### API Route Errors

```typescript
export async function POST(req: Request) {
  try {
    // ... logic
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```
