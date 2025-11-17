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
import type { Id } from "@/convex/_generated/dataModel";
import type { PRDData, PRDStatus } from "@/types";

interface PRDCardProps {
  prd: {
    _id: Id<"prds">;
    conversationId: Id<"conversations">;
    productName: string;
    prdData: PRDData;
    createdAt: number;
    updatedAt: number;
    version: number;
    status: PRDStatus;
  };
  onDelete: (prdId: Id<"prds">) => void;
}

export function PRDCard({ prd, onDelete }: PRDCardProps) {
  const router = useRouter();

  const handleView = () => {
    // If PRD is still generating, redirect to conversation
    if (prd.status === "generating") {
      router.push(`/chat/${prd.conversationId}`);
    } else {
      router.push(`/prd/${prd._id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-macaron-mint/30 text-primary-foreground border-macaron-mint/50";
      case "generating":
        return "bg-macaron-lavender/30 text-secondary-foreground border-macaron-lavender/50";
      case "failed":
        return "bg-macaron-berry/30 text-accent-foreground border-macaron-berry/50";
      default:
        return "";
    }
  };

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-scale-in border-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-display group-hover:text-secondary-foreground transition-colors">{prd.productName}</CardTitle>
            <CardDescription className="mt-1.5 font-medium">
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
                {prd.status === "generating" ? "Continue" : "View PRD"}
              </DropdownMenuItem>
              {prd.status === "completed" && (
                <DropdownMenuItem onClick={() => router.push(`/prd/${prd._id}`)}>
                  <Download className="h-4 w-4 mr-2" />
                  View & Export
                </DropdownMenuItem>
              )}
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
        <div className="space-y-3">
          <Badge className={`${getStatusColor(prd.status)} border font-semibold px-3 py-1 rounded-full`}>
            {prd.status}
          </Badge>
          {prd.prdData?.projectOverview?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {prd.prdData.projectOverview.description}
            </p>
          )}
          {prd.prdData?.techStack && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(prd.prdData.techStack)
                .filter(([key, value]) => {
                  // Skip entries that should not be displayed
                  if (key === "reasoning") return false;
                  if (!value || typeof value !== "object") return false;
                  if (!("name" in value) || typeof value.name !== "string") return false;
                  return true;
                })
                .slice(0, 3)
                .map(([key, value]) => (
                  <Badge key={key} variant="outline" className="rounded-full border-2 px-3 py-1 font-medium">
                    {(value as { name: string }).name}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleView} className="w-full bg-gradient-to-r from-macaron-lavender to-macaron-mint text-secondary-foreground font-display font-semibold">
          {prd.status === "generating" ? "Continue Workflow" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}
