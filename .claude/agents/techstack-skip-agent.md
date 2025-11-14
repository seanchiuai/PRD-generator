# Tech Stack Skip Agent

## Role
Responsible for implementing skip functionality for both tech stack research and selection phases, including intelligent default tech stack recommendations.

## Objective
Enable users to skip tech stack research and selection entirely, with the system automatically:
1. Generating sensible default tech stack based on product type
2. Skipping the research API calls (Perplexity)
3. Skipping the selection UI
4. Auto-validating the default stack
5. Proceeding directly to PRD generation

## Context
Currently:
- Research page calls Perplexity API for 5 tech categories (5-15 seconds)
- Selection page requires choosing from research results
- Validation checks compatibility

New requirements:
- Allow skipping research (bypass Perplexity)
- Use intelligent defaults based on product context
- Auto-select and validate default stack
- Navigate directly to generation page

---

## Tasks

### 1. Create Tech Stack Defaults Library

**File:** `lib/techStack/defaults.ts`

Define default stacks for common product types:

```typescript
export interface TechStackSelection {
  frontend: string
  backend: string
  database: string
  auth: string
  hosting: string
}

export const DEFAULT_STACKS: Record<string, TechStackSelection> = {
  web_app: {
    frontend: 'Next.js',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
  mobile_app: {
    frontend: 'React Native',
    backend: 'Firebase Functions',
    database: 'Firestore',
    auth: 'Firebase Auth',
    hosting: 'Expo + Firebase',
  },
  saas_platform: {
    frontend: 'Next.js',
    backend: 'Node.js with tRPC',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel + Railway',
  },
  ecommerce: {
    frontend: 'Next.js',
    backend: 'Stripe + Next.js API',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
  dashboard: {
    frontend: 'React with Vite',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Auth0',
    hosting: 'Netlify + Railway',
  },
  api_service: {
    frontend: 'N/A (API only)',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'JWT',
    hosting: 'Railway',
  },
  ai_app: {
    frontend: 'Next.js',
    backend: 'Python with FastAPI',
    database: 'PostgreSQL with pgvector',
    auth: 'Clerk',
    hosting: 'Vercel + Modal',
  },
  general: {
    frontend: 'Next.js',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
}

export function detectProductType(
  extractedContext: any,
  answers: any
): keyof typeof DEFAULT_STACKS {
  if (!extractedContext && !answers) return 'general'

  // Check for mobile keywords
  const mobileKeywords = ['mobile', 'ios', 'android', 'app store', 'react native']
  const description = extractedContext?.description?.toLowerCase() || ''
  const productName = extractedContext?.productName?.toLowerCase() || ''
  const features = extractedContext?.keyFeatures?.join(' ').toLowerCase() || ''
  const techPrefs = extractedContext?.technicalPreferences?.join(' ').toLowerCase() || ''

  const allText = `${description} ${productName} ${features} ${techPrefs}`

  if (mobileKeywords.some(kw => allText.includes(kw))) {
    return 'mobile_app'
  }

  // Check for e-commerce
  const ecommerceKeywords = ['shop', 'store', 'cart', 'payment', 'checkout', 'product catalog']
  if (ecommerceKeywords.some(kw => allText.includes(kw))) {
    return 'ecommerce'
  }

  // Check for AI
  const aiKeywords = ['ai', 'ml', 'machine learning', 'gpt', 'llm', 'chatbot', 'recommendation']
  if (aiKeywords.some(kw => allText.includes(kw))) {
    return 'ai_app'
  }

  // Check for dashboard/analytics
  const dashboardKeywords = ['dashboard', 'analytics', 'visualization', 'chart', 'metrics']
  if (dashboardKeywords.some(kw => allText.includes(kw))) {
    return 'dashboard'
  }

  // Check for API/backend service
  const apiKeywords = ['api', 'backend', 'service', 'microservice', 'webhook']
  if (apiKeywords.some(kw => allText.includes(kw))) {
    return 'api_service'
  }

  // Check for SaaS
  const saasKeywords = ['saas', 'subscription', 'multi-tenant', 'platform']
  if (saasKeywords.some(kw => allText.includes(kw))) {
    return 'saas_platform'
  }

  // Default to general web app
  return 'web_app'
}

export function getDefaultTechStack(
  extractedContext: any,
  answers: any
): TechStackSelection {
  const productType = detectProductType(extractedContext, answers)
  return DEFAULT_STACKS[productType]
}

export function generateMockResearchResults(
  stack: TechStackSelection
): Record<string, any> {
  return {
    frontend: {
      category: 'frontend',
      recommendations: [
        {
          name: stack.frontend,
          description: `${stack.frontend} is a modern, production-ready framework.`,
          pros: ['Fast development', 'Great DX', 'Large community'],
          cons: ['Learning curve'],
          popularity: 'High',
          recommended: true,
        },
      ],
    },
    backend: {
      category: 'backend',
      recommendations: [
        {
          name: stack.backend,
          description: `${stack.backend} provides a robust backend solution.`,
          pros: ['Scalable', 'Well-documented', 'Ecosystem'],
          cons: ['Setup complexity'],
          popularity: 'High',
          recommended: true,
        },
      ],
    },
    database: {
      category: 'database',
      recommendations: [
        {
          name: stack.database,
          description: `${stack.database} is a reliable database choice.`,
          pros: ['ACID compliant', 'Mature', 'Performant'],
          cons: ['Requires management'],
          popularity: 'High',
          recommended: true,
        },
      ],
    },
    auth: {
      category: 'auth',
      recommendations: [
        {
          name: stack.auth,
          description: `${stack.auth} simplifies authentication.`,
          pros: ['Easy integration', 'Secure', 'Feature-rich'],
          cons: ['Third-party dependency'],
          popularity: 'High',
          recommended: true,
        },
      ],
    },
    hosting: {
      category: 'hosting',
      recommendations: [
        {
          name: stack.hosting,
          description: `${stack.hosting} offers excellent deployment experience.`,
          pros: ['Zero-config', 'Auto-scaling', 'CDN'],
          cons: ['Pricing at scale'],
          popularity: 'High',
          recommended: true,
        },
      ],
    },
  }
}
```

