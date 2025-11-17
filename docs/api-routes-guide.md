# API Routes Guide

## API Route Structure

All API routes are located in `/app/api/[feature]/[action]/route.ts`

### File Location Pattern

```text
/app/api
  /conversation
    /message/route.ts              # Handle chat messages
    /extract-context/route.ts      # Extract product context
    /initial-message/route.ts      # Generate first message
  /questions
    /generate/route.ts             # Generate questions
    /fill-defaults/route.ts        # Fill default answers
  /research
    /tech-stack/route.ts           # Research technologies
  /validate
    /tech-stack/route.ts           # Validate selections
  /tech-stack
    /suggest-defaults/route.ts     # Suggest defaults
  /prd
    /generate/route.ts             # Generate PRD
```

## Standard Route Template

```typescript
// app/api/feature/action/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { requiredField, optionalField } = body;

    // 3. Validate input
    if (!requiredField) {
      return NextResponse.json(
        { error: "Missing required field" },
        { status: 400 }
      );
    }

    // 4. Perform action (call AI, query DB, etc.)
    const result = await performAction(requiredField);

    // 5. Return response
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Authentication Pattern

### Using Clerk Auth

```typescript
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // userId is Clerk user ID (same as identity.subject in Convex)
}
```

### Passing userId to Convex

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Query Convex
const conversation = await convex.query(api.conversations.get, {
  id: conversationId,
});

// Mutate Convex
await convex.mutation(api.conversations.update, {
  id: conversationId,
  stage: "questions",
});
```

## AI Client Integration

### Claude API (Anthropic SDK)

Located in `lib/ai-clients.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  // Extract text from response
  const assistantMessage = response.content[0];

  // Type guard for safety
  if (!assistantMessage || assistantMessage.type !== "text") {
    throw new Error("Unexpected response type");
  }

  const messageText = assistantMessage.text;

  return NextResponse.json({ message: messageText });
}
```

### Perplexity API (via OpenAI SDK)

```typescript
import OpenAI from "openai";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function POST(req: Request) {
  const { query } = await req.json();

  const response = await perplexity.chat.completions.create({
    model: "llama-3.1-sonar-large-128k-online",
    messages: [
      {
        role: "system",
        content: "You are a helpful research assistant.",
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const result = response.choices[0]?.message?.content;

  return NextResponse.json({ data: result });
}
```

## Request Validation

### Basic Validation

```typescript
export async function POST(req: Request) {
  const body = await req.json();

  // Check required fields
  if (!body.conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }

  // Type validation
  if (typeof body.message !== "string") {
    return NextResponse.json(
      { error: "message must be a string" },
      { status: 400 }
    );
  }

  // Proceed with valid data
}
```

### Using Zod (Recommended)

```typescript
import { z } from "zod";

const requestSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1),
  options: z.object({
    temperature: z.number().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();

  // Validate with Zod
  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.errors,
      },
      { status: 400 }
    );
  }

  const { conversationId, message, options } = result.data;
  // Proceed with validated data
}
```

## Error Handling

### Standard Error Handler

