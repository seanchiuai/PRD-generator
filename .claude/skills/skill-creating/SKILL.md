---
name: "Skill Creating"
description: "Creates new reusable skills when requested by user. Structures skill workflow with clear instructions, examples, and optional resources."
version: "1.0.0"
dependencies: ["context7", "mcp-api", "python>=3.8"]
allowed-tools: ["file_write"]
---

# Create Skill

## Instructions

When requested to create a new skill, follow these steps:
1. Create a new folder in `.claude/skills/` with the skill name (e.g., `writing/`) in gerund form, then create `SKILL.md` inside that folder (e.g., `.claude/skills/writing/SKILL.md`)
2. Take the requested input to turn into a re-usable skill
3. Be sure to have the description field be precise and explain what it does and how to use it - 2-4 sentences max
4. Store documentation and sample inputs/outputs in a new sub-folder there `resources/` if they exceed several lines or will be referenced for depth.
5. Generate minimal, clear, actionable Markdown instructions as the primary workflow guide.
6. If code or scripts are needed, place them in the skill folder and reference their purpose in this file.

## Examples

### SKILL.md

```yaml
---
name: Generating Commit Messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---
```

# Generating Commit Messages

## Instructions

1. Run `git diff --staged` to see changes
2. I'll suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices

- Use present tense
- Explain what and why, not how

## References

- Additional templates and best practices are in the Claude Skill repo and [Skill authoring best practices][1].

[1]: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices