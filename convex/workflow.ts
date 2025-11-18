import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

/**
 * Get default workflow progress state
 */
function getDefaultProgress() {
  return {
    currentStep: "questions" as const,
    completedSteps: [],
    skippedSteps: [],
    lastUpdated: Date.now(),
  }
}

/**
 * Validate conversation access (auth + ownership)
 * @throws Error if unauthorized or conversation not found
 */
async function validateConversationAccess(
  ctx: MutationCtx | QueryCtx,
  conversationId: Id<"conversations">
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthorized")

  const conversation = await ctx.db.get(conversationId)
  if (!conversation) throw new Error("Conversation not found")
  if (conversation.userId !== identity.subject) throw new Error("Unauthorized")

  return conversation
}

/**
 * Update workflow progress for a conversation
 * Tracks which step the user is on, which steps they've completed, and which they've skipped
 */
export const updateProgress = mutation({
  args: {
    conversationId: v.id("conversations"),
    currentStep: v.union(
      v.literal("discovery"), // kept for backwards compatibility
      v.literal("setup"),
      v.literal("questions"),
      v.literal("tech-stack"),
      v.literal("generate")
    ),
    completedSteps: v.array(v.string()),
    skippedSteps: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await validateConversationAccess(ctx, args.conversationId)

    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        currentStep: args.currentStep,
        completedSteps: args.completedSteps,
        skippedSteps: args.skippedSteps || [],
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})

/**
 * Get workflow progress for a conversation
 * Returns the current step, completed steps, and skipped steps
 */
export const getProgress = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== identity.subject) return null

    return conversation.workflowProgress || getDefaultProgress()
  },
})

/**
 * Mark a step as completed
 * Automatically updates the completedSteps array if not already included
 */
export const completeStep = mutation({
  args: {
    conversationId: v.id("conversations"),
    step: v.union(
      v.literal("discovery"), // kept for backwards compatibility
      v.literal("setup"),
      v.literal("questions"),
      v.literal("tech-stack"),
      v.literal("generate")
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await validateConversationAccess(ctx, args.conversationId)

    const currentProgress = conversation.workflowProgress || getDefaultProgress()

    // Add step to completedSteps if not already there
    const completedSteps = currentProgress.completedSteps.includes(args.step)
      ? currentProgress.completedSteps
      : [...currentProgress.completedSteps, args.step]

    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        ...currentProgress,
        completedSteps,
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})

/**
 * Mark a step as skipped
 * Automatically updates the skippedSteps array if not already included
 */
export const skipStep = mutation({
  args: {
    conversationId: v.id("conversations"),
    step: v.union(
      v.literal("discovery"), // kept for backwards compatibility
      v.literal("setup"),
      v.literal("questions"),
      v.literal("tech-stack"),
      v.literal("generate")
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await validateConversationAccess(ctx, args.conversationId)

    const currentProgress = conversation.workflowProgress || getDefaultProgress()

    // Add step to skippedSteps if not already there
    const skippedSteps = currentProgress.skippedSteps.includes(args.step)
      ? currentProgress.skippedSteps
      : [...currentProgress.skippedSteps, args.step]

    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        ...currentProgress,
        skippedSteps,
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})
