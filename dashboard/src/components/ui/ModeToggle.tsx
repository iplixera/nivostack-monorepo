'use client'

import React, { memo } from 'react'

type Mode = 'aggregated' | 'raw'

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
  aggregatedLabel?: string
  rawLabel?: string
  className?: string
}

/**
 * Mode toggle component for switching between Aggregated (Overview) and Raw (Inspect) views
 * Critical pattern: Aggregated shows trends/charts, Raw shows individual records
 */
export const ModeToggle = memo(function ModeToggle({
  mode,
  onChange,
  aggregatedLabel = 'Overview (Aggregated)',
  rawLabel = 'Inspect (Raw)',
  className = ''
}: ModeToggleProps) {
  return (
    <div
      className={`
        inline-flex gap-1.5
        p-1
        rounded-xl
        border border-gray-200 dark:border-white/10
        bg-gray-50 dark:bg-white/[0.02]
        ${className}
      `}
      role="tablist"
      aria-label="View mode"
    >
      <button
        role="tab"
        aria-selected={mode === 'aggregated'}
        onClick={() => onChange('aggregated')}
        className={`
          px-3 py-1.5
          rounded-lg
          text-xs font-medium
          transition-colors
          ${mode === 'aggregated'
            ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
      >
        {aggregatedLabel}
      </button>
      <button
        role="tab"
        aria-selected={mode === 'raw'}
        onClick={() => onChange('raw')}
        className={`
          px-3 py-1.5
          rounded-lg
          text-xs font-medium
          transition-colors
          ${mode === 'raw'
            ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
      >
        {rawLabel}
      </button>
    </div>
  )
})

export default ModeToggle
