'use client'

import React, { memo, ReactNode } from 'react'
import { ChipButton } from './Chip'

interface SegmentItem {
  label: string
  count: number
  value: string
}

interface SegmentationBoxProps {
  title: string
  items: SegmentItem[]
  selectedValue?: string
  onSelect?: (value: string) => void
  onViewAll?: () => void
  maxItems?: number
  className?: string
}

interface SegmentationGridProps {
  children: ReactNode
  className?: string
}

/**
 * SegmentationBox component for displaying clickable segmentation chips
 * Used for Platform, Environment, OS versions, App versions breakdowns
 */
export const SegmentationBox = memo(function SegmentationBox({
  title,
  items,
  selectedValue,
  onSelect,
  onViewAll,
  maxItems = 4,
  className = ''
}: SegmentationBoxProps) {
  const displayedItems = maxItems ? items.slice(0, maxItems) : items
  const hasMore = items.length > maxItems

  return (
    <div
      className={`
        p-3 rounded-xl
        border border-gray-200 dark:border-white/10
        bg-gray-50 dark:bg-white/[0.02]
        ${className}
      `}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">{title}</span>
        {(onViewAll || hasMore) && (
          <button
            onClick={onViewAll}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            View all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {displayedItems.map((item) => (
          <ChipButton
            key={item.value}
            count={item.count}
            active={selectedValue === item.value}
            onClick={() => onSelect?.(item.value)}
          >
            {item.label}
          </ChipButton>
        ))}
      </div>
    </div>
  )
})

/**
 * SegmentationGrid - 2-column grid layout for segmentation boxes
 */
export const SegmentationGrid = memo(function SegmentationGrid({
  children,
  className = ''
}: SegmentationGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {children}
    </div>
  )
})

export default SegmentationBox
