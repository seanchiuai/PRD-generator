# Repository Restructuring Plan

## Executive Summary
This plan restructures the PRD Generator repository to follow Next.js 15, Clerk+Convex, and shadcn/ui best practices for 2025, ensuring better organization, maintainability, and scalability.

## Current Issues Identified
1. ❌ No `src/` directory (Next.js 15 best practice)
2. ❌ Large components violating <200 LOC rule
3. ❌ Inconsistent naming (kebab-case vs PascalCase)
4. ❌ Missing barrel exports (index.ts files)
5. ❌ Types file too large (330 lines)
6. ❌ Unclear provider organization
7. ❌ Utility function separation unclear
8. ❌ No clear lib/ organization pattern

## Proposed New Structure

```
PRD-generator/
├── src/                          [NEW] - All source code
│   ├── app/                      [MOVED] - Next.js App Router
│   │   ├── (auth)/               [NEW] - Auth route group
│   │   │   └── sign-in/
│   │   ├── (protected)/          [NEW] - Protected route group
│   │   │   ├── dashboard/
│   │   │   ├── chat/
│   │   │   └── prd/
│   │   ├── api/                  [KEPT] - API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/               [MOVED & REORGANIZED]
│   │   ├── providers/            [NEW] - All React providers
│   │   │   ├── index.ts
│   │   │   ├── convex-client-provider.tsx
│   │   │   ├── store-user-provider.tsx
│   │   │   └── client-body.tsx
│   │   │
│   │   ├── layout/               [NEW] - Layout components
│   │   │   ├── index.ts
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── site-header.tsx
│   │   │   └── nav-*.tsx
│   │   │
│   │   ├── ui/                   [KEPT] - shadcn/ui primitives
│   │   │   ├── index.ts          [NEW]
│   │   │   └── [29 component files]
│   │   │
│   │   ├── features/             [NEW] - Feature components
│   │   │   ├── chat/
│   │   │   │   ├── index.ts
│   │   │   │   ├── chat-container.tsx
│   │   │   │   ├── chat-input.tsx
│   │   │   │   ├── chat-message.tsx
│   │   │   │   └── typing-indicator.tsx
│   │   │   │
│   │   │   ├── questions/
│   │   │   │   ├── index.ts
│   │   │   │   └── [3 components]
│   │   │   │
│   │   │   ├── selection/
│   │   │   │   ├── index.ts
│   │   │   │   └── [4 components]
│   │   │   │
│   │   │   ├── research/
│   │   │   │   ├── index.ts
│   │   │   │   └── [3 components]
│   │   │   │
│   │   │   ├── prd/
│   │   │   │   ├── index.ts
│   │   │   │   └── [2 components]
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── index.ts
│   │   │   │   ├── prd-card.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── search-bar.tsx
│   │   │   │   └── sort-controls.tsx
│   │   │   │
│   │   │   ├── export/
│   │   │   │   ├── index.ts
│   │   │   │   └── [2 components]
│   │   │   │
│   │   │   ├── workflow/
│   │   │   │   ├── index.ts
│   │   │   │   └── [5 components]
│   │   │   │
│   │   │   └── tech-stack/
│   │   │       ├── index.ts
│   │   │       └── default-stack-preview.tsx
│   │   │
│   │   ├── shared/               [NEW] - Shared/common components
│   │   │   ├── index.ts
│   │   │   ├── data-table.tsx
│   │   │   └── section-cards.tsx
│   │   │
│   │   └── charts/               [NEW] - Chart components
│   │       ├── index.ts
│   │       └── chart-area-interactive.tsx
│   │
│   ├── lib/                      [MOVED & REORGANIZED]
│   │   ├── utils/                [NEW] - Utility functions
│   │   │   ├── index.ts
│   │   │   ├── cn.ts             [Class name utilities]
│   │   │   ├── formatting.ts     [Format helpers]
│   │   │   └── validation.ts     [Validation helpers]
│   │   │
│   │   ├── ai/                   [NEW] - AI-related utilities
│   │   │   ├── index.ts
│   │   │   ├── clients.ts
│   │   │   └── parse-json.ts
│   │   │
│   │   ├── export/               [NEW] - Export functionality
│   │   │   ├── index.ts
│   │   │   ├── pdf.ts
│   │   │   └── markdown.ts
│   │   │
│   │   ├── workflow/             [KEPT] - Workflow utilities
│   │   │   ├── index.ts
│   │   │   ├── guards.ts
│   │   │   ├── progress.ts
│   │   │   └── persistence.ts
│   │   │
│   │   ├── tech-stack/           [RENAMED] - Tech stack utilities
│   │   │   ├── index.ts
│   │   │   └── defaults.ts
│   │   │
│   │   ├── analytics/            [KEPT] - Analytics utilities
│   │   │   ├── index.ts
│   │   │   ├── tech-stack-events.ts
│   │   │   ├── workflow-events.ts
│   │   │   └── questions-events.ts
│   │   │
│   │   ├── api/                  [NEW] - API utilities
│   │   │   ├── index.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   ├── logger.ts             [KEPT]
│   │   └── constants.ts          [KEPT]
│   │
│   ├── hooks/                    [MOVED]
│   │   ├── index.ts              [NEW]
│   │   ├── use-toast.ts
│   │   ├── use-mobile.ts
│   │   └── use-store-user.ts
│   │
│   ├── contexts/                 [MOVED]
│   │   ├── index.ts              [NEW]
│   │   └── workflow-context.tsx
│   │
│   ├── types/                    [MOVED & SPLIT]
│   │   ├── index.ts              [Exports all types]
│   │   ├── conversation.ts       [Conversation types]
│   │   ├── prd.ts                [PRD types]
│   │   ├── workflow.ts           [Workflow types]
│   │   ├── tech-stack.ts         [Tech stack types]
│   │   ├── question.ts           [Question types]
│   │   └── user.ts               [User types]
│   │
│   └── middleware.ts             [MOVED]
│
├── convex/                       [KEPT] - Backend stays at root
│   └── [all convex files]
│
├── public/                       [KEPT]
├── docs/                         [KEPT]
├── .claude/                      [KEPT]
├── .playwright-mcp/              [KEPT]
│
└── [Root config files]           [KEPT]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── components.json
    ├── README.md
    ├── SETUP.md
    ├── CLAUDE.md
    └── convexGuidelines.md
```

