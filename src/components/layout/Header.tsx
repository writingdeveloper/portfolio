'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/blog', key: 'blog' },
  { href: '/projects', key: 'projects' },
  { href: '/graveyard', key: 'graveyard' },
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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="ledger-mono text-sm font-bold tracking-[0.15em] flex items-center gap-1.5">
          <span className="text-[var(--accent-text)]" aria-hidden="true">▪</span>
          WRITINGDEVELOPER
          <span className="ledger-cursor" aria-hidden="true" />
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="ledger-mono text-xs tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition-colors"
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

      <nav
        aria-label="Mobile navigation"
        data-open={mobileOpen}
        className="md:hidden border-t border-[var(--border-subtle)] mobile-menu"
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu-inner">
          <div ref={menuRef} className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="ledger-mono text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition-colors py-2.5"
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
