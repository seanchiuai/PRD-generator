# PRD Generator - Complete User Workflow Guide

**Last Updated:** November 12, 2025

## Table of Contents

1. [Overview](#overview)
2. [Complete User Journey](#complete-user-journey)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [UI Components Reference](#ui-components-reference)
5. [Navigation Flow Diagram](#navigation-flow-diagram)

---

## Overview

The PRD Generator is an AI-powered application that helps users create comprehensive Product Requirements Documents through a conversational and guided process. The application consists of **8 main stages** that take users from initial product idea to a fully-formatted, exportable PRD.

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React, Tailwind CSS, shadcn/ui
- **Backend**: Convex (real-time database)
- **Authentication**: Clerk
- **AI Services**:
  - Claude Sonnet 4.5 (conversation, question generation, PRD generation, validation)
  - Perplexity API (tech stack research)

---

## Complete User Journey

```
Sign In/Sign Up
      ↓
Dashboard (Landing Page)
      ↓
[START NEW PRD]
      ↓
1. Discovery Chat (Conversational)
      ↓
2. Clarifying Questions (Structured Form)
      ↓
3. Tech Stack Research (AI-Powered)
      ↓
4. Tech Stack Selection (Interactive Cards)
      ↓
5. PRD Generation (AI Synthesis)
      ↓
6. PRD View & Export (JSON/PDF)
      ↓
Back to Dashboard
```

**Estimated Time to Complete:** 15-30 minutes for a comprehensive PRD

---

## Step-by-Step Workflow

### Step 0: Authentication & Landing Page

#### Route: `/` (Home Page)

**Purpose:** Entry point for the application, handles authentication.

**UI Elements:**
- **Unauthenticated State:**
  - Application title: "Welcome to PRD Generator"
  - Subtitle: "Sign in to create professional Product Requirements Documents"
  - Two buttons:
    - "Sign in" (primary, filled)
    - "Create account" (secondary, outlined)
  - Uses Clerk modals for authentication flow

- **Authenticated State:**
  - Automatic redirect message: "PRD Generator - Redirecting to dashboard..."
  - Immediately redirects to `/dashboard`

**User Actions:**
- Click "Sign in" → Opens Clerk sign-in modal
- Click "Create account" → Opens Clerk sign-up modal
- After authentication → Auto-redirect to dashboard

**Code Location:** `app/page.tsx`

---

### Step 1: Dashboard (Main Landing Page)

#### Route: `/dashboard`

**Purpose:** Central hub for viewing, managing, and creating PRDs.

**UI Layout:**

**Header Section:**
- Title: "My PRDs"
- Stats display: "X total • Y completed"
- "New PRD" button (primary, with Plus icon)

**Search & Sort Controls** (only shown if PRDs exist):
- Search bar with magnifying glass icon
  - Placeholder: "Search PRDs by name..."
  - Real-time filtering as user types
- Sort dropdown with 4 options:
  - Newest First (default)
  - Oldest First
  - Name (A-Z)
  - Name (Z-A)

**PRD Grid:**
- Responsive layout:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- Each PRD card displays:
  - Product name (heading)
  - Creation date (formatted)
  - Status badge (Completed/Generating/Failed)
  - Description snippet (2 lines max, clipped)
  - Tech stack badges (first 3 technologies)
  - Three-dot menu with actions:
    - View PRD
    - Export (navigates to PRD view page)
    - Delete (with confirmation dialog)

**Empty State** (when no PRDs exist):
- File icon in muted circle
- Message: "No PRDs yet"
- Subtitle: "Create your first Product Requirements Document"
- "Create Your First PRD" button

**User Actions:**
1. Click "New PRD" → Navigate to `/chat/new` (creates conversation)
2. Type in search → Filter PRDs by product name
3. Change sort order → Reorder PRDs client-side
4. Click PRD card → Navigate to `/prd/[prdId]` (view page)
5. Click "Export" → Navigate to `/prd/[prdId]` (view page)
6. Click "Delete" → Show confirmation dialog → Delete PRD

**Data Source:**
- `api.prds.list` query (with search parameter)
- `api.prds.getStats` query (for stats display)

**Code Location:** `app/dashboard/page.tsx`

---

### Step 2: New Conversation Creation

#### Route: `/chat/new`

**Purpose:** Intermediary step that creates a new conversation and redirects.

**UI Elements:**
- Centered loading message: "Creating new conversation..."

**Backend Actions:**
1. Calls `api.conversations.create` mutation
2. Creates new conversation record with:
   - Empty messages array
   - Stage: "discovery"
   - userId from authenticated user
   - Timestamp
3. Returns conversation ID
4. Redirects to `/chat/[conversationId]`

**User Experience:**
- User sees this page briefly (< 1 second)
- Automatic redirect to discovery chat

**Code Location:** `app/chat/new/page.tsx`

---

### Step 3: Discovery Chat (Phase 1)

#### Route: `/chat/[conversationId]`

**Purpose:** Conversational interface where users describe their product idea. AI asks clarifying questions naturally.

**UI Layout:**

**Header (Fixed Top):**
- Title: "Product Discovery"
- Subtitle: "Tell me about your product idea"

**Chat Container (Scrollable Middle):**
- Message bubbles alternating:
  - **User messages:** Right-aligned, blue background
  - **Assistant messages:** Left-aligned, gray background
- Each message shows timestamp
- Auto-scrolls to bottom on new messages
- Typing indicator (three animated dots) when AI is responding

**Input Area (Fixed Bottom):**
- Textarea input with:
  - Placeholder: "Describe your product idea..."
  - Auto-resize as user types
  - Keyboard shortcuts:
    - Enter: Send message
    - Shift+Enter: New line
- Send button (paper plane icon)
- "Skip to Questions" button (appears after sufficient context):
  - Only shown when: ≥3 messages AND ≥100 characters from user
  - Right-aligned, outlined style
  - Shows "Skipping..." with spinner when loading

**Conversation Flow:**
1. Page loads with empty chat
2. User types and sends first message about their product
3. AI responds with follow-up questions about:
   - Target audience
   - Core features
   - Problem being solved
   - Business goals
4. Conversation continues naturally (typically 3-6 exchanges)
5. Once sufficient context exists, "Skip to Questions" button appears

**User Actions:**
1. Type product description → Click send (or press Enter)
2. Wait for AI response (1-3 seconds)
3. Continue conversation or click "Skip to Questions"
4. Click "Skip to Questions" → Updates stage to "clarifying" → Navigate to questions page

**AI Behavior:**
- Model: Claude Sonnet 4.5
- Max tokens: 1024 (keeps responses concise)
- System prompt: Be conversational, encouraging, gather basic info
- Responses: 2-3 sentences, ask clarifying questions

**Data Flow:**
1. User message → Saved to Convex immediately
2. API call to `/api/conversation/message`
3. Claude generates response
4. Assistant message → Saved to Convex
5. Real-time UI update via Convex subscription

**Skip Validation:**
- Minimum 3 messages in conversation
- Minimum 100 total characters from user
- If insufficient, shows error toast

**Code Location:** `app/chat/[conversationId]/page.tsx`

---

### Step 4: Clarifying Questions (Phase 2)

#### Route: `/chat/[conversationId]/questions`

**Purpose:** Structured form with AI-generated, product-specific questions to gather detailed requirements.

**UI Layout:**

**Header Section:**
- Title: "Clarifying Questions"
- Description: "Help us understand your product better by answering these questions. Your answers will help us recommend the best tech stack for your needs."

**Progress Indicator:**
- Shows: "X of Y required questions answered"
- Progress bar with percentage (0-100%)
- Color-coded:
  - Red (< 50%): Destructive/danger state
  - Yellow (50-69%): Warning state
  - Green (≥70%): Success state

**Questions Grid** (Grouped by Category):
Questions are organized into 6 categories:
1. **Core Features** (3-4 questions)
2. **User Types & Personas** (2-3 questions)
3. **Data Requirements** (2-3 questions)
4. **Scalability & Performance** (2 questions)
5. **Integrations & Third-party Services** (2 questions)
6. **Technical Constraints** (1-2 questions)

Each category section shows:
- Category heading (bold, larger font)
- List of question cards

**Question Card UI:**
- Question text with asterisk (*) if required
- Input field:
  - Text input (for short answers)
  - Textarea (for detailed answers - most common)
  - Select dropdown (for predefined options - rare)
- Placeholder text with example answer
- Auto-saves on every change

**Sticky Footer:**
- "Back" button (left, outlined)
- "Continue to Research" button (right, primary)
  - Disabled if < 70% completion
  - Shows "Saving..." when updating stage

**Generation Flow:**
1. **On First Visit:**
   - Shows loading spinner: "Generating tailored questions for your product..."
   - Calls `/api/questions/generate` with product context from discovery
   - Claude generates 12-15 product-specific questions
   - Questions saved to Convex
   - UI renders questions

2. **On Return Visit:**
   - Loads questions from Convex database
   - Pre-fills any previously answered questions
   - Shows current completion percentage

**User Actions:**
1. Read questions in each category
2. Type answers in text fields (auto-saves immediately)
3. Monitor progress indicator
4. Once ≥70% complete, click "Continue to Research"
5. If < 70%, click shows error toast: "Please answer at least 70% of required questions"

**AI Question Generation:**
- Model: Claude Sonnet 4.5
- Max tokens: 4096
- Input: Product context from discovery conversation
- Output: JSON array of question objects
- Questions are product-specific, not generic templates

**Answer Validation:**
- Required questions must have non-empty answers
- Completion calculated as: (answered required / total required) × 100
- 70% threshold enforced before proceeding

**Code Location:** `app/chat/[conversationId]/questions/page.tsx`

---

### Step 5: Tech Stack Research (Phase 3)

#### Route: `/chat/[conversationId]/research`

**Purpose:** AI-powered research phase that analyzes user requirements and recommends optimal technologies across 5 categories.

**UI Layout:**

**Header Section:**
- Title: "Tech Stack Research"
- Subtitle: "AI-powered recommendations based on your product requirements"

**Research Progress** (shown during research):
- 5 category cards in vertical list:
  1. Frontend Framework
  2. Backend Framework
  3. Database
  4. Authentication
  5. Hosting Platform
- Each card shows:
  - Category name
  - Status icon:
    - Empty circle (pending)
    - Spinning loader (in progress)
    - Green checkmark (completed)
  - Status text (Pending/Researching/Complete)

**Loading Skeleton** (shown during research):
- Animated placeholder cards
- Pulse animation effect
- Gives user sense of progress

**Research Results** (shown after completion):
For each category, displays:
- Category heading (e.g., "Frontend Framework")
- Expandable accordion for each recommended technology (typically 3-5 options):

  **Accordion Header (Always Visible):**
  - Technology name (e.g., "React", "Next.js", "Vue.js")
  - Expand/collapse chevron icon

  **Accordion Content (Expandable):**
  - **Description:** What the technology is and its primary use case
  - **Pros:** Bulleted list of advantages (typically 3-5 points)
  - **Cons:** Bulleted list of disadvantages (typically 2-4 points)
  - **Best For:** Ideal use cases for this technology

**Navigation Footer:**
- "Back to Questions" button (left, outlined)
- "Continue to Selection" button (right, primary)
  - Disabled during research or if no results

**Research Flow:**

1. **Auto-start on Page Load:**
   - If no research results exist, automatically begins research
   - If results exist (return visit), displays them immediately

2. **Research Execution:**
   - Parallel API calls to Perplexity for all 5 categories
   - Each query includes full product context:
     - Product name and description
     - Target audience
     - Core features
     - Question answers
   - Takes 5-15 seconds total
   - Uses Promise.allSettled for fault tolerance

3. **Result Processing:**
   - Parses AI responses (handles JSON, markdown, or plain text)
   - Structures into consistent format
   - Saves to Convex database
   - Displays in UI

**User Actions:**
1. Wait for research to complete (5-15 seconds)
2. Review recommendations for each category
3. Expand/collapse accordions to read details
4. Click "Continue to Selection" when ready

**AI Research:**
- Model: Perplexity API (via OpenAI SDK)
- 5 parallel queries
- Each query: ~2500 tokens
- Total consumption: ~12,500 tokens
- Results cached in database (never regenerated)

**Data Schema:**
```typescript
researchResults: {
  frontend: Array<TechOption>,
  backend: Array<TechOption>,
  database: Array<TechOption>,
  authentication: Array<TechOption>,
  hosting: Array<TechOption>
}

TechOption: {
  name: string,
  description: string,
  pros: string[],
  cons: string[],
  bestFor: string
}
```

**Code Location:** `app/chat/[conversationId]/research/page.tsx`

---

### Step 6: Tech Stack Selection (Phase 4)

#### Route: `/chat/[conversationId]/select`

**Purpose:** Interactive selection interface where users choose their preferred technologies. AI validates compatibility in real-time.

**UI Layout:**

**Header Section:**
- Title: "Select Your Tech Stack"
- Subtitle: "Choose one technology from each category based on your requirements"

**Progress Indicator:**
- Shows: "X of 5 categories selected"
- Visual progress bar
- Updates as user makes selections

**Validation Warnings** (appears when warnings exist):
- Alert boxes at top of page
- Two types:
  - **Errors (Red):** Blocking issues, must be resolved
    - Example: "React Native and Next.js are incompatible"
  - **Warnings (Yellow):** Non-blocking suggestions
    - Example: "Django + Node.js is unusual, consider Django + PostgreSQL"
- Each warning shows:
  - Icon (alert triangle or error circle)
  - Message
  - Affected technologies
  - Suggestion (optional)

**Category Sections** (5 sections):
Each section displays:
- Category name (e.g., "Frontend Framework")
- Horizontal grid of technology cards (2-3 per row, responsive)

**Technology Card UI:**
- Technology name (heading)
- "Select" button or "Selected" badge
- Expandable accordion for details:
  - **Description:** Brief overview
  - **Pros:** Collapsible list with green checkmarks
  - **Cons:** Collapsible list with red x-marks
  - **Best For:** Use case description

**Card States:**
- **Unselected:** Gray border, "Select" button
- **Selected:** Blue border, blue background, "Selected" badge
- **Hover:** Shadow effect, cursor pointer

**Sticky Navigation Footer:**
- "Back to Research" button (left, outlined)
- "Generate PRD" button (right, primary)
  - Disabled if:
    - < 5 selections (not all categories)
    - Validation in progress
    - Blocking errors exist
  - Shows "Validating..." during validation

**Selection Flow:**

1. **Initial State:**
   - All cards unselected
   - No warnings
   - Generate button disabled

2. **Selection Process:**
   - User clicks "Select" on a technology card
   - Card immediately shows "Selected" state (optimistic UI)
   - Selection saved to Convex
   - After 2+ selections, triggers validation

3. **Real-Time Validation:**
   - Calls `/api/validate/tech-stack` with current selections
   - Claude AI analyzes compatibility
   - Returns warnings and errors
   - UI updates with warning boxes
   - Takes 2-3 seconds

4. **Validation Response:**
   - **No Issues:** Continue button enabled
   - **Warnings Only:** Continue button enabled, yellow alerts shown
   - **Errors:** Continue button disabled, red alerts shown, user must change selection

**User Actions:**
1. Click "Select" on preferred technology in each category
2. Review validation warnings that appear
3. If errors exist, change selections to resolve
4. Once all 5 categories selected and no errors, click "Generate PRD"

**AI Validation:**
- Model: Claude Sonnet 4.5
- Max tokens: 1024
- Input: Current tech stack selections
- Output: Array of warnings with severity levels
- Checks for:
  - Incompatible technology pairs
  - Suboptimal combinations
  - Missing integrations
  - Framework conflicts

**Data Schema:**
```typescript
selectedTechStack: {
  frontend: TechSelection,
  backend: TechSelection,
  database: TechSelection,
  authentication: TechSelection,
  hosting: TechSelection
}

TechSelection: {
  name: string,
  reasoning: string,
  selectedFrom: string[]
}

validationWarnings: {
  errors: Array<Warning>,
  warnings: Array<Warning>
}

Warning: {
  level: "warning" | "error",
  message: string,
  affectedTechnologies: string[],
  suggestion?: string
}
```

**Code Location:** `app/chat/[conversationId]/select/page.tsx`

---

### Step 7: PRD Generation (Phase 5)

#### Route: `/chat/[conversationId]/generate`

**Purpose:** Final synthesis stage where AI generates a comprehensive PRD from all collected data.

**UI Layout:**

**Header Section:**
- Title: "Product Requirements Document"
- Subtitle (dynamic):
  - During generation: "Generating your comprehensive PRD..."
  - After completion: "Your PRD is ready!"
- Export button (top right, only after completion):
  - Icon: Download
  - Text: "Export PRD"
  - Navigates to `/prd/[prdId]`

**Generation Progress** (shown during generation):
5-step progress indicator:
1. ✓ Analyzing conversation data (completed)
2. ⟳ Extracting product requirements (in progress)
3. ○ Structuring features and architecture (pending)
4. ○ Generating timeline and risks (pending)
5. ○ Finalizing PRD (pending)

**Step States:**
- **Pending:** Empty circle, gray text
- **In Progress:** Spinning loader, blue text
- **Completed:** Green checkmark, green text

**Estimated Time Display:**
- "This usually takes 20-30 seconds"
- Updates as steps complete

**PRD Display** (shown after generation):
Tabbed interface with 5 tabs:

**Tab 1: Overview**
Displays:
- Product name (large heading)
- Tagline (italic subtitle)
- Full description (2-3 paragraphs)
- Target audience (with icon)
- Problem statement card:
  - Problem description
  - How product solves it
- Vision statement
- Objectives (bulleted list)
- Success metrics (bulleted list)

**Tab 2: Tech Stack**
Displays all 5 selected technologies:
- Category name (e.g., "Frontend Framework")
- Technology name (heading)
- Purpose/reasoning
- Pros (green checkmarks, bulleted)
- Cons (red x-marks, bulleted)
- Alternatives considered (bulleted)

**Tab 3: Features**
Two sections:
1. **MVP Features** (Must-Have):
   - Feature name
   - User story ("As a [user], I want [goal] so that [benefit]")
   - Acceptance criteria (bulleted checklist)
   - Priority badge (High/Medium/Low)

2. **Nice-to-Have Features**:
   - Same structure as MVP
   - Clearly separated section

**Tab 4: Architecture**
Four sections:
1. **User Personas:**
   - Persona name
   - Demographics
   - Goals
   - Pain points
   - Tech savviness

2. **System Architecture:**
   - High-level system design description
   - Component breakdown
   - Data flow description

3. **Data Models:**
   - Entity name
   - Fields with types
   - Relationships

4. **API Endpoints:**
   - Method + Path (e.g., "POST /api/users")
   - Description
   - Request/response format

**Tab 5: Timeline**
Three sections:
1. **Development Phases:**
   - Phase name (e.g., "Phase 1: Foundation")
   - Deliverables (bulleted)
   - Estimated duration

2. **UI/UX Considerations:**
   - Design principles
   - Key user flows
   - Accessibility requirements

3. **Risks & Mitigation:**
   - Risk category badge (Technical/Business/User)
   - Risk description
   - Impact level
   - Mitigation strategy

**Navigation Footer:**
- "Back to Selection" button (left, outlined)
- "View All PRDs" button (right, primary, only after completion)

**Generation Flow:**

1. **Auto-start on Page Load:**
   - If PRD already exists, displays it immediately
   - If no PRD, automatically starts generation

2. **Data Aggregation:**
   - Discovery conversation messages
   - Clarifying question answers
   - Selected tech stack with reasoning
   - All compiled into comprehensive context

3. **AI Generation:**
   - Step 1: Analyzing (1 second delay)
   - Step 2: Extraction begins (API call starts)
   - Claude processes all data
   - Step 3: Structuring (1.5 second delay)
   - Step 4: Timeline generation (API responds)
   - Step 5: Finalizing (save to Convex)
   - Total time: 20-30 seconds

4. **Save & Display:**
   - PRD data saved to Convex `prds` table
   - Conversation stage updated to "completed"
   - PRD record linked to conversation
   - Tabbed interface displays result

**User Actions:**
1. Wait for generation (20-30 seconds, watch progress)
2. Once complete, explore tabs to review PRD
3. Click "Export PRD" to go to export page
4. Click "View All PRDs" to return to dashboard

**AI Generation:**
- Model: Claude Sonnet 4.5
- Max tokens: 8192 (large, comprehensive PRD)
- Input: All conversation data (5,000-10,000 tokens)
- Output: Structured JSON with 8 major sections
- Prompt: Highly detailed with exact schema requirements

**PRD Structure (Generated):**
```typescript
{
  projectOverview: {
    productName: string,
    tagline: string,
    description: string,
    targetAudience: string,
    problemStatement: string
  },
  purposeAndGoals: {
    vision: string,
    objectives: string[],
    successMetrics: string[]
  },
  techStack: {
    frontend: TechDetail,
    backend: TechDetail,
    database: TechDetail,
    authentication: TechDetail,
    hosting: TechDetail
  },
  features: {
    mvpFeatures: Feature[],
    niceToHaveFeatures: Feature[]
  },
  userPersonas: Persona[],
  technicalArchitecture: {
    systemDesign: string,
    dataModels: DataModel[],
    apiEndpoints: API[]
  },
  uiUxConsiderations: {
    designPrinciples: string[],
    keyUserFlows: string[],
    accessibility: string[]
  },
  timeline: {
    phases: Phase[]
  },
  risks: Risk[]
}
```

**Code Location:** `app/chat/[conversationId]/generate/page.tsx`

---

### Step 8: PRD View & Export (Phase 6)

#### Route: `/prd/[prdId]`

**Purpose:** Dedicated page for viewing a completed PRD and exporting it in multiple formats.

**UI Layout:**

**Header Section:**
- Product name (large heading)
- Metadata line:
  - Creation date and time
  - Version number (e.g., "Version 1")
- Export dropdown (top right):
  - Button: "Export" with download icon
  - Dropdown menu:
    - "Export as JSON" (with FileJson icon)
    - "Export as PDF" (with FileText icon)
  - Shows loading state: "Exporting JSON..." or "Exporting PDF..."

**PRD Display:**
- Same tabbed interface as generation page
- All 5 tabs: Overview, Tech Stack, Features, Architecture, Timeline
- Read-only view (no editing)
- Full PRD content rendered beautifully

**Navigation Footer:**
- "Back to Dashboard" button (left, outlined)

**Export Functionality:**

**JSON Export:**
1. User clicks "Export as JSON"
2. Button shows loading state: "Exporting JSON..."
3. PRD data stringified with formatting (2-space indent)
4. File generated: `[product-name]-prd.json`
5. Filename sanitized (lowercase, special chars → hyphens)
6. Browser downloads file immediately
7. Success toast: "Exported Successfully - PRD downloaded as JSON file"

**PDF Export:**
1. User clicks "Export as PDF"
2. Button shows loading state: "Exporting PDF..."
3. React-PDF generates 5-page document:

   **Page 1: Overview & Goals**
   - Header: Product name + "Product Requirements Document"
   - Project Overview section
   - Purpose & Goals section
   - Footer: Product name + page number

   **Page 2: Technology Stack**
   - Header: "Technology Stack"
   - All 5 technologies with pros/cons
   - Color-coded: Green pros, red cons
   - Footer: Product name + page number

   **Page 3: MVP Features**
   - Header: "MVP Features"
   - Each feature with:
     - User story
     - Acceptance criteria (checkboxes)
     - Priority badge
   - Footer: Product name + page number

   **Page 4: Technical Architecture**
   - Header: "Technical Architecture"
   - System design
   - Data models (table format)
   - API endpoints (method + path)
   - Footer: Product name + page number

   **Page 5: Timeline & Risks**
   - Header: "Development Timeline & Risks"
   - Phases with deliverables
   - Estimated duration
   - Risks with mitigation
   - Footer: Product name + page number

4. PDF styling:
   - Font: Helvetica family
   - Page margins: 40px
   - Body text: 11pt, line height 1.5
   - Headings: 16pt
   - Subheadings: 13pt
   - Professional, print-ready layout

5. File generated: `[product-name]-prd.pdf`
6. Takes 2-5 seconds to generate
7. Browser downloads file
8. Success toast: "Exported Successfully - PRD downloaded as PDF file"

**User Actions:**
1. Review complete PRD across all tabs
2. Click "Export" dropdown
3. Choose format (JSON or PDF)
4. Wait for generation (instant for JSON, 2-5s for PDF)
5. File downloads automatically
6. Click "Back to Dashboard" to return

**Error Handling:**
- If PRD not found: Shows "PRD Not Found" message
- If unauthorized: Shows "No permission" message
- Both redirect to dashboard with button
- Export errors show toast: "Export Failed - Could not export [format] file"

**Export Utilities:**
```typescript
exportJSON(data, filename): void
  - Converts data to formatted JSON string
  - Creates Blob with application/json type
  - Triggers download via temporary link

exportPDF(document, filename): Promise<void>
  - Renders React-PDF document
  - Generates PDF blob
  - Triggers download via temporary link

sanitizeFilename(name): string
  - Converts to lowercase
  - Replaces special chars with hyphens
  - Removes leading/trailing hyphens
```

**Dependencies:**
- `@react-pdf/renderer` for PDF generation
- `@radix-ui/react-dropdown-menu` for export menu

**Code Location:** `app/prd/[prdId]/page.tsx`

---

## UI Components Reference

### Reusable Components Used Throughout

#### Chat Components (`/components/chat/`)

**ChatContainer.tsx:**
- Scrollable message list
- Auto-scrolls to bottom
- Displays user and assistant messages
- Shows typing indicator

**ChatMessage.tsx:**
- Individual message bubble
- Different styles for user vs assistant
- Timestamp display
- Word wrap for long messages

**ChatInput.tsx:**
- Auto-resizing textarea
- Send button with icon
- Keyboard shortcuts (Enter/Shift+Enter)
- Disabled state during API calls

**TypingIndicator.tsx:**
- Three animated dots
- Pulsing animation
- Shows while waiting for AI

#### Question Components (`/components/questions/`)

**QuestionCategory.tsx:**
- Groups questions by category
- Category heading
- Maps through questions

**QuestionCard.tsx:**
- Individual question display
- Required indicator (*)
- Input field (text/textarea/select)
- Placeholder text
- Handles answer changes

**ProgressIndicator.tsx:**
- "X of Y answered" text
- Progress bar (0-100%)
- Color-coded by completion

#### Research Components (`/components/research/`)

**ResearchProgress.tsx:**
- 5-step vertical progress list
- Status icons per category
- Pending/In Progress/Complete states

**ResearchResults.tsx:**
- Accordion for tech options
- Expandable details
- Pros/cons lists
- Best for section

**LoadingSkeleton.tsx:**
- Animated placeholder cards
- Pulse effect
- Shown during research

#### Selection Components (`/components/selection/`)

**CategorySection.tsx:**
- Category heading
- Grid of technology cards
- Passes selections to parent

**TechStackCard.tsx:**
- Technology name
- Select/Selected button
- Accordion for details
- Pros/cons with icons
- Interactive hover state

**ValidationWarnings.tsx:**
- Alert boxes for warnings/errors
- Color-coded (red/yellow)
- Affected technologies list
- Suggestions displayed

**SelectionProgress.tsx:**
- "X of 5 selected" indicator
- Progress bar
- Visual feedback

#### PRD Components (`/components/prd/`)

**GenerationProgress.tsx:**
- 5-step generation progress
- Step names and status icons
- Estimated time display
- Animated transitions

**PRDDisplay.tsx:**
- Tabbed interface (5 tabs)
- Overview tab with cards
- Tech Stack with details
- Features with user stories
- Architecture with models
- Timeline with risks

#### Export Components (`/components/export/`)

**ExportButtons.tsx:**
- Dropdown menu button
- JSON and PDF options
- Loading states
- Icons for each format

**PRDDocument.tsx:**
- React-PDF template
- 5-page layout
- Professional styling
- Headers and footers

#### Dashboard Components (`/components/dashboard/`)

**PRDCard.tsx:**
- Product name heading
- Creation date
- Status badge
- Description preview
- Tech stack badges
- Actions dropdown menu

**SearchBar.tsx:**
- Search icon
- Input field
- Placeholder text
- Controlled component

**SortControls.tsx:**
- Dropdown select
- 4 sort options
- Arrow indicator
- onChange handler

**EmptyState.tsx:**
- File icon
- Encouraging message
- "Create First PRD" button
- Centered layout

---

## Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION                          │
│                       / (Home)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Unauthenticated: Sign In / Sign Up                  │  │
│  │  Authenticated: Auto-redirect                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     MAIN DASHBOARD                          │
│                    /dashboard                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • View all PRDs                                     │  │
│  │  • Search and sort                                   │  │
│  │  • Create new PRD                                    │  │
│  │  • Delete existing PRDs                              │  │
│  │  • Navigate to PRD view                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [New PRD Button]
┌─────────────────────────────────────────────────────────────┐
│              CREATE CONVERSATION (Intermediary)             │
│                      /chat/new                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auto-creates conversation → Redirects                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: DISCOVERY CHAT                        │
│             /chat/[conversationId]                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Chat interface                                    │  │
│  │  • AI asks clarifying questions                      │  │
│  │  • User describes product                            │  │
│  │  • Skip button appears (after ≥3 messages)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Skip or Natural Flow]
┌─────────────────────────────────────────────────────────────┐
│          PHASE 2: CLARIFYING QUESTIONS                      │
│          /chat/[conversationId]/questions                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • AI generates 12-15 product-specific questions     │  │
│  │  • Grouped in 6 categories                           │  │
│  │  • User answers (auto-saves)                         │  │
│  │  • Progress indicator                                │  │
│  │  • Must reach 70% to continue                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Continue to Research]
┌─────────────────────────────────────────────────────────────┐
│          PHASE 3: TECH STACK RESEARCH                       │
│          /chat/[conversationId]/research                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • AI researches 5 categories (parallel)            │  │
│  │  • Frontend, Backend, Database, Auth, Hosting       │  │
│  │  • 3-5 options per category                         │  │
│  │  • Pros/cons for each                               │  │
│  │  • Takes 5-15 seconds                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Continue to Selection]
┌─────────────────────────────────────────────────────────────┐
│          PHASE 4: TECH STACK SELECTION                      │
│           /chat/[conversationId]/select                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Interactive technology cards                      │  │
│  │  • Select 1 per category (5 total)                  │  │
│  │  • Real-time AI validation                          │  │
│  │  • Warning/error display                            │  │
│  │  • Must resolve errors to continue                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Generate PRD]
┌─────────────────────────────────────────────────────────────┐
│             PHASE 5: PRD GENERATION                         │
│          /chat/[conversationId]/generate                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • 5-step generation process                        │  │
│  │  • AI synthesizes all data                          │  │
│  │  • Takes 20-30 seconds                              │  │
│  │  • Saves to database                                │  │
│  │  • Displays complete PRD                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Export PRD or View All]
┌─────────────────────────────────────────────────────────────┐
│           PHASE 6: PRD VIEW & EXPORT                        │
│                  /prd/[prdId]                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Full PRD display (tabbed)                        │  │
│  │  • Export to JSON (instant)                         │  │
│  │  • Export to PDF (2-5 seconds)                      │  │
│  │  • Back to dashboard                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ [Back to Dashboard]
                      (Returns to top)
