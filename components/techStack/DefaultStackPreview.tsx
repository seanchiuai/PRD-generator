'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface DefaultStackPreviewProps {
  stack: {
    frontend: string
    backend: string
    database: string
    auth: string
    hosting: string
  }
  productType?: string
}

type StackKey = keyof DefaultStackPreviewProps['stack']

interface StackItem {
  key: StackKey
  label: string
  fullWidth?: boolean
}

const stackItems: StackItem[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Database' },
  { key: 'auth', label: 'Auth' },
  { key: 'hosting', label: 'Hosting', fullWidth: true },
]

export function DefaultStackPreview({ stack, productType }: DefaultStackPreviewProps) {
  return (
    <Card className="p-6 border-green-200 bg-green-50">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="w-5 h-5" />
        <h3 className="font-semibold">Recommended Stack Selected</h3>
      </div>

      {productType && (
        <p className="text-sm text-muted-foreground mb-4">
          Optimized for {productType.replace(/_/g, ' ')} applications
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stackItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-3 bg-white rounded-md${
              item.fullWidth ? ' md:col-span-2' : ''
            }`}
          >
            <span className="text-sm font-medium">{item.label}</span>
            <Badge>{stack[item.key]}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
