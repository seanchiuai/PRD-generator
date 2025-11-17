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
                colorPrimary: "#C7522A",
                colorBackground: "#FAFAF8",
                colorInputBackground: "#F2F1EE",
                colorInputText: "#1A1816",
                colorText: "#1A1816",
                colorTextSecondary: "#706B63",
                colorNeutral: "#D6D3CC",
                colorDanger: "#D93F3F",
                colorSuccess: "#2C5F5D",
                colorWarning: "#C7522A",
                borderRadius: "0.375rem",
                fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
                fontFamilyButtons: "'Fraunces', Georgia, serif",
              },
              elements: {
                card: "bg-white border-[#D6D3CC] shadow-md",
                headerTitle: "text-[#1A1816] font-display",
                headerSubtitle: "text-[#706B63]",
                socialButtonsBlockButton: "border-[#D6D3CC] hover:bg-[#F2F1EE] transition-all",
                formButtonPrimary: "bg-[#C7522A] text-[#FAFAF8] hover:bg-[#B14723] font-display font-semibold",
                formFieldInput: "bg-[#F2F1EE] border-[#D6D3CC] text-[#1A1816] focus:border-[#C7522A]",
                footerActionLink: "text-[#C7522A] hover:text-[#B14723]",
                formFieldLabel: "text-[#1A1816] font-medium",
                identityPreviewText: "text-[#1A1816]",
                identityPreviewEditButton: "text-[#C7522A]",
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
