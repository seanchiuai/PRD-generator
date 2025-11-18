# Component Patterns

## Standard Component Structure

### Functional Component Pattern

All components follow this structure:

```typescript
"use client";

import { useState } from "react";
import { ComponentProps } from "@/types"; // if needed
import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  items: Item[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export function MyComponent({
  title,
  items,
  onItemClick,
  className
}: MyComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setSelected(id);
    onItemClick?.(id);
  };

  return (
    <div className={cn("default-classes", className)}>
      <h2>{title}</h2>
      {items.map((item) => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### Key Principles

**1. "use client" Directive:**
- Place at top of file for client components
- Required for hooks, event handlers, browser APIs

**2. Props Interface:**
- Always define explicit interface
- Name as `[ComponentName]Props`
- Optional props use `?`
- Include `className?: string` for style overrides

**3. Destructure Props:**
```typescript
// ✅ Correct
export function Component({ title, items }: Props) {

// ❌ Incorrect
export function Component(props: Props) {
  const { title, items } = props;
```

**4. File Length:**
- Keep components <200 LOC
- Split into smaller components if longer
- Extract logic to custom hooks

## Props Patterns

### Common Props Structure

```typescript
interface ComponentProps {
  // Required data
  data: DataType;
  id: string;

  // Optional callbacks
  onClick?: () => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => Promise<void>;

  // Optional configuration
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "outlined" | "ghost";

  // Style overrides
  className?: string;
}
```

### Props Naming Conventions

**Event handlers:**
- Prefix with `on`: `onClick`, `onChange`, `onSubmit`
- Optional unless required for functionality

**Boolean flags:**
- Use descriptive names: `isLoading`, `disabled`, `showIcon`
- Or: `loading`, `disabled`, `visible`

**Data props:**
- Singular for object: `user`, `prd`, `conversation`
- Plural for arrays: `users`, `items`, `categories`

### Example from Codebase

```typescript
// components/research/ResearchProgress.tsx
interface ResearchCategory {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  icon?: React.ReactNode;
}

interface ResearchProgressProps {
  categories: ResearchCategory[];
}

export function ResearchProgress({ categories }: ResearchProgressProps) {
  // Component logic
}
```

## Import Pattern

### Standard Import Order

```typescript
// 1. React & Next.js imports
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { CheckCircle2, Loader2 } from "lucide-react";

// 3. UI components (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Custom components
import { ChatMessage } from "@/components/chat/ChatMessage";

// 5. Utilities & helpers
import { cn } from "@/lib/utils";

// 6. Types
import type { Message } from "@/types";

// 7. Convex (if needed)
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
```

### Always Use @/ Aliases

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ❌ Incorrect
import { Button } from "../../../components/ui/button"
import { cn } from "../../lib/utils"
```

## State Management Patterns

### Local State (useState)

```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Array state
const [items, setItems] = useState<Item[]>([]);

// Object state with type
const [formData, setFormData] = useState<FormData>({
  name: "",
  email: "",
});

// Update patterns
setItems([...items, newItem]);           // Add
setItems(items.filter(i => i.id !== id)); // Remove
setItems(items.map(i =>
  i.id === id ? { ...i, updated: true } : i
)); // Update
```

### useReducer for Complex State

For components with multiple interdependent state fields (5+), use `useReducer`:

```typescript
type Action =
  | { type: "TOGGLE_MULTISELECT"; option: string }
  | { type: "SELECT_OPTION"; option: string }
  | { type: "TOGGLE_OTHER" }
  | { type: "INITIALIZE"; payload: State };

interface State {
  selectedOptions: string[];
  otherEnabled: boolean;
  otherText: string;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_MULTISELECT":
      return {
        ...state,
        selectedOptions: state.selectedOptions.includes(action.option)
          ? state.selectedOptions.filter(o => o !== action.option)
          : [...state.selectedOptions, action.option]
      };
    case "SELECT_OPTION":
      return { ...state, selectedOptions: [action.option] };
    default:
      return state;
  }
}

// Usage
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: "SELECT_OPTION", option: "React" });
```

### Derived State

```typescript
// ✅ Correct - compute on render
const completed = items.filter(i => i.status === "completed");
const progress = (completed.length / items.length) * 100;

// ❌ Incorrect - don't store derived state
const [progress, setProgress] = useState(0);
useEffect(() => {
  const completed = items.filter(i => i.status === "completed");
  setProgress((completed.length / items.length) * 100);
}, [items]);
```

### Side Effects (useEffect)

```typescript
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependencies change
useEffect(() => {
  if (conversationId) {
    loadMessages(conversationId);
  }
}, [conversationId]);

// Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Event Handler Patterns

### Inline Handlers (Simple)

```typescript
<Button onClick={() => setIsOpen(true)}>
  Open
</Button>
```

### Named Handlers (Complex)

```typescript
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitForm(data);
    toast({ title: "Success" });
  } catch (error) {
    toast({
      title: "Error",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};

<Button onClick={handleSubmit}>Submit</Button>
```

### Parameterized Handlers

```typescript
const handleItemClick = (id: string) => {
  setSelected(id);
  onItemClick?.(id);
};

{items.map(item => (
  <div
    key={item.id}
    onClick={() => handleItemClick(item.id)}
  >
    {item.name}
  </div>
))}
```

## Conditional Rendering

### Ternary for Simple Cases

```typescript
{isLoading ? (
  <Loader2 className="h-5 w-5 animate-spin" />
) : (
  <CheckCircle2 className="h-5 w-5 text-green-600" />
)}
```

### && for Show/Hide

```typescript
{error && (
  <div className="text-red-600">{error}</div>
)}

{items.length > 0 && (
  <div>Found {items.length} items</div>
)}
```

### Early Returns for Complex Logic

```typescript
export function Component({ data }: Props) {
  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.error) {
    return <div>Error: {data.error}</div>;
  }

  return <div>{/* Main content */}</div>;
}
```

## List Rendering

### Map Pattern

```typescript
{categories.map((category) => (
  <div
    key={category.name}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      category.status === "completed" && "bg-green-50"
    )}
  >
    <StatusIcon status={category.status} />
    <span>{category.name}</span>
  </div>
))}
```

### Key Requirements

```typescript
// ✅ Correct - use unique ID
{items.map(item => <div key={item.id}>{item.name}</div>)}

