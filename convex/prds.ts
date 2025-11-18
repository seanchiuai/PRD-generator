import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        isDone: true,
        continueCursor: null as string | null,
      };
    }

    // Use pagination to limit the number of PRDs fetched
    const result = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .paginate(args.paginationOpts);

    // Client-side search filter (applied after pagination)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      result.page = result.page.filter((prd) =>
        prd.productName.toLowerCase().includes(searchLower)
      );
    }

    return result;
  },
});

export const get = query({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== identity.subject) {
      return null;
    }

    return prd;
  },
});

export const deletePRD = mutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Clear prdId reference in any associated conversation
    if (prd.conversationId) {
      const conversation = await ctx.db.get(prd.conversationId);
      if (conversation && conversation.prdId === args.prdId) {
        await ctx.db.patch(prd.conversationId, { prdId: undefined });
      }
    }

    await ctx.db.delete(args.prdId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      total: prds.length,
      completed: prds.filter((p) => p.status === "completed").length,
      generating: prds.filter((p) => p.status === "generating").length,
      failed: prds.filter((p) => p.status === "failed").length,
    };
  },
});

export const getByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (prds.length === 0) return null;

    const prd = prds[0];
    if (!prd || prd.userId !== identity.subject) return null;

    return prd;
  },
});

export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    productName: v.string(),
    prdData: v.any(),
  },
  handler: async (ctx, args): Promise<Id<"prds">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Helper to create PRD data object
    const createPrdData = {
      conversationId: args.conversationId,
      userId: identity.subject,
      productName: args.productName,
      prdData: args.prdData,
      version: 1,
      status: "completed" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let prdId: Id<"prds">;

    // Check if PRD already exists (created during setup) and verify it still exists
    if (conversation.prdId) {
      const existingPrd = await ctx.db.get(conversation.prdId);

      if (existingPrd && existingPrd.userId === identity.subject) {
        // Update existing PRD
        await ctx.db.patch(conversation.prdId, {
          productName: args.productName,
          prdData: args.prdData,
          status: "completed",
          updatedAt: Date.now(),
        });
        prdId = conversation.prdId;
      } else {
        // PRD was deleted or doesn't exist - create new one
        prdId = await ctx.db.insert("prds", createPrdData) as Id<"prds">;

        // Update conversation with new PRD link
        await ctx.db.patch(args.conversationId, {
          prdId: prdId,
        });
      }
    } else {
      // Create new PRD (fallback for legacy conversations)
      prdId = await ctx.db.insert("prds", createPrdData) as Id<"prds">;

      // Link PRD to conversation
      await ctx.db.patch(args.conversationId, {
        prdId: prdId,
      });
    }

    // Update conversation stage to completed
    await ctx.db.patch(args.conversationId, {
      currentStage: "completed",
      updatedAt: Date.now(),
    });

    return prdId;
  },
});
