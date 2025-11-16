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
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-macaron-lavender to-macaron-mint animate-pulse"></div>
          <p className="text-muted-foreground font-medium">Loading your PRDs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-display font-bold text-gradient-primary">
            My PRDs
          </h1>
          {stats && (
            <p className="text-muted-foreground mt-2 text-lg">
              <span className="inline-flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-macaron-lavender/20 text-secondary-foreground font-medium">
                  {stats.total} total
                </span>
                <span className="px-3 py-1 rounded-full bg-macaron-mint/20 text-primary-foreground font-medium">
                  {stats.completed} completed
                </span>
              </span>
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push("/chat/new")}
          className="bg-gradient-to-r from-macaron-lavender to-macaron-mint text-secondary-foreground hover:shadow-xl hover:scale-105 transition-all duration-300 font-display font-semibold px-6 py-6 text-base rounded-2xl"
        >
          <Plus className="h-5 w-5 mr-2" />
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
