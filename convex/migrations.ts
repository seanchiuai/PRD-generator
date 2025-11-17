import { internalMutation } from "./_generated/server"

/**
 * Migration: Update old conversation stages to new schema
 * Converts "researching" and "selecting" to "tech-stack"
 */
export const migrateConversationStages = internalMutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Check if migration already ran
      const migrationRecord = await ctx.db
        .query("migrations")
        .filter((q) => q.eq(q.field("name"), "migrate_conversation_stages"))
        .first()

      if (migrationRecord) {
        console.log("Migration already executed")
        return { success: true, conversationsUpdated: 0, skipped: true }
      }

      let updated = 0
      let hasMore = true
      let continueCursor: string | null = null

      while (hasMore) {
        const page = await ctx.db
          .query("conversations")
          .paginate({ cursor: continueCursor, numItems: 100 })

        for (const conversation of page.page) {
          const currentStage = conversation.currentStage

          // Type guard: ensure currentStage is a valid string
          if (
            typeof currentStage === "string" &&
            (currentStage === "researching" || currentStage === "selecting")
          ) {
            const newStage = "tech-stack"
            await ctx.db.patch(conversation._id, { currentStage: newStage })
            updated++
          }
        }

        hasMore = page.continueCursor !== null
        continueCursor = page.continueCursor
      }

      // Record migration completion
      await ctx.db.insert("migrations", {
        name: "migrate_conversation_stages",
        executedAt: Date.now(),
        conversationsUpdated: updated
      })

      console.log(`Migration completed: ${updated} conversations updated`)
      return { success: true, conversationsUpdated: updated }
    } catch (error) {
      console.error("Migration failed:", error)
      throw error
    }
  },
})
