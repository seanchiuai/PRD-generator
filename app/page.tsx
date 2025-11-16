"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-macaron-lavender to-macaron-mint flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-secondary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-semibold mb-2">VIBED</h1>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-macaron-lavender/30 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-macaron-mint/30 blur-3xl animate-float [animation-delay:1s]"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-macaron-rose/30 blur-3xl animate-float [animation-delay:2s]"
        aria-hidden="true"
      />

      <div className="max-w-lg w-full relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block mb-6" aria-hidden="true">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-macaron-lavender via-macaron-mint to-macaron-peach p-0.5">
              <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                <FileText className="w-10 h-10 text-secondary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold mb-4 text-gradient-accent">
            VIBED
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Create professional Product Requirements Documents with AI assistance
          </p>
        </div>

        <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-scale-in [animation-delay:0.2s]">
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="group w-full px-6 py-4 bg-gradient-to-r from-macaron-lavender to-macaron-mint text-secondary-foreground rounded-2xl font-display font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95">
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Sign in to get started
                </span>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full px-6 py-4 border-2 border-border rounded-2xl font-display font-semibold text-lg text-foreground hover:bg-muted transition-all duration-300 hover:border-secondary">
                Create new account
              </button>
            </SignUpButton>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-macaron-mint/20 flex items-center justify-center" aria-hidden="true">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="font-medium text-foreground">AI-Powered</p>
                <p className="text-muted-foreground text-xs mt-1">Smart document generation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-macaron-lavender/20 flex items-center justify-center" aria-hidden="true">
                  <FileText className="w-6 h-6 text-secondary-foreground" />
                </div>
                <p className="font-medium text-foreground">Professional</p>
                <p className="text-muted-foreground text-xs mt-1">Production-ready PRDs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

