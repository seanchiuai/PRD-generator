# Comprehensive Refactoring Plan

**Project**: PRD Generator
**Date**: November 16, 2025
**Status**: Awaiting Approval

---

## Executive Summary

This refactoring plan addresses critical maintainability, consistency, and efficiency issues identified across the codebase. The plan is organized into 5 phases, prioritized by impact and risk.

**Key Metrics**:
- 28 `any` type occurrences → 0 (100% type safety)
- 10 components >200 LOC → Extract to smaller modules
- 15+ console.log → Centralized logging
- 3 duplicate type definitions → Consolidated
- 2 stub functions → Properly implemented
- 2,444 lines in 5 oversized files → Modularized

**Estimated Timeline**: 3-4 sprints
**Risk Level**: Medium (with proper testing)

---

## Phase 1: Foundation & Type Safety (CRITICAL - Week 1)

**Priority**: CRITICAL
**Risk**: Low
**Effort**: Low-Medium
**Dependencies**: None

### 1.1 Consolidate Type Definitions

**Problem**: Duplicate interfaces across codebase causing type inconsistencies.

**Files to Modify**:
- ✅ `/types/index.ts` (add missing exports)
- ❌ `/app/api/research/tech-stack/route.ts` (remove duplicate ProductContext)
- ❌ `/app/api/conversation/extract-context/route.ts` (remove ContextData)
- ❌ `/app/api/questions/fill-defaults/route.ts` (remove ExtractedContext)
- ❌ `/app/api/tech-stack/suggest-defaults/route.ts` (add TechStack export)
- ❌ `/app/api/validate/tech-stack/route.ts` (add ValidationResponse export)

**Changes**:
```typescript
// types/index.ts - ADD
export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  // ... complete definition
}

export interface ValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ResearchQuery {
  category: string;
  query: string;
  context: string;
}

// Ensure ProductContext is properly exported (already exists)
// Add ExtractedContext if missing
```

**Testing**: Run type checks: `npm run build`

---

### 1.2 Replace `any` Types with Proper Interfaces

**Files to Fix** (28 occurrences):

**Priority 1 - API Routes**:
- `/app/api/tech-stack/suggest-defaults/route.ts:99` - `getAISuggestedStack(extractedContext: any, answers: any)`
- `/app/api/tech-stack/suggest-defaults/route.ts:157` - `validateDefaultStack(_stack: any)`
- `/app/api/tech-stack/suggest-defaults/route.ts:166` - `fixStackErrors(_stack: any, _errors: any[])`
- `/app/api/research/tech-stack/route.ts:170` - `parseResponse(content: string, _category: string): any[]`

**Changes**:
```typescript
// BEFORE
async function getAISuggestedStack(extractedContext: any, answers: any)

// AFTER
import { ExtractedContext, QuestionAnswer, TechStack } from '@/types';
async function getAISuggestedStack(
  extractedContext: ExtractedContext,
  answers: QuestionAnswer[]
): Promise<TechStack>
```

**Priority 2 - Lib Utilities**:
- `/lib/export-utils.ts` (2 occurrences)
- `/lib/techStack/defaults.ts` (2 occurrences)

**Testing**:
- Run `npm run build` (TypeScript strict checks)
- Run existing tests: `npm test`

---

### 1.3 Replace console.log with Centralized Logger

**Files to Update** (15+ occurrences):

| File | Occurrences | Lines |
|------|-------------|-------|
| `/app/api/research/tech-stack/route.ts` | 15 | 61, 91, 106, 142, 216, 242-244, 261, 356-358, 365 |
| `/app/chat/[conversationId]/research/page.tsx` | 3 | 46, 50, 73 |
| `/app/api/conversation/initial-message/route.ts` | 1+ | TBD |
| `/app/api/questions/generate/route.ts` | 1+ | TBD |
| `/app/api/validate/tech-stack/route.ts` | 1+ | TBD |

**Pattern**:
```typescript
// BEFORE
console.log("Generating research queries for context:", extractedContext);
console.error("Error generating queries:", error);

// AFTER
import { logger } from '@/lib/logger';
logger.info({ extractedContext }, "Generating research queries");
logger.error({ error }, "Failed to generate queries");
```

