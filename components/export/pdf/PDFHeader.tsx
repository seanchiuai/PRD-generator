import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";

interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
}

export function PDFHeader({ title, subtitle, showDate = false }: PDFHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>{title}</Text>
      {subtitle && <Text style={pdfStyles.subtitle}>{subtitle}</Text>}
      {showDate && (
        <Text style={pdfStyles.subtitle}>
          Generated: {new Date().toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
