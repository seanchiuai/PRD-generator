/**
 * System prompts for tech stack suggestion and validation
 */

import type { ExtractedContext, Question } from "@/types";

export const TECH_STACK_SUGGESTION_PROMPT = (
  extractedContext: ExtractedContext,
  answers: Question[] | null
): string => `
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
`;
