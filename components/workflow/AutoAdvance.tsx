'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Pause } from 'lucide-react'

interface AutoAdvanceProps {
  enabled: boolean
  delaySeconds?: number
  nextStepName: string
  onAdvance: () => void
  onCancel?: () => void
}

export function AutoAdvance({
  enabled,
  delaySeconds = 5,
  nextStepName,
  onAdvance,
  onCancel,
}: AutoAdvanceProps) {
  const [countdown, setCountdown] = useState(delaySeconds)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!enabled || isPaused) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      // Countdown finished, advance
      onAdvance()
    }
  }, [enabled, countdown, isPaused, onAdvance])

  const handlePause = () => {
    setIsPaused(true)
    onCancel?.()
  }

  if (!enabled || isPaused) return null

  const progressPercent = ((delaySeconds - countdown) / delaySeconds) * 100

  return (
    <Card className="fixed bottom-8 right-8 p-6 max-w-sm shadow-xl border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 dark:border-blue-800 z-50">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Proceeding to {nextStepName}</p>
            <p className="text-sm text-muted-foreground">in {countdown} seconds</p>
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          className="w-full"
        >
          <Pause className="w-4 h-4 mr-2" />
          Stay on this page
        </Button>
      </div>
    </Card>
  )
}
