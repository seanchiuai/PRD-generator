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
 * Shared Convex client instance (unauthenticated)
 *
 * DEPRECATED: Use getAuthenticatedConvexClient() instead for authenticated routes.
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

/**
 * Get an authenticated Convex client with Clerk JWT token
 *
 * Use this in authenticated API routes:
 * ```typescript
 * import { getAuthenticatedConvexClient } from "@/lib/convex-client";
 *
 * export const POST = withAuth(async (request, { userId, token }) => {
 *   const client = getAuthenticatedConvexClient(token);
 *   const data = await client.query(api.conversations.get, { conversationId });
 * });
 * ```
 *
 * @param token - The JWT token from Clerk (obtained via auth().getToken({ template: "convex" }))
 * @returns An authenticated ConvexHttpClient instance
 */
export function getAuthenticatedConvexClient(token: string): ConvexHttpClient {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  client.setAuth(token);
  return client;
}
