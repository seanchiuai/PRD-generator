# Implementation Plan: User Authentication & PRD Storage

## Overview
Ensure proper user authentication with Clerk and implement secure, user-specific PRD storage in Convex with row-level security. This is a foundational feature.

## Tech Stack
- **Authentication**: Clerk (already configured)
- **Database**: Convex with row-level security
- **Frontend**: Next.js 15 + React + TypeScript

---

## Phase 1: Verify Clerk Setup

### Environment Variables
Verify `.env.local` contains:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Clerk Provider Setup
**File**: `app/layout.tsx`
```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

---

## Phase 2: Convex Auth Configuration

### Auth Config
**File**: `convex/auth.config.ts`
```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

### Convex Environment Variable
Add to Convex Dashboard → Settings → Environment Variables:
```
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

### Clerk JWT Template
1. Go to Clerk Dashboard → JWT Templates
2. Create new template named "convex"
3. Select Convex from the list
4. Set issuer to your Clerk domain

---

## Phase 3: User Storage Schema

### Users Table
**File**: `convex/schema.ts`
```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  lastSeenAt: v.number(),
}).index("by_clerk_id", ["clerkId"]),
```

### User Functions
**File**: `convex/users.ts`
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
```

---

## Phase 4: Client-Side User Store

### useStoreUser Hook
**File**: `hooks/use-store-user.ts`
```typescript
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (user) storeUser();
  }, [user, storeUser]);
}
```

### Provider Component
**File**: `components/StoreUserProvider.tsx`
```typescript
"use client";
import { useStoreUser } from "@/hooks/use-store-user";
import { ReactNode } from "react";

export function StoreUserProvider({ children }: { children: ReactNode }) {
  useStoreUser();
  return <>{children}</>;
}
```

Add to `app/layout.tsx`:
```typescript
<ConvexClientProvider>
  <StoreUserProvider>{children}</StoreUserProvider>
</ConvexClientProvider>
```

---

## Phase 5: Row-Level Security

### Security Pattern for Mutations
```typescript
export const exampleMutation = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const record = await ctx.db.get(args.recordId);
    if (!record || record.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.recordId, { /* updates */ });
  },
});
```

### Security Pattern for Queries
```typescript
export const exampleQuery = query({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("tableName")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
```

---

## Phase 6: Route Protection

### Middleware
**File**: `middleware.ts`
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

## Security Checklist

Apply to ALL Convex functions:

### Mutations
- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Check `if (!identity) throw new Error(...)`
- [ ] Verify ownership for updates/deletes
- [ ] Use `identity.subject` as userId

### Queries
- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Return `null` or `[]` if not authenticated
- [ ] Filter by `userId` using indexes
- [ ] Verify ownership before returning data

### API Routes
- [ ] `await auth()` from Clerk
- [ ] Check `if (!userId) return 401`
- [ ] Validate all inputs
- [ ] Never trust client-provided userId

---

## Common Pitfalls to Avoid

### 1. Missing userId Filter
❌ Don't: `const all = await ctx.db.query("conversations").collect();`
✅ Do: `.withIndex("by_user", (q) => q.eq("userId", identity.subject))`

### 2. No Ownership Verification
❌ Don't: `await ctx.db.patch(args.id, { /* updates */ });`
✅ Do: Verify ownership first

### 3. Trusting Client Data
❌ Don't: Accept userId from client
✅ Do: Always use `identity.subject`

---

## Testing Checklist

- [ ] Sign up creates user in Convex
- [ ] Sign in retrieves existing user
- [ ] Protected routes redirect unauthenticated users
- [ ] User A cannot access User B's data
- [ ] All mutations verify ownership
- [ ] All queries filter by userId

---

## Integration Points

This is foundational and connects to:
- **All Features** - Every feature depends on authentication
- **Clerk** - User authentication provider
- **Convex** - Secure data storage
- **Middleware** - Route protection
