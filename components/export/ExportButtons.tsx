"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface ExportButtonsProps {
  onExportJSON: () => Promise<void>;
  onExportPDF: () => Promise<void>;
}

export function ExportButtons({
  onExportJSON,
  onExportPDF,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"json" | "pdf" | null>(null);

  const handleExport = async (type: "json" | "pdf") => {
    setIsExporting(true);
    setExportType(type);

    try {
      if (type === "json") {
        await onExportJSON();
      } else {
        await onExportPDF();
      }
    } catch (error) {
      console.error(`Export failed for ${type}:`, error);
      // Note: Consider adding toast notification here
      // toast.error(`Failed to export ${type.toUpperCase()}`)
      throw error; // Re-throw to allow parent component to handle
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting && exportType ? `Exporting ${exportType.toUpperCase()}...` : isExporting ? "Exporting..." : "Export PRD"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