---

### 2. Create Smart Default Selection API

**File:** `app/api/tech-stack/suggest-defaults/route.ts`

Use Claude to suggest intelligent defaults:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { getDefaultTechStack, generateMockResearchResults } from '@/lib/techStack/defaults'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { conversationId, useAI = false } = await request.json()

    // Fetch conversation data
    const conversation = await convex.query(api.conversations.get, {
      conversationId,
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const extractedContext = conversation.extractedContext
    const answers = conversation.answers

    let techStack

    if (useAI && extractedContext) {
      // Use Claude for smarter suggestions
      techStack = await getAISuggestedStack(extractedContext, answers)
    } else {
      // Use rule-based defaults
      techStack = getDefaultTechStack(extractedContext, answers)
    }

    // Generate mock research results
    const researchResults = generateMockResearchResults(techStack)

    // Save to Convex
    await convex.mutation(api.conversations.saveResearchResults, {
      conversationId,
      results: researchResults,
      autoGenerated: true,
    })

    // Save selection
    await convex.mutation(api.conversations.saveSelection, {
      conversationId,
      selection: techStack,
      autoSelected: true,
    })

    // Validate the stack
    const validation = await validateDefaultStack(techStack)

    if (validation.errors.length > 0) {
      // If there are errors, try to fix them
      techStack = await fixStackErrors(techStack, validation.errors)

      // Re-save fixed selection
      await convex.mutation(api.conversations.saveSelection, {
        conversationId,
        selection: techStack,
        autoSelected: true,
      })
    }

    return NextResponse.json({
      success: true,
      techStack,
      validation,
    })
  } catch (error) {
    console.error('Default tech stack error:', error)
    return NextResponse.json(
      { error: 'Failed to generate defaults', details: error.message },
      { status: 500 }
    )
  }
}

