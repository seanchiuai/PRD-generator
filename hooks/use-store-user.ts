import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { logger } from "@/lib/logger";

/**
 * Hook that automatically stores/updates user in Convex database when they authenticate
 * Should be called once at the root level of the app
 */
export function useStoreUser() {
  const { user, isLoaded } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    // Only store user once Clerk has loaded and user is authenticated
    if (!isLoaded) return;
    if (!user) return;

    // Store/update user in Convex
    storeUser().catch((error) => {
      logger.error("useStoreUser", error, { userId: user.id });
    });
  }, [user?.id, isLoaded]);
}
