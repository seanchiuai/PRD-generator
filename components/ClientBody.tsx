'use client'

import { useEffect, useRef } from 'react'

interface ClientBodyProps {
  className?: string
  children: React.ReactNode
  extensionAttributesToClean?: string[]
}

export default function ClientBody({
  className,
  children,
  extensionAttributesToClean = ['cz-shortcut-listen']
}: ClientBodyProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Apply the className to the actual body element after hydration
    if (className) {
      // Split and add each class individually to preserve existing classes
      className.split(' ').forEach(cls => {
        if (cls.trim()) {
          document.body.classList.add(cls.trim())
        }
      })
    }

    // Clean up any browser extension attributes that might cause hydration issues
    if (typeof document !== 'undefined' && document.body) {
      extensionAttributesToClean.forEach(attr => {
        if (document.body.hasAttribute(attr)) {
          document.body.removeAttribute(attr)
        }
      })
    }

    // Cleanup function to remove added classes
    return () => {
      if (className) {
        className.split(' ').forEach(cls => {
          if (cls.trim()) {
            document.body.classList.remove(cls.trim())
          }
        })
      }
    }
  }, [className, extensionAttributesToClean])

  // Return a div that will contain the app content
  // This avoids hydration issues with the body element
  return <div ref={bodyRef}>{children}</div>
}