async function getAISuggestedStack(extractedContext: any, answers: any) {
  const prompt = `
Suggest an optimal tech stack for this product:

PRODUCT CONTEXT:
${JSON.stringify(extractedContext, null, 2)}

ANSWERS:
${JSON.stringify(answers, null, 2)}

Based on this information, suggest:
1. Frontend framework/library
2. Backend framework/language
3. Database
4. Authentication solution
5. Hosting platform

Consider:
- Product type and scale
- Target audience
- Technical preferences mentioned
- Industry best practices
- Developer experience
- Cost-effectiveness

Return ONLY a JSON object:
{
  "frontend": "technology name",
  "backend": "technology name",
  "database": "technology name",
  "auth": "technology name",
  "hosting": "technology name"
}
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  })

  return JSON.parse(response.content[0].text)
}

async function validateDefaultStack(stack: any) {
  // Basic validation - could be enhanced
  return {
    isValid: true,
    errors: [],
    warnings: [],
  }
}

async function fixStackErrors(stack: any, errors: any[]) {
  // If there are compatibility errors, fall back to safest defaults
  return {
    frontend: 'Next.js',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  }
}
```

---

### 3. Update Research Page with Skip

**File:** `app/chat/[conversationId]/research/page.tsx`

**Changes:**
1. Add skip button (visible immediately)
2. Skip handler calls suggest-defaults API
3. Navigate directly to generate page (skip selection)

**Add Skip Button:**
```tsx
<WorkflowLayout
  currentStep="research"
  completedSteps={['discovery', 'questions']}
  conversationId={conversationId}
  showSkipButton={true}
  onSkip={handleSkipResearch}
  skipButtonLoading={isSkipping}
  skipButtonText="Use Recommended Stack"
>
  {/* Existing research UI */}
</WorkflowLayout>
```

**Skip Handler:**
```typescript
const [isSkipping, setIsSkipping] = useState(false)

const handleSkipResearch = async () => {
  setIsSkipping(true)
  try {
    // Generate and save default stack
    const response = await fetch('/api/tech-stack/suggest-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        useAI: true, // Use Claude for smarter defaults
      }),
    })

    if (!response.ok) throw new Error('Failed to generate defaults')

    const { success, techStack } = await response.json()

    if (success) {
      // Show brief preview
      toast.success(`Selected: ${techStack.frontend}, ${techStack.backend}, ${techStack.database}`)

      // Navigate directly to generate (skip selection page)
      // Add 1.5 second delay to show toast
      await new Promise(resolve => setTimeout(resolve, 1500))

      router.push(`/chat/${conversationId}/generate`)
    }
  } catch (error) {
    console.error('Skip research failed:', error)
    toast.error('Failed to skip. Please try again.')
  } finally {
    setIsSkipping(false)
  }
}
```

---

### 4. Update Selection Page for Auto-Selection

**File:** `app/chat/[conversationId]/select/page.tsx`

**Changes:**
1. Check if stack was auto-selected
2. Show visual indicator for auto-selected technologies
3. Allow skip button (uses current selection or generates new defaults)
4. Show countdown before auto-advancing to generate

**Detect Auto-Selection:**
```typescript
const conversation = useQuery(api.conversations.get, {
  conversationId: params.conversationId,
})

const isAutoSelected = conversation?.selection?.autoSelected || false
const selection = conversation?.selection
```

**Show Auto-Selection Indicator:**
```tsx
{isAutoSelected && (
  <Alert className="mb-6">
    <Sparkles className="h-4 w-4" />
    <AlertTitle>Recommended Stack Selected</AlertTitle>
    <AlertDescription>
      We've selected a tech stack based on your product requirements.
      You can review and change any selections below.
    </AlertDescription>
  </Alert>
)}
```

**Add Skip/Auto-Advance:**
```typescript
// If auto-selected, show countdown to auto-advance
useEffect(() => {
  if (isAutoSelected && selection) {
    // Start 5-second countdown
    const timer = setTimeout(() => {
      router.push(`/chat/${conversationId}/generate`)
    }, 5000)

    return () => clearTimeout(timer)
  }
}, [isAutoSelected, selection, conversationId, router])
```

**Show Countdown UI:**
```tsx
{isAutoSelected && (
  <div className="fixed bottom-8 right-8 bg-white border shadow-lg rounded-lg p-4 max-w-sm">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div>
        <p className="font-medium">Proceeding to PRD Generation</p>
        <p className="text-sm text-muted-foreground">
          Generating in {countdown} seconds...
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCountdown(false)}
          className="mt-1"
        >
          Stay here
        </Button>
      </div>
    </div>
  </div>
)}
```

---

### 5. Update Convex Schema

**File:** `convex/schema.ts`

Add flags for auto-generated research and selection:

```typescript
conversations: defineTable({
  // ... existing fields ...

  researchResults: v.optional(v.any()),
  researchAutoGenerated: v.optional(v.boolean()), // NEW

  selection: v.optional(
    v.object({
      frontend: v.string(),
      backend: v.string(),
      database: v.string(),
      auth: v.string(),
      hosting: v.string(),
      autoSelected: v.optional(v.boolean()), // NEW
    })
  ),

  // ... rest of fields
})
```

---

### 6. Update Convex Mutations

**File:** `convex/conversations.ts`

Update mutations to support auto-generation flags:

```typescript
export const saveResearchResults = mutation({
  args: {
    conversationId: v.id('conversations'),
    results: v.any(),
    autoGenerated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    await ctx.db.patch(args.conversationId, {
      researchResults: args.results,
      researchAutoGenerated: args.autoGenerated || false,
      stage: 'selection',
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const saveSelection = mutation({
  args: {
    conversationId: v.id('conversations'),
    selection: v.object({
      frontend: v.string(),
      backend: v.string(),
      database: v.string(),
      auth: v.string(),
      hosting: v.string(),
    }),
    autoSelected: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    await ctx.db.patch(args.conversationId, {
      selection: {
        ...args.selection,
        autoSelected: args.autoSelected || false,
      },
      stage: 'generation',
      updatedAt: Date.now(),
    })

    // Update workflow progress
    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        currentStep: 'generate',
        completedSteps: ['discovery', 'questions', 'research', 'selection'],
        skippedSteps: args.autoSelected
          ? ['research', 'selection']
          : [],
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})
```

---

### 7. Create Default Stack Preview Component

**File:** `components/techStack/DefaultStackPreview.tsx`

Show preview of auto-selected stack:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface DefaultStackPreviewProps {
  stack: {
    frontend: string
    backend: string
    database: string
    auth: string
    hosting: string
  }
  productType?: string
}

export function DefaultStackPreview({ stack, productType }: DefaultStackPreviewProps) {
  return (
    <Card className="p-6 border-green-200 bg-green-50">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="w-5 h-5" />
        <h3 className="font-semibold">Recommended Stack Selected</h3>
      </div>

      {productType && (
        <p className="text-sm text-muted-foreground mb-4">
          Optimized for {productType.replace('_', ' ')} applications
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Frontend</span>
          <Badge>{stack.frontend}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Backend</span>
          <Badge>{stack.backend}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Database</span>
          <Badge>{stack.database}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Auth</span>
          <Badge>{stack.auth}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md col-span-2">
          <span className="text-sm font-medium">Hosting</span>
          <Badge>{stack.hosting}</Badge>
        </div>
      </div>
    </Card>
  )
}
```

---

### 8. Analytics Tracking

**File:** `lib/analytics/techStackEvents.ts`

Track skip and default selection:

```typescript
export function trackTechStackSkip(data: {
  conversationId: string
  productType: string
  defaultStack: any
  useAI: boolean
}) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Tech Stack Skipped', {
      conversation_id: data.conversationId,
      product_type: data.productType,
      frontend: data.defaultStack.frontend,
      backend: data.defaultStack.backend,
      database: data.defaultStack.database,
      auth: data.defaultStack.auth,
      hosting: data.defaultStack.hosting,
      used_ai: data.useAI,
    })
  }
}
```

---

## Testing Checklist

- [ ] Skip button visible on research page
- [ ] Default stack generation works with context
- [ ] Default stack generation works without context
- [ ] Product type detection is accurate
- [ ] AI-suggested stacks are sensible
- [ ] Mock research results saved correctly
- [ ] Selection saved with autoSelected flag
- [ ] Visual indicators show auto-selected items
- [ ] Auto-advance countdown works
- [ ] Can cancel auto-advance
- [ ] Can edit auto-selected technologies
- [ ] Skip directly from research to generate works
- [ ] Default stacks are valid/compatible
- [ ] Error handling for API failures
- [ ] Loading states are clear
- [ ] Analytics tracking works
- [ ] Mobile responsive

---

## Notes

- Bypass Perplexity API entirely when skipping (save cost and time)
- Use rule-based defaults as fallback if AI fails
- Product type detection uses keyword matching on all available context
- Default stacks are production-ready, battle-tested combinations
- Auto-selected items are clearly marked for transparency
- Users can always override any auto-selection
- Consider showing reasoning for stack choice (e.g., "Best for SaaS applications")
- Track which default stacks are most commonly used vs. changed