```

### Alternative Flows

**From Dashboard:**
- Click existing PRD card → Jump directly to `/prd/[prdId]`
- Click "Export" in dropdown → Jump directly to `/prd/[prdId]`
- Click "Delete" → Show confirmation → Remove PRD

**Navigation Between Phases:**
- Each phase has "Back" button to previous step
- Can revisit previous phases anytime
- Data persists across page reloads
- Real-time sync via Convex

**Skip Functionality:**
- Discovery Chat: Can skip to questions after sufficient context
- Cannot skip questions, research, or selection phases
- Each phase validates completion before proceeding

---

## Key Features Summary

### Real-Time Features
- **Auto-save:** Questions and selections save immediately
- **Live Updates:** Dashboard updates in real-time when PRDs change
- **Optimistic UI:** Selection cards update instantly, then sync

### AI-Powered Features
- **Conversational Discovery:** Claude understands context naturally
- **Custom Questions:** Each product gets unique, relevant questions
- **Tech Research:** Perplexity finds optimal technologies
- **Compatibility Validation:** Claude prevents incompatible tech stacks
- **PRD Synthesis:** Claude generates comprehensive, structured PRDs

### User Experience
- **Progress Indicators:** Always know where you are in the process
- **Loading States:** Animated loaders during AI processing
- **Error Handling:** Clear error messages with recovery suggestions
- **Toast Notifications:** Non-intrusive feedback for actions
- **Responsive Design:** Works on mobile, tablet, and desktop

### Security
- **Authentication Required:** All routes protected except home/sign-in
- **Row-Level Security:** Users only see their own data
- **Ownership Verification:** All mutations check user owns the resource
- **API Route Protection:** Server-side authentication on all endpoints

### Performance
- **Client-Side Sorting:** Dashboard sorts without server calls
- **Cached Research:** Research results never regenerated
- **Parallel Processing:** Research queries run simultaneously
- **Real-Time Subscriptions:** Efficient database updates via Convex

---

## Common User Journeys

### First-Time User
1. Sign up with email/OAuth
2. Redirected to empty dashboard
3. Clicks "Create Your First PRD"
4. Goes through all 6 phases (15-30 minutes)
5. Exports PRD as PDF
6. Returns to dashboard to see PRD listed

### Returning User with Existing PRDs
1. Sign in
2. Sees dashboard with PRD cards
3. Searches for specific product
4. Clicks to view PRD
5. Exports as JSON for integration
6. Returns to dashboard

### User Creating Multiple PRDs
1. Sign in to dashboard
2. Creates first PRD (complete workflow)
3. Returns to dashboard
4. Creates second PRD (different product)
5. Compares both on dashboard
6. Deletes older draft PRD

### User Interrupted Mid-Process
1. Starts new PRD, completes discovery and questions
2. Closes browser
3. Returns later, signs in
4. Sees incomplete conversation in progress
5. Can resume from research phase (data preserved)

---

## Technical Implementation Notes

### State Management
- **Local State:** React useState for UI state
- **Server State:** Convex useQuery/useMutation for data
- **Real-Time Sync:** Convex subscriptions auto-update UI

### Data Persistence
- All conversation data persisted to Convex
- No data loss between phases
- Can reload page at any stage
- Resume where you left off

### API Integration
- **Claude Sonnet 4.5:** Conversation, questions, PRD generation, validation
- **Perplexity:** Tech stack research
- All API keys server-side only
- Error handling and retry logic

### File Structure
```
/app
  /page.tsx                    # Home/Auth
  /dashboard/page.tsx          # Main landing
  /chat
    /new/page.tsx              # Create conversation
    /[conversationId]
      /page.tsx                # Discovery
      /questions/page.tsx      # Questions
      /research/page.tsx       # Research
      /select/page.tsx         # Selection
      /generate/page.tsx       # Generation
  /prd/[prdId]/page.tsx        # View & Export

