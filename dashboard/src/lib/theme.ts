'use client'

/**
 * Theme management utilities
 * Handles theme switching and persistence
 */

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'nivostack_theme'

/**
 * Get current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  return stored || 'system'
}

/**
 * Set theme and persist to localStorage
 */
export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  
  const html = document.documentElement
  
  if (theme === 'system') {
    // Remove data-theme to let CSS media queries handle it
    html.removeAttribute('data-theme')
    // But set it to 'system' so we can track it
    html.setAttribute('data-theme', 'system')
  } else {
    html.setAttribute('data-theme', theme)
  }
}

/**
 * Initialize theme on mount
 */
export function initTheme() {
  if (typeof window === 'undefined') return
  
  const theme = getTheme()
  applyTheme(theme)
}

/**
 * Get effective theme (resolves 'system' to actual light/dark)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  
  const theme = getTheme()
  
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  return theme
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  if (typeof window === 'undefined') return
  
  const current = getEffectiveTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
}

