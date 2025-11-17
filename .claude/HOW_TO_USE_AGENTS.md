# How to Use Feature-Specific Agents

## Quick Reference

When working on a specific feature, use the corresponding agent for context-aware assistance.

---

## Agent Usage Examples

### Working on Discovery/Chat Feature

```bash
# Example user request:
"The chat messages aren't saving to the database properly"

# Claude will use:
agent-prd-discovery.md

# This agent knows:
- Conversation schema and mutations
- Message handling patterns
- Context extraction flow
- Common chat implementation issues
```

### Working on Questions Feature

```bash
# Example user request:
"Add a new question type for date picker"

# Claude will use:
agent-clarifying-questions.md

# This agent knows:
- Question schema structure
- Input type patterns
- Auto-fill logic
- Progress calculation
```

### Working on Tech Stack Feature

```bash
# Example user request:
"Research isn't using the latest Next.js docs"

# Claude will use:
agent-tech-stack-research.md

# This agent knows:
- context7 MCP integration
- Research API patterns
- Category determination logic
- Validation patterns
```

### Working on PRD Generation Feature

```bash
# Example user request:
"The generated PRD is missing API endpoints"

# Claude will use:
agent-prd-generation.md

# This agent knows:
- PRD generation prompt structure
- JSON validation requirements
- Display components
- Export functionality
```

---

## When to Use Default Agents

### Clerk Authentication Issues
```bash
# Use: agent-clerk.md
# Examples:
- "JWT tokens not working with Convex"
- "Users can't sign up"
- "Add social login options"
```

### Convex Backend Issues
```bash
# Use: agent-convex.md
# Examples:
- "CORS errors on HTTP endpoints"
- "File upload to storage failing"
- "Need authenticated mutations"
```

### Next.js Frontend Issues
```bash
# Use: agent-nextjs.md
# Examples:
- "App Router routing issues"
- "Server components vs client components"
- "Middleware not protecting routes"
```

### Error Fixing
```bash
# Use: agent-error-fixer.md
# Examples:
- "Fix all TypeScript errors"
- "Resolve build failures"
- "Address code review issues"
```

---

## Using Implementation Plans

### Start a New Feature

1. **Read the plan:**
   ```bash
   # Example: Starting clarifying questions
   cat .claude/plans/plan-clarifying-questions.md
   ```

2. **Ask Claude to implement:**
   ```
   "Implement Phase 2 of plan-clarifying-questions (API Routes)"
   ```

3. **Claude will:**
   - Use the corresponding agent
   - Follow the plan steps
   - Create necessary files
   - Test implementation
   - Update todos

### Implement All Plans

Use the `/cook` command:
```bash
/cook
```

This will:
- Read all plans in `.claude/plans/`
- Use corresponding agents
- Implement sequentially
- Track progress
- Handle errors

---

## Agents + Plans Workflow

### Example: Adding Questions Feature

**Step 1:** Review the agent
```
Read .claude/agents/agent-clarifying-questions.md
Understand patterns and rules
```

**Step 2:** Review the plan
```
Read .claude/plans/plan-clarifying-questions.md
Note phases and estimated times
```

**Step 3:** Ask Claude
```
"Implement the clarifying questions feature using the plan.
Focus on Phase 2 (API Routes) first."
```

**Step 4:** Test and iterate
```
"Run the dev server and test question generation.
Fix any issues that come up."
```

**Step 5:** Move to next phase
```
"Questions API working! Let's implement Phase 3 (Frontend Components)."
```

---

## Agent Features

### What Agents Provide

✅ **Implementation Patterns** - Proven code patterns
✅ **Critical Rules** - Must-follow guidelines
✅ **Common Pitfalls** - What to avoid
✅ **Key Files** - Where to make changes
✅ **Testing Checklists** - What to verify
✅ **Error Handling** - How to handle failures
✅ **Best Practices** - Quality standards

### What Agents Know

Each agent has deep knowledge of:
- Database schemas specific to their feature
- API endpoint patterns
- Frontend component structure
- Mutations and queries
- Validation logic
- UX patterns
- Analytics events

---

## Tips for Best Results

### 1. Be Specific About the Feature
❌ "Fix the app"
✅ "Fix the question auto-fill logic in the clarifying questions feature"

### 2. Reference Agents When Needed
❌ "How do I save questions?"
✅ "Using agent-clarifying-questions, how do I save questions to Convex?"

### 3. Follow Implementation Order
- Database schema first
- API routes second
- Frontend components third
- Integration and testing last

### 4. Test After Each Phase
Don't wait until everything is built to test. Test incrementally.

### 5. Use Plans for Estimates
Plans include time estimates - use them for planning sprints.

---

## Quick Commands

```bash
# List all agents
ls .claude/agents/

# List all plans
ls .claude/plans/

# Read an agent
cat .claude/agents/agent-prd-discovery.md

# Read a plan
cat .claude/plans/plan-prd-discovery.md

# Implement all plans
/cook

# Create new agent
# Use the agent-creating skill
```

---

## Troubleshooting

### "Claude isn't using the right agent"
**Solution:** Explicitly mention the agent
```
"Using agent-tech-stack-research, fix the category determination logic"
```

### "Agent patterns don't match my code"
**Solution:** Update the agent with your patterns
```
"Update agent-prd-discovery.md to reflect our new message schema"
```

### "Plan estimates are off"
**Solution:** Update the plan after implementation
```
"Update plan-clarifying-questions.md with actual time taken: 12h instead of 16h"
```

### "Need a new agent for a new feature"
**Solution:** Use the agent-creating skill
```
/use skill agent-creating

# Describe the feature and patterns
# Claude will create a new agent
```

---

## Integration with Workflow

### Development Workflow

1. **Feature Request** → Check if agent exists
2. **Read Agent** → Understand patterns
3. **Read Plan** → Understand phases
4. **Implement** → Follow plan with agent assistance
5. **Test** → Verify success criteria
6. **Update Docs** → Refine agent/plan if needed

### Code Review Workflow

1. **Review Changes** → Which feature?
2. **Check Agent** → Does code follow patterns?
3. **Verify Tests** → Are success criteria met?
4. **Update Agent** → Document new patterns

---

## Advanced Usage

### Combining Agents

Some tasks span multiple features:

```
"Using agent-prd-discovery and agent-clarifying-questions,
implement the transition from discovery to questions stage"
```

### Creating Variations

Fork an agent for a specific use case:

```
"Create agent-prd-discovery-enterprise.md based on
agent-prd-discovery.md but with multi-tenant patterns"
```

### Agent-Driven Development

Let agents guide your architecture:

```
"Based on agent-tech-stack-research, what's the best
way to add a new 'design tools' category?"
```

---

## Summary

- **4 feature agents** for PRD Generator core features
- **4 default agents** for stack-level concerns
- **4 implementation plans** with time estimates
- **~94 hours** total implementation time
- **Modular** - use agents independently or together
- **Documented** - patterns, rules, examples included

**Next Step:** Start with plan-prd-discovery.md and implement phase by phase!

---

**Last Updated:** 2025-11-17
