"use client";

import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 relative">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-1/4 w-24 h-24 rounded-full bg-macaron-lavender/20 blur-2xl animate-float"></div>
      <div className="absolute bottom-10 right-1/4 w-32 h-32 rounded-full bg-macaron-mint/20 blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-macaron-lavender via-macaron-mint to-macaron-peach p-1">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
              <FileText className="h-12 w-12 text-[#3D2066]" />
            </div>
          </div>
        </div>

        <h3 className="text-3xl font-display font-bold mb-3 bg-gradient-to-r from-[#3D2066] to-[#1A4D3E] bg-clip-text text-transparent">
          No PRDs Yet
        </h3>

        <p className="text-muted-foreground text-center max-w-md mb-8 text-lg leading-relaxed">
          Get started by creating your first Product Requirements Document. It only takes a few
          minutes with our AI-powered assistant!
        </p>

        <Button
          onClick={() => router.push("/chat/new")}
          className="bg-gradient-to-r from-macaron-lavender to-macaron-mint text-secondary-foreground font-display font-semibold px-8 py-6 text-base shadow-xl hover:shadow-2xl"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Create Your First PRD
        </Button>
      </div>
    </div>
  );
}
