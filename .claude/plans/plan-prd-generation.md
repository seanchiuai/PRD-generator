# Implementation Plan: PRD Generation

## Feature Overview
Generate comprehensive Product Requirements Documents in structured JSON format by synthesizing discovery conversation, answered questions, and selected tech stack into actionable technical specifications with features, data models, APIs, timelines, and scope boundaries.

## Agent Reference
See `.claude/agents/agent-prd-generation.md` for detailed implementation patterns.

## Implementation Steps

### Phase 1: Database Schema (Already Implemented)

#### 1.1 PRD Schema
**File:** `convex/schema.ts`

- [x] prds table with:
  - conversationId (link back to conversation)
  - userId
  - prdData (full JSON structure)
  - productName
  - version (for future versioning)
  - status (generating, completed, failed)
  - createdAt, updatedAt
- [x] Indexes: by_user, by_conversation, by_user_and_created

**Status:** ✅ Complete
**Dependencies:** None

### Phase 2: Generation Prompt

#### 2.1 PRD Generation Prompt
**File:** `lib/prompts/markdowns/prd-generation.md`

- [x] Comprehensive prompt defining PRD structure
- [x] JSON schema specification
- [x] Instructions for Claude to generate valid JSON only
- [x] Sections: projectOverview, solutionOverview, techStack, features, successCriteria, technicalArchitecture, implementationFlows, timeline, technicalRisks

**Status:** ✅ Complete (already exists)
**Dependencies:** None

### Phase 3: API Routes

