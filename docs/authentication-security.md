# Authentication & Security Implementation

## Overview
This document describes the authentication and data security implementation for the PRD Generator application using Clerk and Convex.

## Authentication Stack
- **Clerk**: User authentication provider with JWT tokens
- **Convex**: Real-time database with row-level security
- **Next.js 15**: App Router with protected routes

## Implementation Details

### 1. User Storage

#### Schema (convex/schema.ts)
```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  lastSeenAt: v.number(),
}).index("by_clerk_id", ["clerkId"])
```

#### User Functions (convex/users.ts)
- `store`: Mutation to create/update user on sign-in
- `current`: Query to get current authenticated user
- `getByClerkId`: Query to get user by Clerk ID
- Helper functions for use in other Convex functions

### 2. Client-Side Integration

#### StoreUserProvider
Automatically stores user in Convex database when they authenticate with Clerk.

Location: `components/StoreUserProvider.tsx`

Usage: Wraps app content in `app/layout.tsx`:
```typescript
<ConvexClientProvider>
  <StoreUserProvider>
    {children}
  </StoreUserProvider>
</ConvexClientProvider>
```

#### Hook: useStoreUser
Location: `hooks/use-store-user.ts`

Monitors Clerk authentication state and calls `api.users.store` mutation when user signs in.

### 3. Route Protection

#### Middleware (middleware.ts)
Protected routes: All routes except:
- `/` (home)
- `/sign-in(.*)`
- `/sign-up(.*)`
- `/api/webhooks(.*)`

Unauthenticated users are redirected to Clerk sign-in.

### 4. Row-Level Security

All Convex functions follow security patterns:

#### Mutations Pattern
```typescript
export const exampleMutation = mutation({
  args: { id: v.id("table") },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 2. Get resource
    const resource = await ctx.db.get(args.id);

    // 3. Verify ownership
    if (!resource || resource.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // 4. Perform operation
    await ctx.db.patch(args.id, { /* updates */ });
  },
});
```

#### Queries Pattern
```typescript
export const exampleQuery = query({
  args: {},
  handler: async (ctx) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Filter by user
    return await ctx.db
      .query("table")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
```

### 5. Secure Tables

All user-data tables have proper security:

#### ✅ Users (convex/users.ts)
- Stores user profile data
- Indexed by `clerkId`
- Auto-updates on sign-in

#### ✅ Conversations (convex/conversations.ts)
- Indexed by `userId`
- All operations verify ownership
- Cannot access other users' conversations

#### ✅ PRDs (convex/prds.ts)
- Indexed by `userId`
- All operations verify ownership
- Cannot access other users' PRDs

#### ✅ Todos (convex/todos.ts)
- Indexed by `userId`
- All operations verify ownership
- Cannot access other users' todos

## Security Checklist

### For All Mutations:
- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Check `if (!identity) throw new Error(...)`
- [ ] Verify ownership for updates/deletes
- [ ] Use `identity.subject` as userId

### For All Queries:
- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Return `null` or `[]` if not authenticated
- [ ] Filter by `userId` using indexes
- [ ] Verify ownership before returning data

### For All Tables:
- [ ] Has `userId: v.string()` field
- [ ] Has `.index("by_user", ["userId"])`
- [ ] All mutations verify ownership
- [ ] All queries filter by userId

## Environment Variables

### Required for Clerk
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Required in Convex Dashboard
```env
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

## Clerk Configuration

### JWT Template
1. Go to Clerk Dashboard → JWT Templates
2. Create template named "convex"
3. Select Convex from presets
4. Set issuer to your Clerk domain

## Testing

### Manual Testing Checklist
- [ ] Sign up creates user in Convex `users` table
- [ ] Sign in retrieves existing user
- [ ] `lastSeenAt` updates on each sign-in
- [ ] Protected routes redirect unauthenticated users
- [ ] User A cannot access User B's conversations
- [ ] User A cannot access User B's PRDs
- [ ] User A cannot access User B's todos
- [ ] Sign out clears authentication state

### Security Testing
1. Create User A and User B
2. User A creates a conversation
3. Try to access User A's conversation ID as User B → Should return null
4. Try to delete User A's conversation as User B → Should throw error
5. List conversations as User B → Should only show User B's conversations

## Common Pitfalls Avoided

### ❌ Missing userId Filter
```typescript
// WRONG - returns all users' data
const all = await ctx.db.query("conversations").collect();
```

### ✅ Correct Usage
```typescript
// CORRECT - only returns current user's data
const mine = await ctx.db
  .query("conversations")
  .withIndex("by_user", (q) => q.eq("userId", identity.subject))
  .collect();
```

### ❌ No Ownership Verification
```typescript
// WRONG - anyone can delete any record
await ctx.db.delete(args.id);
```

### ✅ Correct Usage
```typescript
// CORRECT - verify ownership first
const record = await ctx.db.get(args.id);
if (!record || record.userId !== identity.subject) {
  throw new Error("Unauthorized");
}
await ctx.db.delete(args.id);
```

### ❌ Trusting Client Data
```typescript
// WRONG - client could send any userId
args: { userId: v.string() }
```

### ✅ Correct Usage
```typescript
// CORRECT - always use server-side identity
const identity = await ctx.auth.getUserIdentity();
userId: identity.subject
```

## Integration with Features

This authentication system is foundational and integrates with:
- **Chat/Conversations**: All conversations are user-specific
- **PRD Generation**: All PRDs are user-specific
- **Dashboard**: Shows user's own data
- **Todo System**: All todos are user-specific

## Files Modified/Created

### Created:
- `convex/users.ts` - User storage functions
- `hooks/use-store-user.ts` - Client-side user storage hook
- `components/StoreUserProvider.tsx` - Provider component
- `docs/authentication-security.md` - This documentation

### Modified:
- `convex/schema.ts` - Added users table
- `app/layout.tsx` - Added StoreUserProvider
- `middleware.ts` - Updated route protection

### Already Secure:
- `convex/conversations.ts` - Has proper security
- `convex/prds.ts` - Has proper security
- `convex/todos.ts` - Has proper security
- `components/nav-user.tsx` - User UI component
