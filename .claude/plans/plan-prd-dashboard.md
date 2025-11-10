# Implementation Plan: PRD Dashboard

## Overview
Build a comprehensive dashboard where users can view, search, sort, and manage all their saved PRDs. This serves as the main hub for accessing previously generated PRDs.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript + shadcn/ui
- **Backend**: Convex (queries with search/filter capabilities)
- **Database**: Convex
- **Auth**: Clerk (already configured)

---

## Phase 1: Database Schema (Already Complete)

The `prds` table already exists with necessary indexes:

```typescript
prds: defineTable({
  conversationId: v.id("conversations"),
  userId: v.string(),
  prdData: v.any(),
  productName: v.string(),
  version: v.number(),
  status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_conversation", ["conversationId"])
  .index("by_user_and_created", ["userId", "createdAt"]),
```

---

## Phase 2: UI Components (Build UI First!)

### 2.1 PRD Card Component

**File**: `components/dashboard/PRDCard.tsx`

```typescript
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface PRDCardProps {
  prd: {
    _id: Id<"prds">;
    productName: string;
    prdData: any;
    createdAt: number;
    updatedAt: number;
    version: number;
    status: "generating" | "completed" | "failed";
  };
  onDelete: (prdId: Id<"prds">) => void;
}

export function PRDCard({ prd, onDelete }: PRDCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/prd/${prd._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "generating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{prd.productName}</CardTitle>
            <CardDescription className="mt-1">
              Created {new Date(prd.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View PRD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/prd/${prd._id}`)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(prd._id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge className={getStatusColor(prd.status)}>{prd.status}</Badge>
          {prd.prdData?.projectOverview?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {prd.prdData.projectOverview.description}
            </p>
          )}
          {prd.prdData?.techStack && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(prd.prdData.techStack).slice(0, 3).map(([key, value]: [string, any]) => {
                if (key === "reasoning" || !value?.name) return null;
                return (
                  <Badge key={key} variant="outline">
                    {value.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleView} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 2.2 Search Bar Component

**File**: `components/dashboard/SearchBar.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search PRDs..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

### 2.3 Sort Controls Component

**File**: `components/dashboard/SortControls.tsx`

```typescript
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

interface SortControlsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 2.4 Empty State Component

**File**: `components/dashboard/EmptyState.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No PRDs Yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first Product Requirements Document. It only takes a few
        minutes!
      </p>
      <Button onClick={() => router.push("/chat/new")}>
        Create Your First PRD
      </Button>
    </div>
  );
}
```

---

## Phase 3: Convex Functions

### File: `convex/prds.ts` (add to existing file)

```typescript
// List function already exists from previous plans, but let's enhance it

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let prds = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // Client-side search filter (Convex doesn't have full-text search)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      prds = prds.filter((prd) =>
        prd.productName.toLowerCase().includes(searchLower)
      );
    }

    return prds;
  },
});

export const deletePRD = mutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.prdId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      total: prds.length,
      completed: prds.filter((p) => p.status === "completed").length,
      generating: prds.filter((p) => p.status === "generating").length,
      failed: prds.filter((p) => p.status === "failed").length,
    };
  },
});
```

---

## Phase 4: Main Dashboard Page

### File: `app/dashboard/page.tsx`

```typescript
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PRDCard } from "@/components/dashboard/PRDCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { SortControls } from "@/components/dashboard/SortControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"prds"> | null>(null);

  const prds = useQuery(api.prds.list, { search: searchQuery });
  const stats = useQuery(api.prds.getStats);
  const deletePRD = useMutation(api.prds.deletePRD);

  // Sort PRDs
  const sortedPRDs = useMemo(() => {
    if (!prds) return [];

    const sorted = [...prds];

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case "oldest":
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case "name-asc":
        return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
      case "name-desc":
        return sorted.sort((a, b) => b.productName.localeCompare(a.productName));
      default:
        return sorted;
    }
  }, [prds, sortBy]);

  const handleDelete = async (prdId: Id<"prds">) => {
    setDeleteConfirmId(prdId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deletePRD({ prdId: deleteConfirmId });
      toast({
        title: "PRD Deleted",
        description: "The PRD has been permanently deleted.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the PRD. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (prds === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My PRDs</h1>
          {stats && (
            <p className="text-muted-foreground mt-1">
              {stats.total} total • {stats.completed} completed
            </p>
          )}
        </div>
        <Button onClick={() => router.push("/chat/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New PRD
        </Button>
      </div>

      {/* Search and Sort */}
      {prds.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <SortControls value={sortBy} onChange={setSortBy} />
        </div>
      )}

      {/* PRD Grid */}
      {sortedPRDs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPRDs.map((prd) => (
            <PRDCard key={prd._id} prd={prd} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PRD?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The PRD and all associated data will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

---

## Phase 5: Navigation Integration

### Add Dashboard Link to Header/Sidebar

**File**: `components/Header.tsx` or similar

```typescript
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">PRD Generator</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </header>
  );
}
```

---

## Phase 6: Testing Checklist

### Manual Testing
- [ ] Dashboard loads all user's PRDs
- [ ] Search filters PRDs by name
- [ ] Sort options work correctly
- [ ] Delete confirmation dialog appears
- [ ] PRD deletion works
- [ ] Stats display correctly
- [ ] Empty state shows for new users
- [ ] "New PRD" button navigates correctly
- [ ] Mobile layout is responsive

### Error Scenarios
- [ ] No PRDs shows empty state
- [ ] Failed PRDs display with error status
- [ ] Delete failures show error toast
- [ ] Unauthenticated users redirected
- [ ] Network errors handled gracefully

### Performance
- [ ] Dashboard loads quickly with 50+ PRDs
- [ ] Search is responsive (debounced if needed)
- [ ] Sorting is instant
- [ ] No memory leaks

---

## Common Pitfalls to Avoid

### 1. **N+1 Queries**
❌ Don't: Query related data in loop
✅ Do: Use batch queries or include data in initial query

### 2. **No Loading States**
❌ Don't: Show blank screen while loading
✅ Do: Show skeleton or spinner

### 3. **Poor Search UX**
❌ Don't: Search on every keystroke without debounce
✅ Do: Debounce search input (300ms) for performance

### 4. **No Confirmation for Delete**
❌ Don't: Delete immediately on click
✅ Do: Show confirmation dialog

### 5. **Stale Data**
❌ Don't: Cache indefinitely
✅ Do: Convex handles real-time updates automatically

---

## Optional Enhancements

### 1. Batch Operations
- Select multiple PRDs
- Bulk delete
- Bulk export

### 2. Filters
- Filter by status (completed, generating, failed)
- Filter by date range
- Filter by tech stack

### 3. Analytics
- Total PRDs created
- Most used tech stacks
- Creation timeline chart

### 4. Collaboration
- Share PRD with team
- Comment on PRDs
- Version history

---

## Next Steps

After completing this feature:
1. Test dashboard with multiple PRDs
2. Verify search and sort functionality
3. Add analytics if desired
4. Consider implementing filters
5. User testing for UX improvements

---

## Integration Points

This feature connects to:
- **All Features** - Central hub for accessing PRDs
- **Convex DB** - Queries PRD data
- **Authentication** - Shows only user's PRDs
- **PRD Export** - Links to export functionality
