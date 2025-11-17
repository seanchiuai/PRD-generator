import { Document } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { OverviewPage } from "./pdf/OverviewPage";
import { TechStackPage } from "./pdf/TechStackPage";
import { FeaturesPage } from "./pdf/FeaturesPage";
import { ArchitecturePage } from "./pdf/ArchitecturePage";
import { TimelinePage } from "./pdf/TimelinePage";

interface PRDDocumentProps {
  prd: PRDData;
}

export function PRDDocument({ prd }: PRDDocumentProps) {
  return (
    <Document>
      <OverviewPage prd={prd} />
      <TechStackPage prd={prd} />
      <FeaturesPage prd={prd} />
      <ArchitecturePage prd={prd} />
      <TimelinePage prd={prd} />
    </Document>
  );
}