**Testing**: Verify logs appear correctly during development

---

### 1.4 Implement Stub Functions

**Location**: `/app/api/tech-stack/suggest-defaults/route.ts`

**Function 1 - validateDefaultStack (lines 157-164)**:
```typescript
// BEFORE (stub)
async function validateDefaultStack(_stack: any) {
  return { isValid: true, errors: [], warnings: [] }
}

// AFTER (actual implementation)
async function validateDefaultStack(stack: TechStack): Promise<ValidationResponse> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!stack.frontend?.trim()) errors.push("Frontend framework is required");
  if (!stack.backend?.trim()) errors.push("Backend framework is required");
  if (!stack.database?.trim()) errors.push("Database selection is required");

  // Validate compatibility (basic checks)
  if (stack.frontend === "Next.js" && !stack.backend.includes("Node")) {
    warnings.push("Next.js works best with Node.js backend");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

**Function 2 - fixStackErrors (lines 166-175)**:
```typescript
// BEFORE (hardcoded)
async function fixStackErrors(_stack: any, _errors: any[]) {
  return { frontend: 'Next.js', backend: 'Node.js with Express', ... }
}

// AFTER (actually fixes based on errors)
async function fixStackErrors(
  stack: TechStack,
  errors: string[]
): Promise<TechStack> {
  const fixedStack = { ...stack };

  errors.forEach(error => {
    if (error.includes("Frontend")) {
      fixedStack.frontend = fixedStack.frontend || "Next.js";
    }
    if (error.includes("Backend")) {
      fixedStack.backend = fixedStack.backend || "Node.js with Express";
    }
    if (error.includes("Database")) {
      fixedStack.database = fixedStack.database || "PostgreSQL";
    }
  });

  return fixedStack;
}
```

**Testing**:
- Unit tests for validation logic
- Integration tests for error correction flow

---

## Phase 2: Code Deduplication (HIGH - Week 2)

**Priority**: HIGH
**Risk**: Low
**Effort**: Low

### 2.1 Extract Common Utilities

**Problem**: JSON parsing and timeout logic duplicated across routes.

#### 2.1.1 Create Timeout Utility

**New File**: `/lib/utils/timeout.ts`
```typescript
export interface TimeoutConfig {
  timeoutMs: number;
  onTimeout?: () => void;
}

export function createAbortController(config: TimeoutConfig): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    config.onTimeout?.();
  }, config.timeoutMs);

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId)
  };
}
```

**Usage in Files**:
- `/app/api/research/tech-stack/route.ts` (lines 63-82, 218-239)
- Other API routes with timeout logic

**Before**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
try {
  // ... API call
} finally {
  clearTimeout(timeoutId);
}
```

**After**:
```typescript
import { createAbortController } from '@/lib/utils/timeout';
const { controller, cleanup } = createAbortController({
  timeoutMs: RESEARCH_TIMEOUT_MS
});
try {
  // ... API call
} finally {
  cleanup();
}
```

#### 2.1.2 Consolidate JSON Parsing

**Problem**: Routes duplicate JSON extraction instead of using `/lib/parse-ai-json.ts`

**Files to Update**:
- `/app/api/research/tech-stack/route.ts` (lines 94-103, 173-176)

**Before**:
```typescript
const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
const jsonStr = jsonMatch?.[1] || content;
const parsed = JSON.parse(jsonStr);
```

**After**:
```typescript
import { parseAIJSON } from '@/lib/parse-ai-json';
const parsed = await parseAIJSON<ResearchQuery[]>(content);
```

---

### 2.2 Centralize Constants

**New File**: `/lib/constants/timeouts.ts`
```typescript
// Replace magic numbers across codebase
export const API_TIMEOUTS = {
  RESEARCH_QUERY_GENERATION: 30_000, // 30s
  RESEARCH_QUERY_EXECUTION: 20_000,  // 20s
  PRD_GENERATION: 60_000,            // 60s
  DEFAULT: 15_000                     // 15s
} as const;

export const LIMITS = {
  MAX_RESEARCH_QUERIES: 20,
  MAX_JSON_RESPONSE_SIZE: 50_000, // bytes
  MAX_RETRIES: 3
} as const;
```

