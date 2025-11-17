"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, MessageSquare, Search, FileText } from "lucide-react";

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
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-grid-subtle opacity-40" aria-hidden="true" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display text-xl font-semibold">VIBED</span>
              </div>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">AI-Powered PRD Generation</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground [animation-delay:100ms] animate-fade-in-up">
              Build Product Requirements Documents in Minutes
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed [animation-delay:200ms] animate-fade-in-up">
              Stop spending hours writing PRDs from scratch. Let AI interview you, research tech stacks, and generate professional documentation.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 [animation-delay:300ms] animate-fade-in-up">
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                  Start Building Free
                </button>
              </SignUpButton>
              <a
                href="#how-it-works"
                className="px-8 py-4 border border-border rounded-lg font-semibold text-base hover:bg-muted/50 transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-12 pt-12 [animation-delay:400ms] animate-fade-in">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">15min</div>
                <div className="text-sm text-muted-foreground mt-1">Average Time</div>
              </div>
              <div className="w-px h-12 bg-border" aria-hidden="true" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">Claude AI</div>
                <div className="text-sm text-muted-foreground mt-1">Powered By</div>
              </div>
              <div className="w-px h-12 bg-border" aria-hidden="true" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">PDF Export</div>
                <div className="text-sm text-muted-foreground mt-1">Ready to Use</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t border-border/50">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="space-y-4 [animation-delay:100ms] animate-fade-in-up">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                AI Interview
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Conversational AI asks the right questions to extract every detail about your product vision, features, and requirements.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 [animation-delay:200ms] animate-fade-in-up">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Tech Research
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered research identifies and validates the best technologies, frameworks, and tools for your specific product needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 [animation-delay:300ms] animate-fade-in-up">
              <div className="w-12 h-12 rounded-lg bg-warm-terracotta/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warm-terracotta" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Export PRD
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate comprehensive, professional PRD documents in seconds. Export as JSON or PDF, ready for your team.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t border-border/50">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From idea to professional PRD in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="space-y-4 [animation-delay:100ms] animate-fade-in-up">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <span className="font-mono text-2xl font-semibold text-foreground">01</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Describe Your Idea
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Share your product vision in a natural conversation with Claude AI.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 [animation-delay:200ms] animate-fade-in-up">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <span className="font-mono text-2xl font-semibold text-foreground">02</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Answer Questions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                AI asks clarifying questions to capture all the essential details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 [animation-delay:300ms] animate-fade-in-up">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <span className="font-mono text-2xl font-semibold text-foreground">03</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Select Tech Stack
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Review AI-researched technologies and choose what fits best.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 [animation-delay:400ms] animate-fade-in-up">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <span className="font-mono text-2xl font-semibold text-foreground">04</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Export Your PRD
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Download a complete, professional PRD ready for your team.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t border-border/50">
          <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
              Ready to Build Your PRD?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join product teams using VIBED to ship faster with better documentation.
            </p>
            <SignUpButton mode="modal">
              <button className="px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-primary" />
                </div>
                <span className="font-display text-sm font-semibold text-muted-foreground">VIBED</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 VIBED. AI-Powered PRD Generation.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
