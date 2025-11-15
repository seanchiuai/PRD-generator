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
`/app/(auth|protected)` `/components` `/convex` `/docs` (all docs here, `scratchpad.md` for critical notes) `/.claude`

## Rules
**TS:** Strict, no `any`, `@/*` imports | **React:** Functional, `"use client"`, Convex hooks, <200 LOC | **Style:** Tailwind, mobile-first | **Security:** OWASP Top 10, row-level filter, secrets in `.env.local` | **Quality:** >80% coverage, lint clean, build pass

**Convex:** Follow `convexGuidelines.md` exactly | **Env:** Get key from user → add to `.env.local` | **Impl:** UI first → functionality. Modular code.

**Pre-commit:** Build + tests + lint, >80% coverage, no vulnerabilities