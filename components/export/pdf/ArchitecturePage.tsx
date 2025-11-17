import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface ArchitecturePageProps {
  prd: PRDData;
  pageNumber?: number;
}

export function ArchitecturePage({ prd, pageNumber = 4 }: ArchitecturePageProps) {
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
        {prd.technicalArchitecture.dataModels.map((model) => (
          <View key={model.entityName} style={{ marginBottom: 10 }}>
            <Text style={pdfStyles.subsectionTitle}>{model.entityName}</Text>
            <Text style={pdfStyles.text}>{model.description}</Text>
            {model.fields.map((field) => (
              <Text key={field.name} style={{ fontSize: 9, marginLeft: 10 }}>
                - {field.name}: {field.type} {field.required ? "*" : ""}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
