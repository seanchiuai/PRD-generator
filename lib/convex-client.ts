/**
 * Centralized Convex HTTP Client
 *
 * Single instance of ConvexHttpClient for all API routes.
 * Prevents multiple client instantiations and ensures consistent configuration.
 */

import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
}

/**
 * Shared Convex client instance
 *
 * Use this in API routes instead of creating new instances:
 * ```typescript
 * import { convexClient } from "@/lib/convex-client";
 *
 * const data = await convexClient.query(api.conversations.get, { id });
 * ```
 */
export const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);
