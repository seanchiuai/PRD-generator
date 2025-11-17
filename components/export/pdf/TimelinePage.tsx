import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface TimelinePageProps {
  prd: PRDData;
}

export function TimelinePage({ prd }: TimelinePageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Timeline & Risks" />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Development Timeline</Text>
        <Text style={pdfStyles.text}>
          Estimated Duration: {prd.timeline.estimatedDuration}
        </Text>

        {prd.timeline.phases.map((phase, i) => (
          <View key={i} style={{ marginTop: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>
              {phase.name} ({phase.duration})
            </Text>
            {phase.deliverables.map((deliverable, j) => (
              <Text key={j} style={pdfStyles.bulletPoint}>
                • {deliverable}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Risks & Mitigation</Text>
        {prd.risks.map((risk, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>
              {risk.category}: {risk.description}
            </Text>
            <Text style={pdfStyles.text}>Impact: {risk.impact}</Text>
            <Text style={pdfStyles.text}>Mitigation: {risk.mitigation}</Text>
          </View>
        ))}
      </View>

      <PDFFooter pageNumber={5} productName={prd.projectOverview.productName} />
    </Page>
  );
}
