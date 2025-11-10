import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
    userId: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
  conversations: defineTable({
    userId: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    currentStage: v.union(
      v.literal("discovery"),
      v.literal("clarifying"),
      v.literal("researching"),
      v.literal("selecting"),
      v.literal("generating"),
      v.literal("completed")
    ),
    productContext: v.optional(
      v.object({
        productName: v.optional(v.string()),
        description: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
        coreFeatures: v.optional(v.array(v.string())),
      })
    ),
    clarifyingQuestions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          category: v.string(),
          question: v.string(),
          placeholder: v.optional(v.string()),
          answer: v.optional(v.string()),
          required: v.boolean(),
          type: v.union(v.literal("text"), v.literal("textarea"), v.literal("select")),
        })
      )
    ),
    answersCompleteness: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_stage", ["userId", "currentStage"]),
});
