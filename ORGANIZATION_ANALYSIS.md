# Repository Structure Analysis - PRD Generator

## 1. OVERALL ORGANIZATION SUMMARY

The repository is a **PRD (Product Requirements Document) Generator** - a full-stack TypeScript application built with:
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Convex (real-time serverless database)
- **Authentication**: Clerk with JWT integration
- **Language**: TypeScript with strict mode enabled
- **Total Files**: ~153 tracked files (118 TS/TSX files)

### Directory Purpose Overview:
```
FRONTEND LAYER          BACKEND LAYER          INFRASTRUCTURE
app/                    convex/                package.json
components/             lib/                   tsconfig.json
hooks/                  contexts/              middleware.ts
contexts/               types/                 eslint.config.mjs
                                              .claude/ (Claude Code metadata)
```

---

## 2. DIRECTORY-BY-DIRECTORY BREAKDOWN

### ROOT LEVEL
**Location**: `/home/user/PRD-generator/`
**Type**: Configuration, Documentation, and Framework Root

**Configuration Files (11 files)**:
- `package.json` - NPM scripts (dev, build, lint) + dependencies (68 packages)
- `tsconfig.json` - TypeScript strict mode enabled, `@/*` path alias configured
- `next.config.ts` - Next.js 15 configuration
- `middleware.ts` - Route protection and authentication middleware
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS setup
- `components.json` - shadcn/ui component registry
- `.prettierrc` - Code formatting rules
- `.prettierignore` - Prettier ignore patterns
- `.gitignore` - Git ignore rules
- `.tool-versions` - Tool version management (likely for asdf/mise)

**Documentation (4 files)**:
- `README.md` - Project overview and setup guide
- `SETUP.md` - Detailed setup instructions
- `CLAUDE.md` - Development workflow and coding rules
- `convexGuidelines.md` - 37KB Convex backend patterns guide

---

### /app - Next.js App Router (19 files)
**Location**: `/home/user/PRD-generator/app/`
**Type**: Page routes and API endpoints

#### Structure:
```
app/
├── layout.tsx              Root layout wrapper
├── page.tsx               Home/landing page
├── globals.css            Global styles
├── api/                   Backend API routes (8 route.ts files)
│   ├── conversation/
│   ├── questions/
│   ├── prd/
│   ├── research/
│   ├── tech-stack/
│   └── validate/
├── dashboard/             Dashboard page
├── chat/                  Conversation workflow
│   ├── new/              Start conversation
│   └── [conversationId]/ Dynamic conversation routes
│       ├── page.tsx      Main view
│       ├── questions/    Q&A step
│       ├── select/       Tech selection step
│       ├── research/     Research results step
│       └── generate/     PRD generation step
└── prd/                   PRD viewing
    └── [prdId]/page.tsx
```

**API Routes (8 total)**:
1. `POST /api/conversation/message` - Handle user messages
2. `POST /api/conversation/extract-context` - Extract context from chat
3. `POST /api/questions/generate` - Generate survey questions
4. `POST /api/questions/fill-defaults` - Fill default answers
5. `POST /api/prd/generate` - Generate complete PRD
6. `POST /api/research/tech-stack` - Research technology stack
7. `POST /api/tech-stack/suggest-defaults` - Suggest tech defaults
8. `POST /api/validate/tech-stack` - Validate tech stack

---

### /components - React Components (70 files)
**Location**: `/home/user/PRD-generator/components/`
**Type**: Reusable React components organized by feature

#### Subdirectories by Purpose:

| Directory | Files | Purpose |
|-----------|-------|---------|
| `ui/` | 29 | shadcn/ui primitives (button, card, input, select, etc.) |
| `workflow/` | 5 | Workflow UI (layout, progress, transitions, skip buttons) |
| `selection/` | 4 | Tech stack selection UI |
| `dashboard/` | 4 | Dashboard view components (card, search, sort) |
| `chat/` | 4 | Chat interface (container, input, message, typing) |
| `research/` | 3 | Research results display |
| `questions/` | 3 | Question answering UI |
| `prd/` | 2 | PRD display and generation progress |
| `export/` | 2 | PDF/document export functionality |
| `techStack/` | 1 | Tech stack preview |
| **Root** | ~5 | Layout, providers, charts, tables |

#### Large Components (refactor candidates):
- `data-table.tsx` (807 lines) - TanStack data table with sorting/filtering
- `ui/sidebar.tsx` (726 lines) - Sidebar navigation component
- `ui/chart.tsx` (357 lines) - Recharts integration
- `chart-area-interactive.tsx` (291 lines) - Interactive area chart

---

### /convex - Backend Database & Functions (13 files)
**Location**: `/home/user/PRD-generator/convex/`
**Type**: Convex backend schema, functions, and configuration

