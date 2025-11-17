import { internalMutation } from "./_generated/server"

/**
 * Migration: Update old conversation stages to new schema
 * Converts "researching" and "selecting" to "tech-stack"
 */
export const migrateConversationStages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect()
    let updated = 0

    for (const conversation of conversations) {
      let newStage = conversation.currentStage

      // Map old stages to new ones
      if (newStage === "researching" || newStage === "selecting") {
        newStage = "tech-stack"
        await ctx.db.patch(conversation._id, { currentStage: newStage })
        updated++
      }
    }

    return { success: true, conversationsUpdated: updated }
  },
})
