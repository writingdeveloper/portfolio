'use client'

import { useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Moon } from 'lucide-react'

function getThemeSnapshot() {
  return localStorage.getItem('theme') !== 'light'
}

function getServerSnapshot() {
  return true
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot)
  const [, forceRender] = useState(0)
  const ta = useTranslations('accessibility')

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    forceRender((c) => c + 1)
  }

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors"
      aria-label={ta('toggleTheme')}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
