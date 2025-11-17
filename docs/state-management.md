# State Management

## State Architecture Overview

This project uses a layered state management approach:

1. **Local State** - Component-level (React `useState`)
2. **Server State** - Real-time database (Convex queries/mutations)
3. **Global State** - Application-wide context (React Context API)
4. **Persistent State** - Browser storage (`localStorage`)

## Local State (Component-Level)

### When to Use

- UI-only state (modals, dropdowns, form inputs)
- Temporary state (loading, error messages)
- Component-specific state not needed elsewhere

### useState Pattern

```typescript
"use client";
import { useState } from "react";

export function Component() {
  // Boolean state
  const [isOpen, setIsOpen] = useState(false);

  // String state
  const [search, setSearch] = useState("");

  // Array state
  const [items, setItems] = useState<Item[]>([]);

  // Object state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  return <div>...</div>;
}
```

### State Update Patterns

```typescript
// Boolean toggle
setIsOpen(!isOpen);
setIsOpen(prev => !prev);

// Add to array
setItems([...items, newItem]);
setItems(prev => [...prev, newItem]);

// Remove from array
setItems(items.filter(item => item.id !== id));

// Update array item
setItems(items.map(item =>
  item.id === id ? { ...item, updated: true } : item
));

// Update object
setFormData({ ...formData, name: "New name" });
setFormData(prev => ({ ...prev, name: "New name" }));
```

### Derived State

```typescript
// ✅ Compute on render (not stored in state)
const completed = items.filter(i => i.status === "completed");
const progress = (completed.length / items.length) * 100;

return (
  <div>
    <p>Progress: {progress}%</p>
    <p>Completed: {completed.length}</p>
  </div>
);
```

## Server State (Convex)

### When to Use

- Data from database
- User-specific data
- Real-time synchronized data
- Data shared across components

