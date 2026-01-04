'use client'

import React, { ReactNode, memo, useMemo } from 'react'
import { Pagination } from './Pagination'

export interface Column<T> {
  key: string
  label: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'right' | 'center'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  footerNote?: string
  className?: string
}

function DataTableComponent<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  pagination,
  footerNote,
  className = '',
}: DataTableProps<T>) {
  // Memoize row click handler to prevent recreation
  const handleRowClick = React.useCallback((item: T) => {
    onRowClick?.(item)
  }, [onRowClick])

  // Memoize pagination handler
  const handlePageChange = React.useCallback((page: number) => {
    pagination?.onPageChange(page)
  }, [pagination])

  // Memoize row mouse handlers
  const handleMouseEnter = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    if (onRowClick) {
      e.currentTarget.style.background = 'var(--s2)'
    }
  }, [onRowClick])

  const handleMouseLeave = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    if (onRowClick) {
      e.currentTarget.style.background = 'transparent'
    }
  }, [onRowClick])
  return (
    <div className={`card ${className}`} style={{ marginTop: '14px' }}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                {column.label}
                {column.sortable && (
                  <span style={{ marginLeft: '4px', color: 'var(--m)', fontSize: '10px' }}>
                    ↕
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center', color: 'var(--m)' }}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center', color: 'var(--m)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => handleRowClick(item)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      textAlign: column.align || 'left',
                    }}
                  >
                    {column.render ? column.render(item, index) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {footerNote && (
        <div className="footerNote" style={{ marginTop: '12px', padding: '0 12px 12px' }}>
          {footerNote}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: '18px', padding: '0 12px 12px' }}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

// Memoize DataTable to prevent unnecessary re-renders
export default memo(DataTableComponent) as typeof DataTableComponent