/components
  /chat                        # Chat UI
  /questions                   # Question UI
  /research                    # Research UI
  /selection                   # Selection UI
  /prd                         # PRD display
  /export                      # Export functionality
  /dashboard                   # Dashboard UI
  /ui                          # shadcn/ui components

/convex
  /schema.ts                   # Database schema
  /conversations.ts            # Conversation functions
  /prds.ts                     # PRD functions
  /users.ts                    # User functions

/lib
  /export-utils.ts             # JSON/PDF export logic
```

---

## Environment Variables Required

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=<convex-deployment-url>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
CLERK_SECRET_KEY=<clerk-secret-key>
CLERK_JWT_ISSUER_DOMAIN=<clerk-domain>

# AI APIs
ANTHROPIC_API_KEY=<claude-api-key>
PERPLEXITY_API_KEY=<perplexity-api-key>
```

---

## Troubleshooting Common Issues

### "Need more context" when trying to skip
- Write more detailed messages in discovery chat
- Provide at least 3 exchanges with AI
- Ensure total message length > 100 characters

### "More answers needed" in questions phase
- Answer at least 70% of required questions (marked with *)
- Each answer must be non-empty
- Progress bar shows current completion

### Research stuck or failed
- Check PERPLEXITY_API_KEY is set
- Ensure internet connection active
- Refresh page to retry (results cached if partially complete)

