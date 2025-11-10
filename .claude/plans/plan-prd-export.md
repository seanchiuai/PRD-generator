# Implementation Plan: PRD Export (JSON & PDF)

## Overview
Build export functionality allowing users to download their PRD in JSON format (for integration) and PDF format (for sharing/printing). This enhances the PRD's usefulness beyond the web interface.

## Tech Stack
- **Frontend**: Next.js 15 + React + TypeScript
- **PDF Generation**: @react-pdf/renderer
- **File Download**: Browser APIs (Blob, URL.createObjectURL)
- **Database**: Convex (reads PRD data)
- **Auth**: Clerk (already configured)

---

## Phase 1: Dependencies Installation

```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf
```

**Note**: No database schema changes needed - we read from existing `prds` table.

---

## Phase 2: UI Components (Build UI First!)

### 2.1 Export Button Group Component

**File**: `components/export/ExportButtons.tsx`

```typescript
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
  prd: any;
  productName: string;
  onExportJSON: () => Promise<void>;
  onExportPDF: () => Promise<void>;
}

export function ExportButtons({
  prd,
  productName,
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
          {isExporting ? `Exporting ${exportType?.toUpperCase()}...` : "Export PRD"}
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
```

### 2.2 PDF Document Component

**File**: `components/export/PRDDocument.tsx`

```typescript
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - uses default if omitted)
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 8,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 11,
    marginLeft: 15,
    marginBottom: 3,
  },
  table: {
    display: "flex",
    width: "auto",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  badge: {
    backgroundColor: "#f0f0f0",
    padding: "3 8",
    borderRadius: 3,
    fontSize: 9,
    marginTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
});

interface PRDDocumentProps {
  prd: any;
}

export function PRDDocument({ prd }: PRDDocumentProps) {
  return (
    <Document>
      {/* Page 1: Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{prd.projectOverview.productName}</Text>
          <Text style={styles.subtitle}>{prd.projectOverview.tagline}</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <Text style={styles.text}>{prd.projectOverview.description}</Text>

          <Text style={styles.subsectionTitle}>Target Audience</Text>
          <Text style={styles.text}>{prd.projectOverview.targetAudience}</Text>

          <Text style={styles.subsectionTitle}>Problem Statement</Text>
          <Text style={styles.text}>{prd.projectOverview.problemStatement}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose & Goals</Text>
          <Text style={styles.subsectionTitle}>Vision</Text>
          <Text style={styles.text}>{prd.purposeAndGoals.vision}</Text>

          <Text style={styles.subsectionTitle}>Key Objectives</Text>
          {prd.purposeAndGoals.keyObjectives.map((obj: string, i: number) => (
            <Text key={i} style={styles.bulletPoint}>
              • {obj}
            </Text>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 1 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 2: Tech Stack */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Stack</Text>
        </View>

        {Object.entries(prd.techStack).map(([key, value]: [string, any]) => {
          if (key === "reasoning" || key === "additionalTools") return null;
          return (
            <View key={key} style={styles.section}>
              <Text style={styles.sectionTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.subsectionTitle}>{value.name}</Text>
              <Text style={styles.text}>{value.purpose}</Text>

              <Text style={{ ...styles.subsectionTitle, color: "#059669" }}>Pros</Text>
              {value.pros.map((pro: string, i: number) => (
                <Text key={i} style={styles.bulletPoint}>
                  • {pro}
                </Text>
              ))}

              <Text style={{ ...styles.subsectionTitle, color: "#DC2626" }}>Cons</Text>
              {value.cons.map((con: string, i: number) => (
                <Text key={i} style={styles.bulletPoint}>
                  • {con}
                </Text>
              ))}
            </View>
          );
        })}

        <Text style={styles.footer}>
          Page 2 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 3: Features */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Features</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MVP Features</Text>
          {prd.features.mvpFeatures.map((feature: any, i: number) => (
            <View key={i} style={{ marginBottom: 15 }}>
              <Text style={styles.subsectionTitle}>
                {i + 1}. {feature.name}
              </Text>
              <Text style={styles.text}>{feature.description}</Text>
              <Text style={{ ...styles.text, fontStyle: "italic" }}>
                User Story: {feature.userStory}
              </Text>

              <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 5 }}>
                Acceptance Criteria:
              </Text>
              {feature.acceptanceCriteria.map((criteria: string, j: number) => (
                <Text key={j} style={styles.bulletPoint}>
                  • {criteria}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 3 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 4: Architecture */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Architecture</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Design</Text>
          <Text style={styles.text}>{prd.technicalArchitecture.systemDesign}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Models</Text>
          {prd.technicalArchitecture.dataModels.map((model: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>{model.entityName}</Text>
              <Text style={styles.text}>{model.description}</Text>
              {model.fields.map((field: any, j: number) => (
                <Text key={j} style={{ fontSize: 9, marginLeft: 10 }}>
                  - {field.name}: {field.type} {field.required ? "*" : ""}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 4 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 5: Timeline */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Timeline & Risks</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Timeline</Text>
          <Text style={styles.text}>
            Estimated Duration: {prd.timeline.estimatedDuration}
          </Text>

          {prd.timeline.phases.map((phase: any, i: number) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={styles.subsectionTitle}>
                {phase.name} ({phase.duration})
              </Text>
              {phase.deliverables.map((deliverable: string, j: number) => (
                <Text key={j} style={styles.bulletPoint}>
                  • {deliverable}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks & Mitigation</Text>
          {prd.risks.map((risk: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>
                {risk.category}: {risk.description}
              </Text>
              <Text style={styles.text}>Impact: {risk.impact}</Text>
              <Text style={styles.text}>Mitigation: {risk.mitigation}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 5 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>
    </Document>
  );
}
```

