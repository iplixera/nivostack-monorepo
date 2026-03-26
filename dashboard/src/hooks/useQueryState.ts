'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

/**
 * useQueryState - URL-driven filter state hook (v5)
 *
 * Features:
 * - Read/write URL query params
 * - Type-safe with defaults
 * - Debounced updates (optional)
 * - Preserves other params when updating
 *
 * Usage:
 * const [env, setEnv] = useQueryState('env', 'production')
 * const [range, setRange] = useQueryState('range', '24h')
 */

type QueryValue = string | null

export function useQueryState(
  key: string,
  defaultValue: string = ''
): [string, (value: string) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const value = searchParams.get(key) ?? defaultValue

  const setValue = useCallback((newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newValue === '' || newValue === defaultValue) {
      params.delete(key)
    } else {
      params.set(key, newValue)
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }, [key, defaultValue, searchParams, pathname, router])

  return [value, setValue]
}

/**
 * useQueryStateNumber - For numeric URL params
 */
export function useQueryStateNumber(
  key: string,
  defaultValue: number = 0
): [number, (value: number) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const rawValue = searchParams.get(key)
  const value = rawValue !== null ? parseInt(rawValue, 10) : defaultValue

  const setValue = useCallback((newValue: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newValue === defaultValue) {
      params.delete(key)
    } else {
      params.set(key, newValue.toString())
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }, [key, defaultValue, searchParams, pathname, router])

  return [value, setValue]
}

/**
 * useQueryStateBoolean - For boolean URL params (0/1)
 */
export function useQueryStateBoolean(
  key: string,
  defaultValue: boolean = false
): [boolean, (value: boolean) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const rawValue = searchParams.get(key)
  const value = rawValue !== null ? rawValue === '1' : defaultValue

  const setValue = useCallback((newValue: boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newValue === defaultValue) {
      params.delete(key)
    } else {
      params.set(key, newValue ? '1' : '0')
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }, [key, defaultValue, searchParams, pathname, router])

  return [value, setValue]
}

/**
 * useQueryParams - Read multiple params at once
 */
export function useQueryParams<T extends Record<string, string>>(
  defaults: T
): T {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key)
      if (value !== null) {
        result[key as keyof T] = value as T[keyof T]
      }
    }
    return result
  }, [searchParams, defaults])
}

/**
 * useSetQueryParams - Set multiple params at once
 */
export function useSetQueryParams(): (updates: Record<string, string | null>) => void {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  return useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }, [searchParams, pathname, router])
}

/**
 * buildFilterQuery - Build API query string from URL params
 */
export function buildFilterQuery(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  }

  return query.toString()
}

/**
 * Time range helpers
 */
export const TIME_RANGES = {
  '15m': { label: '15m', minutes: 15 },
  '1h': { label: '1h', minutes: 60 },
  '24h': { label: '24h', minutes: 1440 },
  '7d': { label: '7d', minutes: 10080 },
  '30d': { label: '30d', minutes: 43200 },
} as const

export type TimeRange = keyof typeof TIME_RANGES

export function getTimeRangeFromTo(range: TimeRange): { from: string; to: string } {
  const now = new Date()
  const minutes = TIME_RANGES[range].minutes
  const from = new Date(now.getTime() - minutes * 60 * 1000)

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}
