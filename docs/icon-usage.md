# Icon Usage

## Icon Library

This project uses **lucide-react** for all icons.

**Installation:**
```bash
npm install lucide-react
```

**Documentation:** https://lucide.dev/

## Basic Usage

### Import Pattern

```typescript
import { CheckCircle2, Loader2, Circle, AlertTriangle } from "lucide-react";

export function Component() {
  return (
    <div>
      <CheckCircle2 className="h-5 w-5" />
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
```

### Icon as Component

```typescript
import { Download } from "lucide-react";

<button>
  <Download className="mr-2 h-4 w-4" />
  Download
</button>
```

## Standard Sizing

### Size Classes

```typescript
// Extra small (16px)
<Icon className="h-4 w-4" />

// Small (20px) - Most common
<Icon className="h-5 w-5" />

// Medium (24px)
<Icon className="h-6 w-6" />

// Large (32px)
<Icon className="h-8 w-8" />

// Extra large (48px)
<Icon className="h-12 w-12" />
```

### Sizing by Context

```typescript
// Button icon (small)
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// Status indicator (medium)
<div className="flex items-center gap-2">
  <CheckCircle2 className="h-5 w-5 text-green-600" />
  <span>Completed</span>
</div>

// Empty state icon (large)
<div className="text-center">
  <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
  <p>No files found</p>
</div>
```

## Color Patterns

### Semantic Colors

```typescript
// Success (green)
<CheckCircle2 className="h-5 w-5 text-green-600" />

// Error (red)
<XCircle className="h-5 w-5 text-red-600" />

// Warning (yellow/orange)
<AlertTriangle className="h-5 w-5 text-yellow-600" />

// Info (blue)
<Info className="h-5 w-5 text-blue-600" />

// Muted/secondary
<Icon className="h-5 w-5 text-muted-foreground" />

// Primary
<Icon className="h-5 w-5 text-primary" />
```

### Color by Status

```typescript
import { cn } from "@/lib/utils";

<Icon
  className={cn(
    "h-5 w-5",
    status === "success" && "text-green-600",
    status === "error" && "text-red-600",
    status === "warning" && "text-yellow-600",
    status === "info" && "text-blue-600"
  )}
/>
```

## Common Icons by Use Case

### Status Indicators

```typescript
import {
  CheckCircle2,  // Completed/Success
  Loader2,       // Loading/In Progress
  Circle,        // Pending/Default
  XCircle,       // Failed/Error
  AlertTriangle, // Warning
} from "lucide-react";

// Loading spinner
<Loader2 className="h-5 w-5 animate-spin text-blue-600" />

// Completed
<CheckCircle2 className="h-5 w-5 text-green-600" />

// Pending
<Circle className="h-5 w-5 text-gray-400" />

// Failed
<XCircle className="h-5 w-5 text-red-600" />
```

### Navigation

```typescript
import {
  ChevronRight,  // Next/Forward
  ChevronLeft,   // Back/Previous
  ChevronDown,   // Expand/Show more
  ChevronUp,     // Collapse/Show less
  ArrowLeft,     // Back navigation
  ArrowRight,    // Forward navigation
  Home,          // Home page
  Menu,          // Menu toggle
  X,             // Close
} from "lucide-react";
```

### Actions

```typescript
import {
  Plus,          // Add/Create
  Pencil,        // Edit
  Trash2,        // Delete
  Download,      // Download/Export
  Upload,        // Upload/Import
  Save,          // Save
  Copy,          // Copy/Duplicate
  Search,        // Search
  Filter,        // Filter
  MoreVertical,  // More options (vertical)
  MoreHorizontal,// More options (horizontal)
} from "lucide-react";
```

### Files & Documents

```typescript
import {
  File,          // Generic file
  FileText,      // Text document
  FileJson,      // JSON file
  FileX,         // No file/Empty
  Folder,        // Directory
  FolderOpen,    // Open directory
} from "lucide-react";
```

### Communication

```typescript
import {
  MessageSquare, // Chat/Message
  Send,          // Send message
  Mail,          // Email
  Bell,          // Notification
  Info,          // Information
} from "lucide-react";
```

### User & Account

```typescript
import {
  User,          // Single user
  Users,         // Multiple users
  UserPlus,      // Add user
  Settings,      // Settings
  LogOut,        // Sign out
  LogIn,         // Sign in
} from "lucide-react";
```

## Icon with Text Patterns

### Icon Before Text

```typescript
<button className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  <span>Add Item</span>
</button>
```

### Icon After Text

```typescript
<button className="flex items-center gap-2">
  <span>Continue</span>
  <ChevronRight className="h-4 w-4" />
</button>
```

### Icon Only Button

```typescript
<button className="p-2" aria-label="Delete">
  <Trash2 className="h-4 w-4" />
</button>
```

## Animated Icons

### Spinning Loader

```typescript
<Loader2 className="h-5 w-5 animate-spin" />
```

### Pulsing Indicator

```typescript
<Circle className="h-5 w-5 animate-pulse" />
```

