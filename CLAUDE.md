# CLAUDE.md

## Workflow
Check `.claude/skills/` → `.claude/agents/` → `.claude/plans/` first.

**Agents:** clerk (auth), convex (backend), deployment (EAS), nextjs (frontend)

**CodeRabbit:** After writing code, run `coderabbit review --plain` from repo root for detailed analysis and suggestions. Apply feedback iteratively for quality improvements.

## Stack & Patterns
Next.js 15 • Tailwind 4 + shadcn/ui • Clerk → JWT → Convex • TypeScript strict • `@/*` imports

Auth: `ConvexProviderWithClerk` | Schema: `convex/schema.ts` | Protection: `middleware.ts`

**Clerk+Convex:** Create "convex" JWT in Clerk → set `CLERK_JWT_ISSUER_DOMAIN` → config `convex/auth.config.ts`

## Structure
`/app/(auth|protected)` `/components` `/convex` `/docs` (all docs here, `CHANGELOG.md` for critical notes) `/.claude`

## Reference Docs (Read for Specific Tasks)

**Creating/modifying pages or routes:**
- Read `docs/frontend-architecture.md` - App Router structure, routing patterns, file locations

**Creating/modifying components:**
- Read `docs/component-patterns.md` - Component structure, props, hooks, patterns
- Read `docs/icon-usage.md` - Icon selection, sizing, colors from lucide-react

**Styling components:**
- Read `docs/styling-guide.md` - Tailwind 4 colors, spacing, animations, responsive patterns

**Convex queries/mutations:**
- Read `docs/convex-patterns.md` - Schema, auth, queries, mutations, security patterns

**Creating/modifying API routes:**
- Read `docs/api-routes-guide.md` - Route structure, AI integration, validation, error handling

**Managing state:**
- Read `docs/state-management.md` - Local state, Convex, Context, localStorage patterns

**TypeScript types/interfaces:**
- Read `docs/type-definitions.md` - Type patterns, interfaces, generics, Convex types

## Rules
**TS:** Strict, no `any`, `@/*` imports | **React:** Functional, `"use client"`, Convex hooks, <200 LOC | **Style:** Tailwind, mobile-first | **Security:** OWASP Top 10, row-level filter, secrets in `.env.local` | **Quality:** >80% coverage, lint clean, build pass

**Convex:** Follow `docs/convex-patterns.md` exactly | **Env:** Get key from user → add to `.env.local` | **Impl:** UI first → functionality. Modular code.

**Pre-commit:** Build + tests + lint, >80% coverage, no vulnerabilities

## Important Notes
- Never add backwards compatibility
- Always sacrifise grammar for the sake of conciseness in your responses
- Always constantly commit changes when the user confirms task is completed. Always ask user for confirmation to commit after task it complete.