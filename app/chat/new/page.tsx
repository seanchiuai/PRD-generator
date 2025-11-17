"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function NewChatPage() {
  const router = useRouter();
  const createConversation = useMutation(api.conversations.create);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let errorTimeout: ReturnType<typeof setTimeout> | null = null;

    const initConversation = async () => {
      setIsLoading(true);
      try {
        const conversationId = await createConversation();
        if (mounted) {
          router.push(`/chat/${conversationId}`);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
        if (mounted) {
          // Delay showing error to avoid flashing on transient network issues
          errorTimeout = setTimeout(() => {
            if (mounted) {
              setError(error instanceof Error ? error.message : "Failed to create conversation");
              setIsLoading(false);
            }
          }, 400);
        }
      }
    };

    initConversation();

    return () => {
      mounted = false;
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [createConversation, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive font-semibold">Failed to create conversation</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Creating new conversation...</p>
    </div>
  );
}
