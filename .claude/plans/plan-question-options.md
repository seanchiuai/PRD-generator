# Implementation Plan: Question Options with AI Suggestions

**Feature:** Multiple-choice options for clarifying questions
**Agent:** question-options-implementor
**Estimated Time:** 2-3 hours
**Priority:** High

---

## Overview

Enhance the clarifying questions interface to provide users with:
1. **Two AI-suggested answer options** (clickable buttons)
2. **"Other" option** with custom text input
3. Improved UX with faster question completion

This reduces cognitive load and speeds up the PRD creation process while maintaining flexibility for custom answers.

## Requirements

### Functional Requirements
1. AI generates 2 suggested options per question
2. Options are product-specific and contextual
3. Users can click an option to instantly select it
4. Users can choose "Other" to provide custom answer
5. Selecting an option or "Other" auto-saves
6. Mobile-responsive button layout
7. Backwards compatible with existing questions

### Non-Functional Requirements
- Option generation adds < 2 seconds to question generation time
- Options are concise (3-10 words each)
- Maintains existing auto-save functionality
- No breaking changes to existing conversations
- Accessible interface (WCAG AA)

---

## Technical Design

### 1. Schema Changes

**File:** `/convex/schema.ts`

**Add to question object:**
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
      suggestedOptions: v.optional(v.array(v.string())), // NEW: 2 suggested answers
    })
  )
)
```

### 2. API Enhancement - Question Generation

**File:** `/app/api/questions/generate/route.ts`

**Update Claude prompt:**
```typescript
const systemPrompt = `You are a product management expert...

For each question, generate 2 intelligent suggested answer options based on the product context.
These options should be:
- Product-specific (not generic)
- Concise (3-10 words)
- Mutually exclusive
- Helpful starting points

Output format:
{
  "questions": [
    {
      "id": "...",
      "question": "...",
      "suggestedOptions": ["Option 1", "Option 2"], // NEW
      ...
    }
  ]
}
`;
```

**Example output:**
```json
{
  "id": "q1",
  "question": "What are the primary user actions in your product?",
  "suggestedOptions": [
    "Create, edit, and share content",
    "Search, filter, and bookmark items"
  ],
  "type": "textarea",
  "required": true
}
```

### 3. UI Component Redesign

**File:** `/components/questions/QuestionCard.tsx`

**New Layout Structure:**
```
┌─────────────────────────────────────┐
│ Question: What is the primary...    │
│ [Required indicator if applicable]  │
├─────────────────────────────────────┤
│ [Suggested Option 1 Button]         │
│ [Suggested Option 2 Button]         │
├─────────────────────────────────────┤
│ ☐ Other (specify):                  │
│ ┌─────────────────────────────────┐ │
│ │ [Custom text input - if checked]│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**State Management:**
```typescript
interface QuestionCardProps {
  question: Question;
  onAnswerChange: (id: string, answer: string) => void;
}

const QuestionCard = ({ question, onAnswerChange }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    question.answer && question.suggestedOptions?.includes(question.answer)
      ? question.answer
      : null
  );
  const [isOtherSelected, setIsOtherSelected] = useState(
    !!question.answer && !question.suggestedOptions?.includes(question.answer || "")
  );
  const [otherText, setOtherText] = useState(
    isOtherSelected ? question.answer || "" : ""
  );

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOtherSelected(false);
    setOtherText("");
    onAnswerChange(question.id, option);
  };

  const handleOtherToggle = () => {
    const newValue = !isOtherSelected;
    setIsOtherSelected(newValue);
    if (newValue) {
      setSelectedOption(null);
    } else {
      setOtherText("");
      onAnswerChange(question.id, "");
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (text.trim()) {
      setIsOtherSelected(true);
      setSelectedOption(null);
      onAnswerChange(question.id, text);
    }
  };

  // Render logic below...
};
```

