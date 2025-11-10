import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversationId = await ctx.db.insert("conversations", {
      userId: identity.subject,
      messages: [],
      currentStage: "discovery",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Security: Ensure user owns conversation
    if (conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const newMessage = {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    };

    await ctx.db.patch(args.conversationId, {
      messages: [...conversation.messages, newMessage],
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      return null;
    }

    return conversation;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

export const saveQuestions = mutation({
  args: {
    conversationId: v.id("conversations"),
    questions: v.array(
      v.object({
        id: v.string(),
        category: v.string(),
        question: v.string(),
        placeholder: v.optional(v.string()),
        answer: v.optional(v.string()),
        required: v.boolean(),
        type: v.union(v.literal("text"), v.literal("textarea"), v.literal("select")),
      })
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      clarifyingQuestions: args.questions,
      currentStage: "clarifying",
      updatedAt: Date.now(),
    });
  },
});

export const updateStage = mutation({
  args: {
    conversationId: v.id("conversations"),
    stage: v.union(
      v.literal("discovery"),
      v.literal("clarifying"),
      v.literal("researching"),
      v.literal("selecting"),
      v.literal("generating"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      currentStage: args.stage,
      updatedAt: Date.now(),
    });
  },
});
