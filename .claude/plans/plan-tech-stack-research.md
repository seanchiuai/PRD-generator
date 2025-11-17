# Implementation Plan: Tech Stack Research & Selection

## Feature Overview
Intelligent tech stack research that dynamically determines needed technology categories, researches options using AI and web resources, presents choices with pros/cons, validates compatibility, and supports both manual selection and auto-defaults.

## Agent Reference
See `.claude/agents/agent-tech-stack-research.md` for detailed implementation patterns.

## Implementation Steps

### Phase 1: Database Schema (Already Implemented)

#### 1.1 Research & Selection Schema
**File:** `convex/schema.ts`

- [x] researchResults field (dynamic categories)
- [x] queriesGenerated field (transparency)
- [x] selection field (auto-defaults)
- [x] selectedTechStack field (manual selection)
- [x] validationWarnings field
- [x] researchMetadata field (progress tracking)

**Status:** ✅ Complete
**Dependencies:** None

### Phase 2: API Routes - Research

#### 2.1 Tech Stack Research API
**File:** `app/api/research/tech-stack/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Retrieve extractedContext and answers
- [ ] Phase 1 - Category Determination:
  - Use Claude to analyze project needs
  - Identify base categories (frontend, backend, database, auth, hosting)
  - Identify conditional categories (real_time, file_storage, email, payments, etc.)
  - Generate reasoning for each category
- [ ] Phase 2 - Research Execution:
  - For each category, research 3-4 options
  - Use context7 MCP for latest docs (if applicable)
  - Generate pros/cons, popularity, learnMore links
  - Include category-specific reasoning
- [ ] Track research metadata (status, progress)
- [ ] Save researchResults and queriesGenerated to conversation
- [ ] Return research results

**Dependencies:** Phase 1
**Estimated time:** 4 hours

#### 2.2 Suggest Defaults API
**File:** `app/api/tech-stack/suggest-defaults/route.ts`

- [ ] POST endpoint accepting conversationId
- [ ] Retrieve researchResults
- [ ] Use Claude to select best defaults:
  - Analyze project complexity
  - Consider real-time needs
  - Evaluate scalability requirements
  - Factor in developer experience
  - Consider cost implications
- [ ] Generate reasoning for each selection
- [ ] Return selection object with autoSelected: true

**Dependencies:** 2.1
**Estimated time:** 2 hours

#### 2.3 Validation API
**File:** `app/api/validate/tech-stack/route.ts`

- [ ] POST endpoint accepting selectedTechStack or selection
- [ ] Use Claude to check:
  - Integration compatibility
  - Performance bottlenecks
  - Cost implications
  - Learning curve mismatches
  - Missing critical technologies
  - Redundant selections (e.g., two databases)
- [ ] Generate warnings array with:
  - level (warning vs error)
  - message
  - affectedTechnologies
  - suggestion
- [ ] Return validation results

**Dependencies:** None (can work independently)
**Estimated time:** 1.5 hours

### Phase 3: Frontend Components

#### 3.1 Research Progress Component
**File:** `components/tech-stack/ResearchProgress.tsx`

- [ ] Props: totalCategories, completedCategories, currentCategory, status
- [ ] Progress bar (0-100%)
- [ ] Display current category being researched
- [ ] Show completed categories with checkmarks
- [ ] Loading animation during research
- [ ] Error state if research fails

**Dependencies:** None
**Estimated time:** 1 hour

#### 3.2 Tech Stack Option Card
**File:** `components/tech-stack/TechStackOption.tsx`

- [ ] Props: option, category, isSelected, onSelect
- [ ] Display:
  - Name and description
  - Expandable pros/cons lists
  - Popularity indicator (badge/stars)
  - "Learn More" external link
  - Select button/checkbox
- [ ] Visual selection state (highlight when selected)
- [ ] Responsive card layout

**Dependencies:** None
**Estimated time:** 1.5 hours

#### 3.3 Category Section Component
**File:** `components/tech-stack/CategorySection.tsx`

- [ ] Props: category, options, selectedOption, onSelect, reasoning
- [ ] Category header with icon
- [ ] Display category reasoning
- [ ] Grid/list of TechStackOption cards
- [ ] Show which option selected
- [ ] Required vs optional category indicator

**Dependencies:** 3.2
**Estimated time:** 1 hour

#### 3.4 Validation Warnings Component
**File:** `components/tech-stack/ValidationWarnings.tsx`

- [ ] Props: warnings
- [ ] Display warnings as Alert components
- [ ] Color coding: warning (yellow), error (red)
- [ ] Show affected technologies
- [ ] Display suggestions if available
- [ ] Dismissible warnings (for non-errors)

**Dependencies:** None
**Estimated time:** 45 minutes

### Phase 4: Research Page

#### 4.1 Research Progress Page
**File:** `app/chat/[conversationId]/research/page.tsx`

- [ ] useQuery to fetch conversation
- [ ] Auto-start research if not already started
- [ ] Call /api/research/tech-stack
- [ ] Display ResearchProgress component
- [ ] Show real-time progress updates
- [ ] Handle completion:
  - Navigate to select page OR
  - Show "Use Defaults" vs "Review Options" buttons
- [ ] Error handling with retry option

**Dependencies:** 2.1, 3.1
**Estimated time:** 2 hours

### Phase 5: Selection Pages

#### 5.1 Selection Page
**File:** `app/chat/[conversationId]/select/page.tsx`

- [ ] useQuery to fetch conversation with researchResults
- [ ] useMutation for saveSelection
- [ ] State management:
  - selectedTechStack (local state)
  - validationWarnings
- [ ] Display categories from researchResults
- [ ] Render CategorySection for each category
- [ ] Handle selection changes:
  - Update local state
  - Track reasoning and selectedFrom
- [ ] Validate button:
  - Call /api/validate/tech-stack
  - Show ValidationWarnings
- [ ] Continue button:
  - Validate all base categories selected
  - Save selectedTechStack to conversation
  - Update stage to "generating"
  - Navigate to /chat/[conversationId]/generate

**Dependencies:** 2.1, 2.3, 3.2, 3.3, 3.4
**Estimated time:** 3 hours

#### 5.2 Unified Tech Stack Page
**File:** `app/chat/[conversationId]/tech-stack/page.tsx`

- [ ] Combined research + selection flow
- [ ] Two-step wizard:
  - Step 1: Research (show progress)
  - Step 2: Selection (show options)
- [ ] Skip option at each step:
  - After research: "Use Recommended Defaults"
  - During selection: "Auto-select Best Options"
- [ ] If skip clicked:
  - Call /api/tech-stack/suggest-defaults
  - Save selection (not selectedTechStack)
  - Proceed to generate stage

**Dependencies:** 2.1, 2.2, 5.1
**Estimated time:** 2.5 hours

### Phase 6: Mutations

#### 6.1 Save Research Results Mutation
**File:** `convex/conversations.ts`

- [ ] saveResearchResults mutation
- [ ] Args: conversationId, researchResults, queriesGenerated, researchMetadata
- [ ] Update conversation with research data
- [ ] Validate authentication

**Dependencies:** Phase 1
**Estimated time:** 30 minutes

#### 6.2 Save Selection Mutation
**File:** `convex/conversations.ts`

- [ ] saveSelection mutation (manual selection)
- [ ] Args: conversationId, selectedTechStack
- [ ] Update conversation.selectedTechStack
- [ ] Validate at least base categories selected

**Dependencies:** Phase 1
**Estimated time:** 30 minutes

#### 6.3 Save Auto-Defaults Mutation
**File:** `convex/conversations.ts`

- [ ] saveAutoDefaults mutation
- [ ] Args: conversationId, selection
- [ ] Update conversation.selection with autoSelected: true
- [ ] Faster path for users who skip

**Dependencies:** Phase 1
**Estimated time:** 20 minutes

### Phase 7: Context7 Integration

#### 7.1 Library Documentation Fetching
- [ ] Use mcp__context7__resolve-library-id for tech lookups
- [ ] Use mcp__context7__get-library-docs for latest docs
- [ ] Integrate into research API for accurate info
- [ ] Cache results to avoid redundant calls

**Dependencies:** 2.1
**Estimated time:** 1.5 hours

### Phase 8: Polish & Testing

#### 8.1 UX Enhancements
- [ ] Smooth transitions between research/selection
- [ ] Skeleton loaders during research
- [ ] Optimistic UI updates on selection
- [ ] Back button to review previous stage
- [ ] Keyboard navigation through options
- [ ] Filter/search options (if >10 per category)

**Dependencies:** 5.1, 5.2
**Estimated time:** 2 hours

#### 8.2 Analytics
**File:** `lib/analytics/techStackEvents.ts`

- [ ] trackTechStackResearch event
- [ ] trackTechStackSelection event
- [ ] trackTechStackSkip event
- [ ] Track: categories count, options count, selection mode, validation warnings

**Dependencies:** 5.1, 5.2
**Estimated time:** 45 minutes

#### 8.3 Error Handling
- [ ] Retry logic for failed research
- [ ] Handle partial research completion
- [ ] Validate research results structure
- [ ] Graceful degradation if context7 unavailable
- [ ] Toast notifications for errors
- [ ] Logging with category context

**Dependencies:** All previous
**Estimated time:** 1.5 hours

#### 8.4 Testing
- [ ] Category determination for various project types
- [ ] Research generates quality options
- [ ] Context7 integration works
- [ ] Auto-defaults are reasonable
- [ ] Validation catches incompatibilities
- [ ] Both skip and manual paths work
- [ ] Selection persistence
- [ ] Stage transitions correct
- [ ] Mobile responsiveness
- [ ] Performance with many categories

**Dependencies:** All previous
**Estimated time:** 3 hours

## Total Estimated Time
- Phase 2: 7.5 hours
- Phase 3: 4.25 hours
- Phase 4: 2 hours
- Phase 5: 5.5 hours
- Phase 6: 1.25 hours
- Phase 7: 1.5 hours
- Phase 8: 7.25 hours

**Total: ~29 hours**

## Success Criteria
- [ ] Categories determined dynamically from project needs
- [ ] Research executes for all identified categories
- [ ] Each category has 3-4 quality options with balanced pros/cons
- [ ] Auto-defaults generate reasonable selections
- [ ] Validation catches compatibility issues and shows warnings
- [ ] Both skip and manual selection paths work
- [ ] Selected tech saved to correct schema field
- [ ] Stage transitions to "generate" correctly
- [ ] Context7 provides latest documentation
- [ ] Mobile-responsive and performant
- [ ] Analytics tracking functional

## Technical Risks
1. **Research Quality** - AI may generate outdated or inaccurate information
   - Mitigation: Use context7 MCP, validate against known sources, show last updated date
2. **Category Explosion** - Too many categories overwhelms users
   - Mitigation: Limit to 8 categories max, prioritize base categories, allow skip
3. **Validation Complexity** - Hard to catch all compatibility issues
   - Mitigation: Focus on common issues, show warnings not errors, allow user override
4. **Performance** - Research for many categories may be slow
   - Mitigation: Parallel research, show progress, cache results

## Dependencies
- Phase 2 (Questions) complete with answers
- Context7 MCP server configured
- Claude API access with sufficient tokens
- Convex mutations working

## Category Determination Logic

### Base Categories (Always)
1. Frontend
2. Backend
3. Database
4. Authentication
5. Hosting

### Conditional Categories (Feature-Driven)
- **Real-time Communication** - if mentions: real-time, live updates, websockets, collaborative
- **File Storage** - if mentions: uploads, files, images, documents, media
- **Email Service** - if mentions: email, notifications, transactional emails
- **Payment Processing** - if mentions: payments, subscriptions, billing, checkout
- **Background Jobs** - if mentions: scheduled tasks, cron, async processing, queues
- **Analytics** - if mentions: tracking, metrics, analytics, reporting
- **Search** - if mentions: search, full-text, elasticsearch, algolia

## Research Quality Standards

Each option should include:
- **Name**: Exact technology name
- **Description**: 1-2 sentence overview
- **Pros**: 3-5 specific benefits
- **Cons**: 2-4 honest limitations
- **Popularity**: Download stats, GitHub stars, or "High/Medium/Low"
- **Learn More**: Official docs link

## Notes
- Prioritize technologies that integrate well together
- Consider developer experience (DX) as a factor
- Show "Why this category" reasoning to educate users
- May want to save research results for future conversations (cache)
- Consider allowing users to add custom categories
- Future: AI-powered tech stack recommendations based on similar successful projects
