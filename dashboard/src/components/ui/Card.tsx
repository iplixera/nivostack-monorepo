'use client'

import React, { memo, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  span?: number // Grid column span (1-12)
}

interface CardHeaderProps {
  title: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

interface CardBodyProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

/**
 * Card component following NivoStack design system
 * Use with CardHeader and CardBody for consistent structure
 */
export const Card = memo(function Card({ children, className = '', span }: CardProps) {
  const spanClass = span ? `col-span-${span}` : ''

  return (
    <div
      className={`
        border rounded-xl overflow-hidden
        border-gray-200 dark:border-white/10
        bg-white dark:bg-white/[0.02]
        shadow-sm dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
        ${spanClass}
        ${className}
      `}
      style={span ? { gridColumn: `span ${span}` } : undefined}
    >
      {children}
    </div>
  )
})

/**
 * Card header with title, optional badge, and optional actions
 */
export const CardHeader = memo(function CardHeader({
  title,
  badge,
  actions,
  className = ''
}: CardHeaderProps) {
  return (
    <div
      className={`
        px-3.5 py-2.5
        flex justify-between items-center
        border-b border-gray-200 dark:border-white/10
        bg-gradient-to-b from-gray-50 dark:from-white/[0.03] to-transparent
        ${className}
      `}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="flex items-center gap-2">
        {badge}
        {actions}
      </div>
    </div>
  )
})

/**
 * Card body with consistent padding
 */
export const CardBody = memo(function CardBody({
  children,
  className = '',
  noPadding = false
}: CardBodyProps) {
  return (
    <div className={`${noPadding ? '' : 'px-3.5 py-3'} ${className}`}>
      {children}
    </div>
  )
})

export default Card
