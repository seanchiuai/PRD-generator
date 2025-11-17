# Merge Research & Selection Phases Plan

## Overview
Merge the research and selection phases into a single, unified interface where users can view research results and make selections simultaneously. Replace the current accordion-based research view with an enhanced card-based UI that shows all information upfront.

## Current Problems
1. **Two-step flow is redundant**: Users view research results, then navigate to another page to see the same options again
2. **Poor UX**: Accordion-based research view hides important pros/cons information
3. **Inefficient**: Users must remember research details when making selections on a separate page
4. **Visual disconnect**: Research and selection UIs look different despite showing the same data

## New Design

### Single Unified Page: Tech Stack Selection
**Route:** `/app/chat/[conversationId]/tech-stack/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Select Your Tech Stack"           │
│ Subtitle: Research-backed recommendations   │
│ Skip Button: "Use Recommended Stack"        │
├─────────────────────────────────────────────┤
│ [Auto-research starts on page load]        │
│                                             │
│ Category 1: Frontend                        │
│ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │Card 1│ │Card 2│ │Card 3│ (selected)     │
│ │✓ Pros│ │✓ Pros│ │✓ Pros│                │
│ │✗ Cons│ │✗ Cons│ │✗ Cons│                │
│ │Learn→│ │Learn→│ │Learn→│                │
│ └──────┘ └──────┘ └──────┘                │
│                                             │
│ Category 2: Backend                         │
│ ┌──────┐ ┌──────┐                          │
│ │Card 1│ │Card 2│                          │
│ └──────┘ └──────┘                          │
│                                             │
│ [Progress: 2/5 selected] [Validation]      │
├─────────────────────────────────────────────┤
│ Back │ │ Generate PRD│                     │
└─────────────────────────────────────────────┘
```

### Enhanced TechStackCard Component
**Always visible information:**
- Technology name + popularity badge
- Full description (3-4 lines)
- **Pros list** (green text, checkmarks) - NO accordion, always shown
- **Cons list** (red text, x-marks) - NO accordion, always shown
- "Learn more" link if available
- Selection state: blue ring border + checkmark when selected
- Click anywhere on card to select

**Visual States:**
- Default: White/dark card, subtle border, hover shadow
- Selected: Blue ring border (ring-2 ring-primary), green checkmark top-right, shadow-lg
- Loading: Skeleton animation

## Implementation Steps

### Phase 1: Create Unified Page & Components

#### 1.1 Create New Unified Page
**File:** `app/chat/[conversationId]/tech-stack/page.tsx`

**Features:**
- Auto-start research on mount (like current research page)
- Show loading skeletons during research (per category)
- Display enhanced cards as research completes (stream results if possible)
- Handle selection state locally
- Real-time validation on selection changes
- Progress indicator
- Skip functionality (auto-select + countdown like current selection page)

**States:**
```typescript
const [isResearching, setIsResearching] = useState(false);
const [researchProgress, setResearchProgress] = useState<Record<string, 'pending' | 'loading' | 'completed' | 'failed'>>({});
const [selections, setSelections] = useState<Record<string, string>>({});
const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>({});
const [isValidating, setIsValidating] = useState(false);
```

#### 1.2 Enhance TechStackCard Component
**File:** `components/tech-stack/TechStackCard.tsx` (rename/move from selection/)

**Changes:**
- Remove accordion wrapper
- Display pros/cons lists directly in card body
- Add proper spacing between sections
- Use lucide-react icons: Check (pros), X (cons)
- Increase card height to accommodate full content
- Add subtle animations on hover/selection
- Keep "Learn more" link at bottom

**Layout:**
```tsx
<Card onClick={onSelect}>
  <CardHeader>
    <CardTitle>
      {option.name}
      {option.popularity && <Badge>{option.popularity}</Badge>}
    </CardTitle>
    <CardDescription>{option.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Pros Section */}
      <div>
        <h5>Pros</h5>
        <ul>
          {option.pros.map(pro => (
            <li><Check /> {pro}</li>
          ))}
        </ul>
      </div>

      {/* Cons Section */}
      <div>
        <h5>Cons</h5>
        <ul>
          {option.cons.map(con => (
            <li><X /> {con}</li>
          ))}
        </ul>
      </div>

      {/* Learn More */}
      {option.learnMore && (
        <a href={option.learnMore}>
          Learn more <ExternalLink />
        </a>
      )}
    </div>
  </CardContent>

  {/* Selection Indicator */}
  {isSelected && (
    <div className="absolute top-3 right-3">
      <Check className="checkmark-icon" />
    </div>
  )}
</Card>
```

