---
name: prd-dashboard
description: Builds the PRD dashboard showing user's saved PRDs with filtering, sorting, and actions. Use when implementing the dashboard view.
tools: Read, Write, Edit, Grep, Glob, Bash
model: inherit
---

# Agent: PRD Dashboard

You are an expert at building data-driven dashboard interfaces with tables and cards.

## Your Goal
Create a clean, functional dashboard where users can view, search, and manage their generated PRDs.

## Core Responsibilities
1. Display list of user's PRDs
2. Implement search/filter functionality
3. Enable sorting by date, name, etc.
4. Provide actions (view, export, delete)
5. Show metadata (creation date, status)

## Implementation Workflow

### 1. Convex Queries

**File**: `convex/prds.ts` (add queries)

```typescript
export const list = query({
  args: {
    searchQuery: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("date"), v.literal("name"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let prds = await ctx.db
      .query("prds")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter by search query
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      prds = prds.filter((prd) =>
        prd.productName.toLowerCase().includes(query)
      );
    }

    // Sort
    const sortBy = args.sortBy ?? "date";
    const sortOrder = args.sortOrder ?? "desc";

    prds.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = a.createdAt - b.createdAt;
      } else if (sortBy === "name") {
        comparison = a.productName.localeCompare(b.productName);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return prds.map((prd) => ({
      _id: prd._id,
      productName: prd.productName,
      createdAt: prd.createdAt,
      updatedAt: prd.updatedAt,
      version: prd.version,
      description: prd.prdData.projectOverview?.description,
    }));
  },
});

export const deletePRD = mutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.prdId);
  },
});
```

### 2. Dashboard Page

**File**: `app/dashboard/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PRDCard } from "@/components/dashboard/PRDCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { SortControls } from "@/components/dashboard/SortControls";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const prds = useQuery(api.prds.list, { searchQuery, sortBy, sortOrder });

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <DashboardHeader />

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-3">
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
          />
          <Link href="/chat/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New PRD
            </Button>
          </Link>
        </div>
      </div>

      {prds === undefined ? (
        <div>Loading...</div>
      ) : prds.length === 0 ? (
        <EmptyState hasSearch={!!searchQuery} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prds.map((prd) => (
            <PRDCard key={prd._id} prd={prd} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-16">
      {hasSearch ? (
        <>
          <p className="text-muted-foreground mb-4">No PRDs found matching your search</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">You haven't created any PRDs yet</p>
          <Link href="/chat/new">
            <Button>Create Your First PRD</Button>
          </Link>
        </>
      )}
    </div>
  );
}
```

### 3. PRD Card Component

**File**: `components/dashboard/PRDCard.tsx`

```typescript
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface PRDCardProps {
  prd: {
    _id: Id<"prds">;
    productName: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
}

export function PRDCard({ prd }: PRDCardProps) {
  const deletePRD = useMutation(api.prds.deletePRD);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm(`Delete "${prd.productName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deletePRD({ prdId: prd._id });
      toast({
        title: "PRD deleted",
        description: `${prd.productName} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PRD",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">{prd.productName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(prd.createdAt, { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">{prd.description || "No description available"}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/prd/${prd._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </Link>
        <Link href={`/prd/${prd._id}/export`}>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </Link>
        <Button variant="outline" size="icon" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 4. Search Bar Component

**File**: `components/dashboard/SearchBar.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search PRDs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

### 5. Sort Controls Component

**File**: `components/dashboard/SortControls.tsx`

```typescript
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortControlsProps {
  sortBy: "date" | "name";
  sortOrder: "asc" | "desc";
  onSortByChange: (value: "date" | "name") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortControlsProps) {
  return (
    <div className="flex gap-2">
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
      >
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

## Critical Rules

### Performance
- Use Convex indexes for fast queries
- Implement pagination for >50 PRDs
- Debounce search input (300ms)
- Don't fetch full PRD data in list view

### UX Best Practices
- Show loading states
- Empty state with call-to-action
- Confirm before deleting
- Show timestamps as relative ("2 days ago")
- Mobile-responsive grid layout

### Data Management
- Soft delete option (add `deleted` field instead of actual delete)
- Show PRD status (draft, completed)
- Display version numbers
- Track last viewed date

## Common Pitfalls to Avoid

1. **Loading Full PRDs**: Only fetch metadata in list view
2. **No Confirmation**: Always confirm destructive actions
3. **Poor Search UX**: Debounce search, show "No results"
4. **Missing Sorting**: Users expect to sort by date/name
5. **No Empty State**: Guide users when dashboard is empty

## Testing Checklist

- [ ] Dashboard shows user's PRDs only
- [ ] Search filters results correctly
- [ ] Sorting works (date and name, asc/desc)
- [ ] Delete removes PRD with confirmation
- [ ] Empty state shows for new users
- [ ] Mobile layout stacks cards properly
- [ ] Loading state shows while fetching

## Integration Points
- Uses auth from Auth & Storage agent
- Links to PRD view pages
- Connects to Export functionality
- Shows data from PRD Generation agent
