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
    if (!generatedAt) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    if (typeof generatedAt === 'string') return generatedAt;
    return generatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
