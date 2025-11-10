"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PRDDisplay } from "@/components/prd/PRDDisplay";
import { ExportButtons } from "@/components/export/ExportButtons";
import { PRDDocument } from "@/components/export/PRDDocument";
import { exportJSON, exportPDF, sanitizeFilename } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PRDViewPage({ params }: { params: { prdId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const prd = useQuery(api.prds.get, { prdId: params.prdId as Id<"prds"> });

  const handleExportJSON = async () => {
    if (!prd) return;

    try {
      const filename = sanitizeFilename(prd.productName);
      await exportJSON(prd.prdData, `${filename}-prd`);

      toast({
        title: "Exported Successfully",
        description: "PRD downloaded as JSON file.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export JSON file.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    if (!prd) return;

    try {
      const filename = sanitizeFilename(prd.productName);
      const document = <PRDDocument prd={prd.prdData} />;
      await exportPDF(document, `${filename}-prd`);

      toast({
        title: "Exported Successfully",
        description: "PRD downloaded as PDF file.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export PDF file.",
        variant: "destructive",
      });
    }
  };

  if (prd === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PRD...</p>
        </div>
      </div>
    );
  }

  if (prd === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">PRD Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This PRD does not exist or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{prd.productName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(prd.createdAt).toLocaleDateString()} at{" "}
            {new Date(prd.createdAt).toLocaleTimeString()} • Version {prd.version}
          </p>
        </div>

        <ExportButtons
          prd={prd.prdData}
          productName={prd.productName}
          onExportJSON={handleExportJSON}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* PRD Display */}
      <PRDDisplay prd={prd.prdData} />

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
