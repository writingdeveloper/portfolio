'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { PRIMARY_NAV_ITEMS } from './navigation'

export function Header() {
  const t = useTranslations('nav')
  const ta = useTranslations('accessibility')
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        closeMobile()
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, closeMobile])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
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
          <span className="text-[var(--accent-text)]" aria-hidden="true">
            ▪
          </span>
          WRITINGDEVELOPER
          <span className="ledger-cursor" aria-hidden="true" />
        </Link>

        {/* Keep the canonical six-link ledger navigation on one row only when
            there is enough room. The mobile menu remains the accessible fallback
            below lg, where translated labels can otherwise wrap. */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          {PRIMARY_NAV_ITEMS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="ledger-mono text-xs tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition-colors"
            >
              <span className="text-[var(--accent-text)]">{link.index}</span> {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            className="lg:hidden p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
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
        className="lg:hidden border-t border-[var(--border-subtle)] mobile-menu"
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu-inner">
          <div ref={menuRef} className="px-4 py-4 flex flex-col gap-3">
            {PRIMARY_NAV_ITEMS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="ledger-mono text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition-colors py-2.5"
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
              >
                <span className="text-[var(--accent-text)]">{link.index}</span> {t(link.key)}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