## Key Changes Explained

### 1. Introduction of `src/` Directory ✨
**Why**: Next.js 15 best practice for cleaner separation between source code and configuration.

**Benefits**:
- Clear separation between app code and config files
- Cleaner root directory
- Industry standard structure
- Better for monorepos (future-proofing)

### 2. Route Groups in App Router 🛣️
**New Structure**:
- `(auth)/` - Authentication pages (sign-in, sign-up)
- `(protected)/` - Protected pages requiring authentication

**Why**: Next.js App Router best practice for logical grouping without affecting URLs.

### 3. Component Reorganization 🧩

#### providers/
All React providers in one place with clear composition order.

#### layout/
Layout-related components (header, sidebar, navigation).

#### features/
Domain-specific feature components organized by feature area.

#### shared/
Truly shared components used across multiple features.

#### charts/
Chart-specific components separated for clarity.

### 4. Library (lib/) Reorganization 📚

Clear separation by domain:
- `utils/` - Pure utility functions
- `ai/` - AI client and parsing
- `export/` - Export functionality
- `api/` - API utilities
- `workflow/`, `tech-stack/`, `analytics/` - Feature-specific

### 5. Type Definitions Split 📝

Split from single 330-line file into domain-specific files:
- `conversation.ts` - Conversation and message types
- `prd.ts` - PRD document types
- `workflow.ts` - Workflow and progress types
- `tech-stack.ts` - Technology stack types
- `question.ts` - Question and answer types
- `user.ts` - User profile types

Central `index.ts` exports all types for easy importing.

### 6. Barrel Exports (index.ts) 📦

Every subdirectory gets an `index.ts` for clean imports:

**Before**:
```typescript
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatMessage } from '@/components/chat/ChatMessage'
```

**After**:
```typescript
import { ChatContainer, ChatInput, ChatMessage } from '@/components/features/chat'
```

### 7. File Naming Standardization 📛

**Standardize on kebab-case for all files**:
- `ClientBody.tsx` → `client-body.tsx`
- `ConvexClientProvider.tsx` → `convex-client-provider.tsx`
- `StoreUserProvider.tsx` → `store-user-provider.tsx`
- etc.

