---
name: agent-prd-generation
description: Generates comprehensive Product Requirements Documents in structured JSON format. Synthesizes discovery conversation, answered questions, and selected tech stack into actionable technical specifications with features, data models, APIs, timelines, and scope boundaries. Use when implementing or fixing PRD generation.
model: inherit
color: orange
---

# Agent: PRD Generation

Creates implementation-focused PRDs that serve as technical checklists for building products.

## Core Responsibilities

1. **Data Synthesis** - Combine conversation, questions, and tech stack into cohesive PRD
2. **Feature Definition** - Create 5-8 detailed MVP features with acceptance criteria
3. **Architecture Design** - Define data models, API endpoints, system design
4. **Scope Management** - Clearly define what's included, deferred, and excluded
5. **Timeline Planning** - Provide realistic implementation phases
6. **Risk Identification** - Identify technical risks and mitigation strategies

## Implementation Patterns

### 1. PRD Schema
```typescript
// convex/schema.ts
prds: defineTable({
  conversationId: v.id("conversations"),
  userId: v.string(),
  prdData: v.any(), // Full PRD JSON matching generation prompt structure
  productName: v.string(),
  version: v.number(),
  status: v.union(
    v.literal("generating"),
    v.literal("completed"),
    v.literal("failed")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_conversation", ["conversationId"])
  .index("by_user_and_created", ["userId", "createdAt"]),
```

### 2. Generation API
```typescript
// /api/prd/generate
POST {
  conversationId: Id<"conversations">
}

// Retrieves from conversation:
// 1. messages (discovery conversation)
// 2. clarifyingQuestions + answers
// 3. selectedTechStack OR selection (auto-defaults)
// 4. extractedContext

// Sends to Claude with lib/prompts/markdowns/prd-generation.md prompt
// Claude returns ONLY valid JSON (no explanations)

// Response structure matches exact schema from prompt:
{
  projectOverview: { ... },
  solutionOverview: { ... },
  techStack: { ... },
  features: {
    mvpFeatures: [...],
    niceToHaveFeatures: [...],
    outOfScope: [...]
  },
  successCriteria: { ... },
  technicalArchitecture: {
    dataModels: [...],
    apiEndpoints: [...],
    integrations: [...]
  },
  implementationFlows: { ... },
  timeline: { ... },
  technicalRisks: [...]
}
```

### 3. PRD Mutation
```typescript
// convex/prds.ts
export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    prdData: v.any(),
    productName: v.string(),
  },
  handler: async (ctx, { conversationId, prdData, productName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const prdId = await ctx.db.insert("prds", {
      conversationId,
      userId: identity.subject,
      prdData,
      productName,
      version: 1,
      status: "completed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Link PRD to conversation
    await ctx.db.patch(conversationId, {
      prdId,
      currentStage: "completed",
      updatedAt: Date.now(),
    });

    return prdId;
  },
});
```

### 4. PRD Display Page
```typescript
// app/prd/[prdId]/page.tsx
// Rich display of PRD with sections:
// - Project Overview
// - Tech Stack (with reasoning)
// - MVP Features (with acceptance criteria, dependencies, priority)
// - Data Models (with fields, relationships)
// - API Endpoints
// - Timeline & Phases
// - Technical Risks
// - Out of Scope (clearly marked)

// Export options:
// - JSON download
// - Markdown download
// - Print-friendly view
// - Share link
```

### 5. PRD Versioning (Future)
```typescript
// Support multiple versions of same PRD
// When regenerating:
version: existingPRD.version + 1

// Query latest version:
export const getLatest = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("prds")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .first();
  },
});
```

## Key Files

- `app/chat/[conversationId]/generate/page.tsx` - Generation trigger UI
- `app/prd/[prdId]/page.tsx` - PRD display
- `app/api/prd/generate/route.ts` - Generation API
- `lib/prompts/markdowns/prd-generation.md` - Claude prompt
- `convex/prds.ts` - PRD mutations/queries
- `components/prd/` - PRD display components

## Critical Rules

1. **ALWAYS** use exact prompt from `lib/prompts/markdowns/prd-generation.md`
2. **ALWAYS** validate JSON response before saving
3. **ALWAYS** include all conversation context (messages, questions, tech stack)
4. **NEVER** generate PRD without tech stack selections
5. **ALWAYS** handle both selection (auto) and selectedTechStack (manual)
6. **ALWAYS** focus on technical implementation, not business validation
7. **ALWAYS** define clear scope boundaries (outOfScope section)
8. **ALWAYS** create 5-8 MVP features minimum

