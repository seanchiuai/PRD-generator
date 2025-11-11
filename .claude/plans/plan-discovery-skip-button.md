# Implementation Plan: Discovery Skip Button

**Feature:** Add intelligent skip button to discovery chat page
**Agent:** discovery-skip-implementor
**Estimated Time:** 1-2 hours
**Priority:** Medium

---

## Overview

Add a "Skip to Questions" button on the discovery chat page (`/chat/[conversationId]`) that allows users to bypass the conversational discovery phase and jump directly to structured questions. The button will intelligently validate that sufficient context exists before allowing the skip.

## Requirements

### Functional Requirements
1. Button appears in the chat interface after minimum conversation threshold
2. Validates sufficient context before allowing skip (3+ messages, 100+ characters)
3. Extracts product context from chat history
4. Updates conversation stage to "clarifying"
5. Navigates to questions page
6. Shows loading state during processing
7. Provides user feedback via toast notifications

### Non-Functional Requirements
- Response time: < 500ms for validation
- No data loss during skip
- Maintains existing conversation integrity
- Mobile responsive
- Accessible (keyboard navigation, ARIA labels)

---

## Technical Design

### 1. UI Component Location

**File:** `/app/chat/[conversationId]/page.tsx`

**Button Placement Options:**
- **Option A (Recommended):** Sticky footer below chat input
- **Option B:** Header next to conversation title
- **Option C:** Floating action button (bottom right)

**Recommended: Option A** - Natural placement, doesn't interfere with chat flow

### 2. Validation Logic

```typescript
const canSkip = useMemo(() => {
  if (!conversation?.messages) return false;

  const messageCount = conversation.messages.length;
  const userMessages = conversation.messages.filter(m => m.role === 'user');
  const totalUserChars = userMessages.reduce((sum, m) => sum + m.content.length, 0);

  return messageCount >= 3 && totalUserChars >= 100;
}, [conversation?.messages]);
```

### 3. Context Extraction

**Strategy:** Extract key information from chat history

```typescript
const extractContext = (messages: Message[]) => {
  const userContent = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n\n');

  // Simple extraction - look for common patterns
  const productName = extractProductName(userContent);
  const description = userContent.substring(0, 200); // First 200 chars

  return {
    productName,
    description,
    coreFeatures: [], // Can be enhanced later
    targetAudience: undefined, // Can be enhanced later
  };
};
```

### 4. Navigation Flow

```typescript
const handleSkip = async () => {
  try {
    setIsSkipping(true);

    // Validate
    if (!canSkip) {
      toast({
        title: "Need more context",
        description: "Please share a bit more about your product idea before skipping.",
        variant: "destructive",
      });
      return;
    }

    // Extract context (optional - for future use)
    const context = extractContext(conversation.messages);

    // Update stage
    await updateStage({
      conversationId: params.conversationId,
      stage: "clarifying",
    });

    // Navigate
    router.push(`/chat/${params.conversationId}/questions`);

  } catch (error) {
    toast({
      title: "Skip failed",
      description: "Unable to skip to questions. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSkipping(false);
  }
};
```

---

## Implementation Steps

### Phase 1: UI Component (30 minutes)

1. **Open:** `/app/chat/[conversationId]/page.tsx`

2. **Add state:**
   ```typescript
   const [isSkipping, setIsSkipping] = useState(false);
   ```

3. **Add validation logic:**
   ```typescript
   const canSkip = useMemo(() => {
     if (!conversation?.messages) return false;
     const messageCount = conversation.messages.length;
     const userMessages = conversation.messages.filter(m => m.role === 'user');
     const totalUserChars = userMessages.reduce((sum, m) => sum + m.content.length, 0);
     return messageCount >= 3 && totalUserChars >= 100;
   }, [conversation?.messages]);
   ```

4. **Add skip handler function** (see Navigation Flow above)

