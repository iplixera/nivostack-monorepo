'use client'

import React, { memo, ReactNode } from 'react'
import { Badge } from './Badge'

interface PageHeaderProps {
  title: string
  description?: string
  hint?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * PageHeader component for consistent page titles
 * Includes title, description, hint badges, and action buttons
 */
export const PageHeader = memo(function PageHeader({
  title,
  description,
  hint,
  actions,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`flex justify-between items-start gap-4 ${className}`}>
      <div className="flex-1">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
        {hint && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {hint}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  )
})

export default PageHeader
