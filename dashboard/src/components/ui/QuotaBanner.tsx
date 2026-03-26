'use client'

import React, { memo, useState, useEffect } from 'react'
import { Badge } from './Badge'

interface QuotaBannerProps {
  title: string
  used: number
  limit: number
  unit?: string
  onUpgrade?: () => void
  className?: string
  dismissKey?: string // Unique key for localStorage to remember dismissal
}

/**
 * QuotaBanner component for displaying usage warnings
 * v4: Compact, dismissible, proper warning/danger colors
 * Shows at 80% (amber warning) and escalates at 90% (red critical)
 */
export const QuotaBanner = memo(function QuotaBanner({
  title,
  used,
  limit,
  unit = 'devices',
  onUpgrade,
  className = '',
  dismissKey
}: QuotaBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const percentage = Math.round((used / limit) * 100)
  const isBlocked = percentage >= 100
  const isCritical = percentage >= 90
  const isWarning = percentage >= 80

  // Check localStorage for dismissal
  useEffect(() => {
    if (!dismissKey) return
    const dismissedAt = localStorage.getItem(`quota_dismissed_${dismissKey}`)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt)
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
      // Re-show if dismissed more than 3 days ago
      if (dismissedTime > threeDaysAgo) {
        setDismissed(true)
      }
    }
  }, [dismissKey])

  const handleDismiss = () => {
    if (dismissKey) {
      localStorage.setItem(`quota_dismissed_${dismissKey}`, Date.now().toString())
    }
    setDismissed(true)
  }

  // Don't show if under 80% or dismissed (unless blocked)
  if (!isWarning || (dismissed && !isBlocked)) return null

  // v4: Use amber when nearing limit, red only when blocked
  const bgColor = isBlocked
    ? 'bg-red-50 dark:bg-red-900/20'
    : isCritical
    ? 'bg-amber-50 dark:bg-amber-900/20'
    : 'bg-amber-50 dark:bg-amber-900/20'

  const borderColor = isBlocked
    ? 'border-red-200 dark:border-red-800/50'
    : 'border-amber-200 dark:border-amber-700/50'

  const textColor = isBlocked
    ? 'text-red-700 dark:text-red-400'
    : 'text-amber-700 dark:text-amber-400'

  const progressColor = isBlocked
    ? 'bg-red-500'
    : isCritical
    ? 'bg-amber-500'
    : 'bg-amber-400'

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} px-4 py-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Progress bar - compact */}
          <div className="w-32 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            <div
              className={`h-full ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Message - compact */}
          <span className={`text-sm ${textColor} truncate`}>
            {isBlocked
              ? `${title} limit reached — new ${unit} blocked`
              : isCritical
              ? `${title}: ${percentage}% of ${limit.toLocaleString()} ${unit} used`
              : `${title}: approaching limit (${percentage}%)`
            }
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </button>
          )}

          {/* Dismiss button - only if not blocked */}
          {!isBlocked && (
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default QuotaBanner
