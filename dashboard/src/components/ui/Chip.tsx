'use client'

import React, { memo, ReactNode } from 'react'

interface ChipProps {
  label: string
  value: ReactNode
  className?: string
}

interface ChipButtonProps {
  children: ReactNode
  count?: number | string
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Chip component for displaying label-value pairs in filter bars
 */
export const Chip = memo(function Chip({
  label,
  value,
  className = ''
}: ChipProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1.5
        rounded-lg
        border border-gray-200 dark:border-white/10
        bg-gray-50 dark:bg-white/[0.02]
        text-xs text-gray-500 dark:text-gray-400
        ${className}
      `}
    >
      {label}
      <strong className="text-gray-900 dark:text-white font-semibold">
        {value}
      </strong>
    </div>
  )
})

/**
 * ChipButton component for clickable segmentation chips
 */
export const ChipButton = memo(function ChipButton({
  children,
  count,
  active = false,
  onClick,
  className = ''
}: ChipButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1.5
        rounded-full
        border
        text-xs
        cursor-pointer
        transition-colors
        ${active
          ? 'border-blue-300 dark:border-blue-500/35 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
          : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05]'
        }
        ${className}
      `}
    >
      {children}
      {count !== undefined && (
        <span className="text-gray-400 dark:text-gray-500 tabular-nums ml-1">
          {typeof count === 'number' ? count.toLocaleString() : count}
        </span>
      )}
    </button>
  )
})

export default Chip
