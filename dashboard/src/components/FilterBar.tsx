'use client'

import React, { ReactNode, memo, useCallback } from 'react'

export interface FilterItem {
  type: 'search' | 'select' | 'button'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  label?: string
  className?: string
}

export interface FilterBarProps {
  filters: FilterItem[]
  stats?: Array<{ label: string; value: string | number; dot?: 'default' | 'warn' | 'bad' }>
  className?: string
}

function FilterBarComponent({ filters, stats, className = '' }: FilterBarProps) {
  // Memoize filter change handlers
  const handleFilterChange = useCallback((filter: FilterItem, value: string) => {
    filter.onChange?.(value)
  }, [])
  return (
    <div className={`card ${className}`} style={{ marginTop: '14px' }}>
      <div className="row">
        {filters.map((filter, index) => {
          if (filter.type === 'search') {
            return (
              <input
                key={index}
                className="input"
                placeholder={filter.placeholder}
                value={filter.value || ''}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
              />
            )
          }

          if (filter.type === 'select') {
            return (
              <select
                key={index}
                className="select"
                value={filter.value || ''}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
              >
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )
          }

          if (filter.type === 'button') {
            return (
              <button
                key={index}
                className={`btn ${filter.className || 'secondary'}`}
                onClick={() => handleFilterChange(filter, '')}
              >
                {filter.label || filter.placeholder}
              </button>
            )
          }

          return null
        })}
      </div>
      {stats && stats.length > 0 && (
        <div className="row" style={{ marginTop: '12px' }}>
          {stats.map((stat, index) => (
            <span key={index} className="chip">
              <span className={`dot ${stat.dot || 'default'}`} />
              {stat.label} {stat.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Memoize FilterBar to prevent unnecessary re-renders
export default memo(FilterBarComponent)

