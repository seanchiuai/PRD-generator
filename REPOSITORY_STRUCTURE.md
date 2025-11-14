# PRD Generator Repository Structure

/home/user/PRD-generator/
├── ROOT CONFIGURATION FILES
│   ├── package.json                  [9 scripts: dev, build, lint, etc.]
│   ├── tsconfig.json                [Strict TS config, @/* path alias]
│   ├── next.config.ts              [Next.js 15 configuration]
│   ├── middleware.ts               [Route protection/auth middleware]
│   ├── eslint.config.mjs           [ESLint configuration]
│   ├── postcss.config.mjs          [PostCSS configuration]
│   ├── components.json             [shadcn/ui configuration]
│   ├── .prettierrc                 [Code formatting rules]
│   ├── .prettierignore             [Prettier ignore patterns]
│   ├── .gitignore                  [Git ignore patterns]
│   ├── .tool-versions              [Tool version management]
│   └── package-lock.json           [Dependency lock file]
│
├── DOCUMENTATION (in root)
│   ├── README.md                   [Project overview & setup guide]
│   ├── SETUP.md                    [Detailed setup instructions]
│   ├── CLAUDE.md                   [Development workflow & rules]
│   └── convexGuidelines.md         [Convex backend patterns (37KB)]
│
├── APP/ - Next.js App Router (19 files total)
│   ├── layout.tsx                  [Root layout wrapper]
│   ├── page.tsx                    [Home/landing page]
│   ├── globals.css                 [Global styles]
│   │
│   ├── api/                        [Backend API routes (8 route files)]
│   │   ├── conversation/
│   │   │   ├── message/route.ts                [POST conversation messages]
│   │   │   └── extract-context/route.ts       [Extract context from chat]
│   │   ├── questions/
│   │   │   ├── generate/route.ts              [Generate survey questions]
│   │   │   └── fill-defaults/route.ts         [Fill default answers]
│   │   ├── prd/
│   │   │   └── generate/route.ts              [Generate PRD document]
│   │   ├── research/
│   │   │   └── tech-stack/route.ts            [Research tech stack]
│   │   ├── tech-stack/
│   │   │   └── suggest-defaults/route.ts      [Suggest tech stack defaults]
│   │   └── validate/
│   │       └── tech-stack/route.ts            [Validate tech stack]
│   │
│   ├── dashboard/page.tsx          [Dashboard view]
│   │
│   ├── chat/                       [Conversation workflow pages]
│   │   ├── new/page.tsx                       [Start new conversation]
│   │   └── [conversationId]/
│   │       ├── page.tsx                       [Conversation main]
│   │       ├── questions/page.tsx             [Question answering]
│   │       ├── select/page.tsx                [Tech stack selection]
│   │       ├── research/page.tsx              [Research results]
│   │       └── generate/page.tsx              [PRD generation]
│   │
│   └── prd/
│       └── [prdId]/page.tsx        [View generated PRD]
│
├── COMPONENTS/ - React Components (70 files total)
│   ├── Top-level Providers/Layout (7 files)
│   │   ├── ClientBody.tsx                     [Client wrapper]
│   │   ├── ConvexClientProvider.tsx           [Convex setup]
│   │   ├── StoreUserProvider.tsx              [User context provider]
│   │   ├── app-sidebar.tsx                    [Sidebar navigation]
│   │   ├── site-header.tsx                    [Header component]
│   │   ├── auth-buttons.tsx                   [Auth UI buttons]
│   │   └── nav-*.tsx                          [Navigation sub-components (3 files)]
│   │
│   ├── ui/ - shadcn/ui Components (29 files)
│   │   ├── accordion.tsx, alert.tsx, avatar.tsx, badge.tsx
│   │   ├── button.tsx, card.tsx, checkbox.tsx, drawer.tsx
│   │   ├── dropdown-menu.tsx, input.tsx, label.tsx, progress.tsx
│   │   ├── select.tsx, separator.tsx, sheet.tsx, sidebar.tsx
│   │   ├── skeleton.tsx, sonner.tsx, table.tsx, tabs.tsx
│   │   ├── textarea.tsx, toast.tsx, toaster.tsx, toggle.tsx
│   │   ├── tooltip.tsx, chart.tsx, breadcrumb.tsx, dialog.tsx
│   │   ├── alert-dialog.tsx, toggle-group.tsx
│   │
│   ├── chat/ - Chat Interface (4 files)
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   └── TypingIndicator.tsx
│   │
│   ├── questions/ - Q&A Components (3 files)
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionCategory.tsx
│   │   └── ProgressIndicator.tsx
│   │
│   ├── selection/ - Tech Stack Selection (4 files)
│   │   ├── CategorySection.tsx
│   │   ├── TechStackCard.tsx
│   │   ├── SelectionProgress.tsx
│   │   └── ValidationWarnings.tsx
│   │
│   ├── research/ - Research Display (3 files)
│   │   ├── ResearchProgress.tsx
│   │   ├── ResearchResults.tsx
│   │   └── LoadingSkeleton.tsx
│   │
│   ├── prd/ - PRD Display (2 files)
│   │   ├── PRDDisplay.tsx
│   │   └── GenerationProgress.tsx
│   │
│   ├── dashboard/ - Dashboard Components (4 files)
│   │   ├── PRDCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SearchBar.tsx
│   │   └── SortControls.tsx
│   │
│   ├── export/ - Export Functionality (2 files)
│   │   ├── ExportButtons.tsx
│   │   └── PRDDocument.tsx
│   │
│   ├── techStack/ - Tech Stack (1 file)
│   │   └── DefaultStackPreview.tsx
│   │
│   ├── workflow/ - Workflow UI (5 files)
│   │   ├── WorkflowLayout.tsx
│   │   ├── WorkflowProgress.tsx
│   │   ├── PageTransition.tsx
│   │   ├── AutoAdvance.tsx
│   │   └── SkipButton.tsx
│   │
│   ├── section-cards.tsx
│   ├── data-table.tsx               [Large data table component (807 lines)]
│   ├── nav-documents.tsx
│   └── chart-area-interactive.tsx
│
├── CONVEX/ - Backend (13 files total)
│   ├── schema.ts                   [Database schema (275 lines)]
│   ├── auth.config.ts              [Clerk JWT authentication]
│   ├── conversations.ts            [Conversation functions (380 lines)]
│   ├── prds.ts                     [PRD CRUD operations]
│   ├── users.ts                    [User operations]
│   ├── workflow.ts                 [Workflow state management]
│   ├── README.md                   [Convex backend docs]
│   ├── tsconfig.json               [Convex TypeScript config]
│   └── _generated/                 [Auto-generated Convex types]
│
├── LIB/ - Utilities & Logic (14 files total)
│   ├── parse-ai-json.ts            [JSON parsing utilities]
│   ├── ai-clients.ts               [AI API clients (Anthropic, OpenAI)]
│   ├── utils.ts                    [General utilities]
│   ├── export-utils.ts             [PDF/document export logic]
│   ├── logger.ts                   [Logging utilities]
│   ├── api-error-handler.ts        [Error handling]
│   ├── constants.ts                [App constants]
│   │
│   ├── workflow/
│   │   ├── guards.ts               [Workflow guard logic]
│   │   ├── progress.ts             [Progress tracking]
│   │   └── persistence.ts          [Workflow persistence]
│   │
│   ├── techStack/
│   │   └── defaults.ts             [Default tech stack configs]
│   │
│   └── analytics/
│       ├── techStackEvents.ts       [Tech stack analytics]
│       ├── workflowEvents.ts        [Workflow analytics]
│       └── questionsEvents.ts       [Questions analytics]
│
├── HOOKS/ - Custom React Hooks (3 files)
│   ├── use-toast.ts                [Toast notifications]
│   ├── use-mobile.ts               [Mobile responsive hook]
│   └── use-store-user.ts           [User store hook]
│
├── CONTEXTS/ - React Contexts (1 file)
│   └── WorkflowContext.tsx         [Workflow state context]
│
├── TYPES/ - TypeScript Types (1 file)
│   └── index.ts                    [Shared type definitions (330 lines)]
│
├── DOCS/ - Documentation (6 files)
│   ├── scratchpad.md               [Critical notes]
│   ├── user-workflow-guide.md       [User guide]
│   ├── typescript-errors-audit.md   [TS error tracking]
│   ├── prd-generation-implementation.md  [PRD generation docs]
│   ├── authentication-security.md   [Auth & security notes]
│   └── workflow-orchestration-implementation.md [Workflow docs]
│
├── .CLAUDE/ - Claude Code Metadata (26 files)
│   │
│   ├── agents/ (8 agent specs + 1 default folder)
│   │   ├── default/
│   │   │   ├── agent-clerk.md      [Clerk auth agent]
│   │   │   ├── agent-convex.md     [Convex backend agent]
│   │   │   ├── agent-nextjs.md     [Next.js frontend agent]
│   │   │   └── agent-deployment.md [Deployment agent]
│   │   ├── discovery-skip-agent.md
│   │   ├── discovery-skip-implementor.md
│   │   ├── questions-skip-agent.md
│   │   ├── techstack-skip-agent.md
│   │   ├── question-options-implementor.md
│   │   ├── workflow-orchestration-agent.md
│   │   └── workflow-ui-agent.md
│   │
│   ├── commands/ (6 commands + 1 default folder)
│   │   ├── default/
│   │   │   ├── cook.md             [Implement plans]
│   │   │   └── setup.md            [Initial setup]
│   │   ├── refactor.md             [Code refactoring]
│   │   ├── agents-setup.md         [Setup agents]
│   │   ├── basic-ui-test.md        [UI testing]
│   │   ├── worktree.md             [Git worktree]
│   │   └── push.md                 [Git push]
│   │
│   ├── plans/ (3 implementation plans)
│   │   ├── plan-discovery-skip-button.md
│   │   ├── plan-question-options.md
│   │   └── workflow-transformation.md
│   │   └── .gitkeep
│   │
│   └── skills/ (4 custom skills)
│       ├── agent-creating/SKILL.md
│       ├── skill-creating/SKILL.md
│       ├── researching-features/SKILL.md
│       └── vercel-deploying/SKILL.md
│
├── PUBLIC/ - Static Assets (2 files)
│   ├── convex.svg
│   └── fonts/
│       └── mona-sans.css
│
└── .PLAYWRIGHT-MCP/ - Playwright Integration
    └── [playwright testing configuration]

