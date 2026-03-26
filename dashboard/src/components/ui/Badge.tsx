'use client'

import React, { memo, ReactNode } from 'react'

type BadgeVariant = 'default' | 'ok' | 'warn' | 'error'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    border-gray-200 dark:border-white/10
    bg-gray-50 dark:bg-white/[0.02]
    text-gray-500 dark:text-gray-400
  `,
  ok: `
    border-emerald-200 dark:border-emerald-400/35
    bg-emerald-50 dark:bg-emerald-400/[0.08]
    text-emerald-600 dark:text-emerald-400
  `,
  warn: `
    border-amber-200 dark:border-amber-400/35
    bg-amber-50 dark:bg-amber-400/[0.08]
    text-amber-600 dark:text-amber-400
  `,
  error: `
    border-red-200 dark:border-red-400/35
    bg-red-50 dark:bg-red-400/[0.08]
    text-red-600 dark:text-red-400
  `
}

/**
 * Badge component for status indicators and labels
 */
export const Badge = memo(function Badge({
  children,
  variant = 'default',
  className = ''
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        text-xs font-medium
        px-2 py-1
        rounded-full
        border
        whitespace-nowrap
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
})

export default Badge
