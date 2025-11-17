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

export function DefaultStackPreview({ stack, productType }: DefaultStackPreviewProps) {
  return (
    <Card className="p-6 border-green-200 bg-green-50">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="w-5 h-5" />
        <h3 className="font-semibold">Recommended Stack Selected</h3>
      </div>

      {productType && (
        <p className="text-sm text-muted-foreground mb-4">
          Optimized for {productType.replaceAll('_', ' ')} applications
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Frontend</span>
          <Badge>{stack.frontend}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Backend</span>
          <Badge>{stack.backend}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Database</span>
          <Badge>{stack.database}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md">
          <span className="text-sm font-medium">Auth</span>
          <Badge>{stack.auth}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-md col-span-2">
          <span className="text-sm font-medium">Hosting</span>
          <Badge>{stack.hosting}</Badge>
        </div>
      </div>
    </Card>
  )
}