**Component exports remain PascalCase**:
```typescript
// file: client-body.tsx
export function ClientBody() { ... }
```

## Migration Impact Assessment

### Low Impact (Easy)
✅ Moving files into `src/` directory
✅ Renaming files to kebab-case
✅ Adding barrel exports
✅ Splitting types files

### Medium Impact (Requires Updates)
⚠️ Updating all import paths
⚠️ Updating tsconfig.json paths
⚠️ Updating next.config.ts
⚠️ Testing all pages and components

### High Impact (Future Work)
🔄 Breaking down large components (>200 LOC)
🔄 Refactoring data-table.tsx (807 lines)
🔄 Refactoring ui/sidebar.tsx (726 lines)

## Implementation Strategy

### Phase 1: Structure Setup ✅
1. Create `src/` directory
2. Create all new subdirectories
3. Create all barrel export files (index.ts)

### Phase 2: Move & Rename 📦
1. Move `app/` → `src/app/`
2. Move `components/` → `src/components/`
3. Move `lib/` → `src/lib/`
4. Move `hooks/` → `src/hooks/`
5. Move `contexts/` → `src/contexts/`
6. Move `types/` → `src/types/`
7. Move `middleware.ts` → `src/middleware.ts`
8. Rename all files to kebab-case

### Phase 3: Reorganize 🔄
1. Organize components into providers/, layout/, features/, shared/, charts/
2. Organize lib/ into utils/, ai/, export/, api/, etc.
3. Split types/index.ts into domain files

### Phase 4: Update Imports 🔧
1. Update all TypeScript imports
2. Update barrel exports
3. Update configuration files

### Phase 5: Test & Verify ✅
1. Run `npm run build`
2. Run `npm run lint`
3. Test all pages manually
4. Fix any broken imports

## Configuration Updates Required

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### next.config.ts
No changes required - Next.js automatically detects `src/` directory.

### components.json (shadcn/ui)
```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Benefits of This Restructuring

### 1. Clarity & Organization 🎯
- Clear separation of concerns
- Logical grouping by domain
- Easier to find files

### 2. Scalability 📈
- Easy to add new features
- Clear patterns to follow
- Room for growth

### 3. Maintainability 🔧
- Consistent naming conventions
- Clean imports via barrel exports
- Smaller, focused files

### 4. Best Practices ✨
- Follows Next.js 15 conventions
- Matches Clerk+Convex patterns
- Aligns with shadcn/ui structure

### 5. Developer Experience 💻
- Easier onboarding for new developers
- Predictable file locations
- Better IDE support

## Testing Checklist

After restructuring, verify:

- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] All pages load correctly
- [ ] Authentication works (Clerk)
- [ ] Database operations work (Convex)
- [ ] API routes respond correctly
- [ ] Chat workflow functions
- [ ] Question answering works
- [ ] Tech stack selection works
- [ ] PRD generation works
- [ ] Export functionality works
- [ ] No console errors in browser
- [ ] TypeScript has no errors

## Rollback Plan

If issues arise:
1. Git checkout previous commit
2. Branch: `claude/refactor-repo-structure-01HUcaQLyhJfQ1xvRSgN7MVe` has history
3. Can revert specific changes file by file

## Timeline Estimate

- Phase 1 (Setup): 10 minutes
- Phase 2 (Move & Rename): 20 minutes
- Phase 3 (Reorganize): 30 minutes
- Phase 4 (Update Imports): 40 minutes
- Phase 5 (Test & Verify): 20 minutes

**Total: ~2 hours**

## Success Criteria

✅ All files moved to `src/` directory
✅ All files renamed to kebab-case
✅ All subdirectories have barrel exports
✅ Types split into domain files
✅ Components organized by category
✅ Library organized by domain
✅ Build succeeds without errors
✅ All imports updated and working
✅ All pages render correctly
✅ All features function as before

## Notes

- `convex/` directory stays at root (Convex requirement)
- Documentation directories stay at root
- `.claude/` directory stays at root
- Configuration files stay at root
- Only source code moves to `src/`

---

**Status**: Ready for implementation
**Approval**: Pending user confirmation
