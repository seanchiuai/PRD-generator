# Implementation Log

This document tracks how features were implemented in the PRD Generator application.

---

## Commit: 17da3b8 - Conversational Product Discovery Feature

**Date:** November 10, 2025
**Purpose:** Implement the first phase of the PRD generation workflow - conversational product discovery using Claude AI.

### Overview

This commit implements a real-time chat interface where users can describe their product idea through a conversational discovery process. The AI assistant asks clarifying questions to gather initial product context before moving to structured questions.

### Architecture Decisions

1. **Real-time Communication**: Used Convex for real-time database with optimistic updates
2. **Row-Level Security**: Implemented authentication checks at the database level to ensure users only access their own conversations
3. **Staged Workflow**: Created a multi-stage pipeline (discovery → clarifying → researching → selecting → generating → completed)
4. **Separation of Concerns**: API routes handle AI communication, Convex handles data persistence, and React components handle UI

### Schema Changes (`convex/schema.ts`)

Added a new `conversations` table with the following structure:

```typescript
conversations: defineTable({
  userId: v.string(),
  messages: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })
  ),
  currentStage: v.union(
    v.literal("discovery"),
    v.literal("clarifying"),
    v.literal("researching"),
    v.literal("selecting"),
    v.literal("generating"),
    v.literal("completed")
  ),
  productContext: v.optional(
    v.object({
      productName: v.optional(v.string()),
      description: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      coreFeatures: v.optional(v.array(v.string())),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_and_stage", ["userId", "currentStage"])
```

**Key Features:**
- `messages`: Array of conversation messages with roles (user/assistant)
- `currentStage`: Tracks where the user is in the PRD generation workflow
- `productContext`: Stores extracted product information (currently optional, to be populated later)
- Dual indexes for efficient queries by user and by user+stage combination

### Convex Functions (`convex/conversations.ts`)

Implemented 4 core database operations:

#### 1. `create` (mutation)
- Creates a new conversation for authenticated users
- Initializes with empty messages array and "discovery" stage
- Returns the conversation ID
- **Security**: Validates user authentication via `ctx.auth.getUserIdentity()`

#### 2. `addMessage` (mutation)
- Appends a message (user or assistant) to an existing conversation
- Updates the `updatedAt` timestamp
- **Security**: Verifies user owns the conversation before allowing updates
- Uses immutable array spreading to append messages

#### 3. `get` (query)
- Retrieves a single conversation by ID
- Returns null if not found or user doesn't own it
- **Security**: Row-level security check ensures users can't access others' conversations

#### 4. `list` (query)
- Fetches user's 50 most recent conversations
- Ordered by creation date (descending)
- Uses `by_user` index for efficient querying
- **Security**: Only returns conversations owned by authenticated user

### API Route (`app/api/conversation/message/route.ts`)

Created a Next.js API route to handle Claude AI integration:

**Endpoint:** `POST /api/conversation/message`

**Implementation Details:**
- Uses Anthropic SDK with `claude-sonnet-4-5-20250929` model
- Max tokens: 1024 (keeps responses concise)
- Authentication via Clerk's `auth()` helper
- System prompt instructs Claude to:
  - Be conversational and encouraging
  - Keep responses concise (2-3 sentences)
  - Gather basic product information
  - Ask clarifying questions about vague aspects

**Request Format:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response Format:**
```json
{
  "message": "Assistant's response text",
  "usage": { ... }
}
```

**Error Handling:**
- Returns 401 if user not authenticated
- Returns 400 if messages array missing
- Returns 500 for API failures
- Logs errors to console for debugging

### UI Components

#### ChatContainer (`components/chat/ChatContainer.tsx`)
- Displays array of messages in scrollable container
- Auto-scrolls to bottom on new messages using `useRef` and `useEffect`
- Shows typing indicator when AI is responding
- Implements smooth scroll behavior for better UX

**Props:**
- `messages`: Array of message objects
- `isTyping`: Boolean to show/hide typing indicator

#### ChatMessage (`components/chat/ChatMessage.tsx`)
- Renders individual message bubbles
- Different styling for user vs assistant messages
- Formats timestamps for display
- Uses Tailwind CSS for responsive design

