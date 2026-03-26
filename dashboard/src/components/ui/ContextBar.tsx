'use client'

import React, { memo, ReactNode } from 'react'
import { Chip } from './Chip'
import { ModeToggle } from './ModeToggle'

type Mode = 'aggregated' | 'raw'

interface ContextBarProps {
  project?: string
  environment?: string
  timeRange?: string
  segment?: string
  mode: Mode
  onModeChange: (mode: Mode) => void
  extraChips?: ReactNode
  className?: string
}

/**
 * ContextBar component for displaying current context (project, env, time range)
 * and the mode toggle (Aggregated vs Raw)
 */
export const ContextBar = memo(function ContextBar({
  project,
  environment,
  timeRange = 'Last 24h',
  segment,
  mode,
  onModeChange,
  extraChips,
  className = ''
}: ContextBarProps) {
  return (
    <div
      className={`
        flex flex-wrap items-center gap-2
        px-2.5 py-2
        rounded-xl
        border border-gray-200 dark:border-white/10
        bg-gray-50 dark:bg-white/[0.02]
        ${className}
      `}
    >
      {project && <Chip label="Project" value={project} />}
      {environment && <Chip label="Environment" value={environment} />}
      <Chip label="Time range" value={timeRange} />
      {segment && <Chip label="Segment" value={segment} />}
      {extraChips}

      <div className="ml-auto">
        <ModeToggle
          mode={mode}
          onChange={onModeChange}
        />
      </div>
    </div>
  )
})

export default ContextBar
