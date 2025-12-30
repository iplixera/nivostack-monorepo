'use client'

import React, { memo } from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Base Skeleton component for loading states
 */
export const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return ''
      case 'rounded':
        return 'rounded-lg'
      case 'text':
      default:
        return 'rounded'
    }
  }

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-shimmer'
      case 'none':
        return ''
      case 'pulse':
      default:
        return 'animate-pulse'
    }
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`bg-gray-700 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  )
})

/**
 * Skeleton for a single line of text
 */
export const SkeletonText = memo(function SkeletonText({
  lines = 1,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
})

/**
 * Skeleton for avatar/profile image
 */
export const SkeletonAvatar = memo(function SkeletonAvatar({
  size = 40,
  className = ''
}: {
  size?: number
  className?: string
}) {
  return <Skeleton variant="circular" width={size} height={size} className={className} />
})

/**
 * Skeleton card for device/session list items
 */
export const SkeletonCard = memo(function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton variant="rounded" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-5 w-1/3" />
          <Skeleton variant="text" className="h-4 w-2/3" />
          <div className="flex gap-2 mt-2">
            <Skeleton variant="rounded" width={60} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
})

/**
 * Skeleton for stats cards
 */
export const SkeletonStats = memo(function SkeletonStats({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4">
          <Skeleton variant="text" className="h-4 w-20 mb-2" />
          <Skeleton variant="text" className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
})

/**
 * Skeleton for table rows
 */
export const SkeletonTable = memo(function SkeletonTable({
  rows = 5,
  columns = 4,
  className = ''
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-gray-800 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3 bg-gray-900 rounded">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
})

/**
 * Skeleton for device list
 */
export const SkeletonDeviceList = memo(function SkeletonDeviceList({
  count = 6,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
})

/**
 * Skeleton for session list
 */
export const SkeletonSessionList = memo(function SkeletonSessionList({
  count = 5,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" width={32} height={32} />
              <div className="space-y-1">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="text" className="h-4 w-16" />
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton variant="rounded" width={24} height={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

/**
 * Skeleton for log entries
 */
export const SkeletonLogList = memo(function SkeletonLogList({
  count = 10,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded p-3 flex items-start gap-3">
          <Skeleton variant="rounded" width={48} height={20} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-3 w-1/4" />
          </div>
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
})

/**
 * Skeleton for API trace entries
 */
export const SkeletonTraceList = memo(function SkeletonTraceList({
  count = 10,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" width={48} height={24} />
              <Skeleton variant="rounded" width={40} height={20} />
              <Skeleton variant="text" className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="text" className="h-4 w-16" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Skeleton variant="rounded" width={80} height={20} />
            <Skeleton variant="rounded" width={100} height={20} />
          </div>
        </div>
      ))}
    </div>
  )
})

/**
 * Skeleton for crash entries
 */
export const SkeletonCrashList = memo(function SkeletonCrashList({
  count = 5,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-lg p-4 border border-red-900/50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
              <div className="flex gap-2">
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="text" className="h-4 w-32" />
              </div>
            </div>
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
          <Skeleton variant="rounded" className="h-32 w-full mt-3" />
        </div>
      ))}
    </div>
  )
})

/**
 * Full page loading skeleton
 */
export const SkeletonPage = memo(function SkeletonPage({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
        <Skeleton variant="rounded" width={120} height={40} />
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton variant="rounded" width={200} height={40} />
          <Skeleton variant="rounded" width={120} height={40} />
        </div>
        <SkeletonDeviceList />
      </div>
    </div>
  )
})

export default Skeleton
