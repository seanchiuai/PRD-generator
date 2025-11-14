# Discovery Skip Agent

## Role
Responsible for implementing skip functionality in the discovery chat phase, including context extraction from conversation history.

## Objective
Enable users to skip the discovery chat after sending their first message, intelligently extracting product context from the conversation to inform later stages.

## Context
Currently, the discovery chat requires at least 3 messages and 100 characters before showing a skip button. The new requirement is:
- Show skip button after user sends **first message**
- Extract product context from conversation when skipped
- Store context for use in questions and tech stack phases
- Navigate automatically to questions page

---

## Tasks

### 1. Update Discovery Page UI

**File:** `app/chat/[conversationId]/page.tsx`

**Changes Needed:**
1. Show skip button after first user message (not 3rd message)
2. Add skip handler with loading state
3. Call context extraction API
4. Navigate to questions on success

**Current Skip Logic:**
```typescript
// OLD - Remove this
const canSkip = messages.length >= 3 &&
  messages.filter(m => m.role === 'user').join('').length >= 100
```

**New Skip Logic:**
```typescript
// NEW
const userMessages = messages.filter(m => m.role === 'user')
const canSkip = userMessages.length >= 1
```

**Add Skip Handler:**
```typescript
const [isSkipping, setIsSkipping] = useState(false)

const handleSkipDiscovery = async () => {
  setIsSkipping(true)
  try {
    // Call context extraction API
    const response = await fetch('/api/conversation/extract-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    })

    if (!response.ok) throw new Error('Failed to extract context')

    const { success } = await response.json()

    if (success) {
      // Navigate to questions
      router.push(`/chat/${conversationId}/questions`)
    }
  } catch (error) {
    console.error('Skip failed:', error)
    toast.error('Failed to skip. Please try again.')
  } finally {
    setIsSkipping(false)
  }
}
```

**Update WorkflowLayout Props:**
```tsx
<WorkflowLayout
  currentStep="discovery"
  completedSteps={[]}
  conversationId={conversationId}
  showSkipButton={canSkip && !isSkipping}
  onSkip={handleSkipDiscovery}
  skipButtonLoading={isSkipping}
  skipButtonText="Skip to Questions"
>
  {/* Existing chat UI */}
</WorkflowLayout>
```

---

### 2. Create Context Extraction API

**File:** `app/api/conversation/extract-context/route.ts`

Create new API endpoint to extract product context from conversation:

**Requirements:**
- Fetch all messages from conversation
- Use Claude to analyze and extract structured context
- Store extracted context in Convex
- Return success/failure

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )
    }

    // Fetch conversation messages
    const conversation = await convex.query(api.conversations.get, {
      conversationId,
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Build message history for Claude
    const messageHistory = conversation.messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')

    // Call Claude to extract context
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: CONTEXT_EXTRACTION_PROMPT.replace(
            '{messages}',
            messageHistory
          ),
        },
      ],
    })

    // Parse Claude's response
    const extractedText = response.content[0].text
    const contextData = JSON.parse(extractedText)

    // Validate extracted context
    const validatedContext = {
      productName: contextData.productName || 'Untitled Product',
      description: contextData.description || '',
      targetAudience: contextData.targetAudience || 'General users',
      keyFeatures: Array.isArray(contextData.keyFeatures)
        ? contextData.keyFeatures
        : [],
      problemStatement: contextData.problemStatement || '',
      technicalPreferences: Array.isArray(contextData.technicalPreferences)
        ? contextData.technicalPreferences
        : [],
      extractedAt: Date.now(),
    }

    // Save to Convex
    await convex.mutation(api.conversations.saveExtractedContext, {
      conversationId,
      context: validatedContext,
    })

    return NextResponse.json({
      success: true,
      context: validatedContext,
    })
  } catch (error) {
    console.error('Context extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract context', details: error.message },
      { status: 500 }
    )
  }
}

