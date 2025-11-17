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
          {prd.technicalArchitecture?.systemDesign || 'Not specified'}
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Data Models</Text>
        {Array.isArray(prd.technicalArchitecture?.dataModels) && prd.technicalArchitecture.dataModels.length > 0 ? (
          prd.technicalArchitecture.dataModels.map((model) => (
            <View key={model.entityName || 'unnamed'} style={pdfStyles.dataModel}>
              <Text style={pdfStyles.subsectionTitle}>{model.entityName || 'Unnamed Entity'}</Text>
              <Text style={pdfStyles.text}>{model.description || 'No description'}</Text>
              {Array.isArray(model.fields) && model.fields.length > 0 ? (
                model.fields.map((field) => (
                  <Text key={field.name || 'unnamed-field'} style={pdfStyles.fieldItem}>
                    - {field.name || 'unnamed'}: {field.type || 'unknown'} {field.required ? "*" : ""}
                  </Text>
                ))
              ) : (
                <Text style={pdfStyles.text}>No fields defined</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={pdfStyles.text}>No data models defined</Text>
        )}
      </View>

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
