# Implementation Plan: PRD Discovery & Conversation

## Feature Overview
Initial product discovery conversation where users describe their product idea through natural chat. AI asks follow-up questions, extracts structured context, and determines when to proceed to questions stage.

## Agent Reference
See `.claude/agents/agent-prd-discovery.md` for detailed implementation patterns.

## Implementation Steps

### Phase 1: Database & Backend (Convex)

#### 1.1 Schema Implementation
**File:** `convex/schema.ts`

- [x] Define conversations table with:
  - userId, projectName, projectDescription
  - messages array (role, content, timestamp)
  - currentStage enum (setup, discovery, clarifying, etc.)
  - extractedContext object
  - Indexes: by_user, by_user_and_stage

**Dependencies:** None
**Estimated time:** 30 minutes

#### 1.2 Conversation Mutations
**File:** `convex/conversations.ts`

- [ ] Create mutation: Create new conversation
- [ ] addMessage mutation: Add user/AI messages
- [ ] updateStage mutation: Transition between stages
- [ ] saveProjectSetup mutation: Save initial project info
- [ ] saveExtractedContext mutation: Store extracted context

**Dependencies:** 1.1
**Estimated time:** 1 hour

#### 1.3 Conversation Queries
**File:** `convex/conversations.ts`

- [ ] get query: Retrieve conversation by ID
- [ ] listByUser query: Get user's conversations
- [ ] getLatest query: Get most recent conversation

**Dependencies:** 1.1
**Estimated time:** 30 minutes

### Phase 2: API Routes

#### 2.1 Initial Message API
**File:** `app/api/conversation/initial-message/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Retrieve projectName/description from conversation
- [ ] Use Claude to generate friendly greeting
- [ ] If setup provided, acknowledge and ask for details
- [ ] If no setup, ask open-ended question
- [ ] Return AI message

**Dependencies:** 1.2, 1.3
**Estimated time:** 1 hour

#### 2.2 Message Handling API
**File:** `app/api/conversation/message/route.ts`

- [ ] POST endpoint accepting conversationId, message
- [ ] Add user message to conversation
- [ ] Send full conversation history to Claude
- [ ] Claude generates contextual response
- [ ] Determine if enough context gathered (shouldProceed)
- [ ] Return AI response + shouldProceed flag

**Dependencies:** 1.2, 1.3
**Estimated time:** 1.5 hours

#### 2.3 Context Extraction API
**File:** `app/api/conversation/extract-context/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Retrieve full conversation history
- [ ] Use Claude to extract structured context:
  - productName
  - description
  - targetAudience
  - keyFeatures (array)
  - problemStatement
  - technicalPreferences (array)
- [ ] Validate extracted data
- [ ] Save to conversation.extractedContext
- [ ] Return extracted context

**Dependencies:** 1.2, 1.3
**Estimated time:** 1.5 hours

### Phase 3: Frontend Components

#### 3.1 Chat Container Component
**File:** `components/chat/ChatContainer.tsx`

- [ ] Display messages in chronological order
- [ ] Distinguish user vs AI messages (styling)
- [ ] Auto-scroll to bottom on new messages
- [ ] Show typing indicator during AI response
- [ ] Responsive design (mobile-friendly)

**Dependencies:** None
**Estimated time:** 1 hour

#### 3.2 Chat Input Component
**File:** `components/chat/ChatInput.tsx`

- [ ] Textarea for user input
- [ ] Send button (disabled when empty)
- [ ] Enter to send (Shift+Enter for new line)
- [ ] Character counter (optional)
- [ ] Loading state while sending

**Dependencies:** None
**Estimated time:** 45 minutes

#### 3.3 Workflow Layout Component
**File:** `components/workflow/WorkflowLayout.tsx`

- [ ] Consistent header with progress indicator
- [ ] Navigation between stages
- [ ] Back button (if applicable)
- [ ] Continue button (when stage complete)
- [ ] Responsive sidebar (optional)

**Dependencies:** None
**Estimated time:** 1 hour

### Phase 4: Main Chat Page

#### 4.1 Chat Page Implementation
**File:** `app/chat/[conversationId]/page.tsx`

- [ ] useQuery to fetch conversation
- [ ] useMutation for addMessage
- [ ] Display ChatContainer with messages
- [ ] Display ChatInput at bottom
- [ ] Handle message sending:
  - Call addMessage mutation
  - Call /api/conversation/message
  - Display AI response
  - Update local state
- [ ] Show "Continue to Questions" button when:
  - User has >50 chars of meaningful content
  - canSkip validation passes
- [ ] Handle continue click:
  - Call /api/conversation/extract-context
  - Save extracted context
  - Update stage to "clarifying"
  - Navigate to /chat/[conversationId]/questions

**Dependencies:** 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3
**Estimated time:** 2.5 hours

#### 4.2 Loading States
**File:** `app/chat/[conversationId]/loading.tsx`

- [ ] Skeleton loader for messages
- [ ] Loading animation

**Dependencies:** None
**Estimated time:** 20 minutes

### Phase 5: Setup Integration

#### 5.1 Project Setup Page (Optional)
**File:** `app/chat/[conversationId]/setup/page.tsx`

- [ ] Form for projectName and projectDescription
- [ ] Save to conversation via mutation
- [ ] Navigate to main chat page
- [ ] Pre-populate initial message based on setup

**Dependencies:** 1.2
**Estimated time:** 1 hour

### Phase 6: Polish & Testing

#### 6.1 Error Handling
- [ ] Try/catch around all API calls
- [ ] User-friendly toast notifications
- [ ] Logging with conversationId context
- [ ] Retry logic for failed requests

**Dependencies:** All previous
**Estimated time:** 1 hour

#### 6.2 Analytics
**File:** `lib/analytics/discoveryEvents.ts`

- [ ] trackDiscoveryStart event
- [ ] trackDiscoverySkip event
- [ ] trackContextExtraction event

**Dependencies:** 4.1
**Estimated time:** 30 minutes

#### 6.3 Testing
- [ ] New conversation flow
- [ ] Message sending/receiving
- [ ] Context extraction accuracy
- [ ] Skip validation logic
- [ ] Stage transitions
- [ ] Error scenarios
- [ ] Mobile responsiveness

**Dependencies:** All previous
**Estimated time:** 2 hours

## Total Estimated Time
- Phase 1: 2 hours
- Phase 2: 4 hours
- Phase 3: 2.75 hours
- Phase 4: 2.7 hours
- Phase 5: 1 hour
- Phase 6: 3.5 hours

**Total: ~16 hours**

## Success Criteria
- [ ] Users can start new conversation
- [ ] AI generates contextual responses
- [ ] Users can send messages naturally
- [ ] "Continue" appears only when sufficient context
- [ ] Context extraction produces valid structured data
- [ ] Smooth transition to questions stage
- [ ] All error states handled gracefully
- [ ] Mobile-responsive UI
- [ ] Analytics tracking functional

## Technical Risks
1. **AI Response Quality** - Claude may not always generate helpful responses
   - Mitigation: Tune prompts, add examples, implement retry
2. **Context Extraction Accuracy** - May miss important details
   - Mitigation: Review and edit extracted context before proceeding
3. **Skip Validation** - Users might skip too early
   - Mitigation: Require >50 chars, show warning if minimal context

## Dependencies
- Convex backend configured
- Clerk authentication working
- Claude API access
- UI components library (shadcn/ui)

## Notes
- Keep conversations in database indefinitely (user history)
- Consider adding "edit extracted context" feature before questions
- May want conversation templates for common product types
