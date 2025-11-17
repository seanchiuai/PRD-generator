import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { PRDData } from "@/types";

export function exportJSON(data: PRDData, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function exportPDF(documentComponent: ReactElement, filename: string) {
  // Generate PDF blob from React component
  const blob = await pdf(documentComponent).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Windows reserved filenames
const WINDOWS_RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;

export function sanitizeFilename(name: string): string {
  const MAX_BYTE_LENGTH = 200; // Leave room for extensions

  // Normalize to NFC form and preserve Unicode letters/digits
  const normalized = name.normalize('NFC');

  // Replace sequences of non-letter/digit characters with single hyphen
  // Uses Unicode-aware regex with u flag
  const cleaned = normalized
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

  // Check for Windows reserved names
  let sanitized = cleaned || 'export';
  if (WINDOWS_RESERVED.test(sanitized)) {
    sanitized = `${sanitized}-file`;
  }

  // Enforce byte length limit (UTF-8 encoding)
  const encoder = new TextEncoder();
  const bytes = encoder.encode(sanitized);
  if (bytes.length > MAX_BYTE_LENGTH) {
    // Truncate on character boundary
    const decoder = new TextDecoder();
    sanitized = decoder.decode(bytes.slice(0, MAX_BYTE_LENGTH));
    // Clean up any trailing hyphen from truncation
    sanitized = sanitized.replace(/-+$/, '');
  }

  return sanitized || 'export';
}