**Files to Update**:
- `/app/api/research/tech-stack/route.ts` (lines 65, 220, 133, 114)

---

## Phase 3: Component Extraction (HIGH - Week 3-4)

**Priority**: HIGH
**Risk**: Medium (UI changes require testing)
**Effort**: Medium-High

### 3.1 Break Down Large Components

**Target**: All components >200 LOC per CLAUDE.md

#### 3.1.1 CRITICAL: data-table.tsx (807 lines)

**Current**: `/components/data-table.tsx`

**Extract to**:
```
/components/data-table/
├── DataTable.tsx           (main component, ~100 lines)
├── DataTableHeader.tsx     (header logic, ~80 lines)
├── DataTableToolbar.tsx    (filtering/sorting, ~100 lines)
├── DataTablePagination.tsx (pagination controls, ~60 lines)
├── DataTableRow.tsx        (row rendering, ~80 lines)
├── DataTableColumnHeader.tsx (~60 lines)
├── hooks/
│   ├── useDataTableState.ts   (state management)
│   └── useDataTableFilters.ts (filter logic)
└── types.ts                (local types)
```

**Strategy**:
1. Extract toolbar/header/pagination first (independent)
2. Extract row logic
3. Move state management to custom hooks
4. Keep main component as orchestrator

#### 3.1.2 CRITICAL: sidebar.tsx (726 lines)

**Current**: `/components/ui/sidebar.tsx`

**Extract to**:
```
/components/ui/sidebar/
├── Sidebar.tsx            (main ~100 lines)
├── SidebarHeader.tsx      (~80 lines)
├── SidebarContent.tsx     (~100 lines)
├── SidebarMenu.tsx        (~100 lines)
├── SidebarMenuItem.tsx    (~80 lines)
├── SidebarFooter.tsx      (~60 lines)
├── SidebarProvider.tsx    (context, ~100 lines)
└── types.ts
```

#### 3.1.3 Page Components (305, 302, 304 lines)

**Files**:
- `/app/chat/[conversationId]/research/page.tsx` (305 lines)
- `/app/chat/[conversationId]/select/page.tsx` (302 lines)
- `/app/chat/[conversationId]/page.tsx` (304 lines)

**Strategy for Each**:
1. Extract API orchestration to custom hooks
2. Extract complex JSX sections to sub-components
3. Move business logic to service functions

**Example - research/page.tsx**:
```
/app/chat/[conversationId]/research/
├── page.tsx                 (~150 lines)
├── hooks/
│   └── useResearchFlow.ts  (API orchestration)
└── components/
    ├── ResearchHeader.tsx
    └── ResearchActions.tsx
```

**Testing**:
- Visual regression testing
- Component unit tests
- Integration tests for user flows

---

## Phase 4: Error Handling & Robustness (MEDIUM - Week 5)

**Priority**: MEDIUM
**Risk**: Low
**Effort**: Low-Medium

### 4.1 Fix Silent Failures

**Location**: `/app/api/research/tech-stack/route.ts:321-344`

**Before**:
```typescript
results.forEach((result) => {
  if (result.status === "fulfilled") {
    techStackOptions.push(result.value);
  }
  // ❌ Silently ignores rejected promises
});
```

**After**:
```typescript
const failures: Array<{ category: string; error: Error }> = [];

results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    techStackOptions.push(result.value);
  } else {
    const category = researchQueries[index]?.category || "unknown";
    failures.push({ category, error: result.reason });
    logger.error({ category, error: result.reason }, "Research query failed");
  }
});

// Return partial results with warnings
return NextResponse.json({
  success: true,
  data: techStackOptions,
  warnings: failures.length > 0
    ? [`${failures.length} categories failed to load`]
    : []
});
```

### 4.2 Improve Error Recovery

**Pattern**: Add retry logic for transient failures

**New Utility**: `/lib/utils/retry.ts`
```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, shouldRetry } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const shouldRetryError = shouldRetry?.(error as Error) ?? true;

      if (isLastAttempt || !shouldRetryError) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw new Error("Retry failed");
}
```

---

## Phase 5: Architecture & Patterns (MEDIUM - Week 6)

**Priority**: MEDIUM
**Risk**: Low
**Effort**: Medium

