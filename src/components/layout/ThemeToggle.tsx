'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Moon } from 'lucide-react'

const THEME_CHANGE_EVENT = 'theme-change'

function getThemeSnapshot() {
  return localStorage.getItem('theme') !== 'light'
}

function getServerSnapshot() {
  return true
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(THEME_CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(THEME_CHANGE_EVENT, callback)
  }
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot)
  const ta = useTranslations('accessibility')

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
      aria-label={ta('toggleTheme')}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
