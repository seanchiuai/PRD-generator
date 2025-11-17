"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please check your .env configuration."
    );
  }

  const convex = useMemo(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
    []
  );

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
