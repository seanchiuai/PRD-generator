/**
 * Analytics tracking for tech stack events
 */

export function trackTechStackSkip(data: {
  conversationId: string
  productType: string
  defaultStack: {
    frontend: string
    backend: string
    database: string
    auth: string
    hosting: string
  }
  useAI: boolean
}) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Tech Stack Skipped', {
      conversation_id: data.conversationId,
      product_type: data.productType,
      frontend: data.defaultStack.frontend,
      backend: data.defaultStack.backend,
      database: data.defaultStack.database,
      auth: data.defaultStack.auth,
      hosting: data.defaultStack.hosting,
      used_ai: data.useAI,
      timestamp: new Date().toISOString(),
    })
  }
}

export function trackTechStackResearch(data: {
  conversationId: string
  categoriesResearched: string[]
  duration: number
}) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Tech Stack Research Completed', {
      conversation_id: data.conversationId,
      categories_count: data.categoriesResearched.length,
      categories: data.categoriesResearched,
      duration_ms: data.duration,
      timestamp: new Date().toISOString(),
    })
  }
}

export function trackTechStackSelection(data: {
  conversationId: string
  selection: {
    frontend: string
    backend: string
    database: string
    auth: string
    hosting: string
  }
  autoSelected: boolean
}) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Tech Stack Selected', {
      conversation_id: data.conversationId,
      frontend: data.selection.frontend,
      backend: data.selection.backend,
      database: data.selection.database,
      auth: data.selection.auth,
      hosting: data.selection.hosting,
      auto_selected: data.autoSelected,
      timestamp: new Date().toISOString(),
    })
  }
}

export function trackDefaultStackModified(data: {
  conversationId: string
  changedFields: string[]
}) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Default Stack Modified', {
      conversation_id: data.conversationId,
      changed_fields: data.changedFields,
      changes_count: data.changedFields.length,
      timestamp: new Date().toISOString(),
    })
  }
}