// ⚠️ Acceptable - if items are static/immutable
{items.map(item => <div key={item.name}>{item.name}</div>)}

// ❌ Incorrect - never use index
{items.map((item, index) => <div key={index}>{item.name}</div>)}
```

## Form Patterns

### Controlled Inputs

```typescript
const [value, setValue] = useState("");

<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="..."
/>
```

### Form Object State

```typescript
interface FormData {
  name: string;
  email: string;
  message: string;
}

const [formData, setFormData] = useState<FormData>({
  name: "",
  email: "",
  message: "",
});

const handleChange = (field: keyof FormData) => (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value
  }));
};

<input
  value={formData.name}
  onChange={handleChange("name")}
/>
```

## Component Composition

### Wrapper Components

```typescript
// components/chat/ChatContainer.tsx
export function ChatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
}

// Usage
<ChatContainer>
  <ChatMessage message={msg} />
  <ChatInput onSend={handleSend} />
</ChatContainer>
```

### Compound Components

```typescript
// Parent component manages state
export function Accordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <AccordionItem
        id="1"
        isOpen={openId === "1"}
        onToggle={() => setOpenId("1")}
      />
      <AccordionItem
        id="2"
        isOpen={openId === "2"}
        onToggle={() => setOpenId("2")}
      />
    </div>
  );
}
```

## Styling Patterns

### className with cn()

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes always-applied",
  condition && "conditional-classes",
  variant === "primary" && "primary-variant",
  className // Allow override
)}>
```

### Conditional Styling

```typescript
<div
  className={cn(
    "flex items-center gap-3 p-3 rounded-lg border",
    status === "completed" && "bg-green-50 dark:bg-green-950/20",
    status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20",
    status === "failed" && "bg-red-50 dark:bg-red-950/20"
  )}
>
```

### Style Prop Override

```typescript
interface Props {
  className?: string;
}

export function Component({ className }: Props) {
  return (
    <div className={cn("default-styles", className)}>
      {/* User's className overrides defaults */}
    </div>
  );
}
```

## Async Patterns

### Async Click Handlers

```typescript
const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await generatePRD(conversationId);
    router.push(`/prd/${result.id}`);
  } catch (error) {
    setError(error.message);
    toast({
      title: "Generation Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Loading States

```typescript
{isLoading ? (
  <Button disabled>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Loading...
  </Button>
) : (
  <Button onClick={handleClick}>
    Click Me
  </Button>
)}
```

## Component Size Guidelines

### When to Split Components

Split if:
- File exceeds 200 lines
- Component has multiple responsibilities
- Logic can be reused elsewhere
- Testing would be easier with smaller units

### Example Refactor

```typescript
// ❌ Too large (300 lines)
export function PRDDisplay({ prd }: Props) {
  return (
    <Tabs>
      <TabsContent value="overview">
        {/* 100 lines of overview UI */}
      </TabsContent>
      <TabsContent value="tech-stack">
        {/* 100 lines of tech stack UI */}
      </TabsContent>
      <TabsContent value="features">
        {/* 100 lines of features UI */}
      </TabsContent>
    </Tabs>
  );
}

// ✅ Split into smaller components
export function PRDDisplay({ prd }: Props) {
  return (
    <Tabs>
      <TabsContent value="overview">
        <OverviewTab data={prd.overview} />
      </TabsContent>
      <TabsContent value="tech-stack">
        <TechStackTab data={prd.techStack} />
      </TabsContent>
      <TabsContent value="features">
        <FeaturesTab data={prd.features} />
      </TabsContent>
    </Tabs>
  );
}
```

## TypeScript Patterns

### Strict Typing

```typescript
// ✅ Correct - explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);

// ❌ Incorrect - any
const [user, setUser] = useState<any>(null);
```

### Type vs Interface

```typescript
// Use interface for component props
interface ButtonProps {
  variant: "default" | "outline";
  onClick: () => void;
}

// Use type for unions/complex types
type Status = "pending" | "in_progress" | "completed";
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

### Optional Chaining

```typescript
// ✅ Safe access
const userName = user?.name ?? "Guest";
const firstItem = items?.[0];

// Call optional callback
onItemClick?.(itemId);
```

## Accessibility Patterns

### ARIA Labels for Interactive Elements

```typescript
// Chat messages with full context
<div
  aria-label={`Message from ${role} at ${timestamp}: ${content.slice(0, 100)}`}
>
  <span aria-hidden="true">{icon}</span>
  <span>{content}</span>
</div>

// Icon-only buttons
<button aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</button>
```

### Form Element Associations

```typescript
// Checkbox with proper label association
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id={`option-${question.id}-${index}`}
    checked={isSelected}
    onChange={() => handleToggle(option)}
  />
  <label htmlFor={`option-${question.id}-${index}`}>
    {option}
  </label>
</div>
```

### Keyboard Navigation

```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Interactive content
</div>
```

## Common Anti-Patterns to Avoid

### ❌ Don't Mutate State Directly

```typescript
// ❌ Wrong
items.push(newItem);
setItems(items);

// ✅ Correct
setItems([...items, newItem]);
```

### ❌ Don't Use Index as Key

```typescript
// ❌ Wrong
{items.map((item, i) => <div key={i}>{item.name}</div>)}

// ✅ Correct
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### ❌ Don't Forget Dependencies

```typescript
// ❌ Wrong - missing dependency
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ Correct
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### ❌ Don't Store Derived State

```typescript
// ❌ Wrong
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

// ✅ Correct
const total = items.reduce((sum, i) => sum + i.price, 0);
```
