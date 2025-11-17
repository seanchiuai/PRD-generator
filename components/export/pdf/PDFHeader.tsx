import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";

interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  generatedAt?: string | Date;
}

export function PDFHeader({
  title,
  subtitle,
  showDate = false,
  generatedAt
}: PDFHeaderProps) {
  const getFormattedDate = () => {
    if (!generatedAt) return new Date().toLocaleDateString();
    if (typeof generatedAt === 'string') return generatedAt;
    return generatedAt.toLocaleDateString();
  };

  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>{title}</Text>
      {subtitle && <Text style={pdfStyles.subtitle}>{subtitle}</Text>}
      {showDate && (
        <Text style={pdfStyles.subtitle}>
          Generated: {getFormattedDate()}
        </Text>
      )}
    </View>
  );
}