5. **Add button to UI:**
   ```tsx
   <div className="sticky bottom-0 bg-background border-t p-4">
     <div className="max-w-4xl mx-auto">
       <ChatInput
         value={input}
         onChange={setInput}
         onSend={handleSendMessage}
         disabled={isLoading}
       />
       {canSkip && (
         <div className="mt-3 flex justify-end">
           <Button
             variant="outline"
             onClick={handleSkip}
             disabled={isSkipping || isLoading}
             className="gap-2"
           >
             {isSkipping ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" />
                 Skipping...
               </>
             ) : (
               <>
                 Skip to Questions
                 <ArrowRight className="h-4 w-4" />
               </>
             )}
           </Button>
         </div>
       )}
     </div>
   </div>
   ```

6. **Import required icons:**
   ```typescript
   import { ArrowRight, Loader2 } from "lucide-react";
   ```

### Phase 2: Testing (15 minutes)

**Test Cases:**
1. ✅ Button doesn't appear with < 3 messages
2. ✅ Button doesn't appear with < 100 characters
3. ✅ Button appears when thresholds met
4. ✅ Click button shows loading state
5. ✅ Successfully navigates to questions page
6. ✅ Toast appears if insufficient context
7. ✅ Error handling works for failed navigation
8. ✅ Disabled during other operations

### Phase 3: Polish (15 minutes)

1. **Add tooltip for context:**
   ```tsx
   <TooltipProvider>
     <Tooltip>
       <TooltipTrigger asChild>
         <Button>Skip to Questions</Button>
       </TooltipTrigger>
       <TooltipContent>
         <p>Jump directly to structured questions</p>
       </TooltipContent>
     </Tooltip>
   </TooltipProvider>
   ```

2. **Mobile responsive check:**
   - Test on mobile viewport
   - Ensure button is thumb-friendly
   - Stack properly with input

3. **Accessibility:**
   - Add aria-label
   - Keyboard accessible (Tab + Enter)
   - Screen reader friendly

---

## Files to Modify

| File | Changes | Lines Changed |
|------|---------|---------------|
| `/app/chat/[conversationId]/page.tsx` | Add skip button, logic, handler | ~50-70 |

## Files to Create

None - all changes in existing file.

---

## Testing Checklist

### Functional Testing
- [ ] Button appears after 3+ messages with 100+ chars
- [ ] Button hidden before threshold
- [ ] Click triggers loading state
- [ ] Navigation works to questions page
- [ ] Toast shows for insufficient context
- [ ] Error toast shows on failure
- [ ] Button disabled during loading/skipping
- [ ] Works on page reload (state preserved)

### UI/UX Testing
- [ ] Button placement feels natural
- [ ] Loading state is clear
- [ ] Transitions are smooth
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Dark mode styling correct

### Accessibility Testing
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Focus visible on button
- [ ] Screen reader announces button
- [ ] Loading state announced
- [ ] ARIA labels present

---

## Edge Cases

1. **User refreshes page during skip**
   - State resets, no issue
   - Conversation stage may update anyway

2. **Network failure during stage update**
   - Show error toast
   - Allow retry
   - Don't navigate if mutation fails

3. **Conversation deleted while skipping**
   - Handle 404 gracefully
   - Redirect to dashboard

4. **Multiple rapid clicks**
   - Button disabled during operation
   - Prevents duplicate requests

---

## Future Enhancements

1. **Smart Context Extraction (Phase 2):**
   - Use Claude API to extract structured data from chat
   - Save to `productContext` field
   - Pre-populate questions with context

2. **Progress Indicator:**
   - Show "X messages needed to skip"
   - Visual progress bar

3. **Conditional Button Text:**
   - "Continue to Questions" if enough context
   - "Need X more messages to skip" if insufficient

4. **Analytics:**
   - Track skip usage rate
   - A/B test button placement

---

## Success Metrics

- **Primary:** Users can skip discovery phase in < 2 seconds
- **Secondary:** 90%+ skip success rate (not blocked by validation)
- **UX:** No increase in error rates for questions page

---

## Rollback Plan

If issues occur:
1. Remove button from UI (comment out JSX)
2. No database changes to revert
3. No breaking changes to existing flow

---

## Notes

- Keep validation simple initially (message count + character count)
- Can enhance with AI extraction later
- Button should feel like a natural progression option, not an escape hatch
- Maintain all existing conversation data
