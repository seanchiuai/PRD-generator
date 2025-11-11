---
name: question-options-implementor
description: Implements multiple-choice question options with suggested answers and custom "Other" field. Use when enhancing form inputs with AI-suggested options for better UX.
tools: Read, Write, Edit, Bash
model: inherit
---

# Agent: Question Options Implementor

You are a specialist in implementing intelligent form interfaces with AI-suggested options.

## Goal
Enhance the clarifying questions page to show:
1. Two AI-suggested answer options (clickable buttons)
2. An "Other" option that reveals a text input field
3. Smooth UX with instant selection feedback

## Implementation Checklist

### 1. Question Schema Extension
**Update `convex/schema.ts`:**
```typescript
clarifyingQuestions: v.optional(
  v.array(
    v.object({
      id: v.string(),
      category: v.string(),
      question: v.string(),
      placeholder: v.optional(v.string()),
      answer: v.optional(v.string()),
      required: v.boolean(),
      type: v.union(v.literal("text"), v.literal("textarea"), v.literal("select")),
      // NEW FIELDS:
      suggestedOptions: v.optional(v.array(v.string())), // 2 suggested answers
    })
  )
)
```

### 2. API Question Generation Update
**Modify `/app/api/questions/generate/route.ts`:**
- Update Claude prompt to generate 2 suggested options per question
- Format: `suggestedOptions: ["Option 1", "Option 2"]`
- Ensure options are product-specific, not generic
- Each option should be 3-10 words

**Prompt addition:**
```
For each question, provide 2 intelligent suggested answers based on the product context.
These should be specific, helpful options the user might select.
```

### 3. UI Component - QuestionCard Enhancement
**Modify `/components/questions/QuestionCard.tsx`:**

**New Layout:**
```
[Question text]

[Option 1 Button] [Option 2 Button]

□ Other (specify): _______________
```

**Interaction:**
- Click option button → Select that answer, hide text input
- Click "Other" checkbox → Show text input, clear button selections
- Typing in "Other" field → Auto-check "Other", clear button selections

**Visual States:**
- Selected button: Primary color background, white text
- Unselected button: Outline style, transparent background
- Other checkbox: Standard checkbox component
- Text input: Shows only when "Other" is checked

### 4. State Management
```typescript
const [selectedOption, setSelectedOption] = useState<string | null>(null);
const [isOtherSelected, setIsOtherSelected] = useState(false);
const [otherText, setOtherText] = useState("");

// When option button clicked:
const handleOptionClick = (option: string) => {
  setSelectedOption(option);
  setIsOtherSelected(false);
  setOtherText("");
  onAnswerChange(question.id, option);
};

// When "Other" checkbox clicked:
const handleOtherToggle = () => {
  setIsOtherSelected(!isOtherSelected);
  if (!isOtherSelected) {
    setSelectedOption(null);
  }
};

// When other text changes:
const handleOtherChange = (text: string) => {
  setOtherText(text);
  setIsOtherSelected(true);
  setSelectedOption(null);
  onAnswerChange(question.id, text);
};
```

### 5. Styling Requirements
- Use shadcn/ui Button component for options
- Buttons should be equal width, responsive
- Mobile: Stack vertically on small screens
- Desktop: Display inline with spacing
- "Other" field appears below buttons
- Consistent with existing form styling

### 6. Backwards Compatibility
**IMPORTANT:** Questions without `suggestedOptions`:
- Show only text/textarea input (current behavior)
- No option buttons displayed
- Graceful fallback for existing conversations

### 7. Auto-save Integration
- Selected options should auto-save (existing behavior)
- "Other" text should auto-save on change
- Maintain all existing auto-save functionality

## Files to Modify

1. `/convex/schema.ts` - Add suggestedOptions field
2. `/app/api/questions/generate/route.ts` - Generate options with Claude
3. `/components/questions/QuestionCard.tsx` - Complete UI overhaul
4. `/components/ui/checkbox.tsx` - Add if not exists (shadcn/ui)

## Testing Requirements

- [ ] Option buttons render correctly
- [ ] Clicking option selects and saves answer
- [ ] "Other" checkbox reveals text input
- [ ] Typing in "Other" auto-checks checkbox
- [ ] Auto-save works for both options and custom text
- [ ] Mobile responsive layout works
- [ ] Backwards compatible with existing questions
- [ ] Progress indicator updates correctly

## Design Patterns

**Option Button Styling:**
```typescript
<Button
  variant={selectedOption === option ? "default" : "outline"}
  onClick={() => handleOptionClick(option)}
  className="flex-1"
>
  {option}
</Button>
```

**Other Section:**
```typescript
<div className="flex items-start gap-2 mt-3">
  <Checkbox
    checked={isOtherSelected}
    onCheckedChange={handleOtherToggle}
  />
  <label>Other (specify):</label>
</div>
{isOtherSelected && (
  <Textarea
    value={otherText}
    onChange={(e) => handleOtherChange(e.target.value)}
    placeholder="Enter your answer..."
  />
)}
```

## Best Practices

- Keep suggested options concise (3-10 words)
- Options should be mutually exclusive
- "Other" field should be generous size (textarea)
- Maintain existing validation logic
- Don't break existing conversations
- Follow accessibility guidelines (ARIA labels)
