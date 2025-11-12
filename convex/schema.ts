import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * PRD Generator Database Schema
 *
 * Defines the structure for:
 * - users: User authentication and profile data
 * - conversations: Multi-stage PRD creation conversations
 * - prds: Generated Product Requirements Documents
 */
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
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
          suggestedOptions: v.optional(v.array(v.string())),
        })
      )
    ),
    answersCompleteness: v.optional(v.number()),
    researchResults: v.optional(
      v.object({
        frontend: v.optional(
          v.array(
            v.object({
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
              popularity: v.optional(v.string()),
              learnMore: v.optional(v.string()),
            })
          )
        ),
        backend: v.optional(
          v.array(
            v.object({
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
              popularity: v.optional(v.string()),
              learnMore: v.optional(v.string()),
            })
          )
        ),
        database: v.optional(
          v.array(
            v.object({
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
              popularity: v.optional(v.string()),
              learnMore: v.optional(v.string()),
            })
          )
        ),
        authentication: v.optional(
          v.array(
            v.object({
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
              popularity: v.optional(v.string()),
              learnMore: v.optional(v.string()),
            })
          )
        ),
        hosting: v.optional(
          v.array(
            v.object({
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
              popularity: v.optional(v.string()),
              learnMore: v.optional(v.string()),
            })
          )
        ),
        additionalTools: v.optional(
          v.array(
            v.object({
              category: v.string(),
              name: v.string(),
              description: v.string(),
              pros: v.array(v.string()),
              cons: v.array(v.string()),
            })
          )
        ),
      })
    ),
    researchMetadata: v.optional(
      v.object({
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        categoriesCompleted: v.array(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("failed")
        ),
      })
    ),
    selectedTechStack: v.optional(
      v.object({
        frontend: v.optional(
          v.object({
            name: v.string(),
            reasoning: v.string(),
            selectedFrom: v.array(v.string()),
          })
        ),
        backend: v.optional(
          v.object({
            name: v.string(),
            reasoning: v.string(),
            selectedFrom: v.array(v.string()),
          })
        ),
        database: v.optional(
          v.object({
            name: v.string(),
            reasoning: v.string(),
            selectedFrom: v.array(v.string()),
          })
        ),
        authentication: v.optional(
          v.object({
            name: v.string(),
            reasoning: v.string(),
            selectedFrom: v.array(v.string()),
          })
        ),
        hosting: v.optional(
          v.object({
            name: v.string(),
            reasoning: v.string(),
            selectedFrom: v.array(v.string()),
          })
        ),
        additionalTools: v.optional(
          v.array(
            v.object({
              category: v.string(),
              name: v.string(),
              reasoning: v.string(),
            })
          )
        ),
      })
    ),
    validationWarnings: v.optional(
      v.array(
        v.object({
          level: v.union(v.literal("warning"), v.literal("error")),
          message: v.string(),
          affectedTechnologies: v.array(v.string()),
          suggestion: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_stage", ["userId", "currentStage"]),
  prds: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    prdData: v.any(),
    productName: v.string(),
    version: v.number(),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_created", ["userId", "createdAt"]),
});