#### Core Files:
- `schema.ts` (275 lines) - Database schema definition
- `conversations.ts` (380 lines) - Conversation CRUD and queries
- `prds.ts` - PRD document operations
- `users.ts` - User management
- `workflow.ts` - Workflow state management
- `auth.config.ts` - Clerk JWT configuration
- `README.md` - Backend documentation
- `tsconfig.json` - TypeScript config for Convex
- `_generated/` - Auto-generated types from schema

#### Schema Entities (inferred from file structure):
- Conversations
- PRDs
- Users
- Workflow states

---

### /lib - Utilities and Business Logic (14 files)
**Location**: `/home/user/PRD-generator/lib/`
**Type**: Reusable logic, utilities, and helper functions

#### Core Utilities:
- `utils.ts` - General utility functions
- `export-utils.ts` - PDF/document export logic
- `parse-ai-json.ts` - JSON parsing from AI responses
- `ai-clients.ts` - Anthropic & OpenAI client setup
- `logger.ts` - Logging utilities
- `api-error-handler.ts` - API error handling
- `constants.ts` - Application constants

#### Feature-specific Subdirectories:
- `workflow/` - Workflow guards, progress tracking, persistence
- `techStack/` - Default tech stack configurations
- `analytics/` - Event tracking for techStack, workflow, questions

---

### /hooks - Custom React Hooks (3 files)
**Location**: `/home/user/PRD-generator/hooks/`
**Type**: Custom React hooks

- `use-toast.ts` - Toast notification hook
- `use-mobile.ts` - Mobile responsive detection
- `use-store-user.ts` - User state management hook

---

### /contexts - React Context Providers (1 file)
**Location**: `/home/user/PRD-generator/contexts/`
**Type**: Shared state management

- `WorkflowContext.tsx` - Workflow state context (progress, settings, etc.)

---

### /types - TypeScript Type Definitions (1 file)
**Location**: `/home/user/PRD-generator/types/`
**Type**: Shared type definitions

- `index.ts` (330 lines) - Centralized types for conversations, PRDs, workflow, tech stack

---

### /docs - Documentation (6 files)
**Location**: `/home/user/PRD-generator/docs/`
**Type**: Internal documentation and guides

- `scratchpad.md` - Critical implementation notes
- `user-workflow-guide.md` - End-user guide
- `typescript-errors-audit.md` - TypeScript error tracking
- `prd-generation-implementation.md` - PRD generation details
- `authentication-security.md` - Auth flow and security notes
- `workflow-orchestration-implementation.md` - Workflow orchestration details

---

