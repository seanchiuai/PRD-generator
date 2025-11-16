"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface SkipButtonProps {
  onSkip: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
  disabledMessage?: string
  confirmMessage?: string
  confirmTitle?: string
  buttonText?: string
  variant?: "default" | "outline" | "ghost"
}

export function SkipButton({
  onSkip,
  loading = false,
  disabled = false,
  disabledMessage,
  confirmMessage,
  confirmTitle,
  buttonText = "Skip this step",
  variant = "outline",
}: SkipButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleSkipClick = () => {
    if (confirmMessage) {
      setShowConfirmDialog(true)
    } else {
      handleConfirmedSkip()
    }
  }

  const handleConfirmedSkip = async () => {
    setShowConfirmDialog(false)
    await onSkip()
  }

  const buttonContent = (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}>
      <Button
        onClick={handleSkipClick}
        disabled={loading || disabled}
        variant={variant}
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Skipping...</span>
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </motion.div>
  )

  return (
    <>
      {disabled && disabledMessage ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        buttonContent
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTitle || "Skip this step?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage || "Are you sure you want to skip this step?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSkip}>
              Skip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
