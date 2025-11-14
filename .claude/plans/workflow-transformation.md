# PRD Generator Workflow Transformation Plan

## Overview
Transform the PRD generator into a seamless workflow experience with progress tracking, skip functionality at every step, and automatic advancement to the final PRD generation.

## Current State
The application has a 6-phase flow:
1. Discovery chat (`/chat/[conversationId]`)
2. Clarifying questions (`/chat/[conversationId]/questions`)
3. Tech stack research (`/chat/[conversationId]/research`)
4. Tech stack selection (`/chat/[conversationId]/select`)
5. PRD generation (`/chat/[conversationId]/generate`)
6. PRD view (`/prd/[prdId]`)

## Target State
A guided workflow with:
- **Progress navigation bar** at the top of every step
- **Skip buttons** available after initial user engagement
- **Default selections** for skipped steps
- **Auto-advance** to PRD generation after final step
- **Seamless transitions** between phases

---

## Phase 1: Workflow UI Infrastructure

### 1.1 Progress Bar Component
**File:** `components/workflow/WorkflowProgress.tsx`

Create a persistent progress bar showing all workflow steps:
- Display 5 steps: Discovery → Questions → Tech Research → Tech Selection → Generate PRD
- Show current step highlighted
- Show completed steps with checkmarks
- Show upcoming steps greyed out
- Allow clicking completed steps to navigate back
- Mobile-responsive (stack/scroll on small screens)

**Design:**
```
[✓ Discovery] → [● Questions] → [ Research ] → [ Selection ] → [ Generate ]
```

### 1.2 Workflow Layout Wrapper
**File:** `components/workflow/WorkflowLayout.tsx`

Wrap all workflow pages with consistent layout:
- Progress bar at top
- Skip button in top-right (conditionally shown)
- Main content area
- Footer with navigation buttons (Back/Next)

### 1.3 Skip Button Component
**File:** `components/workflow/SkipButton.tsx`

Reusable skip button with:
- Icon + "Skip this step" text
- Loading state during skip processing
- Confirmation dialog for critical steps
- Analytics tracking

---

## Phase 2: Discovery Chat Skip Functionality

### 2.1 Skip Button Activation
**Modified:** `app/chat/[conversationId]/page.tsx`

Show skip button after user sends **first message** (not 3 messages as currently):
- Add skip button to ChatContainer header
- Show after first user message sent
- Disable during AI response generation

### 2.2 Context Extraction Logic
**New API:** `app/api/conversation/extract-context/route.ts`

When skip is clicked:
1. Fetch all chat messages from conversation
2. Use Claude to extract product context:
   - Product name/description
   - Target audience
   - Key features mentioned
   - Problem being solved
   - Any technical preferences
3. Store extracted context in conversation metadata
4. Navigate to questions page

**Prompt Template:**
```
Analyze this product discovery conversation and extract:
1. Product name (or generate one if unclear)
2. Brief description (1-2 sentences)
3. Target audience/users
4. Key features or capabilities mentioned
5. Problem this product solves
6. Any technical requirements or preferences

Conversation:
{messages}

Return structured JSON.
```

### 2.3 Convex Schema Update
**Modified:** `convex/schema.ts`

Add to conversations table:
```typescript
extractedContext: v.optional(v.object({
  productName: v.string(),
  description: v.string(),
  targetAudience: v.string(),
  keyFeatures: v.array(v.string()),
  problemStatement: v.string(),
  technicalPreferences: v.array(v.string()),
  extractedAt: v.number(),
}))
```

---

## Phase 3: Questions Skip with Defaults

### 3.1 Skip Button on Questions Page
**Modified:** `app/chat/[conversationId]/questions/page.tsx`

Add skip button that:
- Appears immediately when page loads
- Shows number of answered vs total questions
- Confirms user wants to use recommended answers

### 3.2 Default Answer Selection
**New:** `lib/questionDefaults.ts`

