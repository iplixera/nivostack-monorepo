'use client'

import React, { memo, ReactNode } from 'react'

/**
 * v6: Page density modes for content width control
 * - narrow: settings forms (900-1100px)
 * - normal: mixed content, cards (1100-1300px)
 * - wide: tables, dashboards, monitoring (1400-1600px)
 * - fluid: full width with max cap
 */
export type PageDensity = 'narrow' | 'normal' | 'wide' | 'fluid'

interface PageContainerProps {
  children: ReactNode
  density?: PageDensity
  className?: string
  /** Remove default padding */
  noPadding?: boolean
}

const densityClasses: Record<PageDensity, string> = {
  narrow: 'max-w-4xl', // ~896px
  normal: 'max-w-6xl', // ~1152px
  wide: 'max-w-[1600px]', // 1600px
  fluid: 'max-w-full',
}

/**
 * PageContainer - v6 density-aware content wrapper
 *
 * Usage:
 * <PageContainer density="wide">
 *   <DashboardContent />
 * </PageContainer>
 */
export const PageContainer = memo(function PageContainer({
  children,
  density = 'normal',
  className = '',
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={`
        w-full mx-auto
        ${densityClasses[density]}
        ${noPadding ? '' : 'px-4 sm:px-5 py-4'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  )
})

export default PageContainer
