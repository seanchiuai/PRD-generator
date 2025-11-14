"use client";

import { useStoreUser } from "@/hooks/use-store-user";
import { ReactNode } from "react";

/**
 * Provider component that stores user in Convex database when they authenticate
 * This should wrap the app content inside ConvexClientProvider
 */
export function StoreUserProvider({ children }: { children: ReactNode }) {
  useStoreUser();
  return <>{children}</>;
}
