"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";

/**
 * Auth buttons component that shows sign-in/sign-up for unauthenticated users
 * and user button for authenticated users
 */
export function AuthButtons() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}