#### ChatInput (`components/chat/ChatInput.tsx`)
- Textarea-based input with auto-resize
- Send button with keyboard shortcut (Enter)
- Disables during API calls to prevent double-sends
- Clears input after successful send

**Features:**
- Shift+Enter for new lines
- Enter to send
- Disabled state during typing
- Auto-focus for better UX

#### TypingIndicator (`components/chat/TypingIndicator.tsx`)
- Animated three-dot indicator
- Shows while waiting for AI response
- CSS animations for smooth pulsing effect

### Chat Page (`app/chat/[conversationId]/page.tsx`)

Main page component that orchestrates the chat experience:

**State Management:**
- Uses Convex's `useQuery` for real-time conversation data
- Uses Convex's `useMutation` for database updates
- Local state for typing indicator
- Toast notifications for error feedback

**Message Flow:**
1. User types message and clicks send
2. Message immediately saved to Convex (user message)
3. Typing indicator shown
4. API call to Claude for response
5. Assistant message saved to Convex
6. Typing indicator hidden
7. UI automatically updates via Convex real-time subscription

**Error Handling:**
- Try-catch blocks around async operations
- Toast notifications for user feedback
- Graceful fallbacks for loading states

### Additional UI Components Added

#### Textarea (`components/ui/textarea.tsx`)
- shadcn/ui component for multi-line text input
- Consistent styling with the rest of the app

#### Toast System (`components/ui/toast.tsx`, `components/ui/toaster.tsx`, `hooks/use-toast.ts`)
- Complete toast notification system
- Variants: default, destructive
- Auto-dismiss functionality
- Positioned in corner with animations
- Context-based hook for easy usage throughout app

### New Page Route

#### New Chat Page (`app/chat/new/page.tsx`)
- Creates new conversation on mount
- Redirects to conversation page with new ID
- Server-side rendering for better performance

### Dependencies Added

```json
{
  "@anthropic-ai/sdk": "^0.x.x",
  "@radix-ui/react-toast": "^1.x.x"
}
```

### How It All Works Together

1. **User Journey:**
   - User navigates to `/chat/new`
   - New conversation created in Convex
   - Redirect to `/chat/[conversationId]`
   - User sees empty chat interface
   - User types and sends message
   - Message appears immediately (optimistic update)
   - AI responds after 1-2 seconds
   - Conversation continues with real-time updates

2. **Data Flow:**
   ```
   User Input → ChatInput Component
        ↓
   addMessage Mutation → Convex Database
        ↓
   API Route → Claude AI
        ↓
   addMessage Mutation → Convex Database
        ↓
   Real-time Query Update → UI Re-render
   ```

3. **Security Model:**
   - Clerk handles authentication
   - Convex mutations verify user identity
   - Row-level security prevents unauthorized access
   - API routes check authentication before processing

---

## Commit: d5024af - AI-Powered Clarifying Questions Feature

**Date:** November 10, 2025
**Purpose:** Implement the second phase of the PRD workflow - structured clarifying questions generated by AI based on the discovery conversation.

### Overview

This commit adds an AI-powered question generation system that creates personalized, product-specific clarifying questions. Users answer these questions to provide detailed requirements that will inform tech stack recommendations.

### Architecture Decisions

1. **AI-Generated Questions**: Used Claude to generate contextual questions based on discovery conversation
2. **Auto-save**: Implemented real-time answer saving to prevent data loss
3. **Progress Tracking**: Required 70% completion before advancing to next stage
4. **Categorized Questions**: Organized questions into 6 categories for better UX
5. **Validation Gates**: Prevent progression without sufficient information

### Schema Extensions (`convex/schema.ts`)

Added two new optional fields to the `conversations` table:

```typescript
clarifyingQuestions: v.optional(
  v.array(
    v.object({
      id: v.string(),
      category: v.string(),
      question: v.string(),
      placeholder: v.optional(v.string()),
      answer: v.optional(v.string()),
      required: v.boolean(),
      type: v.union(v.literal("text"), v.literal("textarea"), v.literal("select")),
    })
  )
),
answersCompleteness: v.optional(v.number())
```