const CONTEXT_EXTRACTION_PROMPT = `
Analyze the following product discovery conversation and extract key information about the product being discussed.

Even if the conversation is very brief, make your best attempt to extract whatever information is available.

Conversation:
{messages}

Extract and return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "productName": "Name of the product (or generate a descriptive name if not mentioned)",
  "description": "Brief 1-2 sentence description of what the product does",
  "targetAudience": "Who will use this product (be specific if mentioned, otherwise infer)",
  "keyFeatures": ["Feature 1", "Feature 2", ...],
  "problemStatement": "What problem does this product solve",
  "technicalPreferences": ["Any tech mentioned like 'mobile app', 'web', 'AI-powered', etc."]
}

Guidelines:
- If information is not explicitly mentioned, make reasonable inferences
- Be concise but specific
- Extract all features mentioned, even if briefly
- Include any technical requirements or preferences mentioned
- If the conversation is very short, still provide your best interpretation
- Product name: if not mentioned, create a descriptive name based on the concept
`
```

---

### 3. Update Convex Schema

**File:** `convex/schema.ts`

Add `extractedContext` field to conversations table:

**Changes:**
```typescript
conversations: defineTable({
  userId: v.string(),
  title: v.string(),
  stage: v.string(),
  messages: v.array(
    v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),

  // ADD THIS:
  extractedContext: v.optional(
    v.object({
      productName: v.string(),
      description: v.string(),
      targetAudience: v.string(),
      keyFeatures: v.array(v.string()),
      problemStatement: v.string(),
      technicalPreferences: v.array(v.string()),
      extractedAt: v.number(),
    })
  ),

  // ... existing fields
})
```

---

### 4. Create Convex Mutation for Saving Context

**File:** `convex/conversations.ts`

Add new mutation to save extracted context:

```typescript
export const saveExtractedContext = mutation({
  args: {
    conversationId: v.id('conversations'),
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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthorized')
    }

    // Get conversation and verify ownership
    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    if (conversation.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    // Update conversation with extracted context
    await ctx.db.patch(args.conversationId, {
      extractedContext: args.context,
      updatedAt: Date.now(),
    })

    // Also update workflow progress
    await ctx.db.patch(args.conversationId, {
      workflowProgress: {
        currentStep: 'questions',
        completedSteps: ['discovery'],
        skippedSteps: ['discovery'],
        lastUpdated: Date.now(),
      },
    })

    return { success: true }
  },
})
```

---

### 5. Use Extracted Context in Questions Page

**File:** `app/chat/[conversationId]/questions/page.tsx`

Modify questions page to use extracted context for generating better questions:

**Changes:**
1. Check if extractedContext exists
2. Pass context to question generation API
3. Use context to pre-fill relevant text fields

**Fetch Extracted Context:**
```typescript
const conversation = useQuery(api.conversations.get, {
  conversationId: params.conversationId as Id<'conversations'>,
})

const extractedContext = conversation?.extractedContext
```

**Pass to Question Generation:**
```typescript
// When generating questions
const response = await fetch('/api/questions/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId,
    extractedContext, // Include this
  }),
})
```

---

### 6. Update Question Generation API

**File:** `app/api/questions/generate/route.ts`

Enhance question generation to use extracted context:

**Changes:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { conversationId, extractedContext } = await request.json()

    // ... existing code to get conversation ...

    // Build context-aware prompt
    let contextSection = ''
    if (extractedContext) {
      contextSection = `
PRODUCT CONTEXT (extracted from discovery):
- Product: ${extractedContext.productName}
- Description: ${extractedContext.description}
- Target Audience: ${extractedContext.targetAudience}
- Key Features: ${extractedContext.keyFeatures.join(', ')}
- Problem: ${extractedContext.problemStatement}
- Technical Preferences: ${extractedContext.technicalPreferences.join(', ')}

Use this context to generate highly relevant questions.
`
    }

    const prompt = `
${contextSection}

Generate 12-15 clarifying questions for this product...
[rest of existing prompt]
`

    // ... rest of existing code ...
  }
}
```

---

### 7. Add Analytics Tracking

**File:** `lib/analytics/discoveryEvents.ts`

Track skip events for analytics:

```typescript
export function trackDiscoverySkip(data: {
  conversationId: string
  messageCount: number
  characterCount: number
  extractedContext: any
}) {
  // If you have analytics setup (e.g., Posthog, Mixpanel)
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Discovery Skipped', {
      conversation_id: data.conversationId,
      message_count: data.messageCount,
      character_count: data.characterCount,
      had_product_name: !!data.extractedContext?.productName,
      feature_count: data.extractedContext?.keyFeatures?.length || 0,
    })
  }
}
```

**Use in Skip Handler:**
```typescript
const handleSkipDiscovery = async () => {
  setIsSkipping(true)
  try {
    const response = await fetch('/api/conversation/extract-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    })

    const { success, context } = await response.json()

    if (success) {
      // Track analytics
      trackDiscoverySkip({
        conversationId,
        messageCount: messages.length,
        characterCount: messages.join('').length,
        extractedContext: context,
      })

      router.push(`/chat/${conversationId}/questions`)
    }
  } catch (error) {
    // ... error handling
  } finally {
    setIsSkipping(false)
  }
}
```

---

### 8. Add User Feedback UI (Optional)

**File:** `components/discovery/ContextPreview.tsx`

Show preview of extracted context before navigating:

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface ContextPreviewProps {
  context: {
    productName: string
    description: string
    targetAudience: string
    keyFeatures: string[]
    problemStatement: string
    technicalPreferences: string[]
  }
}

export function ContextPreview({ context }: ContextPreviewProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <h3 className="font-semibold">Context Extracted</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Product:</span> {context.productName}
        </div>
        <div>
          <span className="font-medium">Description:</span>{' '}
          {context.description}
        </div>
        <div>
          <span className="font-medium">Audience:</span>{' '}
          {context.targetAudience}
        </div>
        {context.keyFeatures.length > 0 && (
          <div>
            <span className="font-medium">Features:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {context.keyFeatures.map((feature, i) => (
                <Badge key={i} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
```

**Optional: Show Preview Before Navigation:**
```typescript
// In discovery page skip handler
const handleSkipDiscovery = async () => {
  setIsSkipping(true)
  try {
    const response = await fetch('/api/conversation/extract-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    })

    const { success, context } = await response.json()

    if (success) {
      // Show preview for 2 seconds before navigating
      setExtractedContext(context)
      setShowPreview(true)

      await new Promise(resolve => setTimeout(resolve, 2000))

      router.push(`/chat/${conversationId}/questions`)
    }
  } catch (error) {
    // ... error handling
  } finally {
    setIsSkipping(false)
  }
}
```

---

## Error Handling

### Handle API Failures Gracefully

1. **Network Errors:** Retry once after 2 seconds
2. **Parsing Errors:** Use fallback context
3. **Missing Context:** Allow proceeding with minimal data

**Fallback Context:**
```typescript
const FALLBACK_CONTEXT = {
  productName: 'New Product',
  description: 'A product to be defined',
  targetAudience: 'Target users',
  keyFeatures: [],
  problemStatement: 'To be determined',
  technicalPreferences: [],
  extractedAt: Date.now(),
}
```

---

## Testing Checklist

- [ ] Skip button appears after first user message
- [ ] Skip button disabled during skip process
- [ ] Context extraction API works with minimal input (1 message)
- [ ] Context extraction API works with detailed input (10+ messages)
- [ ] Extracted context saved to Convex correctly
- [ ] Navigation to questions page works
- [ ] Questions page receives extracted context
- [ ] Questions are more relevant with context
- [ ] Error handling works (network failure, API error)
- [ ] Loading states are clear
- [ ] Analytics events fire correctly
- [ ] Works on mobile devices
- [ ] Accessible: keyboard navigation, screen readers

---

## Dependencies

Ensure these are installed:
```bash
npm install @anthropic-ai/sdk
```

---

## Environment Variables

Required in `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CONVEX_URL=https://...
```

---

## Notes

- Context extraction should work even with very short conversations (1-2 messages)
- Claude is good at making reasonable inferences from limited data
- The extracted context improves question generation quality
- Users can always go back to discovery to add more details
- Consider showing a summary of what was extracted for transparency
- Track skip rate to measure feature usage