#### 1.3 Create CategorySection Component
**File:** `components/tech-stack/CategorySection.tsx`

**Features:**
- Category title + reasoning (from Claude)
- Grid layout of enhanced TechStackCards
- Loading state: show 3 skeleton cards
- Error state: show retry button for this category
- Empty state: "No options found"

**Props:**
```typescript
interface CategorySectionProps {
  category: string;
  reasoning?: string;
  options: TechOption[];
  selectedOption?: string;
  onSelect: (techName: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}
```

#### 1.4 Create Progress & Validation UI
**Component:** `components/tech-stack/SelectionStatus.tsx`

**Features:**
- Progress bar: "X of Y categories selected"
- Validation status indicator
- Real-time validation warnings/errors display (like current selection page)
- Compact design, sticky to bottom of viewport (optional)

### Phase 2: Update Backend & Data Flow

#### 2.1 Update Research API
**File:** `app/api/research/tech-stack/route.ts`

**Changes:**
- No changes needed - API already returns correct format
- Consider streaming support (optional enhancement)

#### 2.2 Update Convex Schema
**File:** `convex/schema.ts`

**Changes:**
- Ensure `researchResults` and `selectedTechStack` schemas are compatible
- Add `techStackStage` field: 'not_started' | 'researching' | 'selecting' | 'completed'

#### 2.3 Update Stage Management
**File:** `convex/conversations.ts`

**Changes:**
- Remove separate 'research' and 'selection' stages
- Replace with single 'tech-stack' stage
- Update stage transitions in mutations

### Phase 3: Update Routing & Navigation

#### 3.1 Update Workflow Layout
**File:** `components/layout/WorkflowLayout.tsx`

**Changes:**
- Update progress steps: Discovery → Questions → **Tech Stack** → Generate
- Update navigation paths
- Update skip button behavior

#### 3.2 Update Navigation Redirects
**Files to update:**
- `app/chat/[conversationId]/questions/page.tsx` - redirect to `/tech-stack`
- `app/chat/[conversationId]/generate/page.tsx` - check previous stage is `tech-stack`

#### 3.3 Create Redirect Routes (Backward Compatibility)
**Files:**
- `app/chat/[conversationId]/research/page.tsx` - redirect to `/tech-stack`
- `app/chat/[conversationId]/select/page.tsx` - redirect to `/tech-stack`

Add warning toast: "Research and Selection have been merged into a single step"

### Phase 4: UI/UX Enhancements

#### 4.1 Styling Updates
**File:** `components/tech-stack/TechStackCard.tsx` - styles

**Design system:**
- Card min-height: ~400px (to accommodate all content)
- Grid: 2 columns on tablet, 1 column on mobile, 3 columns on desktop (optional: 2 cols for better readability)
- Pros color: `text-green-700 dark:text-green-400`
- Cons color: `text-red-700 dark:text-red-400`
- Icon size: `h-4 w-4`
- Spacing: generous padding between sections
- Selection ring: `ring-2 ring-primary`
- Checkmark: green circle background, white check icon, top-right absolute position

#### 4.2 Loading Experience
- Show category sections sequentially as research completes
- Skeleton cards: 3 per category
- Animated research progress indicator per category
- Optional: estimated time remaining

#### 4.3 Error Handling
- Per-category retry buttons (research failed)
- Global retry button (all failed)
- Fallback: "Use Recommended Stack" always available
- Validation errors: prominent display, blocks progression

### Phase 5: Cleanup & Migration