### Custom Animation

```typescript
<Icon className="h-5 w-5 transition-transform hover:scale-110" />
```

## Icon Composition Patterns

### Status Icon Component

```typescript
interface StatusIconProps {
  status: "pending" | "in_progress" | "completed" | "failed";
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  if (status === "completed") {
    return <CheckCircle2 className={cn("h-5 w-5 text-green-600", className)} />;
  }

  if (status === "in_progress") {
    return <Loader2 className={cn("h-5 w-5 text-blue-600 animate-spin", className)} />;
  }

  if (status === "failed") {
    return <XCircle className={cn("h-5 w-5 text-red-600", className)} />;
  }

  return <Circle className={cn("h-5 w-5 text-gray-400", className)} />;
}

// Usage
<StatusIcon status="in_progress" />
```

### Icon Button Component

```typescript
interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

export function IconButton({ icon: Icon, label, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted"
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

// Usage
<IconButton icon={Download} label="Export" onClick={handleExport} />
```

## Accessibility

### Always Provide Labels

```typescript
// ❌ Wrong - no label for icon-only button
<button>
  <Download className="h-4 w-4" />
</button>

// ✅ Correct - aria-label for screen readers
<button aria-label="Download file">
  <Download className="h-4 w-4" />
</button>

// ✅ Correct - visible text
<button>
  <Download className="h-4 w-4 mr-2" />
  Download
</button>
```

### Decorative Icons

```typescript
// Icon is decorative (text provides context)
<div>
  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
  <span>Task completed</span>
</div>
```

## Icon Placement in UI

### In Buttons

```typescript
// Primary action with icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  New PRD
</Button>

// Icon button (small)
<Button variant="ghost" size="icon">
  <MoreVertical className="h-4 w-4" />
</Button>
```

### In Cards

```typescript
<Card>
  <div className="flex items-center gap-3">
    <FileText className="h-5 w-5 text-primary" />
    <h3>Document Title</h3>
  </div>
</Card>
```

### In Lists

```typescript
<ul>
  {items.map(item => (
    <li key={item.id} className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <span>{item.name}</span>
    </li>
  ))}
</ul>
```

### In Forms

```typescript
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input className="pl-10" placeholder="Search..." />
</div>
```

## Common Patterns from Codebase

### Research Progress Icons

```typescript
// components/research/ResearchProgress.tsx
{category.status === "completed" && (
  <CheckCircle2 className="h-5 w-5 text-green-600" />
)}
{category.status === "in_progress" && (
  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
)}
{category.status === "pending" && (
  <Circle className="h-5 w-5 text-gray-400" />
)}
{category.status === "failed" && (
  <XCircle className="h-5 w-5 text-red-600" />
)}
```

### Button with Icon

```typescript
<Button onClick={handleCreate}>
  <Plus className="mr-2 h-4 w-4" />
  New PRD
</Button>
```

### Empty State

```typescript
<div className="text-center">
  <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">No PRDs yet</h3>
  <p className="text-muted-foreground">Create your first PRD</p>
</div>
```

## Icon Reference by Category

### Most Used Icons

```typescript
// Status & Progress
CheckCircle2, Loader2, Circle, XCircle, AlertTriangle

// Navigation
ChevronRight, ChevronLeft, ChevronDown, ArrowLeft, Home

// Actions
Plus, Pencil, Trash2, Download, Search, Send

// Files
File, FileText, FileJson, Folder

// UI Elements
X, Menu, MoreVertical, MoreHorizontal

// User
User, Settings, LogOut
```

### Import Statement for Common Icons

```typescript
import {
  // Status
  CheckCircle2,
  Loader2,
  Circle,
  XCircle,
  AlertTriangle,

  // Navigation
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,

  // Actions
  Plus,
  Pencil,
  Trash2,
  Download,
  Search,

  // Files
  FileText,
  FileJson,

  // UI
  X,
  Menu,
  MoreVertical,
} from "lucide-react";
```

## Best Practices

1. **Consistent sizing** - Use `h-5 w-5` for most icons
2. **Semantic colors** - Green for success, red for errors, etc.
3. **Always add spacing** - Use `mr-2`, `gap-2` for icon-text spacing
4. **Accessibility** - Provide `aria-label` for icon-only buttons
5. **Animate appropriately** - Use `animate-spin` for loaders
6. **Match context** - Smaller icons in buttons, larger in empty states
7. **Import only needed** - Don't import all icons, tree-shaking works best
8. **Use cn()** - Combine classes with `cn()` for conditional styling

## Finding Icons

**Search on lucide.dev:**
https://lucide.dev/icons/

**Search in VSCode:**
1. Start typing icon name in import
2. Autocomplete will show available icons
3. Hover for preview

**Common naming patterns:**
- `Circle` variants: `Circle`, `CheckCircle2`, `XCircle`
- `Arrow` variants: `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`
- `Chevron` variants: `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `File` variants: `File`, `FileText`, `FileJson`, `FileX`
