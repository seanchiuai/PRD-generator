import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface TechStackPageProps {
  prd: PRDData;
  pageNumber?: number;
}

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export function TechStackPage({ prd, pageNumber = 2 }: TechStackPageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader title="Technical Stack" />

      {Object.entries(prd.techStack)
        .filter(([key, value]) => key !== "reasoning" && typeof value !== "string")
        .map(([key, value]) => {
          // Type assertion safe after filtering out strings
          const techItem = value as import("@/types").TechStackItem;
          return (
            <View key={key} style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>
                {formatKey(key)}
              </Text>
              <Text style={pdfStyles.subsectionTitle}>{techItem.name}</Text>
              <Text style={pdfStyles.text}>{techItem.purpose}</Text>

              <Text style={{ ...pdfStyles.subsectionTitle, color: "#059669" }}>
                Pros
              </Text>
              {techItem.pros.map((pro, i) => (
                <Text key={i} style={pdfStyles.bulletPoint}>
                  • {pro}
                </Text>
              ))}

              <Text style={{ ...pdfStyles.subsectionTitle, color: "#DC2626" }}>
                Cons
              </Text>
              {techItem.cons.map((con, i) => (
                <Text key={i} style={pdfStyles.bulletPoint}>
                  • {con}
                </Text>
              ))}
            </View>
          );
        })}

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
