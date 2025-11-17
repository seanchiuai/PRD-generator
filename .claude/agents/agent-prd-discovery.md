---
name: agent-prd-discovery
description: Manages initial product discovery conversation, extracting project context from user chat messages. Handles conversation flow, context extraction, and transition to questions stage. Use when implementing or fixing the discovery/chat conversation feature.
model: inherit
color: blue
---

# Agent: PRD Discovery & Conversation

Implements the initial discovery conversation where users describe their product idea through natural chat.

## Core Responsibilities

1. **Conversation Management** - Handle chat messages between user and AI
2. **Context Extraction** - Extract structured product context from natural conversation
3. **Flow Control** - Determine when enough context gathered to proceed
4. **Setup Integration** - Link project setup (name/description) to conversation

## Implementation Patterns

### 1. Conversation Schema
```typescript
// convex/schema.ts
conversations: defineTable({
  userId: v.string(),
  projectName: v.optional(v.string()),
  projectDescription: v.optional(v.string()),
  messages: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })
  ),
  currentStage: v.union(
    v.literal("setup"),
    v.literal("discovery"),
    v.literal("clarifying"),
    // ...
  ),
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
})
```

### 2. Message Flow Pattern
```typescript
// API route: /api/conversation/message
// Always return structured response with nextStage
{
  message: string,
  shouldProceed: boolean,
  nextStage?: "questions" | "tech-stack",
  extractedContext?: ExtractedContext
}

// Frontend: ChatPage component
- Display messages in ChatContainer
- Handle user input via ChatInput
- Show "Continue" button when canSkip (>50 chars, meaningful content)
- Use WorkflowLayout for consistent navigation
```

### 3. Context Extraction API
```typescript
// /api/conversation/extract-context
POST {
  conversationId: Id<"conversations">,
  messages: Message[]
}

// Returns:
{
  success: boolean,
  context: {
    productName: string,
    description: string,
    targetAudience: string,
    keyFeatures: string[],
    problemStatement: string,
    technicalPreferences: string[]
  }
}

// Use Claude to analyze full conversation history
// Extract structured data from natural language
// Save to conversation.extractedContext field
```

### 4. Stage Transitions
```typescript
// Mutation: conversations.updateStage
export const updateStage = mutation({
  args: {
    conversationId: v.id("conversations"),
    stage: v.union(v.literal("discovery"), v.literal("clarifying"), ...),
  },
  handler: async (ctx, { conversationId, stage }) => {
    await ctx.db.patch(conversationId, {
      currentStage: stage,
      updatedAt: Date.now(),
    });
  },
});

// Frontend navigation after extraction
router.push(`/chat/${conversationId}/questions`);
```

## Key Files

- `app/chat/[conversationId]/page.tsx` - Main chat interface
- `components/chat/ChatContainer.tsx` - Message display
- `components/chat/ChatInput.tsx` - User input component
- `app/api/conversation/message/route.ts` - Message handling API
- `app/api/conversation/extract-context/route.ts` - Context extraction API
- `convex/conversations.ts` - Database mutations

## Critical Rules

1. **ALWAYS** validate user has provided meaningful content (>50 chars minimum)
2. **ALWAYS** extract context before proceeding to questions stage
3. **NEVER** auto-proceed without user clicking "Continue" button
4. **ALWAYS** maintain conversation history in messages array
5. **ALWAYS** update conversation.updatedAt on every change
6. **ALWAYS** check userId matches authenticated user before mutations

## Common Patterns

### Initial Message Generation
```typescript
// /api/conversation/initial-message
// Generate friendly AI greeting based on projectName/description
// If setup provided, acknowledge and ask for details
// If no setup, ask open-ended question about product idea
```

### Skip Validation
```typescript
// Frontend validation before showing "Continue"
const canSkip = useMemo(() => {
  const userMessages = conversation.messages.filter(m => m.role === "user");
  const hasMinimumContent = userMessages.some(m => m.content.trim().length >= 50);
  return userMessages.length >= 1 && hasMinimumContent;
}, [conversation?.messages]);
```

### Error Handling
```typescript
// ALWAYS wrap API calls in try/catch
// Show user-friendly toast notifications
// Log errors with conversationId context
try {
  const response = await fetch('/api/conversation/message', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }
} catch (error) {
  logger.error('ChatPage.handleSendMessage', error, { conversationId });
  toast({
    variant: 'destructive',
    description: 'Failed to send message. Please try again.',
  });
}
```

## Analytics Events

Track user behavior for insights:
```typescript
import { trackDiscoverySkip } from '@/lib/analytics/discoveryEvents';

// When user clicks "Continue to Questions"
trackDiscoverySkip(conversationId, {
  messageCount: conversation.messages.length,
  userMessageCount: userMessages.length,
});
```

## Testing Checklist

- [ ] New conversation starts with AI greeting
- [ ] User can send messages and receive AI responses
- [ ] "Continue" button appears only when >50 chars provided
- [ ] Context extraction works with varied conversation styles
- [ ] Stage transitions to "questions" correctly
- [ ] Conversation history persists across page reloads
- [ ] Error states display user-friendly messages
- [ ] Setup data (projectName) integrates with conversation

## Reference Docs

Follow patterns from:
- `docs/frontend-architecture.md` - App Router structure
- `docs/component-patterns.md` - Component patterns
- `docs/convex-patterns.md` - Database operations
- `docs/api-routes-guide.md` - API endpoint structure
