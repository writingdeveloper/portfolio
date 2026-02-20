'use client'

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialTheme() {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    return false
  }
  return true
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
