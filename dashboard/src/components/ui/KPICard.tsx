'use client'

import React, { memo, ReactNode } from 'react'
import { Card, CardHeader, CardBody } from './Card'
import { Badge } from './Badge'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    type: 'up' | 'down' | 'neutral'
  }
  badge?: string
  badgeVariant?: 'default' | 'ok' | 'warn' | 'error'
  hint?: string
  span?: number
  onClick?: () => void
  className?: string
}

/**
 * KPI Card component for displaying key metrics
 * Used in Dashboard and Devices pages for aggregated stats
 */
export const KPICard = memo(function KPICard({
  title,
  value,
  subtitle,
  trend,
  badge,
  badgeVariant = 'default',
  hint,
  span = 3,
  onClick,
  className = ''
}: KPICardProps) {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString()
    : value

  const trendColor = trend?.type === 'up'
    ? 'text-emerald-600 dark:text-emerald-400'
    : trend?.type === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-500 dark:text-gray-400'

  return (
    <Card
      span={span}
      className={`${onClick ? 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors' : ''} ${className}`}
    >
      <CardHeader
        title={title}
        badge={
          badge ? (
            <Badge variant={badgeVariant}>{badge}</Badge>
          ) : trend ? (
            <Badge variant={trend.type === 'up' ? 'ok' : trend.type === 'down' ? 'error' : 'default'}>
              {trend.type === 'up' ? '+' : trend.type === 'down' ? '' : ''}{trend.value}
            </Badge>
          ) : null
        }
      />
      <CardBody>
        <div className="flex justify-between items-baseline gap-2">
          <div
            className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            onClick={onClick}
          >
            {formattedValue}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>
        {hint && (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {hint}
          </div>
        )}
      </CardBody>
    </Card>
  )
})

export default KPICard
