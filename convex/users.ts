import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Store or update user in database when they sign in
 * This is called automatically from the client side when user authenticates
 */
export const store = mutation({
  args: {},
  handler: async (ctx): Promise<Id<"users">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Update last seen time and name/email if changed
      await ctx.db.patch(existing._id, {
        lastSeenAt: Date.now(),
        name: identity.name,
        email: identity.email ?? existing.email,
        imageUrl: identity.pictureUrl || existing.imageUrl,
      });
      return existing._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? undefined,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
    });
  },
});

/**
 * Get current authenticated user
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Get user by Clerk ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Only allow users to query their own data
    if (identity.subject !== args.clerkId) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Helper function to get current user (for use in other Convex functions)
 */
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/**
 * Helper function to get current user ID (for use in other Convex functions)
 */
export async function getCurrentUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const user = await getCurrentUser(ctx);
  return user?._id || null;
}