For each question type, define default selection logic:
- **Multiple choice:** Select first recommended option
- **Text input:** Use context from discovery or leave blank
- **Priority ranking:** Default moderate priority
- **Yes/No:** Default to most common safe choice

### 3.3 Auto-fill Mutation
**New Convex:** `convex/questions.ts` → `fillDefaults()`

When skip clicked:
1. Get current answers
2. For each unanswered question:
   - If has recommended option: select it
   - If multiple choice: select first option
   - If text: use extracted context or placeholder
3. Save all defaults
4. Mark questions as "auto-completed"
5. Navigate to research page

---

## Phase 4: Tech Stack Skip with Recommendations

### 4.1 Combined Research + Selection Skip
**Modified:** `app/chat/[conversationId]/research/page.tsx`

Add skip button that:
- Shows after 3 seconds if research hasn't started
- Allows skipping both research AND selection
- Uses intelligent defaults based on product type

### 4.2 Default Tech Stack Logic
**New:** `lib/techStackDefaults.ts`

Define default stacks for common product types:
```typescript
const DEFAULT_STACKS = {
  web_app: {
    frontend: "Next.js",
    backend: "Node.js with Express",
    database: "PostgreSQL",
    auth: "Clerk",
    hosting: "Vercel"
  },
  mobile_app: {
    frontend: "React Native",
    backend: "Firebase",
    database: "Firestore",
    auth: "Firebase Auth",
    hosting: "Expo"
  },
  // ... more templates
}
```

### 4.3 Smart Default Selection
**New API:** `app/api/tech-stack/suggest-defaults/route.ts`

Use Claude to suggest defaults based on:
- Extracted product context
- Product type/category
- Any technical preferences mentioned
- Industry best practices

### 4.4 Skip Research Flow
**Modified:** `app/chat/[conversationId]/research/page.tsx`

When skip clicked:
1. Generate default tech stack suggestions
2. Save as "research results" (mark as auto-generated)
3. Auto-select all defaults
4. Validate compatibility
5. Navigate directly to generate page (skip selection UI)

---

## Phase 5: Auto-Advance to PRD Generation

### 5.1 Remove Manual "Generate" Step
**Modified:** `app/chat/[conversationId]/select/page.tsx`

After tech stack selection (manual or skipped):
- Replace "Continue to Generate" button with auto-redirect
- Show 3-second countdown: "Generating your PRD..."
- Automatically navigate to `/chat/[conversationId]/generate`

### 5.2 Auto-Start Generation
**Modified:** `app/chat/[conversationId]/generate/page.tsx`

When page loads:
1. Check if PRD already exists
2. If not, automatically start generation (no button click needed)
3. Show progress: "Generating your PRD..."
4. Display 5-step progress as currently implemented
5. On completion, show PRD with "View Full PRD" button

### 5.3 Generation Status Component
**New:** `components/workflow/GenerationStatus.tsx`

Beautiful loading state:
- Animated progress indicator
- Current step description
- Estimated time remaining
- Background gradient animation
- "This usually takes 20-30 seconds" message

---

## Phase 6: Workflow State Management

### 6.1 Workflow Context Provider
**New:** `contexts/WorkflowContext.tsx`

Global state management for:
- Current step index
- Completed steps
- Skip flags for each step
- Navigation history
- Auto-advance settings

### 6.2 Navigation Guards
**New:** `lib/workflowGuards.ts`

Prevent skipping forward without completing/skipping previous steps:
- Check if previous step completed or skipped
- Redirect to correct step if accessed out of order
- Preserve user progress

### 6.3 Analytics Events
**New:** `lib/analytics/workflowEvents.ts`

Track workflow interactions:
- Step started/completed/skipped
- Time spent on each step
- Skip reasons (if we add feedback)
- Completion rate by step
- Drop-off points

---

## Phase 7: UI/UX Enhancements

### 7.1 Transition Animations
Use framer-motion for:
- Step transitions (slide in/out)
- Progress bar updates
- Skip button appearance
- Auto-advance countdown

