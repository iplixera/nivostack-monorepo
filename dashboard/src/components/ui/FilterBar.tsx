'use client'

import React, { memo, ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
}

interface FilterInputProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  width?: string
  className?: string
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

interface FilterButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary'
  className?: string
}

/**
 * FilterBar container for compact horizontal filters
 */
export const FilterBar = memo(function FilterBar({
  children,
  className = ''
}: FilterBarProps) {
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
      {children}
    </div>
  )
})

/**
 * Filter input for search fields
 */
export const FilterInput = memo(function FilterInput({
  label,
  placeholder,
  value,
  onChange,
  width = '240px',
  className = ''
}: FilterInputProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1.5
        rounded-lg
        border border-gray-200 dark:border-white/10
        bg-white dark:bg-white/[0.02]
        text-xs text-gray-500 dark:text-gray-400
        ${className}
      `}
    >
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width }}
        className="
          border-0 outline-none
          bg-transparent
          text-gray-900 dark:text-white
          text-xs
          placeholder:text-gray-400 dark:placeholder:text-gray-500
        "
      />
    </div>
  )
})

/**
 * Filter select dropdown
 */
export const FilterSelect = memo(function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = ''
}: FilterSelectProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1.5
        rounded-lg
        border border-gray-200 dark:border-white/10
        bg-white dark:bg-white/[0.02]
        text-xs text-gray-500 dark:text-gray-400
        ${className}
      `}
    >
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          border-0 outline-none
          bg-transparent
          text-gray-900 dark:text-white
          text-xs
          cursor-pointer
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
})

/**
 * Filter button for actions (More filters, Clear, Export)
 */
export const FilterButton = memo(function FilterButton({
  children,
  onClick,
  variant = 'default',
  className = ''
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1.5
        rounded-lg
        text-xs font-medium
        border
        cursor-pointer
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

export default FilterBar
