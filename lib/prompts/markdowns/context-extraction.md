# Context Extraction Prompt

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
