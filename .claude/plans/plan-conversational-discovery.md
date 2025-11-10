# Implementation Plan: Conversational Product Discovery

## Overview
Build an AI-powered chat interface where users describe their product idea and receive intelligent follow-up questions. This is the first stage of the PRD generation flow.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript + shadcn/ui
- **Backend**: Next.js API Routes + Convex
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Auth**: Clerk (already configured)
- **Database**: Convex

---

## Phase 1: Database Schema (Convex)

### File: `convex/schema.ts`

Add the Conversation schema:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_stage", ["userId", "currentStage"]),
});
```

**Key Points:**
- `userId` links to Clerk authentication
- `messages` stores full conversation history
- `currentStage` tracks progress through PRD workflow
- `productContext` accumulates structured data from conversation
- Indexes enable fast queries by user and stage

---

## Phase 2: UI Components (Build UI First!)

### 2.1 Chat Container Component

**File**: `components/chat/ChatContainer.tsx`

```typescript
"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatContainer({ messages, isTyping }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={scrollRef} />
    </div>
  );
}
```

### 2.2 Chat Message Component

**File**: `components/chat/ChatMessage.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
```

### 2.3 Chat Input Component

**File**: `components/chat/ChatInput.tsx`

```typescript
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your product idea..."
          className="min-h-[60px] max-h-[200px]"
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={disabled || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

### 2.4 Typing Indicator Component

**File**: `components/chat/TypingIndicator.tsx`

```typescript
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 3: Convex Functions

### 3.1 Create New Conversation Mutation

**File**: `convex/conversations.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
      currentStage: "discovery",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});
```

### 3.2 Add Message Mutation

**File**: `convex/conversations.ts` (add to existing file)

```typescript
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
```

### 3.3 Get Conversation Query

**File**: `convex/conversations.ts` (add to existing file)

```typescript
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
```

### 3.4 List User Conversations Query

**File**: `convex/conversations.ts` (add to existing file)

```typescript
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
```

---

## Phase 4: API Routes for Claude Integration

### 4.1 Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### 4.2 Add Environment Variable

Add to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 4.3 Create Conversation API Route

**File**: `app/api/conversation/message/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant helping users create a Product Requirements Document (PRD).

Your goal in this discovery phase is to:
1. Understand the user's product idea
2. Ask clarifying questions about vague or incomplete aspects
3. Be conversational and encouraging
4. Keep responses concise (2-3 sentences max)
5. Gradually gather information about:
   - What the product does
   - Who will use it
   - Core features needed
   - Any specific requirements

When you have enough basic information, confirm understanding and let the user know you'll move to detailed questions next.`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0];
    if (assistantMessage.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({
      message: assistantMessage.text,
      usage: response.usage,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
```

---

## Phase 5: Main Chat Page

### File: `app/chat/[conversationId]/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const { toast } = useToast();

  const conversation = useQuery(api.conversations.get, { conversationId });
  const addMessage = useMutation(api.conversations.addMessage);

  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      // Add user message to Convex
      await addMessage({
        conversationId,
        role: "user",
        content,
      });

      setIsTyping(true);

      // Call API for Claude response
      const response = await fetch("/api/conversation/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...conversation.messages,
            { role: "user", content, timestamp: Date.now() },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add assistant message to Convex
      await addMessage({
        conversationId,
        role: "assistant",
        content: data.message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Product Discovery</h1>
        <p className="text-sm text-muted-foreground">
          Tell me about your product idea
        </p>
      </div>

      <ChatContainer messages={conversation.messages} isTyping={isTyping} />

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
```

### File: `app/chat/new/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function NewChatPage() {
  const router = useRouter();
  const createConversation = useMutation(api.conversations.create);

  useEffect(() => {
    const initConversation = async () => {
      const conversationId = await createConversation();
      router.push(`/chat/${conversationId}`);
    };

    initConversation();
  }, [createConversation, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Creating new conversation...</p>
    </div>
  );
}
```

---

## Phase 6: Testing Checklist

### Manual Testing
- [ ] User can start a new conversation
- [ ] User messages appear immediately in chat
- [ ] AI responses stream in with typing indicator
- [ ] Messages persist after page reload
- [ ] Conversation history shows correct timestamps
- [ ] Mobile layout is responsive
- [ ] Keyboard shortcuts work (Enter to send, Shift+Enter for newline)

### Error Scenarios
- [ ] Unauthenticated users are redirected
- [ ] Network errors show user-friendly messages
- [ ] Invalid conversation IDs handled gracefully
- [ ] Users can't access other users' conversations

### Performance
- [ ] Chat scrolls smoothly with 50+ messages
- [ ] No memory leaks on long conversations
- [ ] Optimistic updates feel instant

---

## Common Pitfalls to Avoid

### 1. **Don't Store Entire Conversation in API Calls**
- Only send last 10-20 messages to Claude
- Summarize older context if needed

### 2. **Security: Row-Level Access Control**
- Always verify `userId` matches authenticated user
- Use Convex indexes for fast lookups

### 3. **Type Safety**
- Use generated Convex types (`Id<"conversations">`)
- Define explicit return types for mutations/queries

### 4. **UX: Loading States**
- Show typing indicator immediately
- Disable input during API calls
- Handle retry on errors

### 5. **Mobile Responsiveness**
- Test on small screens (max-w-[80%] on messages)
- Ensure textarea resizes properly
- Test keyboard behavior on mobile

---

## Next Steps

After completing this feature:
1. Test the conversation flow end-to-end
2. Move to **AI-Powered Clarifying Questions** feature
3. Implement stage transition from "discovery" to "clarifying"
4. Extract product context from conversation for PRD generation

---

## Integration Notes

This feature connects to:
- **Clerk Auth** - User authentication (already configured)
- **Convex DB** - Real-time conversation storage
- **Claude API** - AI responses
- **Next Feature** - Transitions to clarifying questions stage

When the AI determines enough information is gathered, update `currentStage` to `"clarifying"` to trigger next phase.
