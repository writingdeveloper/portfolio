'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/blog', key: 'blog' },
  { href: '/projects', key: 'projects' },
  { href: '/about', key: 'about' },
  { href: '/play', key: 'play' },
] as const

export function Header() {
  const t = useTranslations('nav')
  const ta = useTranslations('accessibility')
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        closeMobile()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, closeMobile])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return
    const focusable = menuRef.current.querySelectorAll<HTMLElement>('a, button')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    first.focus()
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--header-bg)] backdrop-blur-md transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          WritingDeveloper
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={ta('toggleMenu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[var(--border-subtle)]"
          >
            <div ref={menuRef} className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors py-2.5"
                  onClick={closeMobile}
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