**JSX Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base font-medium">
      {question.question}
      {question.required && <span className="text-red-500 ml-1">*</span>}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* Suggested Options */}
    {question.suggestedOptions && question.suggestedOptions.length > 0 && (
      <div className="flex flex-col sm:flex-row gap-2">
        {question.suggestedOptions.map((option, idx) => (
          <Button
            key={idx}
            variant={selectedOption === option ? "default" : "outline"}
            onClick={() => handleOptionClick(option)}
            className="flex-1 h-auto py-3 px-4 text-left justify-start whitespace-normal"
          >
            {selectedOption === option && (
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <span>{option}</span>
          </Button>
        ))}
      </div>
    )}

    {/* Other Option */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`other-${question.id}`}
          checked={isOtherSelected}
          onCheckedChange={handleOtherToggle}
        />
        <label
          htmlFor={`other-${question.id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Other (specify)
        </label>
      </div>

      {isOtherSelected && (
        <Textarea
          value={otherText}
          onChange={(e) => handleOtherChange(e.target.value)}
          placeholder={question.placeholder || "Enter your answer..."}
          className="min-h-[100px]"
        />
      )}
    </div>

    {/* Fallback for questions without options */}
    {(!question.suggestedOptions || question.suggestedOptions.length === 0) && (
      <Textarea
        value={question.answer || ""}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        placeholder={question.placeholder || "Enter your answer..."}
        className="min-h-[100px]"
      />
    )}
  </CardContent>
</Card>
```

---

## Implementation Steps

### Phase 1: Schema Update (15 minutes)

1. **Open:** `/convex/schema.ts`

2. **Add `suggestedOptions` field** to clarifyingQuestions object:
   ```typescript
   suggestedOptions: v.optional(v.array(v.string())),
   ```

3. **Save and run:**
   ```bash
   # Convex will auto-detect schema changes
   # Types will regenerate on next dev server start
   ```

### Phase 2: API Enhancement (30 minutes)

1. **Open:** `/app/api/questions/generate/route.ts`

2. **Update system prompt** to request suggested options:
   ```typescript
   const systemPrompt = `You are a product management expert generating clarifying questions.

   Based on the product context, generate 12-15 questions across these categories:
   1. Core Features (3-4 questions)
   2. User Types & Personas (2-3 questions)
   3. Data Requirements (2-3 questions)
   4. Scalability & Performance (2 questions)
   5. Integrations & Third-party Services (2 questions)
   6. Technical Constraints (1-2 questions)

   For each question, provide:
   - question: The question text
   - category: One of the above categories
   - placeholder: Example answer
   - required: true/false
   - type: "textarea" (most), "text" (short answers), or "select"
   - suggestedOptions: Array of 2 product-specific suggested answers (3-10 words each)

   Make suggested options:
   - Specific to this product, not generic
   - Concise and actionable
   - Mutually exclusive
   - Helpful starting points

   Output ONLY valid JSON in this format:
   {
     "questions": [
       {
         "id": "unique-id",
         "category": "Core Features",
         "question": "What are the primary user actions?",
         "placeholder": "e.g., Create posts, comment, share...",
         "required": true,
         "type": "textarea",
         "suggestedOptions": ["Create and share content", "Search and discover items"]
       }
     ]
   }`;
   ```

3. **Test generation:**
   - Start a new conversation
   - Complete discovery chat
   - Navigate to questions page
   - Verify options appear in console/database

### Phase 3: UI Component Update (60 minutes)

1. **Create checkbox component if needed:**
   ```bash
   npx shadcn-ui@latest add checkbox
   ```

2. **Open:** `/components/questions/QuestionCard.tsx`

3. **Import required components:**
   ```typescript
   import { Checkbox } from "@/components/ui/checkbox";
   import { Check } from "lucide-react";
   ```

4. **Add state management** (see Technical Design above)

5. **Replace render logic** with new layout structure

6. **Add responsive styles:**
   ```typescript
   // Buttons stack on mobile, inline on desktop
   className="flex flex-col sm:flex-row gap-2"
   ```

7. **Test in browser:**
   - Desktop view
   - Mobile view (< 640px)
   - Tablet view

### Phase 4: Testing & Polish (45 minutes)

**Test Scenarios:**

1. **New questions with options:**
   - Generate new questions
   - Verify 2 options appear
   - Click option → saves correctly
   - Select "Other" → shows input
   - Type in "Other" → saves correctly

2. **Existing questions without options:**
   - Load old conversation
   - Verify textarea appears (backwards compatible)
   - Answer saves correctly

3. **State management:**
   - Select option → "Other" unchecks
   - Check "Other" → options deselect
   - Type in "Other" → auto-checks checkbox
   - Clear "Other" → unchecks checkbox

4. **Auto-save:**
   - Select option → immediate save
   - Type "Other" → debounced save
   - Progress bar updates

5. **Mobile:**
   - Buttons stack vertically
   - Touch targets ≥ 44px
   - Scrolling works smoothly

6. **Accessibility:**
   - Tab through options (keyboard nav)
   - Enter/Space selects option
   - Screen reader announces selected state
   - ARIA labels present

---

## Files to Modify

| File | Changes | Est. Lines |
|------|---------|------------|
| `/convex/schema.ts` | Add suggestedOptions field | +1 |
| `/app/api/questions/generate/route.ts` | Update prompt for options | +15 |
| `/components/questions/QuestionCard.tsx` | Complete redesign | +80-100 |
| `/components/ui/checkbox.tsx` | Add if missing (shadcn) | +50 (new) |

---

## Testing Checklist

### Functional Testing
- [ ] New questions generate with 2 options
- [ ] Options are product-specific, not generic
- [ ] Click option selects and saves
- [ ] "Other" checkbox shows input field
- [ ] Typing in "Other" auto-checks checkbox
- [ ] Selecting option deselects "Other"
- [ ] Auto-save works for both options and custom
- [ ] Progress bar updates correctly
- [ ] Old questions without options still work
- [ ] Answer validation still works (70% rule)

### UI/UX Testing
- [ ] Options layout looks professional
- [ ] Selected state is visually clear
- [ ] "Other" transition is smooth
- [ ] Mobile: buttons stack vertically
- [ ] Mobile: touch targets are adequate
- [ ] Tablet: layout adapts properly
- [ ] Desktop: buttons display inline
- [ ] Dark mode styling correct
- [ ] Loading states work
- [ ] Hover states work

### Accessibility Testing
- [ ] Tab navigation works
- [ ] Enter/Space selects option
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces button states
- [ ] Screen reader announces checkbox state
- [ ] ARIA labels present and correct
- [ ] Color contrast meets WCAG AA
- [ ] Works without mouse

---

## Example Generated Questions

**Question 1:**
```json
{
  "id": "q1",
  "category": "Core Features",
  "question": "What are the primary actions users take in your app?",
  "suggestedOptions": [
    "Create, edit, and publish content",
    "Search, filter, and save items"
  ],
  "type": "textarea",
  "required": true
}
```

**Question 2:**
```json
{
  "id": "q2",
  "category": "User Types & Personas",
  "question": "Who are your primary user types?",
  "suggestedOptions": [
    "Content creators and contributors",
    "Consumers and readers"
  ],
  "type": "textarea",
  "required": true
}
```

**Question 3:**
```json
{
  "id": "q3",
  "category": "Scalability & Performance",
  "question": "What is your expected user scale in the first year?",
  "suggestedOptions": [
    "Under 10,000 users",
    "10,000 - 100,000 users"
  ],
  "type": "text",
  "required": true
}
```

---

## Edge Cases

1. **No suggested options generated:**
   - Fallback to standard textarea
   - Backwards compatible behavior

2. **Only 1 option generated:**
   - Show single button + "Other"
   - Still functional

3. **Very long option text:**
   - Button wraps text (whitespace-normal)
   - Min height maintained

4. **User changes mind:**
   - Can switch between options freely
   - Can switch from option to "Other"
   - All state updates correctly

5. **Page reload with selected option:**
   - Restore selected state from answer
   - Check if answer matches an option
   - Otherwise show in "Other" field

---

## Future Enhancements

1. **Adaptive options based on previous answers:**
   - Q2 options adapt based on Q1 answer
   - More intelligent suggestions

2. **More than 2 options:**
   - Show 3-4 options for some questions
   - Grid layout for many options

3. **Option categories:**
   - Group options (e.g., "Popular" vs "Advanced")
   - Expandable sections

4. **Smart "Other" suggestions:**
   - AI suggests completions as user types
   - Autocomplete functionality

5. **Analytics:**
   - Track option selection rates
   - Identify most useful options
   - A/B test different options

---

## Success Metrics

- **Primary:** 60%+ users select suggested options (vs. "Other")
- **Secondary:** 20% faster question completion time
- **UX:** No increase in validation errors
- **Quality:** PRD quality maintained or improved

---

## Rollback Plan

If issues occur:
1. Schema change is non-breaking (optional field)
2. Can disable option rendering in UI
3. Questions without options still work
4. No data migration needed

Simple rollback:
```typescript
// In QuestionCard.tsx, comment out option rendering
// {question.suggestedOptions && ( ... )}
```

---

## Notes

- Keep options concise to avoid overwhelming users
- Options should feel helpful, not restrictive
- "Other" option ensures flexibility
- Consider product type when generating options (SaaS vs Mobile vs E-commerce)
- Balance between speed (options) and customization ("Other")
