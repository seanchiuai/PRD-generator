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
