import { Page, Text, View } from "@react-pdf/renderer";
import type { PRDData } from "@/types";
import { pdfStyles } from "./styles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";

interface OverviewPageProps {
  prd: PRDData;
  pageNumber?: number;
}

export function OverviewPage({ prd, pageNumber = 1 }: OverviewPageProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PDFHeader
        title={prd.projectOverview.productName}
        subtitle={prd.projectOverview.tagline}
        showDate
      />

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Project Overview</Text>
        <Text style={pdfStyles.text}>{prd.projectOverview.description}</Text>

        <Text style={pdfStyles.subsectionTitle}>Target Audience</Text>
        <Text style={pdfStyles.text}>{prd.projectOverview.targetAudience}</Text>

        <Text style={pdfStyles.subsectionTitle}>Problem Statement</Text>
        <Text style={pdfStyles.text}>{prd.projectOverview.problemStatement}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Purpose & Goals</Text>
        <Text style={pdfStyles.subsectionTitle}>Vision</Text>
        <Text style={pdfStyles.text}>{prd.purposeAndGoals.vision}</Text>

        <Text style={pdfStyles.subsectionTitle}>Key Objectives</Text>
        {prd.purposeAndGoals.keyObjectives.map((obj, i) => (
          <Text key={i} style={pdfStyles.bulletPoint}>
            • {obj}
          </Text>
        ))}
      </View>

      <PDFFooter pageNumber={pageNumber} productName={prd.projectOverview.productName} />
    </Page>
  );
}
