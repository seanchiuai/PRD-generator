import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ClientBody from "@/components/ClientBody";
import { Toaster } from "@/components/ui/toaster";
import { StoreUserProvider } from "@/components/StoreUserProvider";
import { WorkflowProvider } from "@/contexts/WorkflowContext";

export const metadata: Metadata = {
  title: "VIBED",
  description: "Welcome to VIBED",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientBody className="antialiased">
          <ClerkProvider
            dynamic
            appearance={{
              variables: {
                colorPrimary: "#D4BDFC",
                colorBackground: "#FFFBF5",
                colorInputBackground: "#F9F5F1",
                colorInputText: "#2D1B3D",
                colorText: "#2D1B3D",
                colorTextSecondary: "#6B5B73",
                colorNeutral: "#E8DDD4",
                colorDanger: "#FF6B9D",
                colorSuccess: "#B8E6D5",
                colorWarning: "#FFD1B3",
                borderRadius: "1.25rem",
                fontFamily: "'Onest', system-ui, -apple-system, sans-serif",
                fontFamilyButtons: "'Bricolage Grotesque', system-ui, -apple-system, sans-serif",
              },
              elements: {
                card: "bg-white border-[#E8DDD4] shadow-lg",
                headerTitle: "text-[#2D1B3D] font-display",
                headerSubtitle: "text-[#6B5B73]",
                socialButtonsBlockButton: "border-[#E8DDD4] hover:bg-[#F9F5F1] transition-all",
                formButtonPrimary: "bg-[#D4BDFC] text-[#3D2066] hover:bg-[#C9AEFB] font-display font-semibold",
                formFieldInput: "bg-[#F9F5F1] border-[#E8DDD4] text-[#2D1B3D] focus:border-[#D4BDFC]",
                footerActionLink: "text-[#D4BDFC] hover:text-[#C9AEFB]",
                formFieldLabel: "text-[#2D1B3D] font-medium",
                identityPreviewText: "text-[#2D1B3D]",
                identityPreviewEditButton: "text-[#D4BDFC]",
              }
            }}
          >
            <ConvexClientProvider>
              <StoreUserProvider>
                <WorkflowProvider>
                  {children}
                  <Toaster />
                </WorkflowProvider>
              </StoreUserProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </ClientBody>
      </body>
    </html>
  );
}