**Question Object Structure:**
- `id`: Unique identifier for the question
- `category`: Groups questions (e.g., "Core Features", "User Types & Personas")
- `question`: The question text
- `placeholder`: Example answer to guide users
- `answer`: User's response (initially undefined)
- `required`: Boolean indicating if question must be answered
- `type`: Input type (text, textarea, or select)

### API Route (`app/api/questions/generate/route.ts`)

Created endpoint to generate personalized questions using Claude:

**Endpoint:** `POST /api/questions/generate`

**Request:**
```json
{
  "productContext": {
    "productName": "...",
    "description": "...",
    "targetAudience": "...",
    "coreFeatures": ["..."]
  }
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "unique-id",
      "category": "Core Features",
      "question": "What specific actions should users be able to perform?",
      "placeholder": "e.g., Create projects, invite team members...",
      "required": true,
      "type": "textarea"
    }
  ]
}
```

**Implementation Details:**
- Model: `claude-sonnet-4-5-20250929`
- Max tokens: 4096 (allows for detailed question generation)
- Generates 12-15 questions across 6 categories
- Questions are product-specific, not generic templates

**Question Categories:**
1. Core Features (3-4 questions)
2. User Types & Personas (2-3 questions)
3. Data Requirements (2-3 questions)
4. Scalability & Performance (2 questions)
5. Integrations & Third-party Services (2 questions)
6. Technical Constraints (1-2 questions)

**System Prompt Strategy:**
- Instructs Claude to generate questions specific to the product
- Requires mix of open-ended and specific questions
- Answers should inform tech stack decisions
- Output must be valid JSON (handles both plain JSON and markdown-wrapped)

**JSON Extraction Logic:**
Handles three response formats:
1. Plain JSON: `{ "questions": [...] }`
2. Markdown JSON: ` ```json\n{ "questions": [...] }\n``` `
3. Generic markdown: ` ```\n{ "questions": [...] }\n``` `

### Convex Functions Extensions (`convex/conversations.ts`)

Added two new mutations:

#### 1. `saveQuestions` (mutation)
- Saves or updates the entire questions array
- Automatically sets stage to "clarifying"
- Updates `updatedAt` timestamp
- **Security**: Verifies user owns conversation

**Arguments:**
```typescript
{
  conversationId: Id<"conversations">,
  questions: Array<Question>
}
```

**Use Cases:**
- Initial save after generation
- Auto-save on answer changes
- Batch updates when multiple answers change

#### 2. `updateStage` (mutation)
- Updates the workflow stage
- Generic function for any stage transition
- Updates `updatedAt` timestamp
- **Security**: Verifies user owns conversation

**Arguments:**
```typescript
{
  conversationId: Id<"conversations">,
  stage: "discovery" | "clarifying" | "researching" | "selecting" | "generating" | "completed"
}
```

### Questions Page (`app/chat/[conversationId]/questions/page.tsx`)

Main page component for the questions phase:

#### State Management
```typescript
const [questions, setQuestions] = useState<Question[]>([]);
const [isGenerating, setIsGenerating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
```

#### Component Lifecycle

1. **On Mount:**
   - Fetches conversation from Convex
   - If questions already exist, loads them from database
   - If not, triggers question generation

2. **Question Generation (`generateQuestions`):**
   - Shows loading spinner
   - Calls `/api/questions/generate` with product context
   - Parses JSON response
   - Saves questions to Convex
   - Updates local state
   - Error handling with toast notifications

3. **Answer Updates (`handleAnswerChange`):**
   - Updates local state immediately (optimistic update)
   - Auto-saves to Convex without debouncing
   - Silent errors (no toast for auto-save failures)
   - Provides responsive UX

4. **Progress Calculation (`calculateCompleteness`):**
   ```typescript
   const completeness = (answeredRequired / totalRequired) * 100;
   ```
   - Only counts required questions
   - Checks for non-empty trimmed answers
   - Returns percentage (0-100)

5. **Continue Button (`handleContinue`):**
   - Validates 70% completion threshold
   - Shows error toast if insufficient answers
   - Updates stage to "researching"
   - Navigates to `/chat/${conversationId}/research`
   - Disabled during save operation

#### UI Organization

**Questions Grouping:**
```typescript
const categories = questions.reduce((acc, q) => {
  if (!acc[q.category]) acc[q.category] = [];
  acc[q.category].push(q);
  return acc;
}, {} as Record<string, Question[]>);
```