---

## Phase 3: Export Utility Functions

### File: `lib/export-utils.ts`

```typescript
import { pdf } from "@react-pdf/renderer";

export async function exportJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function exportPDF(documentComponent: React.ReactElement, filename: string) {
  // Generate PDF blob from React component
  const blob = await pdf(documentComponent).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  // Remove special characters and spaces
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

---

## Phase 4: PRD Detail Page with Export

### File: `app/prd/[prdId]/page.tsx`

```typescript
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PRDDisplay } from "@/components/prd/PRDDisplay";
import { ExportButtons } from "@/components/export/ExportButtons";
import { PRDDocument } from "@/components/export/PRDDocument";
import { exportJSON, exportPDF, sanitizeFilename } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function PRDDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prdId = params.prdId as Id<"prds">;
  const { toast } = useToast();

  const prd = useQuery(api.prds.get, { prdId });

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

  if (!prd) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading PRD...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{prd.productName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(prd.createdAt).toLocaleDateString()}
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
```

---

## Phase 5: Testing Checklist

### Manual Testing
- [ ] JSON export downloads correctly
- [ ] JSON file is valid and readable
- [ ] PDF export generates successfully
- [ ] PDF contains all PRD sections
- [ ] PDF formatting is clean and readable
- [ ] Filename sanitization works (removes special chars)
- [ ] Export buttons disable during generation
- [ ] Toast notifications appear on success/failure
- [ ] Both exports work on mobile

### Error Scenarios
- [ ] Large PRDs (>100 pages) export successfully
- [ ] Special characters in product name handled
- [ ] Network errors during PDF generation handled
- [ ] Browser compatibility (Chrome, Firefox, Safari)

### Performance
- [ ] JSON export is instant
- [ ] PDF generation completes in <5 seconds
- [ ] No memory leaks with large PRDs

---

## Phase 6: Additional Features (Optional Enhancements)

### Email PRD Feature

**File**: `app/api/prd/email/route.ts`

```typescript
// Optional: Send PRD via email using Resend or similar service
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email, prdData, productName } = await request.json();

  await resend.emails.send({
    from: "PRD Generator <noreply@yourdomain.com>",
    to: email,
    subject: `PRD: ${productName}`,
    attachments: [
      {
        filename: `${productName}-prd.json`,
        content: Buffer.from(JSON.stringify(prdData, null, 2)),
      },
    ],
  });

  return NextResponse.json({ success: true });
}
```

---

## Common Pitfalls to Avoid

### 1. **PDF Rendering Errors**
❌ Don't: Use unsupported CSS properties
✅ Do: Use only @react-pdf/renderer supported styles

### 2. **Large File Sizes**
❌ Don't: Include images without compression
✅ Do: Optimize assets and use web fonts sparingly

### 3. **Browser Compatibility**
❌ Don't: Use advanced browser-only features
✅ Do: Test on multiple browsers

### 4. **No Error Feedback**
❌ Don't: Fail silently
✅ Do: Show toast notifications for all export attempts

### 5. **Poor PDF Layout**
❌ Don't: Cram all content on one page
✅ Do: Use multiple pages with clear sections

---

## Next Steps

After completing this feature:
1. Test both export formats thoroughly
2. Verify PDF formatting on different devices
3. Consider adding email delivery feature
4. Implement export analytics (track download counts)

---

## Integration Points

This feature connects to:
- **PRD Generation** - Uses generated PRD data
- **Convex DB** - Reads PRD from database
- **Browser APIs** - Handles file download
- **User Dashboard** - Export available from PRD list