```typescript
try {
  // Risky operation
  const result = await callExternalAPI();
  return NextResponse.json({ data: result });

} catch (error) {
  console.error("[API_ROUTE_ERROR]", error);

  // Specific error handling
  if (error instanceof Anthropic.APIError) {
    return NextResponse.json(
      { error: "AI service error" },
      { status: 503 }
    );
  }

  // Generic error
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### Error Logging

Located in `lib/logger.ts`:

```typescript
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // ...
  } catch (error) {
    logger.error("API Error", {
      route: "/api/conversation/message",
      error: error.message,
      userId,
    });

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```

## Response Patterns

### Success Response

```typescript
return NextResponse.json({
  success: true,
  data: {
    id: "123",
    message: "Created successfully",
  },
});
```

### Error Response

```typescript
return NextResponse.json(
  {
    success: false,
    error: "Something went wrong",
    details: "Specific error message",
  },
  { status: 400 }
);
```

### Status Codes

```typescript
// Success
200 - OK (GET, PUT, DELETE)
201 - Created (POST)

// Client errors
400 - Bad Request (validation failed)
401 - Unauthorized (not authenticated)
403 - Forbidden (authenticated but no permission)
404 - Not Found

// Server errors
500 - Internal Server Error
503 - Service Unavailable (external API failed)
```

## JSON Parsing Utilities

Located in `lib/parse-ai-json.ts`:

### Extracting JSON from AI Responses

```typescript
import { parseAIJSON } from "@/lib/parse-ai-json";

export async function POST(req: Request) {
  const response = await anthropic.messages.create({...});

  const messageText = response.content[0].text;

  // Handles:
  // - Raw JSON
  // - JSON in markdown code blocks
  // - JSON with surrounding text
  const parsed = parseAIJSON(messageText);

  return NextResponse.json({ data: parsed });
}
```

### Manual JSON Extraction

```typescript
function extractJSON(text: string) {
  // Try parsing directly
  try {
    return JSON.parse(text);
  } catch {
    // Extract from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Extract from generic code block
    const codeMatch = text.match(/```\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return JSON.parse(codeMatch[1]);
    }

    throw new Error("No JSON found in response");
  }
}
```

## Common API Route Patterns

### Chat Message Handler

```typescript
// app/api/conversation/message/route.ts
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, message } = await req.json();

  // 1. Save user message to Convex
  await convex.mutation(api.conversations.addMessage, {
    conversationId,
    role: "user",
    content: message,
  });

  // 2. Get conversation history
  const conversation = await convex.query(api.conversations.get, {
    id: conversationId,
  });

  // 3. Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: conversation.messages,
  });

  const assistantMessage = response.content[0];
  if (!assistantMessage || assistantMessage.type !== "text") {
    throw new Error("Unexpected response");
  }

  // 4. Save assistant message
  await convex.mutation(api.conversations.addMessage, {
    conversationId,
    role: "assistant",
    content: assistantMessage.text,
  });

  return NextResponse.json({ message: assistantMessage.text });
}
```

### Generation Handler

```typescript
// app/api/prd/generate/route.ts
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await req.json();

  // 1. Fetch all required data
  const conversation = await convex.query(api.conversations.get, {
    id: conversationId,
  });

  // 2. Build comprehensive prompt
  const systemPrompt = `Generate a comprehensive PRD...`;
  const userPrompt = `
    Conversation: ${JSON.stringify(conversation.messages)}
    Questions: ${JSON.stringify(conversation.questions)}
    Tech Stack: ${JSON.stringify(conversation.selectedTechStack)}
  `;

  // 3. Call Claude with large token limit
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8192, // Large for comprehensive PRD
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  // 4. Parse JSON response
  const prdData = parseAIJSON(response.content[0].text);

  // 5. Save to Convex
  const prdId = await convex.mutation(api.prds.create, {
    conversationId,
    prdData,
    productName: prdData.projectOverview.productName,
  });

  // 6. Update conversation stage
  await convex.mutation(api.conversations.updateStage, {
    conversationId,
    stage: "completed",
  });

  return NextResponse.json({ prdId });
}
```

### Validation Handler

```typescript
// app/api/validate/tech-stack/route.ts
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { selections } = await req.json();

  const systemPrompt = `Analyze tech stack compatibility...`;
  const userPrompt = `Validate: ${JSON.stringify(selections)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const warnings = parseAIJSON(response.content[0].text);

  return NextResponse.json({ warnings });
}
```

## Environment Variables

### Required for AI APIs

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
```

### Access in Route

```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error("ANTHROPIC_API_KEY not configured");
}
```

## Convex Integration

### Using ConvexHttpClient

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

// Query
const data = await convex.query(api.table.get, { id });

// Mutation
await convex.mutation(api.table.create, { data });
```

### Type-Safe Calls

```typescript
import { Id } from "@/convex/_generated/dataModel";

const conversationId: Id<"conversations"> = body.conversationId;

await convex.mutation(api.conversations.update, {
  id: conversationId,  // Type-safe
  stage: "questions",
});
```

## Rate Limiting Considerations

### Claude API Limits

- Sonnet 4: 100,000 tokens/min
- Monitor usage in console logs
- Implement exponential backoff for 429 errors

### Example Retry Logic

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Usage
const response = await callWithRetry(() =>
  anthropic.messages.create({...})
);
```

## Testing API Routes

### Using cURL

```bash
curl -X POST http://localhost:3000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "123", "message": "Hello"}'
```

### Using Postman/Insomnia

1. Set method to POST
2. Add Content-Type: application/json header
3. Include authentication cookies
4. Send JSON body

## Best Practices

1. **Always authenticate** - Check userId at start
2. **Validate input** - Use Zod or manual checks
3. **Handle errors** - Try/catch with specific error types
4. **Log errors** - Use logger for debugging
5. **Type safety** - Use TypeScript types for Convex IDs
6. **Secure API keys** - Never expose in client code
7. **Return consistent responses** - Use standard format
8. **Document errors** - Clear error messages for debugging
9. **Monitor performance** - Log slow requests
10. **Rate limit** - Implement retry logic for AI APIs