**Layout Structure:**
- Header with title and description
- Progress indicator showing completion percentage
- Questions grouped by category
- Sticky footer with Back and Continue buttons

**Loading States:**
1. **Generating:** Full-screen spinner with message
2. **Empty:** Loading message
3. **Loaded:** Full question form

### UI Components

#### QuestionCategory (`components/questions/QuestionCategory.tsx`)
- Renders a category section with heading
- Maps through questions in that category
- Passes individual questions to QuestionCard
- Provides visual separation between categories

**Props:**
```typescript
{
  category: string;
  questions: Question[];
  onAnswerChange: (id: string, answer: string) => void;
}
```

#### QuestionCard (`components/questions/QuestionCard.tsx`)
- Renders individual question with appropriate input type
- Shows required indicator (*)
- Displays placeholder text
- Handles answer changes and calls parent callback
- Supports text, textarea, and select input types

**Props:**
```typescript
{
  question: Question;
  onAnswerChange: (id: string, answer: string) => void;
}
```

**Input Types:**
- `text`: Single-line input
- `textarea`: Multi-line input (default for most questions)
- `select`: Dropdown (not yet implemented in this commit)

#### ProgressIndicator (`components/questions/ProgressIndicator.tsx`)
- Visual progress bar using Radix UI
- Shows X/Y answered format
- Displays percentage completion
- Color changes based on completion:
  - Red/destructive: < 50%
  - Yellow/warning: 50-69%
  - Green/success: ≥ 70%

**Props:**
```typescript
{
  total: number;
  completed: number;
  className?: string;
}
```

**Implementation:**
```typescript
const percentage = (completed / total) * 100;
return (
  <div>
    <p>{completed} of {total} required questions answered</p>
    <Progress value={percentage} />
  </div>
);
```

#### Progress Bar (`components/ui/progress.tsx`)
- shadcn/ui component wrapping Radix UI Progress
- Animated fill based on value
- Consistent styling with theme
- Accessible ARIA attributes

### Layout Updates (`app/layout.tsx`)

Added Toaster component to root layout for global toast notifications:
```typescript
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Dependencies Added

```json
{
  "@radix-ui/react-progress": "^1.x.x"
}
```

### How It All Works Together

1. **User Flow:**
   ```
   Discovery Chat Completed
        ↓
   Navigate to Questions Page
        ↓
   Questions Auto-Generated (if first visit)
        ↓
   User Answers Questions (auto-saved)
        ↓
   Progress Bar Updates in Real-time
        ↓
   Continue Button Enabled at 70%
        ↓
   Proceed to Research Phase
   ```

2. **Question Generation Flow:**
   ```
   Page Load → Check for Existing Questions
        ↓ (if none)
   Extract Product Context from Discovery
        ↓
   API Call to Claude
        ↓
   Generate 12-15 Contextual Questions
        ↓
   Save to Convex
        ↓
   Render in UI
   ```

3. **Auto-save Flow:**
   ```
   User Types Answer
        ↓
   onChange Event Fired
        ↓
   Update Local State (immediate)
        ↓
   Save to Convex (async)
        ↓
   Real-time Sync to Database
        ↓
   Other Devices/Tabs See Update
   ```

4. **Validation Flow:**
   ```
   User Clicks Continue
        ↓
   Calculate Completeness
        ↓
   Check if ≥ 70%
        ↓ (if yes)
   Update Stage to "researching"
        ↓
   Navigate to Next Phase
   ```

### Key Implementation Patterns

#### Real-time Auto-save
- No debouncing (saves immediately on change)
- Optimistic UI updates
- Silent failure for better UX
- Convex handles conflict resolution

#### Progress Validation
- Client-side validation before proceeding
- Toast notifications for insufficient completion
- Button disabled during save operation
- Required questions clearly marked

#### Error Handling
- Try-catch blocks around all async operations
- User-friendly error messages via toasts
- Console logging for debugging
- Graceful degradation

#### Performance Optimizations
- Questions grouped client-side (no extra queries)
- Local state for immediate UI updates
- Convex mutations batched automatically
- Single query for conversation data

---

## Key Patterns Used Across Both Features

### 1. Row-Level Security Pattern
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

const record = await ctx.db.get(recordId);
if (record.userId !== identity.subject) {
  throw new Error("Unauthorized");
}
```