## PRD Quality Standards

### Feature Completeness
```typescript
// Each MVP feature MUST have:
{
  name: "User Authentication",
  description: "Secure user registration and login system",
  functionality: "Users can create accounts, log in, and manage sessions",
  userInteraction: "Sign up form, login form, profile page, logout button",
  expectedBehavior: "Users stay logged in across sessions, redirected to dashboard after login",
  acceptanceCriteria: [
    "Users can register with email and password",
    "Email verification required before access",
    "Password reset via email works",
    "Sessions persist for 30 days",
    "Logout clears session and redirects to login"
  ],
  technicalRequirements: [
    "Clerk authentication integration",
    "JWT token management",
    "Protected route middleware",
    "User profile storage in database"
  ],
  dependencies: ["Database schema for users", "Email service setup"],
  priority: "critical"
}

// ✅ GOOD - specific, measurable, actionable
// ❌ BAD - vague, missing acceptance criteria, no technical details
```

### Data Model Quality
```typescript
// Each data model MUST have:
{
  entityName: "Project",
  description: "Represents a user's project/product idea",
  fields: [
    { name: "id", type: "string", required: true },
    { name: "userId", type: "string", required: true },
    { name: "name", type: "string", required: true },
    { name: "description", type: "string", required: true },
    { name: "status", type: "enum[draft|active|archived]", required: true },
    { name: "createdAt", type: "timestamp", required: true },
    { name: "updatedAt", type: "timestamp", required: true }
  ],
  relationships: [
    "Belongs to User (one-to-many)",
    "Has many Tasks (one-to-many)",
    "Has one TeamSettings (one-to-one)"
  ]
}

// Fields align with features
// Relationships clearly defined
// Types specific (not just "string")
```

### API Endpoint Completeness
```typescript
// Each endpoint MUST specify:
{
  method: "POST",
  path: "/api/projects",
  purpose: "Create new project for authenticated user",
  authentication: true
}

// Include all CRUD operations
// Map to features (if feature needs data, it needs APIs)
// Specify auth requirements
```

### Scope Boundaries
```typescript
// outOfScope MUST be comprehensive:
{
  feature: "Multi-language support",
  reason: "MVP focuses on English-only to validate core value prop first",
  category: "Internationalization"
}

{
  feature: "Mobile native apps",
  reason: "Starting with web-responsive design, native apps deferred to v2",
  category: "Platform scope"
}

{
  feature: "AI-powered recommendations",
  reason: "Complex feature requiring ML infrastructure not in MVP",
  category: "Advanced features"
}

// Clear, justified exclusions
// Prevents scope creep
// Sets expectations
```

## Generation Flow

### Pre-Generation Validation
```typescript
// Before calling /api/prd/generate, verify:
const conversation = await ctx.db.get(conversationId);

// 1. Has conversation messages
if (!conversation.messages || conversation.messages.length < 2) {
  throw new Error("Insufficient conversation data");
}

// 2. Has answered questions
if (!conversation.clarifyingQuestions) {
  throw new Error("Questions not answered");
}

// 3. Has tech stack (either format)
if (!conversation.selection && !conversation.selectedTechStack) {
  throw new Error("Tech stack not selected");
}

// 4. Has extracted context
if (!conversation.extractedContext) {
  throw new Error("Context not extracted");
}
```

### Generation Process
```typescript
// 1. Gather all inputs
const inputs = {
  conversation: conversation.messages,
  extractedContext: conversation.extractedContext,
  questions: conversation.clarifyingQuestions,
  techStack: conversation.selectedTechStack || convertSelection(conversation.selection),
  researchResults: conversation.researchResults // For tech stack details
};

// 2. Format prompt with inputs
const prompt = formatPRDPrompt(inputs);

// 3. Call Claude API
const response = await anthropic.messages.create({
  model: "claude-sonnet-4",
  max_tokens: 8000,
  messages: [{ role: "user", content: prompt }]
});

// 4. Parse and validate JSON
const prdData = JSON.parse(response.content[0].text);
validatePRDStructure(prdData);

// 5. Save to database
const prdId = await createPRD({
  conversationId,
  prdData,
  productName: prdData.projectOverview.productName
});
```

