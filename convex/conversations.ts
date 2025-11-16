import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to merge workflow steps without duplicates
function mergeCompletedSteps(
  existingSteps: string[] | undefined,
  newSteps: string[]
): string[] {
  const allSteps = [...(existingSteps || []), ...newSteps];
  // Define step order for proper sequencing
  const stepOrder = ["setup", "discovery", "questions", "research", "selection", "generate"];
  // Remove duplicates and sort by defined order
  const uniqueSteps = Array.from(new Set(allSteps));
  return uniqueSteps.sort((a, b) => stepOrder.indexOf(a) - stepOrder.indexOf(b));
}

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
      currentStage: "setup",
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
        suggestedOptions: v.optional(v.array(v.string())),
        autoCompleted: v.optional(v.boolean()),
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

    // Track which questions were auto-completed
    const autoCompletedQuestions = args.questions
      .filter((q) => q.autoCompleted)
      .map((q) => q.id);

    await ctx.db.patch(args.conversationId, {
      clarifyingQuestions: args.questions,
      autoCompletedQuestions:
        autoCompletedQuestions.length > 0 ? autoCompletedQuestions : undefined,
      currentStage: "clarifying",
      updatedAt: Date.now(),
    });
  },
});

export const updateStage = mutation({
  args: {
    conversationId: v.id("conversations"),
    stage: v.union(
      v.literal("setup"),
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

export const saveResearchResults = mutation({
  args: {
    conversationId: v.id("conversations"),
    researchResults: v.optional(v.any()), // Use the detailed schema object
    results: v.optional(v.any()), // Alternative name for compatibility
    autoGenerated: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Support both parameter names for compatibility
    const results = args.researchResults || args.results;
    if (!results) {
      throw new Error("Research results are required");
    }

    await ctx.db.patch(args.conversationId, {
      researchResults: results,
      researchAutoGenerated: args.autoGenerated || false,
      researchMetadata: {
        startedAt: conversation.researchMetadata?.startedAt || Date.now(),
        completedAt: Date.now(),
        categoriesCompleted: Object.keys(results),
        status: "completed",
      },
      currentStage: "selecting",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateResearchProgress = mutation({
  args: {
    conversationId: v.id("conversations"),
    category: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const currentCompleted = conversation.researchMetadata?.categoriesCompleted || [];
    const newCompleted =
      args.status === "completed" && !currentCompleted.includes(args.category)
        ? [...currentCompleted, args.category]
        : currentCompleted;

    await ctx.db.patch(args.conversationId, {
      researchMetadata: {
        startedAt: conversation.researchMetadata?.startedAt || Date.now(),
        categoriesCompleted: newCompleted,
        status: "in_progress",
      },
      updatedAt: Date.now(),
    });
  },
});

export const saveSelection = mutation({
  args: {
    conversationId: v.id("conversations"),
    category: v.optional(v.string()),
    selection: v.union(
      v.object({
        name: v.string(),
        reasoning: v.string(),
        selectedFrom: v.array(v.string()),
      }),
      v.object({
        frontend: v.string(),
        backend: v.string(),
        database: v.string(),
        auth: v.string(),
        hosting: v.string(),
      })
    ),
    autoSelected: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Check if this is a full stack selection or individual category
    if ("frontend" in args.selection) {
      // Full stack selection
      const completedSteps = mergeCompletedSteps(
        conversation.workflowProgress?.completedSteps,
        ["discovery", "questions", "research", "selection"]
      );

      await ctx.db.patch(args.conversationId, {
        selection: {
          ...args.selection,
          autoSelected: args.autoSelected || false,
        },
        currentStage: "generating",
        workflowProgress: {
          currentStep: "generate",
          completedSteps,
          skippedSteps: args.autoSelected ? ["research", "selection"] : [],
          lastUpdated: Date.now(),
        },
        updatedAt: Date.now(),
      });
    } else if (args.category) {
      // Individual category selection
      const currentSelections = conversation.selectedTechStack || {};
      await ctx.db.patch(args.conversationId, {
        selectedTechStack: {
          ...currentSelections,
          [args.category]: args.selection,
        },
        updatedAt: Date.now(),
      });
    } else {
      throw new Error("Either category or full selection must be provided");
    }

    return { success: true };
  },
});

export const saveValidationWarnings = mutation({
  args: {
    conversationId: v.id("conversations"),
    warnings: v.array(
      v.object({
        level: v.union(v.literal("warning"), v.literal("error")),
        message: v.string(),
        affectedTechnologies: v.array(v.string()),
        suggestion: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      validationWarnings: args.warnings,
      updatedAt: Date.now(),
    });
  },
});

export const saveExtractedContext = mutation({
  args: {
    conversationId: v.id("conversations"),
    context: v.object({
      productName: v.string(),
      description: v.string(),
      targetAudience: v.string(),
      keyFeatures: v.array(v.string()),
      problemStatement: v.string(),
      technicalPreferences: v.array(v.string()),
      extractedAt: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get conversation and verify ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Update conversation with extracted context
    const completedSteps = mergeCompletedSteps(
      conversation.workflowProgress?.completedSteps,
      ["discovery"]
    );

    await ctx.db.patch(args.conversationId, {
      extractedContext: args.context,
      currentStage: "clarifying",
      workflowProgress: {
        currentStep: "questions",
        completedSteps,
        skippedSteps: ["discovery"],
        lastUpdated: Date.now(),
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const saveProjectSetup = mutation({
  args: {
    conversationId: v.id("conversations"),
    projectName: v.string(),
    projectDescription: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; prdId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get conversation and verify ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Create PRD record with status "generating"
    const prdId = await ctx.db.insert("prds", {
      conversationId: args.conversationId,
      userId: identity.subject,
      productName: args.projectName,
      prdData: null, // Will be populated later during generation
      version: 1,
      status: "generating",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create initial assistant message with project context
    const initialMessage = {
      role: "assistant" as const,
      content: `Great! I see you're working on **${args.projectName}**.

${args.projectDescription}

I'd love to learn more about your vision for this project. Let me ask you a few questions to better understand what you're building:

- What inspired you to create this project?
- Who do you envision as your primary users?
- What key problems will this solve for them?

Feel free to share as much or as little as you'd like, and I'll guide us through the discovery process!`,
      timestamp: Date.now(),
    };

    // Update conversation with project info, PRD link, and initial message
    await ctx.db.patch(args.conversationId, {
      projectName: args.projectName,
      projectDescription: args.projectDescription,
      prdId: prdId,
      currentStage: "discovery",
      messages: [initialMessage],
      workflowProgress: {
        currentStep: "discovery",
        completedSteps: ["setup"],
        skippedSteps: [],
        lastUpdated: Date.now(),
      },
      updatedAt: Date.now(),
    });

    return { success: true, prdId };
  },
});
