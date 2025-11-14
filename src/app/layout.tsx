import type { Metadata } from "next";
// Temporarily disabled Google Fonts due to network restrictions
// import { Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import ClientBody from "@/components/providers/client-body";
import { Toaster } from "@/components/ui/toaster";
import { StoreUserProvider } from "@/components/providers/store-user-provider";
import { WorkflowProvider } from "@/contexts/WorkflowContext";

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
        <ClientBody className="antialiased font-mona-regular">
          <ClerkProvider
            dynamic
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#ffffff",
                colorBackground: "#000000",
                colorInputBackground: "#1a1a1a",
                colorInputText: "#ffffff",
                colorText: "#ffffff",
                colorTextSecondary: "#b3b3b3",
                colorNeutral: "#3a3a3a",
                colorDanger: "#dc2626",
                colorSuccess: "#10b981",
                colorWarning: "#f59e0b",
                borderRadius: "0.625rem",
              },
              elements: {
                card: "bg-[#1a1a1a] border-[#3a3a3a]",
                headerTitle: "text-white",
                headerSubtitle: "text-[#b3b3b3]",
                socialButtonsBlockButton: "border-[#3a3a3a] hover:bg-[#2a2a2a]",
                formButtonPrimary: "bg-white text-black hover:bg-gray-200",
                formFieldInput: "bg-[#1a1a1a] border-[#3a3a3a] text-white",
                footerActionLink: "text-white hover:text-gray-300",
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