### 7.2 Mobile Optimization
- Collapsible progress bar on mobile
- Touch-friendly skip buttons
- Swipe gestures between steps
- Responsive layouts for all workflow pages

### 7.3 Onboarding Tooltips
First-time user guidance:
- "You can skip any step" tooltip on first skip button
- Progress bar explanation
- Expected time for each step

---

## Implementation Order

### Sprint 1: Core Infrastructure (Agent: workflow-ui)
- [ ] Create WorkflowProgress component
- [ ] Create WorkflowLayout wrapper
- [ ] Create SkipButton component
- [ ] Update all workflow pages to use WorkflowLayout
- [ ] Add navigation between completed steps

### Sprint 2: Discovery Skip (Agent: discovery-skip)
- [ ] Add skip button to chat page (after first message)
- [ ] Create context extraction API endpoint
- [ ] Update Convex schema for extractedContext
- [ ] Implement context extraction with Claude
- [ ] Test skip flow from discovery to questions

### Sprint 3: Questions Skip (Agent: questions-skip)
- [ ] Add skip button to questions page
- [ ] Create questionDefaults utility
- [ ] Implement fillDefaults Convex mutation
- [ ] Auto-fill logic for each question type
- [ ] Mark auto-completed questions in UI

### Sprint 4: Tech Stack Skip (Agent: techstack-skip)
- [ ] Add skip button to research page
- [ ] Create techStackDefaults utility
- [ ] Create suggest-defaults API endpoint
- [ ] Implement smart default selection
- [ ] Skip both research and selection flow
- [ ] Validation of default stack

### Sprint 5: Auto-Advance (Agent: workflow-orchestration)
- [ ] Remove manual generate button from select page
- [ ] Add auto-redirect with countdown
- [ ] Auto-start generation on page load
- [ ] Create GenerationStatus component
- [ ] Smooth transitions between all steps

### Sprint 6: Polish & Testing
- [ ] Add WorkflowContext provider
- [ ] Implement navigation guards
- [ ] Add analytics tracking
- [ ] Transition animations
- [ ] Mobile responsiveness
- [ ] Onboarding tooltips
- [ ] End-to-end testing
- [ ] Performance optimization

---

## Success Metrics

- User can complete entire workflow in < 2 minutes with maximum skipping
- Each step clearly shows skip option after initial engagement
- Default selections are contextually relevant
- Auto-advance feels natural, not jarring
- Mobile experience is smooth
- No breaking changes to existing functionality

---

## Technical Considerations

### Backward Compatibility
- Existing PRDs should still work
- Users mid-workflow should not break
- Database migrations must be safe

### Performance
- Context extraction should be < 3 seconds
- Default generation should be < 2 seconds
- No blocking operations in UI thread

### Error Handling
- Graceful fallbacks if AI extraction fails
- Manual override for bad defaults
- Clear error messages
- Retry mechanisms for API calls

### Security
- Validate all skip operations server-side
- Ensure defaults don't bypass required validations
- Maintain data integrity

---

## Agent Assignments

| Agent | Responsibility | Files Modified/Created |
|-------|---------------|------------------------|
| workflow-ui | Progress bar, layout, skip buttons | `components/workflow/*`, all workflow pages |
| discovery-skip | Chat skip + context extraction | `app/chat/[conversationId]/page.tsx`, `app/api/conversation/extract-context/*` |
| questions-skip | Questions skip + defaults | `app/chat/[conversationId]/questions/*`, `lib/questionDefaults.ts` |
| techstack-skip | Tech stack skip + smart defaults | `app/chat/[conversationId]/research/*`, `lib/techStackDefaults.ts` |
| workflow-orchestration | Auto-advance, state, navigation | `contexts/WorkflowContext.tsx`, `lib/workflowGuards.ts` |

Each agent has detailed instructions in `.claude/agents/` directory.