### /.claude - Claude Code Metadata (26 files)
**Location**: `/home/user/PRD-generator/.claude/`
**Type**: Claude Code (Anthropic's AI IDE) metadata

#### agents/ (8 agents + default folder)
Feature-specific agents for implementation:
- `default/` - Stack-specific agents (Clerk, Convex, Next.js, Deployment)
- Feature agents: discovery-skip, questions-skip, techstack-skip, workflow-orchestration, workflow-ui
- Implementor agents: discovery-skip-implementor, question-options-implementor

#### commands/ (6 custom commands)
Custom CLI-like commands for development:
- `cook.md` - Implement plans
- `setup.md` - Initial setup
- `refactor.md` - Code refactoring
- `agents-setup.md` - Setup agents
- `basic-ui-test.md` - UI testing
- `worktree.md` - Git worktree management
- `push.md` - Git push operations

#### plans/ (3 implementation plans)
Feature implementation plans:
- `plan-discovery-skip-button.md`
- `plan-question-options.md`
- `workflow-transformation.md`

#### skills/ (4 custom skills)
Reusable skills for AI agents:
- `agent-creating` - Create new agents
- `skill-creating` - Create new skills
- `researching-features` - Research and implement features
- `vercel-deploying` - Deploy to Vercel

---

### /public - Static Assets (2 files)
**Location**: `/home/user/PRD-generator/public/`
**Type**: Public static files

- `convex.svg` - Convex logo
- `fonts/mona-sans.css` - Custom font stylesheet

---

### /.playwright-mcp - Testing Integration
**Location**: `/home/user/PRD-generator/.playwright-mcp/`
**Type**: Playwright testing configuration for MCP (Multi-modal code platform)

---

## 3. FILE ORGANIZATION PATTERNS

### ✓ STRENGTHS & GOOD PATTERNS

1. **Clear Feature-Based Component Organization**
   - Components grouped by feature (chat/, questions/, selection/, etc.)
   - Each feature folder is self-contained

2. **Proper Separation of Concerns**
   - `/components` for UI
   - `/lib` for business logic
   - `/convex` for backend
   - `/hooks` for custom hooks

3. **Configuration Files Properly Placed**
   - All root-level config files are in root
   - Convex has its own tsconfig
   - Clear purpose for each config file

4. **Documentation Centralized**
   - All docs in `/docs` (except root MD files)
   - CLAUDE.md for development workflow
   - SETUP.md for project setup

5. **API Routes Well-Structured**
   - RESTful hierarchy: `/api/[feature]/[action]/route.ts`
   - Logical grouping by domain (conversation, questions, prd, research)

6. **TypeScript Strict Mode**
   - No `any` types allowed
   - Path alias `@/*` configured for clean imports

---

## 4. ORGANIZATIONAL ISSUES & INCONSISTENCIES

### 🚨 ISSUES FOUND

#### Issue 1: Potential Utility Function Duplication
**Files**: 
- `/home/user/PRD-generator/lib/utils.ts` - General utilities
- `/home/user/PRD-generator/lib/export-utils.ts` - Export-specific utilities

**Problem**: Unclear separation of concerns. What goes in `utils.ts` vs `export-utils.ts`?
**Recommendation**: Either consolidate or clearly document the dividing line between these files.

---

#### Issue 2: Large Component Files (Technical Debt)
**Files** (with line counts):
- `data-table.tsx` - 807 lines
- `ui/sidebar.tsx` - 726 lines
- `ui/chart.tsx` - 357 lines

**Problem**: These components violate the CLAUDE.md rule: "React: Functional, `use client`, Convex hooks, <200 LOC"
**Recommendation**: Break down into smaller, focused sub-components.

---

#### Issue 3: Inconsistent Provider Organization
**Issue**: Multiple provider/wrapper components at different locations:
- `components/ClientBody.tsx`
- `components/ConvexClientProvider.tsx`
- `components/StoreUserProvider.tsx`

**Problem**: No dedicated `/providers` or `/wrappers` directory; unclear hierarchy
**Recommendation**: Either create a dedicated `components/providers/` directory or add clear documentation about provider composition order.

---

#### Issue 4: Missing /utils Subdirectory
**Issue**: Utility functions scattered across `/lib`, with multiple subdirectories:
- `lib/workflow/`
- `lib/techStack/`
- `lib/analytics/`
- Root level: `lib/utils.ts`, `lib/export-utils.ts`, `lib/api-error-handler.ts`, etc.

**Problem**: No clear pattern for when to create subdirectories vs root-level files
**Recommendation**: Establish a rule - either all utilities are in root `/lib`, or subdirectories should follow a consistent pattern (feature vs domain-based).

---

#### Issue 5: Inconsistent Naming Convention in /components
**Examples**:
- Some files use kebab-case: `data-table.tsx`, `auth-buttons.tsx`, `app-sidebar.tsx`, `site-header.tsx`
- Others use PascalCase: `ClientBody.tsx`, `ConvexClientProvider.tsx`, `StoreUserProvider.tsx`, `TypingIndicator.tsx`

**Problem**: Mix of naming conventions for component files
**Recommendation**: Standardize on one convention (typically kebab-case for files, PascalCase for exports).

---

#### Issue 6: Single File in /contexts and /types
**Files**:
- `contexts/WorkflowContext.tsx` - Only 1 file
- `types/index.ts` - All types in single file (330 lines)

**Problem**: Over-engineering for single files, but types file getting too large
**Recommendation**: Either move single context to components/ or create more context files as needed. Consider splitting `types/index.ts` by domain (types/workflow.ts, types/conversation.ts, etc.).

---

#### Issue 7: Missing Layer for Dynamic Routes
**Issue**: Dynamic pages exist in multiple places:
- `app/chat/[conversationId]/page.tsx`
- `app/prd/[prdId]/page.tsx`

**Problem**: No clear pattern for how dynamic pages are structured
**Recommendation**: Consider grouping related dynamic pages or adding documentation on this pattern.

---

#### Issue 8: Documentation Organization
**Issue**: Mixed documentation locations:
- Root level: `README.md`, `SETUP.md`, `CLAUDE.md`
- Subdirectory: `docs/scratchpad.md`, `docs/user-workflow-guide.md`, etc.
- `.claude/` directory: Agent and implementation docs

**Problem**: Unclear what goes where
**Recommendation**: Establish documentation hierarchy: Marketing docs (README) → Dev workflow (CLAUDE.md) → Detailed docs (docs/) → Implementation details (.claude/).

---

#### Issue 9: Missing Export Barrel Files
**Issue**: No `index.ts` or `index.tsx` files found in component directories
**Problem**: Imports likely use full paths (`@/components/chat/ChatMessage`) instead of clean exports (`@/components/chat`)
**Recommendation**: Add barrel exports (index files) in subdirectories for cleaner imports.

---

#### Issue 10: .claude Directory Structure Unclear
**Issue**: Mixed naming in `.claude/agents/`:
- Named agents: `discovery-skip-agent.md`, `workflow-ui-agent.md`
- Implementors: `discovery-skip-implementor.md`, `question-options-implementor.md`
- Generic folder: `default/` with stack-specific agents

**Problem**: Unclear relationship between agents and implementors
**Recommendation**: Document the purpose of each agent type and establish naming conventions.

---

## 5. SUMMARY STATISTICS

| Category | Count | Notes |
|----------|-------|-------|
| Total TypeScript/TSX Files | 118 | Excludes node_modules, .git |
| Components | 70 | Includes 29 shadcn/ui primitives |
| Pages/Routes | 10 | 1 home + 1 dashboard + 6 chat pages + 1 prd page |
| API Routes | 8 | RESTful endpoints for features |
| Convex Functions | 5 | Schema, conversations, prds, users, workflow |
| Configuration Files | 11 | Package, TS, Next, ESLint, etc. |
| Documentation Files | 10 | README, SETUP, docs/, .claude/ |
| Hooks | 3 | Custom React hooks |
| Contexts | 1 | WorkflowContext |
| Types | 1 file | (330 lines, may need splitting) |
| **Total Lines of Code** | ~13,084 | TypeScript/TSX only |
| **Largest Component** | 807 lines | data-table.tsx |

---

## 6. RECOMMENDATIONS FOR IMPROVEMENT

### Priority 1 - CRITICAL
1. **Break down large components** (data-table, sidebar, chart) to <200 LOC
2. **Clarify utils separation** (utils.ts vs export-utils.ts)
3. **Standardize naming** (kebab-case for files)

### Priority 2 - HIGH
4. **Create provider directory** or document provider composition
5. **Add barrel exports** (index files in component subdirectories)
6. **Split types/index.ts** by domain (200+ lines is too much)

### Priority 3 - MEDIUM
7. **Document .claude/ structure** clearly
8. **Establish lib/ organization rules**
9. **Create feature-specific docs** (less cluttering root docs/)

### Priority 4 - NICE-TO-HAVE
10. **Add README files** to major directories explaining contents
11. **Create ARCHITECTURE.md** documenting overall structure
12. **Consider feature-based folder structure** (optional, current works fine)

---

## 7. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│              PUBLIC / BROWSER                        │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────┐
│          NEXT.JS APP ROUTER (Frontend)              │
│  /app - Pages & API Routes                          │
│  /components - UI Components (70 files)             │
│  /contexts, /hooks - State & Logic                  │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ JWT Auth
                        ▼
┌─────────────────────────────────────────────────────┐
│              CLERK AUTHENTICATION                    │
│  JWT Token Creation & Validation                    │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ Convex Client
                        ▼
┌─────────────────────────────────────────────────────┐
│         CONVEX BACKEND (Database & Functions)       │
│  /convex - Schema, Functions, Auth Config           │
│  Real-time sync with frontend                       │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ Server-side
                        ▼
┌─────────────────────────────────────────────────────┐
│          EXTERNAL AI APIS                           │
│  Anthropic Claude, OpenAI                           │
└─────────────────────────────────────────────────────┘
```

---

## 8. KEY FILES BY RESPONSIBILITY

### Authentication & Security
- `middleware.ts` - Route protection
- `convex/auth.config.ts` - JWT configuration
- `components/ConvexClientProvider.tsx` - Client setup
- `docs/authentication-security.md` - Security notes

### Database & State
- `convex/schema.ts` - Database schema
- `convex/conversations.ts` - Conversation logic
- `types/index.ts` - Type definitions
- `contexts/WorkflowContext.tsx` - Workflow state

### AI Integration
- `lib/ai-clients.ts` - Anthropic/OpenAI setup
- `lib/parse-ai-json.ts` - JSON parsing
- API routes in `/app/api/`

### UI/UX
- `components/workflow/` - Workflow progression
- `components/chat/` - Conversation UI
- `components/questions/` - Q&A UI
- `components/ui/` - Base components

---

## CONCLUSION

**Overall Assessment**: The repository has a **well-organized structure** with clear separation of concerns following Next.js and React best practices. However, there are some **technical debt issues** (large components) and **naming inconsistencies** that should be addressed during the next refactoring cycle.

**Compliance with CLAUDE.md**: 
- ✓ Follows structure guidelines
- ✓ Uses @/* imports
- ✗ Some components exceed 200 LOC limit
- ✓ TypeScript strict mode enabled
- ✓ Proper layer separation (UI, logic, backend)