### Validation errors blocking selection
- Red errors must be resolved
- Change incompatible technology selections
- Yellow warnings are informational, don't block progress

### Generation failed
- Check ANTHROPIC_API_KEY is set
- Ensure all previous steps completed
- Check browser console for error details
- Refresh page to retry (won't regenerate if successful)

### Export not working
- PDF generation requires modern browser
- Check popup blockers not blocking download
- Ensure sufficient browser storage
- Try exporting JSON first (faster, simpler)

---

## Future Enhancements Planned

1. **PRD Editing:** Edit sections after generation
2. **AI Refinement:** Ask AI to improve specific sections
3. **Version History:** Track changes over time
4. **Collaboration:** Share PRDs with team members
5. **Templates:** Pre-built PRD templates for common product types
6. **Markdown Export:** Additional export format
7. **Email Delivery:** Send PRD via email
8. **Cloud Storage:** Save to Google Drive/Dropbox
9. **Comments:** Add notes and comments to PRDs
10. **Analytics:** Track PRD views and usage

---

**End of User Workflow Guide**

For technical implementation details, see:
- `/docs/CHANGELOG.md` - Implementation log
- `/docs/prd-generation-implementation.md` - PRD generation details
- `/docs/authentication-security.md` - Security implementation
- `CLAUDE.md` - Project conventions and guidelines
