# Convex Patterns

## Overview

This project uses Convex as the real-time backend with row-level security enforced through Clerk authentication.

**Key Files:**
- `convex/schema.ts` - Database schema definitions
- `convex/auth.config.ts` - Clerk JWT integration
- `convex/*.ts` - Query and mutation functions

## Schema Patterns

### Table Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tableName: defineTable({
    // Required fields
    userId: v.string(),
    name: v.string(),
    createdAt: v.number(),

    // Optional fields
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // Nested objects
    metadata: v.optional(v.object({
      key: v.string(),
      value: v.string(),
    })),

    // Any type (use sparingly)
    data: v.any(),
  })
  // Indexes for efficient queries
  .index("by_user", ["userId"])
  .index("by_created", ["createdAt"])
  .index("by_user_and_created", ["userId", "createdAt"]),
});
```

### Common Field Types

```typescript
// Primitives
v.string()
v.number()
v.boolean()
v.null()

// Complex types
v.array(v.string())
v.object({ key: v.string(), value: v.number() })
v.optional(v.string())
v.union(v.string(), v.number())

// IDs
v.id("tableName")

// Any (avoid when possible)
v.any()
```

### Index Patterns

```typescript
// Single field index
.index("by_user", ["userId"])

// Composite index
.index("by_user_and_status", ["userId", "status"])

// Index for sorting
.index("by_created", ["createdAt"])
.index("by_user_and_created", ["userId", "createdAt"])
```

**Index Usage:**
- Create index for every field used in queries
- Composite indexes for multi-field queries
- Always include `userId` for row-level security

## Authentication Patterns

### Clerk Integration

**Config** (`convex/auth.config.ts`):

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
};
```

**Required Env Var (Convex Dashboard):**
```
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

### Get Current User

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Not authenticated");
}

const userId = identity.subject; // Clerk user ID
```

## Query Patterns

### Basic Query

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Query with Authentication

```typescript
export const get = query({
  args: { id: v.id("prds") },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // or throw error
    }

    // 2. Get resource
    const prd = await ctx.db.get(args.id);

    // 3. Verify ownership
    if (!prd || prd.userId !== identity.subject) {
      return null;
    }

    return prd;
  },
});
```

### List Query with Filter

```typescript
export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Filter by userId using index
    let results = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) =>
        q.eq("userId", identity.subject)
      )
      .collect();

    // Additional filtering
    if (args.search) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(args.search!.toLowerCase())
      );
    }

    return results;
  },
});
```

### Ordered Query

```typescript
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("conversations")
      .withIndex("by_user_and_created", (q) =>
        q.eq("userId", identity.subject)
      )
      .order("desc") // Most recent first
      .collect();
  },
});
```

### Paginated Query

```typescript
export const paginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .paginate(args.paginationOpts);
  },
});
```

## Mutation Patterns

### Create Mutation

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Create record
    const id = await ctx.db.insert("conversations", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
      messages: [],
      stage: "discovery",
    });

    return id;
  },
});
```

### Update Mutation

```typescript
export const update = mutation({
  args: {
    id: v.id("conversations"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 1. Get existing record
    const existing = await ctx.db.get(args.id);

    // 2. Verify ownership
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // 3. Update
    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});
```

### Delete Mutation

```typescript
export const remove = mutation({
  args: { id: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const prd = await ctx.db.get(args.id);

    if (!prd || prd.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
```

### Complex Mutation (Multiple Updates)

```typescript
export const updateStage = mutation({
  args: {
    conversationId: v.id("conversations"),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 1. Verify ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // 2. Update conversation
    await ctx.db.patch(args.conversationId, {
      stage: args.stage,
      updatedAt: Date.now(),
    });

    // 3. Additional updates (if needed)
    if (args.stage === "completed") {
      await ctx.db.patch(args.conversationId, {
        completedAt: Date.now(),
      });
    }
  },
});
```

## Array Operations

### Append to Array

```typescript
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    message: v.object({
      role: v.string(),
      content: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      messages: [
        ...conversation.messages,
        {
          ...args.message,
          timestamp: Date.now(),
        },
      ],
    });
  },
});
```

### Update Array Item

```typescript
// Replace entire array with updated version
const updatedMessages = conversation.messages.map(msg =>
  msg.id === messageId
    ? { ...msg, read: true }
    : msg
);

await ctx.db.patch(conversationId, {
  messages: updatedMessages,
});
```

## Frontend Usage

### Query Hook

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const prds = useQuery(api.prds.list);

  if (prds === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{prds.map(prd => ...)}</div>;
}
```

### Query with Args

```typescript
const prd = useQuery(api.prds.get, {
  id: prdId as Id<"prds">,
});
```

### Mutation Hook

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CreateButton() {
  const createPRD = useMutation(api.prds.create);

  const handleCreate = async () => {
    try {
      const id = await createPRD({
        name: "My PRD",
        conversationId: convId,
      });
      console.log("Created:", id);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Conditional Query

```typescript
// Only run query if condition is met
const conversation = useQuery(
  conversationId ? api.conversations.get : "skip",
  conversationId ? { id: conversationId } : undefined
);
```

## Security Checklist

### For Every Mutation

- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Check `if (!identity) throw new Error(...)`
- [ ] Get existing record (for updates/deletes)
- [ ] Verify `record.userId === identity.subject`
- [ ] Use `identity.subject` as userId for creates

### For Every Query

- [ ] `await ctx.auth.getUserIdentity()`
- [ ] Return `null` or `[]` if not authenticated
- [ ] Filter by `userId` using index
- [ ] Verify ownership before returning data

### For Every Table

- [ ] Has `userId: v.string()` field
- [ ] Has `.index("by_user", ["userId"])`
- [ ] All mutations verify ownership
- [ ] All queries filter by userId

## Common Patterns from Codebase

### User Storage (convex/users.ts)

```typescript
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    const user = await getUserByClerkId(ctx, identity.subject);

    if (user !== null) {
      await ctx.db.patch(user._id, {
        lastSeenAt: Date.now(),
      });
      return user._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
    });
  },
});
```

### Conversation with Messages

```typescript
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      messages: [
        ...conversation.messages,
        {
          role: args.role,
          content: args.content,
          timestamp: Date.now(),
        },
      ],
    });
  },
});
```

### Stats Query

```typescript
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { total: 0, completed: 0 };
    }

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      total: prds.length,
      completed: prds.filter(p => p.status === "completed").length,
    };
  },
});
```

## Error Handling

### In Mutations

```typescript
try {
  const result = await somethingRisky();
  return result;
} catch (error) {
  console.error("Mutation error:", error);
  throw new Error("Failed to process request");
}
```

### In Frontend

```typescript
const createItem = useMutation(api.items.create);

try {
  await createItem({ name: "Item" });
  toast({ title: "Created successfully" });
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

## Helper Functions

### Internal Helpers (Not Exported)

```typescript
// Helper function used by other functions in same file
async function getUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkId: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

// Use in exported functions
export const current = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await getUserByClerkId(ctx, identity.subject);
  },
});
```

## Type Imports

```typescript
import { Id } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Use Id type for arguments
args: { conversationId: v.id("conversations") }

// In handler, typed as:
args.conversationId // Type: Id<"conversations">
```

## Best Practices

1. **Always filter by userId** in queries
2. **Always verify ownership** in mutations
3. **Use indexes** for efficient queries
4. **Return early** if not authenticated
5. **Use strict types** - avoid `v.any()` when possible
6. **Keep functions focused** - one responsibility each
7. **Use helper functions** for shared logic
8. **Handle errors gracefully**
9. **Log errors** for debugging
10. **Test authentication** for all operations