#### 3.1 PRD Generation API
**File:** `app/api/prd/generate/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Pre-generation validation:
  - Verify conversation exists
  - Check messages array has content
  - Ensure clarifyingQuestions answered
  - Confirm tech stack selected (selection OR selectedTechStack)
  - Validate extractedContext exists
- [ ] Gather all inputs:
  - conversation.messages
  - conversation.extractedContext
  - conversation.clarifyingQuestions (with answers)
  - conversation.selectedTechStack OR conversation.selection
  - conversation.researchResults (for tech details)
- [ ] Format prompt with inputs using template
- [ ] Call Claude API:
  - Model: claude-sonnet-4
  - Max tokens: 8000
  - Temperature: 0.3 (for consistency)
- [ ] Parse JSON response
- [ ] Validate JSON structure matches schema
- [ ] Save PRD via mutation
- [ ] Link PRD to conversation
- [ ] Return prdId and success status

**Dependencies:** Phase 1, 2.1
**Estimated time:** 3 hours

#### 3.2 Prompt Formatting Helper
**File:** `lib/prompts/formatPRDPrompt.ts`

- [ ] Function to combine prompt template with user data
- [ ] Insert conversation messages
- [ ] Insert extracted context
- [ ] Insert questions with answers
- [ ] Insert tech stack selections
- [ ] Format for optimal Claude parsing
- [ ] Handle both selection formats (auto vs manual)

**Dependencies:** 2.1
**Estimated time:** 1.5 hours

#### 3.3 JSON Validation Helper
**File:** `lib/validation/validatePRD.ts`

- [ ] Validate PRD structure matches schema
- [ ] Check all required fields present:
  - projectOverview (productName, description, etc.)
  - solutionOverview
  - techStack
  - features.mvpFeatures (5-8 features)
  - technicalArchitecture.dataModels
  - technicalArchitecture.apiEndpoints
  - timeline
  - technicalRisks
- [ ] Validate data types (arrays, objects, strings)
- [ ] Return validation errors if any

**Dependencies:** None
**Estimated time:** 1 hour

### Phase 4: Mutations & Queries

#### 4.1 Create PRD Mutation
**File:** `convex/prds.ts`

- [ ] create mutation
- [ ] Args: conversationId, prdData, productName
- [ ] Verify user authentication
- [ ] Insert PRD record with status: "completed"
- [ ] Link to conversation (update conversation.prdId)
- [ ] Update conversation.currentStage to "completed"
- [ ] Return prdId

**Dependencies:** Phase 1
**Estimated time:** 45 minutes

#### 4.2 Get PRD Query
**File:** `convex/prds.ts`

- [ ] get query
- [ ] Args: prdId
- [ ] Fetch PRD by ID
- [ ] Verify user has access (userId match)
- [ ] Return full PRD data

**Dependencies:** Phase 1
**Estimated time:** 20 minutes

#### 4.3 List User PRDs Query
**File:** `convex/prds.ts`

- [ ] listByUser query
- [ ] Args: userId
- [ ] Fetch all PRDs for user
- [ ] Order by createdAt desc (newest first)
- [ ] Return array of PRDs

**Dependencies:** Phase 1
**Estimated time:** 20 minutes

#### 4.4 Get Latest PRD Query
**File:** `convex/prds.ts`

- [ ] getLatestByConversation query
- [ ] Args: conversationId
- [ ] Fetch latest version for conversation
- [ ] Useful for regeneration feature (future)

**Dependencies:** Phase 1
**Estimated time:** 15 minutes

### Phase 5: Generation Page

#### 5.1 Generation Trigger Page
**File:** `app/chat/[conversationId]/generate/page.tsx`

- [ ] useQuery to fetch conversation
- [ ] useMutation for generating PRD (if needed)
- [ ] Auto-start generation on mount
- [ ] State management:
  - isGenerating (loading state)
  - error (if generation fails)
  - progress (simulated progress for UX)
- [ ] Call /api/prd/generate
- [ ] Show progress UI:
  - Loading spinner
  - Progress bar (simulated)
  - Step indicators (analyzing, processing, generating)
- [ ] Handle completion:
  - Navigate to /prd/[prdId]
- [ ] Handle errors:
  - Show error message
  - Retry button
  - Option to go back and edit inputs

**Dependencies:** 3.1, 4.1
**Estimated time:** 2 hours

#### 5.2 Progress Component
**File:** `components/prd/GenerationProgress.tsx`

- [ ] Props: currentStep, totalSteps
- [ ] Animated progress bar
- [ ] Step labels:
  - "Analyzing conversation"
  - "Processing questions and answers"
  - "Incorporating tech stack"
  - "Generating features and architecture"
  - "Finalizing PRD"
- [ ] Estimated time remaining (fake but helpful)
- [ ] Loading animation

**Dependencies:** None
**Estimated time:** 1 hour

### Phase 6: PRD Display Page

#### 6.1 Main PRD Page
**File:** `app/prd/[prdId]/page.tsx`

- [ ] useQuery to fetch PRD
- [ ] Tabbed navigation for sections:
  - Overview
  - Features
  - Architecture
  - Timeline
  - Risks
- [ ] Export options dropdown:
  - Download JSON
  - Download Markdown
  - Print view
  - Copy shareable link (future)
- [ ] Edit button (future: regenerate)
- [ ] Back to dashboard button

**Dependencies:** 4.2
**Estimated time:** 2.5 hours

#### 6.2 Overview Tab Components
**File:** `components/prd/sections/`

- [ ] ProjectOverview component
  - Display productName, description, problemStatement
  - Show desiredEndState
  - List edgeCasesAndConstraints
- [ ] SolutionOverview component
  - Technical approach
  - Key architecture decisions
  - Reasoning
- [ ] TechStack component
  - Display each technology with pros/cons
  - Show overall reasoning
  - Link to alternatives

**Dependencies:** None
**Estimated time:** 2 hours

#### 6.3 Features Tab Components
**File:** `components/prd/sections/`

- [ ] MVPFeatures component
  - List all MVP features
  - Expandable cards per feature
  - Show: name, description, functionality, userInteraction, expectedBehavior
  - Display acceptance criteria as checklist
  - Show technical requirements
  - List dependencies
  - Priority badge (critical, high, medium)
- [ ] NiceToHaveFeatures component
  - List deferred features
  - Show why deferred
- [ ] OutOfScope component
  - List excluded features
  - Show reason and category
  - Highlight to manage expectations

**Dependencies:** None
**Estimated time:** 2.5 hours

#### 6.4 Architecture Tab Components
**File:** `components/prd/sections/`

- [ ] SystemDesign component
  - Display system design paragraph
- [ ] DataModels component
  - Table/cards showing each entity
  - Fields with types and required flags
  - Relationships
- [ ] APIEndpoints component
  - List endpoints grouped by resource
  - Show method, path, purpose, auth
- [ ] Integrations component
  - List third-party services
  - Show purpose for each

**Dependencies:** None
**Estimated time:** 2 hours

#### 6.5 Timeline & Risks Components
**File:** `components/prd/sections/`

- [ ] Timeline component
  - Phase cards with duration and deliverables
  - Gantt-style visualization (optional)
  - Total estimated duration
- [ ] TechnicalRisks component
  - Risk cards categorized
  - Show impact and mitigation
  - Constraints highlighted

**Dependencies:** None
**Estimated time:** 1.5 hours

### Phase 7: Export Functionality

#### 7.1 JSON Export
**File:** `lib/export/exportPRD.ts`

- [ ] Function to download PRD as JSON
- [ ] Format with proper indentation
- [ ] Filename: `{productName}-PRD-{date}.json`

**Dependencies:** None
**Estimated time:** 30 minutes

#### 7.2 Markdown Export
**File:** `lib/export/exportPRDMarkdown.ts`

- [ ] Convert PRD JSON to Markdown format
- [ ] Proper heading hierarchy
- [ ] Tables for data models and APIs
- [ ] Lists for features and risks
- [ ] Download as .md file
- [ ] Filename: `{productName}-PRD-{date}.md`

**Dependencies:** None
**Estimated time:** 2 hours

#### 7.3 Print View
**File:** `app/prd/[prdId]/print/page.tsx`

- [ ] Print-optimized layout
- [ ] All sections on single page
- [ ] Remove navigation and interactive elements
- [ ] CSS print styles (@media print)
- [ ] Page breaks at logical sections

**Dependencies:** 6.1
**Estimated time:** 1 hour

### Phase 8: Polish & Testing

#### 8.1 Error Handling
- [ ] Handle Claude API errors gracefully
- [ ] Retry logic for transient failures
- [ ] Fallback if JSON parsing fails
- [ ] Validate before saving to prevent bad data
- [ ] Show user-friendly error messages
- [ ] Log errors with context

**Dependencies:** 3.1
**Estimated time:** 1.5 hours

#### 8.2 Loading States
- [ ] Skeleton loaders for PRD page
- [ ] Loading states for all queries
- [ ] Optimistic UI where applicable
- [ ] Smooth transitions between states

**Dependencies:** 6.1
**Estimated time:** 1 hour

#### 8.3 Analytics
**File:** `lib/analytics/prdEvents.ts`

- [ ] trackPRDGenerationStarted event
- [ ] trackPRDGenerationCompleted event
- [ ] trackPRDGenerationFailed event
- [ ] trackPRDExport event (JSON, Markdown, Print)
- [ ] Track: duration, feature count, data model count, API count

**Dependencies:** 5.1, 7.1, 7.2
**Estimated time:** 45 minutes

#### 8.4 UX Enhancements
- [ ] Copy to clipboard for sections
- [ ] Collapsible sections for long PRDs
- [ ] Search within PRD
- [ ] Sticky navigation for tabs
- [ ] Smooth scrolling to sections
- [ ] Tooltips for technical terms
- [ ] Responsive design (mobile-friendly)

**Dependencies:** 6.1
**Estimated time:** 2 hours

#### 8.5 Testing
- [ ] Generation from minimal conversation (skip path)
- [ ] Generation from full workflow
- [ ] Both selection modes produce valid PRDs
- [ ] JSON structure validation
- [ ] All sections render correctly
- [ ] Export functions work (JSON, Markdown, Print)
- [ ] Error scenarios handled gracefully
- [ ] PRD persistence and retrieval
- [ ] Mobile responsiveness
- [ ] Performance with large PRDs
- [ ] Accessibility (keyboard nav, screen readers)

**Dependencies:** All previous
**Estimated time:** 3 hours

## Total Estimated Time
- Phase 2: Already complete
- Phase 3: 5.5 hours
- Phase 4: 1.67 hours
- Phase 5: 3 hours
- Phase 6: 10.5 hours
- Phase 7: 3.5 hours
- Phase 8: 8.25 hours

**Total: ~32.5 hours**

## Success Criteria
- [ ] PRD generates from complete conversation workflow
- [ ] PRD generates from skip workflow (minimal inputs)
- [ ] JSON structure matches prompt schema exactly
- [ ] All required sections present and populated
- [ ] Features have detailed acceptance criteria
- [ ] Data models align with features
- [ ] API endpoints support all features
- [ ] OutOfScope section comprehensive
- [ ] Tech stack details accurate and justified
- [ ] Timeline realistic and phased
- [ ] Technical risks identified with mitigations
- [ ] PRD displays beautifully on all devices
- [ ] Export to JSON/Markdown/Print works
- [ ] Error states handled gracefully
- [ ] Analytics tracking functional
- [ ] Performance acceptable (generation <60s)

## Technical Risks
1. **Claude Output Quality** - May generate incomplete or inconsistent PRDs
   - Mitigation: Validate structure, retry on failures, refine prompt with examples
2. **JSON Parsing Failures** - Claude may include non-JSON text
   - Mitigation: Strict prompt instructions, extract JSON with regex, validate before save
3. **Token Limits** - Large conversations may exceed context window
   - Mitigation: Summarize messages, paginate inputs, use Claude Sonnet 4 (200k context)
4. **Generation Time** - Users may abandon if too slow
   - Mitigation: Show progress, set expectations (30-60s), optimize prompt
5. **Data Loss** - Generation failure after long workflow frustrating
   - Mitigation: Save failed attempts, allow retry, preserve all inputs

## Dependencies
- Phase 3 (Tech Stack) complete with selections
- Claude API access with high token limits
- Convex mutations working
- All previous phases (discovery, questions, tech stack) functional

## PRD Quality Assurance

### Feature Completeness Checklist
Each MVP feature must have:
- ✅ Clear name and description
- ✅ Functionality explanation
- ✅ User interaction flow
- ✅ Expected behavior
- ✅ 3-5 measurable acceptance criteria
- ✅ Technical requirements list
- ✅ Dependencies identified
- ✅ Priority assigned

### Architecture Completeness Checklist
- ✅ System design overview paragraph
- ✅ 5-10 data models with fields and relationships
- ✅ 10-20 API endpoints covering all CRUD operations
- ✅ Integrations listed with purpose
- ✅ Performance constraints defined

### Scope Management Checklist
- ✅ 5-8 MVP features (not too few, not too many)
- ✅ Nice-to-have features deferred with reasoning
- ✅ 10+ out-of-scope items to prevent creep
- ✅ Clear boundaries per category (platform, features, scale, etc.)

## Notes
- PRDs should be implementation-focused, not business-focused
- Avoid market validation, user personas, business metrics
- Focus on "what to build" and "how to verify it's done"
- Technical details prioritized over marketing language
- Clear, specific, measurable acceptance criteria critical
- OutOfScope section as important as MVP features
- Future: Allow PRD regeneration with tweaks
- Future: AI-powered feature breakdown into tasks
- Future: Integration with project management tools
