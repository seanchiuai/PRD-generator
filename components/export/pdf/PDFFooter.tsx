import { Text } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";

interface PDFFooterProps {
  pageNumber: number;
  productName: string;
}

export function PDFFooter({ pageNumber, productName }: PDFFooterProps) {
  return (
    <Text style={pdfStyles.footer}>
      Page {pageNumber} | {productName} PRD
    </Text>
  );
}
