# CLAUDE.md

**Purpose**: This file provides persistent, project-level instructions for Claude Code when working in this repository. All guidelines here are version-controlled and shared across the team.

---

## Critical Workflow - Check Before Starting

**ALWAYS** check these directories before implementing any feature or task:

1. **`.claude/skills/`** - Reusable skills for specific actions (e.g., deployment, setup)
2. **`.claude/agents/`** - Specialized agent personas for different domains
3. **`.claude/plans/`** - Pre-built implementation plans for features

**Pattern**: Skills → Agents → Plans → Custom Implementation

If a relevant skill, agent, or plan exists, use it. Otherwise, proceed with standard implementation.

## Common Commands

### Development & Testing
```bash
npm run dev          # Start Next.js + Convex dev servers (http://localhost:3000)
npm test             # Run test suite (maintain >80% coverage)
npm run build        # Production build
npm run lint         # Run ESLint checks
```

### Convex Backend
```bash
npx convex dev       # Start Convex dev server (auto-runs with npm run dev)
npx convex deploy    # Deploy to production
```

**Before committing**: Always run tests and ensure build succeeds.

## Tech Stack & Architecture

**Full-stack TypeScript application** with real-time capabilities:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | React framework, file-based routing in `/app` |
| Styling | Tailwind CSS 4 + shadcn/ui | Dark theme, component library |
| Auth | Clerk | User authentication via `ClerkProvider` |
| Backend | Convex | Real-time database, type-safe queries/mutations |
| Language | TypeScript (strict mode) | Type safety across stack |

### Key Integration Points
- **Auth Flow**: Clerk → JWT → Convex (via `ConvexProviderWithClerk`)
- **Database**: Schema in `convex/schema.ts`, functions in `convex/`
- **Route Protection**: `middleware.ts` protects routes using Clerk
- **Path Aliases**: `@/*` maps to project root

### Clerk + Convex Setup
1. Create JWT template named "convex" in Clerk dashboard
2. Set `CLERK_JWT_ISSUER_DOMAIN` in Convex dashboard
3. Configure in `convex/auth.config.ts`

## Project Structure

```
/app                    # Next.js App Router pages
  /(auth)               # Public authentication pages
  /(protected)          # Protected routes (require auth)
/components             # React components, UI elements
/convex                 # Backend (schema.ts, mutations, queries, actions)
/public                 # Static assets
/.claude                # Claude Code configuration
  /agents               # Specialized agent personas
  /commands             # Custom slash commands
  /plans                # Feature implementation plans
  /skills               # Reusable automation skills
/docs                   # **ALL project documentation goes here**
  scratchpad.md         # Critical decisions & implementation notes
middleware.ts           # Route protection (Clerk)
```

### Documentation Rules
- **Never create `.md` files in project root** (except README.md)
- **All documentation → `/docs`** (guides, specs, notes)
- **`/docs/scratchpad.md`** → Critical decisions, patterns, future context
- **`.claude/` files** → Follow their own structure (agents, plans, skills, commands)

## Code Style & Standards

### TypeScript
- ✅ **Strict mode enabled** - All code must pass TypeScript strict checks
- ✅ **Type safety** - No `any` types; use proper interfaces/types
- ✅ **Path aliases** - Use `@/*` for imports (e.g., `@/components/Button`)

### React & Next.js
- ✅ **Functional components** - Prefer function components over class components
- ✅ **Server/Client separation** - Mark client components with `"use client"`
- ✅ **Hooks** - Use `useQuery`, `useMutation`, `useAction` for Convex integration
- ✅ **Modular code** - Break large pages into smaller components (<200 lines per file)

### Styling
- ✅ **Tailwind CSS 4** - Use utility classes, custom dark theme variables
- ✅ **shadcn/ui** - Prefer pre-built components for consistency
- ✅ **Mobile-first** - Responsive design with mobile breakpoints

### Security
- ✅ **No vulnerabilities** - Prevent XSS, SQL injection, command injection (OWASP Top 10)
- ✅ **Row-level security** - Filter user data at database level in Convex
- ✅ **Protected routes** - Use `middleware.ts` for authentication checks
- ✅ **No secrets in code** - API keys go in `.env.local`, never committed

### Testing & Quality
- ✅ **>80% coverage** - Maintain test coverage above 80%
- ✅ **ESLint clean** - No linting errors before commit
- ✅ **Build succeeds** - `npm run build` must pass before deploying

## Development Conventions

### Convex Backend
**CRITICAL**: Always follow `convexGuidelines.md` for Convex development:
- Function syntax (queries, mutations, actions, internal)
- Validators and type safety
- Schema definitions and indexes
- File storage, scheduling, cron jobs
- Performance optimization

**Never deviate** from these patterns without explicit approval.

### API Keys & Environment Variables
1. Ask user for API key
2. Add to `.env.local` yourself (create file if needed)
3. Never ask user to manually edit environment files

### Implementation Workflow

**UI-First Approach**:
1. Build complete UI (layout, styling, all elements)
2. Match existing design patterns unless stated otherwise
3. Add functionality (business logic, state, backend)

**Modular Code**:
- Break large files into focused components (<200 lines)
- Extract reusable UI elements
- Delegate logic to components and hooks
- Saves tokens and improves maintainability

---

## Quick Reference

| Need | Check First | Action |
|------|-------------|--------|
| New feature | `.claude/plans/` | Use existing plan if available |
| Specific task | `.claude/skills/` | Invoke skill for automation |
| Domain expertise | `.claude/agents/` | Use specialized agent |
| Convex code | `convexGuidelines.md` | Follow all patterns |
| Documentation | `/docs` | Create/update markdown there |
| API integration | User request | Get API key, add to `.env.local` |

**Testing checklist before commit**:
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (>80% coverage)
- [ ] `npm run lint` clean
- [ ] No security vulnerabilities introduced