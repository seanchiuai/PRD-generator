"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, FileText, Zap, ArrowRight, Box, Layers, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
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

function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Geometric background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 bg-dots-pattern opacity-40" aria-hidden="true" />

      {/* Decorative geometric shapes */}
      <div
        className="absolute top-20 right-[10%] w-64 h-64 border-8 border-macaron-lavender/40 rounded-full animate-rotate-slow"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-32 left-[5%] w-48 h-48 bg-macaron-mint/20 rotate-45"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-[15%] w-32 h-32 bg-macaron-rose/30 rounded-2xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-[25%] w-24 h-24 border-4 border-macaron-peach/50"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        {/* Header with logo */}
        <div className="mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-foreground/5 border-2 border-foreground/10 rounded-full">
            <FileText className="w-5 h-5 text-secondary-foreground" />
            <span className="font-jetbrains text-sm font-bold tracking-tight">VIBED</span>
          </div>
        </div>

        {/* Main content - Asymmetric layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Hero content */}
          <div className="space-y-12">
            {/* Hero headline */}
            <div className="space-y-6 animate-slide-in-left">
              <h1 className="font-syne text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-tight">
                <span className="block text-foreground">Build</span>
                <span className="block text-foreground">PRDs</span>
                <span className="block relative inline-block">
                  <span className="relative z-10">Faster</span>
                  <span className="absolute bottom-2 left-0 w-full h-6 bg-macaron-lavender/50 -rotate-1" aria-hidden="true" />
                </span>
              </h1>

              <p className="font-manrope text-xl lg:text-2xl text-muted-foreground max-w-xl leading-relaxed [animation-delay:0.2s] animate-slide-in-left">
                Stop writing Product Requirements Documents from scratch.
                <span className="text-foreground font-semibold"> Let AI do the heavy lifting.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 [animation-delay:0.4s] animate-slide-in-left">
              <SignUpButton mode="modal">
                <button className="group px-8 py-5 bg-foreground text-background rounded-none font-syne font-bold text-lg border-4 border-foreground transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[-8px_8px_0px_0px_rgba(212,189,252,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                  <span className="flex items-center justify-center gap-2">
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </SignUpButton>

              <SignInButton mode="modal">
                <button className="px-8 py-5 bg-transparent text-foreground rounded-none font-syne font-bold text-lg border-4 border-foreground transition-all duration-200 hover:bg-foreground hover:text-background">
                  Sign In
                </button>
              </SignInButton>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t-4 border-foreground/10 [animation-delay:0.6s] animate-slide-in-left">
              <div>
                <div className="font-syne text-4xl font-bold text-foreground">15min</div>
                <div className="font-manrope text-sm text-muted-foreground mt-1">Average time to PRD</div>
              </div>
              <div className="w-px h-12 bg-foreground/20" aria-hidden="true" />
              <div>
                <div className="font-syne text-4xl font-bold text-foreground">AI</div>
                <div className="font-manrope text-sm text-muted-foreground mt-1">Powered by Claude</div>
              </div>
              <div className="w-px h-12 bg-foreground/20" aria-hidden="true" />
              <div>
                <div className="font-syne text-4xl font-bold text-foreground">Pro</div>
                <div className="font-manrope text-sm text-muted-foreground mt-1">Export ready</div>
              </div>
            </div>
          </div>

          {/* Right column - Feature cards */}
          <div className="space-y-6 [animation-delay:0.3s] animate-slide-in-right lg:mt-24">
            {/* Feature card 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-macaron-mint translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-macaron-mint">
                    <Wand2 className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-syne text-2xl font-bold text-foreground mb-2">AI Interview</h3>
                    <p className="font-manrope text-muted-foreground leading-relaxed">
                      Chat with Claude about your product idea. It asks the right questions and extracts key details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature card 2 */}
            <div className="relative group [animation-delay:0.5s] animate-slide-in-right">
              <div className="absolute inset-0 bg-macaron-lavender translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-macaron-lavender">
                    <Layers className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-syne text-2xl font-bold text-foreground mb-2">Tech Stack Research</h3>
                    <p className="font-manrope text-muted-foreground leading-relaxed">
                      AI-powered research finds the best technologies for your product with validation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature card 3 */}
            <div className="relative group [animation-delay:0.7s] animate-slide-in-right">
              <div className="absolute inset-0 bg-macaron-peach translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-macaron-peach">
                    <Box className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-syne text-2xl font-bold text-foreground mb-2">Complete PRD</h3>
                    <p className="font-manrope text-muted-foreground leading-relaxed">
                      Export professional, comprehensive PRDs as JSON or PDF. Ready for your team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process flow - Bottom section */}
        <div className="mt-32 [animation-delay:0.8s] animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="font-syne text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="font-manrope text-xl text-muted-foreground">
              From idea to PRD in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-macaron-mint translate-y-2 transition-transform group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-6 h-full">
                <div className="font-jetbrains text-6xl font-bold text-macaron-mint mb-4">
                  01
                </div>
                <h3 className="font-syne text-xl font-bold text-foreground mb-2">
                  Chat
                </h3>
                <p className="font-manrope text-muted-foreground text-sm">
                  Describe your product idea
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-macaron-lavender translate-y-2 transition-transform group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-6 h-full">
                <div className="font-jetbrains text-6xl font-bold text-macaron-lavender mb-4">
                  02
                </div>
                <h3 className="font-syne text-xl font-bold text-foreground mb-2">
                  Answer
                </h3>
                <p className="font-manrope text-muted-foreground text-sm">
                  Clarify with AI questions
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-macaron-rose translate-y-2 transition-transform group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-6 h-full">
                <div className="font-jetbrains text-6xl font-bold text-macaron-rose mb-4">
                  03
                </div>
                <h3 className="font-syne text-xl font-bold text-foreground mb-2">
                  Research
                </h3>
                <p className="font-manrope text-muted-foreground text-sm">
                  Select tech stack
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-macaron-peach translate-y-2 transition-transform group-hover:translate-y-3" aria-hidden="true" />
              <div className="relative bg-background border-4 border-foreground p-6 h-full">
                <div className="font-jetbrains text-6xl font-bold text-macaron-peach mb-4">
                  04
                </div>
                <h3 className="font-syne text-xl font-bold text-foreground mb-2">
                  Export
                </h3>
                <p className="font-manrope text-muted-foreground text-sm">
                  Get your PRD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
