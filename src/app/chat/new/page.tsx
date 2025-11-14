"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function NewChatPage() {
  const router = useRouter();
  const createConversation = useMutation(api.conversations.create);

  useEffect(() => {
    const initConversation = async () => {
      const conversationId = await createConversation();
      router.push(`/chat/${conversationId}`);
    };

    initConversation();
  }, [createConversation, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Creating new conversation...</p>
    </div>
  );
}