### Error Handling
```typescript
// Handle generation failures gracefully
try {
  const prdData = await generatePRD(conversationId);
  return { success: true, prdId };
} catch (error) {
  logger.error("PRD generation failed", error, { conversationId });

  // Save failed attempt
  await ctx.db.insert("prds", {
    conversationId,
    userId: identity.subject,
    prdData: { error: error.message },
    productName: "Failed Generation",
    version: 1,
    status: "failed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    success: false,
    error: "Failed to generate PRD. Please try again."
  };
}
```

## UI/UX Patterns

### Generation Page
```typescript
// Show generation progress
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <Loader2 className="h-5 w-5 animate-spin" />
    <p>Generating your PRD...</p>
  </div>

  <div className="space-y-2">
    <p className="text-sm text-muted-foreground">
      This may take 30-60 seconds
    </p>
    <Progress value={progress} />
  </div>

  <ul className="text-sm space-y-1">
    <li className={step >= 1 ? "text-green-600" : "text-muted-foreground"}>
      ✓ Analyzing conversation
    </li>
    <li className={step >= 2 ? "text-green-600" : "text-muted-foreground"}>
      ✓ Processing questions and answers
    </li>
    <li className={step >= 3 ? "text-green-600" : "text-muted-foreground"}>
      ✓ Incorporating tech stack
    </li>
    <li className={step >= 4 ? "text-green-600" : "text-muted-foreground"}>
      ✓ Generating features and architecture
    </li>
  </ul>
</div>

// Redirect to /prd/[prdId] when complete
```

### PRD Display
```typescript
// Tabbed navigation for sections
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="features">Features</TabsTrigger>
    <TabsTrigger value="architecture">Architecture</TabsTrigger>
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    <TabsTrigger value="risks">Risks</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <ProjectOverview data={prd.projectOverview} />
    <TechStack data={prd.techStack} />
  </TabsContent>

  <TabsContent value="features">
    <MVPFeatures features={prd.features.mvpFeatures} />
    <NiceToHave features={prd.features.niceToHaveFeatures} />
    <OutOfScope items={prd.features.outOfScope} />
  </TabsContent>

  {/* ... other tabs */}
</Tabs>

// Export actions
<DropdownMenu>
  <DropdownMenuTrigger>Export</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={downloadJSON}>
      Download JSON
    </DropdownMenuItem>
    <DropdownMenuItem onClick={downloadMarkdown}>
      Download Markdown
    </DropdownMenuItem>
    <DropdownMenuItem onClick={print}>
      Print PRD
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Analytics Events

```typescript
import { trackPRDGeneration } from '@/lib/analytics/prdEvents';

// When generation starts
trackPRDGeneration(conversationId, "started", {
  hasExtractedContext: !!conversation.extractedContext,
  questionsAnswered: conversation.clarifyingQuestions?.filter(q => q.answer).length,
  techStackMode: conversation.selection ? "auto" : "manual"
});

// When generation completes
trackPRDGeneration(conversationId, "completed", {
  duration: Date.now() - startTime,
  featureCount: prdData.features.mvpFeatures.length,
  dataModelCount: prdData.technicalArchitecture.dataModels.length,
  apiEndpointCount: prdData.technicalArchitecture.apiEndpoints.length,
  prdSizeBytes: JSON.stringify(prdData).length
});
```

## Testing Checklist

- [ ] Generation works with minimal conversation (skip path)
- [ ] Generation works with full conversation + questions
- [ ] Both selection modes (auto/manual) produce valid PRDs
- [ ] JSON structure matches prompt schema exactly
- [ ] All required sections present in generated PRD
- [ ] Features have acceptance criteria and dependencies
- [ ] Data models align with features
- [ ] API endpoints support features
- [ ] OutOfScope section comprehensive
- [ ] PRD display page renders all sections
- [ ] Export to JSON/Markdown works
- [ ] Error states handled gracefully
- [ ] PRD saved and linked to conversation

## Reference Docs

Follow patterns from:
- `docs/frontend-architecture.md` - Page structure
- `docs/component-patterns.md` - Display components
- `docs/convex-patterns.md` - Database operations
- `docs/api-routes-guide.md` - AI integration
- `docs/type-definitions.md` - PRD TypeScript types
