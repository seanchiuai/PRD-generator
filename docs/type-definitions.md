# Type Definitions

## TypeScript Configuration

Project uses **strict mode** (configured in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Rules:**
- No `any` type (use `unknown` if needed)
- All variables must have types
- Null checks required
- Functions must have return types

## Type vs Interface

### Use Interface For

```typescript
// Component props
interface ButtonProps {
  variant: "default" | "outline";
  onClick: () => void;
  disabled?: boolean;
}

// Object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Extending
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}
```

### Use Type For

```typescript
// Union types
type Status = "pending" | "in_progress" | "completed" | "failed";

// Complex types
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Function types
type Handler = (id: string) => void;
type AsyncHandler = (id: string) => Promise<void>;

// Utility types
type Optional<T> = T | null | undefined;
type Nullable<T> = T | null;
```

## Common Type Patterns

### Component Props

```typescript
// Basic props
interface ComponentProps {
  title: string;
  count: number;
  isActive?: boolean;
}

// Props with children
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Props with callbacks
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange?: (field: string, value: string) => void;
}

// Props with event handlers
interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// Generic props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
```

### State Types

```typescript
// Boolean state
const [isOpen, setIsOpen] = useState<boolean>(false);

// String state
const [name, setName] = useState<string>("");

// Number state
const [count, setCount] = useState<number>(0);

// Array state
const [items, setItems] = useState<Item[]>([]);

// Object state
const [user, setUser] = useState<User | null>(null);

// Union type state
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");
```

### Function Types

```typescript
// Void function
const handleClick = (): void => {
  console.log("clicked");
};

// Function with params
const handleUpdate = (id: string, value: number): void => {
  updateItem(id, value);
};

// Async function
const fetchData = async (): Promise<Data> => {
  const response = await fetch("/api/data");
  return response.json();
};

// Function as prop
interface Props {
  onSave: (data: FormData) => void;
  onCancel?: () => void;
  onError: (error: Error) => Promise<void>;
}
```

## Convex Types

### ID Types

```typescript
import { Id } from "@/convex/_generated/dataModel";

// Specific table ID
const conversationId: Id<"conversations"> = "...";
const prdId: Id<"prds"> = "...";

// In function arguments
function getConversation(id: Id<"conversations">) {
  // ...
}

// Optional ID
const maybeId: Id<"prds"> | undefined = undefined;
```

### Query Return Types

```typescript
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

// Infer type from query
const prds = useQuery(api.prds.list);
// Type: Awaited<ReturnType<typeof api.prds.list>> | undefined

// Explicit typing
type PRD = {
  _id: Id<"prds">;
  userId: string;
  productName: string;
  createdAt: number;
  prdData: any;
};

const prds = useQuery(api.prds.list) as PRD[] | undefined;
```

### Mutation Types

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createPRD = useMutation(api.prds.create);

// Inferred parameter type
await createPRD({
  conversationId: id, // Type: Id<"conversations">
  prdData: data,      // Type: any
  productName: name,  // Type: string
});
```

## Data Model Types

### Conversation

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Conversation {
  _id: Id<"conversations">;
  userId: string;
  messages: Message[];
  stage: "discovery" | "clarifying" | "research" | "selection" | "generation" | "completed";
  productContext?: string;
  createdAt: number;
  updatedAt?: number;
}
```

### Question

```typescript
interface Question {
  id: string;
  category: string;
  question: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
  answer?: string;
}
```

### Tech Stack

```typescript
interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

interface TechStackResearch {
  frontend?: TechOption[];
  backend?: TechOption[];
  database?: TechOption[];
  authentication?: TechOption[];
  hosting?: TechOption[];
}

interface TechSelection {
  name: string;
  reasoning: string;
  selectedFrom: string[];
}

interface SelectedTechStack {
  frontend?: TechSelection;
  backend?: TechSelection;
  database?: TechSelection;
  authentication?: TechSelection;
  hosting?: TechSelection;
}
```

### PRD

```typescript
interface PRDData {
  projectOverview: {
    productName: string;
    tagline: string;
    description: string;
    targetAudience: string;
    problemStatement: string;
  };
  purposeAndGoals: {
    vision: string;
    objectives: string[];
    successMetrics: string[];
  };
  techStack: {
    [key: string]: TechDetail;
  };
  features: {
    mvpFeatures: Feature[];
    niceToHaveFeatures: Feature[];
  };
  userPersonas: Persona[];
  technicalArchitecture: {
    systemDesign: string;
    dataModels: DataModel[];
    apiEndpoints: APIEndpoint[];
  };
  timeline: {
    phases: Phase[];
  };
  risks: Risk[];
}

interface Feature {
  name: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string[];
  priority: "high" | "medium" | "low";
}

interface Persona {
  name: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  techSavviness: string;
}

interface DataModel {
  name: string;
  fields: { name: string; type: string }[];
  relationships: string[];
}

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
}

interface Phase {
  name: string;
  deliverables: string[];
  duration: string;
}

interface Risk {
  category: "technical" | "business" | "user";
  description: string;
  impact: "high" | "medium" | "low";
  mitigation: string;
}
```

## Optional & Nullable Types

### Optional Types (undefined)

```typescript
// Optional property
interface User {
  name: string;
  email?: string; // string | undefined
}

// Optional parameter
function greet(name?: string) {
  console.log(name ?? "Guest");
}

// Optional chaining
const email = user?.email;
const firstItem = items?.[0];
```

### Nullable Types (null)

```typescript
// Explicitly nullable
const user: User | null = null;

// Null check
if (user !== null) {
  console.log(user.name); // Safe
}

// Nullish coalescing
const name = user?.name ?? "Unknown";
```

### undefined vs null

```typescript
// Use undefined for optional
interface Props {
  title?: string; // undefined
}

// Use null for "no value"
const [user, setUser] = useState<User | null>(null);

// Both
type MaybeUser = User | null | undefined;
```

## Union Types

### Status Union

```typescript
type Status = "pending" | "in_progress" | "completed" | "failed";

const status: Status = "pending";

// Type guard
if (status === "completed") {
  // status is "completed"
}
```

### Discriminated Union

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // Safe access
  } else {
    console.error(result.error); // Safe access
  }
}
```

### Component Variant Union

```typescript
type Variant = "default" | "primary" | "secondary" | "destructive";