#### 5.1 Remove Old Components
**Files to delete:**
- `components/research/ResearchResults.tsx`
- `components/research/ResearchProgress.tsx`
- `components/research/LoadingSkeleton.tsx`
- `components/selection/CategorySection.tsx` (replaced)
- `components/selection/TechStackCard.tsx` (moved/enhanced)
- `components/selection/SelectionProgress.tsx` (integrated into new status component)
- `components/selection/ValidationWarnings.tsx` (integrated into new status component)

#### 5.2 Remove Old Pages
**Files to delete (after creating redirects):**
- `app/chat/[conversationId]/research/page.tsx`
- `app/chat/[conversationId]/select/page.tsx`

#### 5.3 Update Documentation
**Files to update:**
- `docs/frontend-architecture.md` - remove research/select, add tech-stack
- `CHANGELOG.md` - document the merge

### Phase 6: Testing & Validation

#### 6.1 Test Scenarios
- [ ] Fresh conversation: auto-research starts correctly
- [ ] Research completes: cards display with all info
- [ ] Selection: click cards to select, visual feedback works
- [ ] Validation: warnings/errors display correctly
- [ ] Skip flow: auto-select + countdown works
- [ ] Error handling: retry buttons work per category
- [ ] Mobile responsive: cards stack properly
- [ ] Dark mode: colors are readable
- [ ] Accessibility: keyboard navigation, screen readers

#### 6.2 Performance
- [ ] Large number of options (10+ per category) renders smoothly
- [ ] Validation doesn't block UI
- [ ] Abort previous validation requests on new selections

## Migration Strategy

### Step 1: Build New Page (Non-Breaking)
Create `app/chat/[conversationId]/tech-stack/page.tsx` alongside existing pages

### Step 2: Test Thoroughly
Use new page for testing, old pages remain functional

### Step 3: Update Navigation
Switch workflow to use new page

### Step 4: Add Redirects
Old pages redirect to new page with toast notification

### Step 5: Monitor
Watch for issues, keep old pages as fallback for 1 week

### Step 6: Clean Up
Delete old components and pages after confirming stability

## Benefits

### User Experience
- **Single view**: See all research and make selections without navigation
- **Full context**: Pros/cons always visible, no clicking accordions
- **Faster workflow**: Eliminate one entire page/step
- **Better visual hierarchy**: Cards are more scannable than accordions

### Developer Experience
- **Simpler flow**: One page instead of two
- **Less state management**: No cross-page state coordination
- **Easier maintenance**: Single source of truth for tech stack UI
- **Better component reuse**: Enhanced TechStackCard is more versatile

### Performance
- **Fewer page loads**: No navigation between research and selection
- **Progressive rendering**: Show cards as research completes per category
- **Reduced API calls**: Research + selection happen in same session

## Success Criteria
- [ ] Users can complete tech stack research + selection in one page
- [ ] Pros/cons are visible without interaction
- [ ] Page is visually appealing on all devices
- [ ] No loss of functionality from old flow
- [ ] Performance is equal or better than before
- [ ] All tests pass

## Timeline Estimate
- Phase 1: 4-6 hours (new page + enhanced components)
- Phase 2: 1-2 hours (backend updates)
- Phase 3: 1-2 hours (routing updates)
- Phase 4: 2-3 hours (styling polish)
- Phase 5: 1 hour (cleanup)
- Phase 6: 2-3 hours (testing)

**Total: 11-17 hours**

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cards too tall on mobile | High | Use 1-column grid, optimize spacing |
| Too much info overwhelming | Medium | Group visually, use color coding |
| Research fails mid-flow | Medium | Per-category retry, skip option always available |
| Users miss pros/cons | Low | Use color + icons to draw attention |
| Performance with many cards | Medium | Virtualization if >20 cards per category |

## Open Questions
1. Should we support streaming research results? (show cards as they're researched)
2. Should we allow multi-select per category? (current: single select)
3. Should cards be expandable for very long pros/cons lists?
4. Should we add comparison view (side-by-side cards)?

## Notes
- Keep skip functionality prominent - many users prefer defaults
- Maintain auto-selection countdown behavior (5s to next step)
- Ensure validation is non-blocking for warnings, blocking for errors
- Consider A/B testing old vs new flow before full migration
