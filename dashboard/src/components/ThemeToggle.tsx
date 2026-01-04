'use client'

import { useState, useEffect } from 'react'
import { getTheme, toggleTheme, initTheme, type Theme } from '@/lib/theme'

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initTheme()
    setCurrentTheme(getTheme())
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (getTheme() === 'system') {
        setCurrentTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleToggle = () => {
    toggleTheme()
    setCurrentTheme(getTheme())
  }

  if (!mounted) {
    return (
      <button className="btn secondary" disabled>
        Light/Dark
      </button>
    )
  }

  return (
    <button className="btn secondary" onClick={handleToggle}>
      Light/Dark
    </button>
  )
}

