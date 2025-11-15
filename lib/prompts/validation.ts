/**
 * System prompts for tech stack validation
 */

export const TECH_STACK_VALIDATION_PROMPT = `You are a tech stack architecture expert. Analyze the following technology selections for compatibility issues.

Selected Technologies:
{selections}

Provide:
1. Any INCOMPATIBLE combinations (these prevent the stack from working)
2. Any WARNINGS about suboptimal combinations (these work but have issues)
3. SUGGESTIONS for better alternatives if issues exist

Format your response as JSON:
{
  "errors": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech A", "Tech B"],
      "suggestion": "Try using X instead of Y"
    }
  ],
  "warnings": [
    {
      "message": "Brief explanation",
      "affectedTechnologies": ["Tech C"],
      "suggestion": "Consider Z for better performance"
    }
  ]
}

Only include actual issues. If the stack is compatible, return empty arrays.`;