### Query Pattern (Read Data)

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Component() {
  // Simple query
  const prds = useQuery(api.prds.list);

  // Query with arguments
  const prd = useQuery(api.prds.get, {
    id: prdId as Id<"prds">,
  });

  // Conditional query
  const conversation = useQuery(
    conversationId ? api.conversations.get : "skip",
    conversationId ? { id: conversationId } : undefined
  );

  // Handle loading state
  if (prds === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{prds.map(...)}</div>;
}
```

### Mutation Pattern (Write Data)

```typescript
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";

export function Component() {
  const createPRD = useMutation(api.prds.create);
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      const id = await createPRD({
        conversationId: convId,
        prdData: data,
      });

      toast({
        title: "Success",
        description: "PRD created successfully",
      });

      router.push(`/prd/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Optimistic Updates

```typescript
const [selections, setSelections] = useState<string[]>([]);
const updateSelection = useMutation(api.selections.update);

const handleSelect = async (id: string) => {
  // Update UI immediately (optimistic)
  setSelections([...selections, id]);

  try {
    // Sync with server
    await updateSelection({ id });
  } catch (error) {
    // Revert on error
    setSelections(selections.filter(s => s !== id));
    toast({ title: "Failed to save", variant: "destructive" });
  }
};
```

### Real-Time Subscriptions

Convex queries automatically subscribe to changes:

```typescript
// Component A creates a PRD
const createPRD = useMutation(api.prds.create);
await createPRD({ name: "New PRD" });

// Component B automatically updates (different component, same query)
const prds = useQuery(api.prds.list); // Re-runs automatically!
```

## Global State (React Context)

### When to Use

- State shared across multiple components
- User preferences
- Workflow state
- Theme/UI state

### WorkflowContext Pattern

Located: `contexts/WorkflowContext.tsx`

**Provider Setup:**

```typescript
// contexts/WorkflowContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

interface WorkflowState {
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
}

interface WorkflowContextValue {
  state: WorkflowState;
  advanceToNextStep: () => Promise<void>;
  markStepComplete: (step: string) => Promise<void>;
  canNavigateToStep: (step: string) => boolean;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
  undefined
);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>({
    currentStep: "discovery",
    completedSteps: [],
    skippedSteps: [],
  });

  const advanceToNextStep = async () => {
    // Logic to advance workflow
  };

  const markStepComplete = async (step: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, step],
    }));
  };

  const canNavigateToStep = (step: string) => {
    // Check if step is accessible
    return state.completedSteps.includes(step);
  };

  return (
    <WorkflowContext.Provider
      value={{
        state,
        advanceToNextStep,
        markStepComplete,
        canNavigateToStep,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}
```

**Provider in Layout:**

```typescript
// app/layout.tsx
<WorkflowProvider>
  {children}
</WorkflowProvider>
```

**Usage in Component:**

```typescript
"use client";
import { useWorkflow } from "@/contexts/WorkflowContext";

export function Component() {
  const { state, advanceToNextStep, markStepComplete } = useWorkflow();

  const handleComplete = async () => {
    await markStepComplete("discovery");
    await advanceToNextStep();
  };

  return (
    <div>
      <p>Current Step: {state.currentStep}</p>
      <button onClick={handleComplete}>Complete & Continue</button>
    </div>
  );
}
```

## Persistent State (localStorage)

### When to Use

- Client-side caching
- User preferences
- Workflow snapshots
- Form draft recovery

### Workflow Persistence Pattern

Located: `lib/workflow/persistence.ts`

```typescript
interface WorkflowSnapshot {
  conversationId: string;
  currentStep: string;
  completedSteps: string[];
  timestamp: number;
}

export function saveWorkflowSnapshot(snapshot: WorkflowSnapshot) {
  try {
    localStorage.setItem(
      `workflow_${snapshot.conversationId}`,
      JSON.stringify({
        ...snapshot,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save workflow snapshot:", error);
  }
}

export function loadWorkflowSnapshot(
  conversationId: string
): WorkflowSnapshot | null {
  try {
    const stored = localStorage.getItem(`workflow_${conversationId}`);
    if (!stored) return null;

    const snapshot = JSON.parse(stored);

    // Check expiration (24 hours)
    const now = Date.now();
    const expiryTime = 24 * 60 * 60 * 1000;

    if (now - snapshot.timestamp > expiryTime) {
      clearWorkflowSnapshot(conversationId);
      return null;
    }

    return snapshot;
  } catch (error) {
    console.error("Failed to load workflow snapshot:", error);
    return null;
  }
}

export function clearWorkflowSnapshot(conversationId: string) {
  try {
    localStorage.removeItem(`workflow_${conversationId}`);
  } catch (error) {
    console.error("Failed to clear workflow snapshot:", error);
  }
}
```

**Usage:**

```typescript
"use client";
import { useEffect } from "react";
import {
  saveWorkflowSnapshot,
  loadWorkflowSnapshot,
} from "@/lib/workflow/persistence";

export function Component({ conversationId }: Props) {
  const [state, setState] = useState(initialState);

  // Load on mount
  useEffect(() => {
    const snapshot = loadWorkflowSnapshot(conversationId);
    if (snapshot) {
      setState(snapshot);
    }
  }, [conversationId]);

  // Save on state change
  useEffect(() => {
    saveWorkflowSnapshot({
      conversationId,
      ...state,
    });
  }, [state, conversationId]);

  return <div>...</div>;
}
```

## State Synchronization Patterns

### Convex + localStorage Sync

```typescript
"use client";
import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";

export function Component({ conversationId }: Props) {
  // Server state
  const serverData = useQuery(api.conversations.get, {
    id: conversationId,
  });

  const updateServer = useMutation(api.conversations.update);

  // Local state
  const [localData, setLocalData] = useState(null);

  // Sync server → local on load
  useEffect(() => {
    if (serverData) {
      setLocalData(serverData);
      // Also save to localStorage
      localStorage.setItem("conv_" + conversationId, JSON.stringify(serverData));
    }
  }, [serverData, conversationId]);

  // Sync local → server on change
  const handleChange = async (newData: any) => {
    // Update local immediately
    setLocalData(newData);

    // Sync to server
    await updateServer({ id: conversationId, data: newData });
  };

  return <div>...</div>;
}
```

## Form State Management

### Controlled Form Pattern

```typescript
interface FormData {
  name: string;
  email: string;
  message: string;
}

export function FormComponent() {
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
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={handleChange("name")}
      />
      <input
        value={formData.email}
        onChange={handleChange("email")}
      />
      <textarea
        value={formData.message}
        onChange={handleChange("message")}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Auto-Save Pattern

```typescript
const [answer, setAnswer] = useState("");
const saveAnswer = useMutation(api.questions.saveAnswer);

// Debounced auto-save
useEffect(() => {
  const timer = setTimeout(() => {
    if (answer) {
      saveAnswer({ questionId, answer });
    }
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timer);
}, [answer, questionId, saveAnswer]);
```

## Loading & Error States

### Unified State Pattern

```typescript
interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function Component() {
  const [state, setState] = useState<DataState<PRD>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    fetchData()
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, []);

  if (state.isLoading) return <Loader />;
  if (state.error) return <Error message={state.error} />;
  if (!state.data) return <Empty />;

  return <Content data={state.data} />;
}
```

### Convex Loading Pattern

```typescript
const prds = useQuery(api.prds.list);

// undefined = loading
// null = no data
// [] = empty array
// [...] = data

if (prds === undefined) {
  return <LoadingSkeleton />;
}

if (prds.length === 0) {
  return <EmptyState />;
}

return <List items={prds} />;
```

## State Management Best Practices

### 1. Choose the Right State Type

```typescript
// ✅ Local state for UI
const [isModalOpen, setIsModalOpen] = useState(false);

// ✅ Server state for data
const prds = useQuery(api.prds.list);

// ✅ Global context for shared state
const { currentStep } = useWorkflow();

// ✅ localStorage for persistence
localStorage.setItem("preferences", JSON.stringify(prefs));
```

### 2. Don't Duplicate State

```typescript
// ❌ Wrong - duplicating server state
const serverData = useQuery(api.data.get);
const [localCopy, setLocalCopy] = useState(null);

useEffect(() => {
  setLocalCopy(serverData);
}, [serverData]);

// ✅ Correct - use server state directly
const data = useQuery(api.data.get);
```

### 3. Lift State When Needed

```typescript
// ❌ Wrong - state in child, needed by parent
function Child() {
  const [selected, setSelected] = useState(null);
  return <div>...</div>;
}

// ✅ Correct - lift state to parent
function Parent() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Child1 selected={selected} onSelect={setSelected} />
      <Child2 selected={selected} />
    </>
  );
}
```

### 4. Use Derived State

```typescript
// ❌ Wrong - storing derived state
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(items.length);
}, [items]);

// ✅ Correct - compute on render
const [items, setItems] = useState([]);
const count = items.length;
```

### 5. Colocate State

```typescript
// ✅ Keep state close to where it's used
function Modal() {
  const [isOpen, setIsOpen] = useState(false); // Only used here

  return <Dialog open={isOpen} onOpenChange={setIsOpen}>...</Dialog>;
}
```

## Performance Optimization

### React.memo for Expensive Components

```typescript
import { memo } from "react";

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data
}: Props) {
  // Only re-renders if data changes
  return <div>{/* Expensive render */}</div>;
});
```

### useMemo for Expensive Calculations

```typescript
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### useCallback for Stable Functions

```typescript
const handleClick = useCallback((id: string) => {
  performAction(id);
}, []); // Stable reference

<ChildComponent onClick={handleClick} />
```