interface ButtonProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}
```

## Generic Types

### Generic Component Props

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={(user) => <div>{user.name}</div>}
  keyExtractor={(user) => user.id}
/>
```

### Generic Functions

```typescript
function first<T>(array: T[]): T | undefined {
  return array[0];
}

const num = first([1, 2, 3]); // number | undefined
const str = first(["a", "b"]); // string | undefined
```

## Utility Types

### Built-in Utility Types

```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;
// { name?: string; email?: string; }

// Required - make all properties required
type RequiredUser = Required<User>;

// Pick - select specific properties
type UserPreview = Pick<User, "name" | "email">;
// { name: string; email: string; }

// Omit - exclude specific properties
type UserWithoutId = Omit<User, "id">;

// Record - create object type
type StatusMap = Record<string, Status>;
// { [key: string]: Status }

// Awaited - unwrap Promise
type Data = Awaited<Promise<User>>;
// User
```

### Custom Utility Types

```typescript
// Make specific fields optional
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserWithOptionalEmail = Optional<User, "email">;

// Extract non-nullable
type NonNullable<T> = T extends null | undefined ? never : T;

// Array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type UserType = ArrayElement<User[]>; // User
```

## Type Guards

### typeof Guards

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  } else {
    return value.toFixed(2); // number
  }
}
```

### instanceof Guards

```typescript
function handle(error: Error | string) {
  if (error instanceof Error) {
    console.error(error.message); // Error
  } else {
    console.error(error); // string
  }
}
```

### Custom Type Guards

```typescript
interface User {
  id: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as User).id === "string" &&
    typeof (value as User).name === "string"
  );
}

// Usage
if (isUser(data)) {
  console.log(data.name); // Safe - data is User
}
```

## React Event Types

```typescript
// Mouse events
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => void

// Keyboard events
onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
onKeyPress: (e: React.KeyboardEvent) => void

// Form events
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

// Focus events
onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
```

## Async Types

```typescript
// Promise return type
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Async function type
type AsyncFunction<T> = () => Promise<T>;

const getData: AsyncFunction<User[]> = async () => {
  return await fetchUsers();
};

// Awaited type
type UserData = Awaited<ReturnType<typeof fetchUser>>;
// User
```

## Best Practices

### 1. Avoid `any`

```typescript
// ❌ Wrong
const data: any = fetchData();

// ✅ Correct
const data: User[] = fetchData();

// ✅ If truly unknown
const data: unknown = fetchData();
if (isUser(data)) {
  // Use data
}
```

### 2. Use Strict Null Checks

```typescript
// ❌ Wrong
const user: User = null;

// ✅ Correct
const user: User | null = null;

if (user !== null) {
  console.log(user.name);
}
```

### 3. Prefer Interfaces for Objects

```typescript
// ✅ Interfaces for object shapes
interface User {
  name: string;
  email: string;
}

// ✅ Types for unions
type Status = "active" | "inactive";
```

### 4. Use Const Assertions

```typescript
// Without const
const colors = ["red", "green", "blue"];
// Type: string[]

// With const
const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]
```

### 5. Type Inference

```typescript
// ✅ Let TypeScript infer when obvious
const count = 0; // inferred as number
const items = []; // inferred as never[] (should add type!)

// ✅ Explicit when needed
const items: Item[] = [];
const user: User | null = null;
```
