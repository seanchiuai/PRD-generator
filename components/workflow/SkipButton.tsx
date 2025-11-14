"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
  confirmMessage?: string
  confirmTitle?: string
  buttonText?: string
  variant?: "default" | "outline" | "ghost"
}

export function SkipButton({
  onSkip,
  loading = false,
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

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleSkipClick}
          disabled={loading}
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