### 5.1 Replace Brittle String Matching

**Location**: `/app/api/questions/fill-defaults/route.ts:113-174`

**Current Problem**: Fragile keyword-based matching
```typescript
if (questionLower.includes("product name")) return extractedContext.productName;
```

**Solution**: Add metadata to question definitions

**Update**: `/lib/prompts/questions.ts`
```typescript
export interface QuestionDefinition {
  id: string;
  question: string;
  category: string;
  contextKey?: keyof ExtractedContext; // NEW
  defaultValue?: string;
}

const QUESTIONS: QuestionDefinition[] = [
  {
    id: "product_name",
    question: "What is the name of your product?",
    category: "Product Overview",
    contextKey: "productName" // Maps directly to context
  },
  // ...
];
```

**Update Route**:
```typescript
function getDefaultAnswer(
  question: QuestionDefinition,
  extractedContext: ExtractedContext
): string | null {
  if (!question.contextKey) return null;
  return extractedContext[question.contextKey] || null;
}
```

### 5.2 Extract API Orchestration to Hooks

**Problem**: Business logic mixed with UI in page components

**Example - research/page.tsx**:

**Create**: `/hooks/useResearchFlow.ts`
```typescript
export function useResearchFlow(conversationId: string) {
  const [status, setStatus] = useState<ResearchStatus>("idle");
  const [results, setResults] = useState<TechStackOption[]>([]);

  const startResearch = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch(`/api/research/tech-stack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId })
      });

      const data = await response.json();
      setResults(data.techStackOptions);
      setStatus("success");
    } catch (error) {
      logger.error({ error }, "Research failed");
      setStatus("error");
    }
  }, [conversationId]);

  return { status, results, startResearch };
}
```

**Update Page**:
```typescript
// BEFORE: ~100 lines of API logic in component

// AFTER: Clean separation
export default function ResearchPage({ params }: PageProps) {
  const { status, results, startResearch } = useResearchFlow(params.conversationId);

  useEffect(() => {
    startResearch();
  }, [startResearch]);

  return <ResearchUI status={status} results={results} />;
}
```

---

## Phase 6: Dependencies & Modernization (LOW - Week 7)

**Priority**: LOW
**Risk**: Medium (breaking changes possible)
**Effort**: Low

### 6.1 Update Dependencies

**Outdated Libraries**:
```json
{
  "next": "15.5.6" → "16.0.3" (major update - review breaking changes),
  "recharts": "2.15.4" → "3.4.1" (major update),
  "@anthropic-ai/sdk": "0.68.0" → "0.69.0" (minor),
  "lucide-react": "0.544.0" → "0.553.0" (patch)
}
```

**Strategy**:
1. ⚠️ Skip Next.js 16 for now (major version, needs separate testing)
2. Update minor/patch versions first
3. Test thoroughly
4. Update recharts (check for breaking changes in chart components)

**Commands**:
```bash
# Safe updates
npm update @anthropic-ai/sdk lucide-react

