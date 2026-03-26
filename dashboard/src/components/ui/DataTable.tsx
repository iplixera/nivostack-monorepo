'use client'

import React, { memo, ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  width?: string
  render?: (row: T) => ReactNode
  className?: string
  mono?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  maxHeight?: string
  className?: string
}

interface TableActionsProps {
  children: ReactNode
  className?: string
}

/**
 * DataTable component with proper styling for raw data views
 * Follows NivoStack design system with themed borders and backgrounds
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  maxHeight = '520px',
  className = ''
}: DataTableProps<T>) {
  return (
    <div
      className={`overflow-auto rounded-xl ${className}`}
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="
                  sticky top-0
                  px-3 py-2.5
                  text-left text-xs font-medium
                  text-gray-500 dark:text-gray-400
                  bg-gray-100 dark:bg-white/[0.02]
                  border-b border-gray-200 dark:border-white/10
                "
                style={col.width ? { minWidth: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-gray-100 dark:border-white/[0.05]
                  ${onRowClick ? 'cursor-pointer' : ''}
                  hover:bg-gray-50 dark:hover:bg-white/[0.03]
                  transition-colors
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`
                      px-3 py-2.5 text-xs
                      text-gray-900 dark:text-white
                      ${col.mono ? 'font-mono' : ''}
                      ${col.className || ''}
                    `}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * TableActions container for action buttons in table cells
 */
export const TableActions = memo(function TableActions({
  children,
  className = ''
}: TableActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
})

/**
 * TableActionButton for table row actions
 */
export const TableActionButton = memo(function TableActionButton({
  children,
  onClick,
  variant = 'default',
  className = ''
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary'
  className?: string
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={`
        px-2 py-1.5
        rounded-lg
        text-xs font-medium
        border
        transition-colors
        ${variant === 'primary'
          ? 'border-blue-300 dark:border-blue-500/35 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
})

/**
 * DebugSwitch indicator for device debug status
 */
export const DebugSwitch = memo(function DebugSwitch({
  enabled,
  onClick,
  className = ''
}: {
  enabled: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={`
        inline-flex items-center gap-2
        px-2 py-1.5
        rounded-full
        border border-gray-200 dark:border-white/10
        bg-gray-50 dark:bg-white/[0.02]
        text-xs
        transition-colors
        ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05]' : ''}
        ${className}
      `}
    >
      <span
        className={`
          w-2.5 h-2.5 rounded-full
          ${enabled
            ? 'bg-emerald-500 dark:bg-emerald-400'
            : 'bg-gray-300 dark:bg-white/20'
          }
        `}
      />
      <span className={enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  )
})

export default DataTable
