import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface ArchitecturePageProps {
  prd: PRDData;
}

export function ArchitecturePage({ prd }: ArchitecturePageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Technical Architecture" />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>System Design</Text>
        <Text style={pdfStyles.text}>
          {prd.technicalArchitecture.systemDesign}
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Data Models</Text>
        {prd.technicalArchitecture.dataModels.map((model, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>{model.entityName}</Text>
            <Text style={pdfStyles.text}>{model.description}</Text>
            {model.fields.map((field, j) => (
              <Text key={j} style={{ fontSize: 9, marginLeft: 10 }}>
                - {field.name}: {field.type} {field.required ? "*" : ""}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <PDFFooter pageNumber={4} productName={prd.projectOverview.productName} />
    </Page>
  );
}
