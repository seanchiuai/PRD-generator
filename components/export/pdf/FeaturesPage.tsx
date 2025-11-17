import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface FeaturesPageProps {
  prd: PRDData;
  pageNumber?: number;
}

export function FeaturesPage({ prd, pageNumber = 3 }: FeaturesPageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Features" />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>MVP Features</Text>
        {prd.features.mvpFeatures.map((feature, i) => (
          <View key={i} style={{ marginBottom: 15 }}>
            <Text style={pdfStyles.subsectionTitle}>
              {i + 1}. {feature.name}
            </Text>
            <Text style={pdfStyles.text}>{feature.description}</Text>
            <Text style={{ ...pdfStyles.text, fontStyle: "italic" }}>
              User Story: {feature.userStory}
            </Text>

            <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 5 }}>
              Acceptance Criteria:
            </Text>
            {feature.acceptanceCriteria.map((criteria, j) => (
              <Text key={j} style={pdfStyles.bulletPoint}>
                • {criteria}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