### 2. Real-time Subscription Pattern
```typescript
const data = useQuery(api.module.functionName, args);
// Automatically updates when data changes in Convex
```

### 3. Optimistic Updates Pattern
```typescript
// Update local state immediately
setLocalState(newValue);

// Then sync to database
await mutation({ ...args });
```

### 4. Loading State Pattern
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await asyncOperation();
  } finally {
    setIsLoading(false);
  }
};
```

### 5. Error Handling Pattern
```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error("Context:", error);
  toast({
    title: "Error",
    description: "User-friendly message",
    variant: "destructive",
  });
}
```

### 6. API Route Pattern
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "..." }, { status: 401 });

  // 2. Validate input
  const body = await request.json();

  // 3. Process
  const result = await externalAPI(body);

  // 4. Return response
  return NextResponse.json(result);
}
```

---

## Tech Stack Summary

### Frontend
- **Next.js 15**: App Router, Server Components, API Routes
- **React**: Hooks (useState, useEffect, useRef)
- **Convex React**: useQuery, useMutation for real-time data
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives (Toast, Progress)

### Backend
- **Convex**: Real-time database with TypeScript
- **Clerk**: Authentication and user management
- **Anthropic Claude**: AI-powered chat and question generation

### Development Patterns
- TypeScript for type safety
- Row-level security for data protection
- Real-time optimistic updates for responsiveness
- Modular component architecture
- Server-side authentication checks
- Client-side validation with server-side enforcement

---

## Future Considerations

### Potential Improvements
1. **Debouncing**: Add debouncing to auto-save for performance
2. **Offline Support**: Queue mutations when offline
3. **Undo/Redo**: Track question answer history
4. **Rich Text**: Support markdown in answers
5. **File Uploads**: Allow users to attach documents
6. **Collaboration**: Multi-user editing of PRDs
7. **Templates**: Pre-defined question sets for common product types
8. **AI Suggestions**: Autocomplete answers based on product context

### Known Limitations
1. No debouncing on auto-save (could cause excessive database writes)
2. No offline support
3. No validation for answer quality (only completeness)
4. Select-type questions not fully implemented
5. No way to regenerate questions if user is unsatisfied
6. Product context extraction from discovery not yet implemented
7. No way to mark questions as not applicable

---

## Testing Session - November 10, 2025

**Testing Method:** Playwright MCP browser automation

### Errors Found and Fixed

#### 1. Missing @clerk/themes Package ✅ FIXED
**Error:**
```
Module not found: Can't resolve '@clerk/themes'
```

**Location:** `app/layout.tsx:6`

**Fix:** Installed missing package:
```bash
npm install @clerk/themes
```

**Status:** ✅ Resolved

#### 2. Missing Convex Environment Variable ⚠️ REQUIRES SETUP
**Error:**
```
Error: No address provided to ConvexReactClient.
If trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/
If running locally, make sure to run `convex dev` and ensure the .env.local file is populated.
```

**Location:** `components/ConvexClientProvider.tsx:7`

**Root Cause:**
- No `.env.local` file exists
- Missing `NEXT_PUBLIC_CONVEX_URL` environment variable

**Required Setup:**
1. Run `npx convex dev` to initialize Convex and generate the deployment URL
2. Create `.env.local` file with:
   ```
   NEXT_PUBLIC_CONVEX_URL=<convex-deployment-url>
   ```
3. Optionally configure Clerk JWT issuer domain:
   ```
   CLERK_JWT_ISSUER_DOMAIN=<your-clerk-domain>
   ```

**Status:** ⚠️ Requires user authentication/setup

**Note:** Clerk is currently running in "keyless mode" which allows development but requires proper keys for production. A claim URL was provided in the console for setting up Clerk keys.

### Summary

**Fixed:** 1 error (missing dependency)
**Requires Setup:** 1 critical error (Convex configuration)
**Warnings:** 1 (Clerk keyless mode - non-blocking for development)

The application cannot load until Convex is properly configured with environment variables. Once the user runs `npx convex dev` and populates `.env.local`, the application should be functional.

---

*Last Updated: November 10, 2025*
