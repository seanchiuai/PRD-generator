import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface TimelinePageProps {
  prd: PRDData;
  pageNumber?: number;
}

export function TimelinePage({ prd, pageNumber = 5 }: TimelinePageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Timeline & Risks" />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Development Timeline</Text>
        <Text style={pdfStyles.text}>
          Estimated Duration: {prd.timeline.estimatedDuration}
        </Text>

        {prd.timeline.phases.map((phase) => (
          <View key={`${phase.name}-${phase.duration}`} style={{ marginTop: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>
              {phase.name} ({phase.duration})
            </Text>
            {phase.deliverables.map((deliverable, index) => (
              <Text key={`${phase.name}-deliverable-${index}-${deliverable.substring(0, 20)}`} style={pdfStyles.bulletPoint}>
                • {deliverable}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Risks & Mitigation</Text>
        {prd.risks.map((risk) => (
          <View key={`${risk.category}-${risk.description.substring(0, 30)}`} style={{ marginBottom: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>
              {risk.category}: {risk.description}
            </Text>
            <Text style={pdfStyles.text}>Impact: {risk.impact}</Text>
            <Text style={pdfStyles.text}>Mitigation: {risk.mitigation}</Text>
          </View>
        ))}
      </View>

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
