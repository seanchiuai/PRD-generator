import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface TechStackPageProps {
  prd: PRDData;
}

export function TechStackPage({ prd }: TechStackPageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Technical Stack" />

      {Object.entries(prd.techStack)
        .filter(([key]) => key !== "reasoning")
        .map(([key, value]) => {
          if (typeof value === "string") return null;
          return (
            <View key={key} style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Text style={pdfStyles.subsectionTitle}>{value.name}</Text>
              <Text style={pdfStyles.text}>{value.purpose}</Text>

              <Text style={{ ...pdfStyles.subsectionTitle, color: "#059669" }}>
                Pros
              </Text>
              {value.pros.map((pro: string, i: number) => (
                <Text key={i} style={pdfStyles.bulletPoint}>
                  • {pro}
                </Text>
              ))}

              <Text style={{ ...pdfStyles.subsectionTitle, color: "#DC2626" }}>
                Cons
              </Text>
              {value.cons.map((con: string, i: number) => (
                <Text key={i} style={pdfStyles.bulletPoint}>
                  • {con}
                </Text>
              ))}
            </View>
          );
        })}

      <PDFFooter pageNumber={2} productName={prd.projectOverview.productName} />
    </Page>
  );
}
