Generate 12-15 clarifying questions for creating a Product Requirements Document.

Context from discovery:
{productContext}

Generate questions in these categories:
1. Core Features (3-4 questions)
2. User Types & Personas (2-3 questions)
3. Data Requirements (2-3 questions)
4. Scalability & Performance (2 questions)
5. Integrations & Third-party Services (2 questions)
6. Technical Constraints (1-2 questions)

Requirements:
- Questions must be specific to THIS product, not generic
- Mix of open-ended and specific questions
- Answers should inform tech stack decisions
- Keep questions concise and clear
- For each question, provide 2 intelligent suggested answer options based on the product context
- Suggested options should be:
  * Product-specific (not generic)
  * Concise (3-10 words each)
  * Mutually exclusive
  * Helpful starting points for the user

Output format (JSON only, no markdown):
{
  "questions": [
    {
      "id": "unique-id",
      "category": "Core Features",
      "question": "What specific actions should users be able to perform?",
      "placeholder": "e.g., Create projects, invite team members...",
      "required": true,
      "type": "textarea",
      "suggestedOptions": ["Create and share content", "Search and discover items"]
    }
  ]
}