# Review before updating
npm update recharts  # Major version - test charts
```

### 6.2 Modernize Code Patterns

**Already Good**:
- ✅ Async/await (used consistently)
- ✅ Arrow functions (used in most places)
- ✅ Optional chaining (used)
- ✅ Nullish coalescing (used)

**Minor improvements**:
- Replace remaining `function` declarations with `const` + arrow functions (consistency)
- Use `satisfies` operator where appropriate for better type inference

---

## Testing Strategy

### Unit Tests
- All new utility functions (`timeout.ts`, `retry.ts`)
- Updated validation functions
- Type parsing improvements

### Integration Tests
- API route error handling
- Research flow with failures
- Tech stack validation + correction

### Visual Regression
- All extracted components
- Large component breakdowns

### E2E Tests (Critical Paths)
- Complete PRD generation flow
- Research → Selection → Questions → Generate
- Error recovery scenarios

---

## Risk Mitigation

### High-Risk Changes
1. **data-table.tsx extraction** (807 → ~500 LOC across files)
   - Risk: Breaking table functionality
   - Mitigation: Extract incrementally, test each piece

2. **sidebar.tsx extraction** (726 → ~600 LOC across files)
   - Risk: Breaking navigation
   - Mitigation: Feature flag, parallel implementation

### Medium-Risk Changes
1. **Type system changes** (removing `any`)
   - Risk: TypeScript errors
   - Mitigation: Incremental conversion, build checks

2. **API error handling updates**
   - Risk: Changed error responses
   - Mitigation: Maintain backward compatibility

### Low-Risk Changes
1. **Logging updates** (console → logger)
   - Risk: Minimal
   - Mitigation: Verify logs in dev

2. **Constants extraction**
   - Risk: Minimal
   - Mitigation: No behavior changes

---

## Rollout Plan

### Week 1: Foundation (Phase 1)
- Day 1-2: Type consolidation + `any` removal
- Day 3-4: Logging updates
- Day 5: Implement stub functions + tests

### Week 2: Deduplication (Phase 2)
- Day 1-2: Create utilities (timeout, retry)
- Day 3-4: Update all API routes to use utilities
- Day 5: Constants extraction

### Week 3-4: Components (Phase 3)
- Week 3: Extract data-table.tsx
- Week 4 Day 1-3: Extract sidebar.tsx
- Week 4 Day 4-5: Extract page components

### Week 5: Error Handling (Phase 4)
- Day 1-2: Fix silent failures
- Day 3-5: Add retry logic + tests

### Week 6: Architecture (Phase 5)
- Day 1-2: Replace string matching
- Day 3-5: Extract API orchestration hooks

### Week 7: Dependencies (Phase 6)
- Day 1-2: Update safe dependencies
- Day 3-5: Test + fix any issues

---

## Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| `any` types | 28 | 0 | 100% type safety |
| Files >200 LOC | 10 | 0 | 0 violations |
| Console.log usage | 15+ | 0 | 100% structured logging |
| Duplicate types | 3 | 0 | DRY compliance |
| Test coverage | ~60% | >80% | CLAUDE.md requirement |
| Build warnings | TBD | 0 | Clean build |

---

## Commit Strategy

**Pattern**: Small, atomic commits with clear messages

**Examples**:
```bash
# Phase 1
git commit -m "refactor(types): consolidate ProductContext and ExtractedContext definitions"
git commit -m "refactor(api): replace any types with proper interfaces in tech-stack routes"
git commit -m "refactor(logging): replace console.log with structured logger"
git commit -m "feat(validation): implement validateDefaultStack and fixStackErrors"

# Phase 2
git commit -m "refactor(utils): extract timeout logic to reusable utility"
git commit -m "refactor(api): use centralized JSON parsing utility"
git commit -m "refactor(constants): extract magic numbers to constants file"

# Phase 3
git commit -m "refactor(components): extract DataTableToolbar from data-table.tsx"
git commit -m "refactor(components): extract DataTablePagination from data-table.tsx"
# ... (incremental commits for each extraction)

# Phase 4
git commit -m "fix(api): handle rejected promises in research route"
git commit -m "feat(utils): add retry utility with exponential backoff"

# Phase 5
git commit -m "refactor(questions): replace string matching with metadata-based defaults"
git commit -m "refactor(hooks): extract research API orchestration to useResearchFlow"

# Phase 6
git commit -m "chore(deps): update @anthropic-ai/sdk to 0.69.0"
git commit -m "chore(deps): update lucide-react to 0.553.0"
```

---

## Approval Required

**Questions for Review**:

1. **Priority**: Do you agree with the phase prioritization?
2. **Scope**: Should any phases be excluded or added?
3. **Timeline**: Is 7 weeks acceptable, or should we accelerate?
4. **Risk**: Any concerns about the high-risk changes (data-table, sidebar)?
5. **Testing**: Do you want additional testing beyond unit/integration/E2E?
6. **Dependencies**: Should we update to Next.js 16 or wait?

**Next Steps After Approval**:
1. Create feature branch: `refactor/phase-1-foundation`
2. Begin Phase 1 implementation
3. Daily progress updates
4. PR review after each phase

---

## Notes

- All changes will be committed to the `claude/refactor-codebase-0124PppAbBBienbEVegis3Vk` branch
- Each phase will be a separate set of commits for easy rollback
- Diffs will be provided for all changes
- Risky changes will be flagged for extra review
- Tests will run after each phase before proceeding
