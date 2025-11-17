"use client"

import { WorkflowProgress } from "./WorkflowProgress"
import { SkipButton } from "./SkipButton"
import { PageTransition } from "./PageTransition"
import { Button } from "@/components/ui/button"

export interface WorkflowLayoutProps {
  currentStep: string
  completedSteps: string[]
  conversationId: string
  children: React.ReactNode
  showSkipButton?: boolean
  onSkip?: () => void | Promise<void>
  skipButtonText?: string
  skipButtonLoading?: boolean
  skipButtonDisabled?: boolean
  skipButtonDisabledMessage?: string
  skipConfirmMessage?: string
  skipConfirmTitle?: string
  showFooter?: boolean
  onBack?: () => void
  onNext?: () => void
  nextButtonText?: string
  nextButtonDisabled?: boolean
  backButtonText?: string
}

export function WorkflowLayout({
  currentStep,
  completedSteps,
  conversationId,
  children,
  showSkipButton = false,
  onSkip,
  skipButtonText,
  skipButtonLoading = false,
  skipButtonDisabled = false,
  skipButtonDisabledMessage,
  skipConfirmMessage,
  skipConfirmTitle,
  showFooter = false,
  onBack,
  onNext,
  nextButtonText = "Next",
  nextButtonDisabled = false,
  backButtonText = "Back",
}: WorkflowLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed header with progress */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="relative">
          <WorkflowProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            conversationId={conversationId}
          />
          {showSkipButton && onSkip && (() => {
            const skipButtonProps = {
              onSkip,
              buttonText: skipButtonText,
              loading: skipButtonLoading,
              disabled: skipButtonDisabled,
              disabledMessage: skipButtonDisabledMessage,
              confirmMessage: skipConfirmMessage,
              confirmTitle: skipConfirmTitle,
            };

            return (
              <>
                <div className="absolute top-4 right-4 hidden md:block">
                  <SkipButton {...skipButtonProps} />
                </div>
                <div className="md:hidden px-4 pb-3 absolute top-4 right-4 md:relative md:top-0 md:right-0">
                  <SkipButton {...skipButtonProps} />
                </div>
              </>
            );
          })()}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <PageTransition>
          <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </PageTransition>
      </main>

      {/* Optional footer */}
      {showFooter && (
        <footer className="border-t bg-white dark:bg-gray-900 sticky bottom-0 z-40">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
              {onBack ? (
                <Button onClick={onBack} variant="outline">
                  {backButtonText}
                </Button>
              ) : (
                <div />
              )}
              {onNext && (
                <Button onClick={onNext} disabled={nextButtonDisabled}>
                  {nextButtonText}
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
