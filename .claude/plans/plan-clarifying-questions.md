# Implementation Plan: Clarifying Questions

## Feature Overview
Generate contextual clarifying questions based on discovery conversation, allow users to answer them, auto-fill obvious answers, track progress, and validate completeness before proceeding to tech stack stage.

## Agent Reference
See `.claude/agents/agent-clarifying-questions.md` for detailed implementation patterns.

## Implementation Steps

### Phase 1: Database Schema (Already Implemented)

#### 1.1 Questions Schema
**File:** `convex/schema.ts`

- [x] clarifyingQuestions field in conversations table
- [x] answersCompleteness field (percentage)
- [x] autoCompletedQuestions field (array of IDs)

**Status:** ✅ Complete
**Dependencies:** None

### Phase 2: API Routes

#### 2.1 Question Generation API
**File:** `app/api/questions/generate/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Retrieve extractedContext from conversation
- [ ] Use Claude to generate 5-8 questions:
  - Categorize: Product Scope, Target Users, Technical Requirements, Success Metrics, Edge Cases
  - Mix of types: text, textarea, select, multiselect
  - Include suggestedOptions where applicable
  - Mark critical questions as required: true
- [ ] Validate question structure
- [ ] Return questions array

**Dependencies:** Phase 1
**Estimated time:** 2 hours

#### 2.2 Auto-Fill Defaults API
**File:** `app/api/questions/fill-defaults/route.ts`

- [ ] POST endpoint accepting conversationId, questions
- [ ] Retrieve full conversation history
- [ ] For each question:
  - Use Claude to analyze if answer inferable from conversation
  - If yes, generate answer and mark autoCompleted: true
  - If no, leave answer blank
- [ ] Return updated questions array
- [ ] Track which questions auto-completed

**Dependencies:** Phase 1
**Estimated time:** 1.5 hours

### Phase 3: Frontend Components

#### 3.1 Question Category Component
**File:** `components/questions/QuestionCategory.tsx`

- [ ] Props: category, questions, onAnswerChange
- [ ] Collapsible section per category
- [ ] Display category name as header
- [ ] Show progress: "X of Y answered"
- [ ] Render questions based on type:
  - text → Input component
  - textarea → Textarea component
  - select → Select component
  - multiselect → Checkbox group
  - radio → RadioGroup component
- [ ] Show "Auto-filled" badge if autoCompleted
- [ ] Required indicator (asterisk)
- [ ] Smooth expand/collapse animation

**Dependencies:** None
**Estimated time:** 2 hours

#### 3.2 Progress Indicator Component
**File:** `components/questions/ProgressIndicator.tsx`

- [ ] Props: totalQuestions, answeredQuestions, requiredQuestions, answeredRequired
- [ ] Progress bar (0-100%)
- [ ] Text: "X of Y questions answered"
- [ ] Highlight required vs optional
- [ ] Show "All required complete" checkmark
- [ ] Color coding: red (incomplete) → yellow (partial) → green (complete)

**Dependencies:** None
**Estimated time:** 1 hour

### Phase 4: Questions Page

#### 4.1 Main Questions Page
**File:** `app/chat/[conversationId]/questions/page.tsx`

- [ ] useQuery to fetch conversation
- [ ] useMutation for updateQuestions
- [ ] State management:
  - questions (local state)
  - isGenerating, isSaving, isSkipping
- [ ] On mount:
  - Check if questions already generated
  - If not, call /api/questions/generate
  - Then call /api/questions/fill-defaults
  - Save to conversation
- [ ] Display questions grouped by category
- [ ] Handle answer changes:
  - Update local state immediately
  - Debounce save to backend (2s)
  - Calculate completeness on every change
- [ ] Validation logic:
  - canProceed = all required questions answered
- [ ] Show "Continue to Tech Stack" button when canProceed
- [ ] Handle continue:
  - Validate all required answered
  - Update stage to "tech-stack"
  - Navigate to /chat/[conversationId]/tech-stack
- [ ] Allow skip if >60% complete + all required answered

**Dependencies:** 2.1, 2.2, 3.1, 3.2
**Estimated time:** 3 hours

#### 4.2 Loading State
**File:** `app/chat/[conversationId]/questions/loading.tsx`

- [ ] Skeleton loaders for question cards
- [ ] Progress bar skeleton

**Dependencies:** None
**Estimated time:** 15 minutes

### Phase 5: Mutations

#### 5.1 Update Questions Mutation
**File:** `convex/conversations.ts`

- [ ] updateQuestions mutation
- [ ] Args: conversationId, questions array
- [ ] Calculate completeness percentage
- [ ] Track auto-completed question IDs
- [ ] Update conversation record
- [ ] Validate user authentication

**Dependencies:** Phase 1
**Estimated time:** 30 minutes

### Phase 6: Polish & Testing

#### 6.1 Input Handling
- [ ] Auto-save on blur (not on every keystroke)
- [ ] Show "Saving..." indicator during save
- [ ] Handle validation errors per question
- [ ] Prevent data loss on page reload
- [ ] Textarea auto-resize based on content

**Dependencies:** 4.1
**Estimated time:** 1.5 hours

#### 6.2 UX Enhancements
- [ ] Highlight unanswered required questions
- [ ] Scroll to first unanswered on page load
- [ ] Keyboard navigation (Tab between inputs)
- [ ] Edit auto-filled answers easily
- [ ] Show helpful placeholders
- [ ] Tooltips for complex questions

**Dependencies:** 4.1
**Estimated time:** 1 hour

#### 6.3 Analytics
**File:** `lib/analytics/questionsEvents.ts`

- [ ] trackQuestionsGenerated event
- [ ] trackQuestionsSkip event
- [ ] trackQuestionsComplete event
- [ ] Track: total, answered, auto-filled counts

**Dependencies:** 4.1
**Estimated time:** 30 minutes

#### 6.4 Error Handling
- [ ] Try/catch around API calls
- [ ] Toast notifications for errors
- [ ] Retry logic for failed saves
- [ ] Graceful degradation if generation fails
- [ ] Logging with question context

**Dependencies:** 4.1
**Estimated time:** 1 hour

#### 6.5 Testing
- [ ] Question generation from various contexts
- [ ] Auto-fill accuracy
- [ ] Answer persistence across refreshes
- [ ] All input types (text, textarea, select, etc.)
- [ ] Progress calculation correctness
- [ ] Required validation logic
- [ ] Stage transition to tech-stack
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard nav, screen readers)

**Dependencies:** All previous
**Estimated time:** 2 hours

## Total Estimated Time
- Phase 2: 3.5 hours
- Phase 3: 3 hours
- Phase 4: 3.25 hours
- Phase 5: 0.5 hours
- Phase 6: 6 hours

**Total: ~16 hours**

## Success Criteria
- [ ] Questions generate based on extracted context
- [ ] 5-8 questions across multiple categories
- [ ] Auto-fill works for obvious answers
- [ ] Progress indicator updates in real-time
- [ ] All question input types work correctly
- [ ] Answers save automatically (debounced)
- [ ] Required validation prevents incomplete proceed
- [ ] Auto-filled answers clearly marked
- [ ] Can proceed when all required complete
- [ ] Stage transitions to "tech-stack" correctly
- [ ] Analytics tracking functional
- [ ] Mobile-responsive and accessible

## Technical Risks
1. **Auto-Fill Accuracy** - May auto-fill incorrectly or miss obvious answers
   - Mitigation: Always allow user to edit, clearly mark auto-filled
2. **Question Relevance** - Generated questions may not fit all projects
   - Mitigation: Dynamic categorization based on context, skip option
3. **Data Loss** - Answers might not save before page close
   - Mitigation: Debounced auto-save, localStorage backup

## Dependencies
- Phase 1 (Discovery) complete with extractedContext
- Convex mutations working
- Claude API access
- shadcn/ui form components

## Question Generation Best Practices

### Example Questions by Category

**Product Scope & Features:**
- "What is the maximum number of [entities] a user can create?"
- "Should users be able to export data? If yes, what formats?"
- "Are there any features from similar products you want to avoid?"

**Target Users & Use Cases:**
- "What is the expected team/organization size?"
- "Will users need offline access?"
- "What are the top 3 use cases you expect users to have?"

**Technical Requirements:**
- "Do you need real-time synchronization across devices?"
- "What level of data security/compliance is required?"
- "Are there any third-party integrations required?"

**Success Metrics:**
- "How will you measure if this product is successful?"
- "What's an acceptable page load time for your users?"
- "What conversion rate would indicate product-market fit?"

**Edge Cases & Constraints:**
- "What should happen if a user tries to [edge case action]?"
- "Are there any regulatory/legal constraints?"
- "What's the acceptable downtime tolerance?"

## Notes
- Keep questions focused and specific (not open-ended essays)
- Provide suggestedOptions for select/multiselect to guide users
- Balance thoroughness with user patience (5-8 questions ideal)
- Consider adding "I don't know" option for uncertain answers
- May want to regenerate questions if user goes back to discovery
