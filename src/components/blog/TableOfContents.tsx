'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import type { TocItem } from '@/lib/mdx'

interface TableOfContentsProps {
  headings: TocItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations('common')
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors"
          aria-expanded={isOpen}
          aria-label={t('tableOfContents')}
        >
          {t('tableOfContents')}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <nav className="mt-3 pl-1 border-l border-[var(--border-default)]" aria-label={`${t('tableOfContents')} (mobile)`}>
            <TocList headings={headings} activeId={activeId} onClick={() => setIsOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">{t('tableOfContents')}</p>
          <nav className="pl-1 border-l border-[var(--border-default)]" aria-label={`${t('tableOfContents')} (desktop)`}>
            <TocList headings={headings} activeId={activeId} />
          </nav>
        </div>
      </aside>
    </>
  )
}

function TocList({ headings, activeId, onClick }: { headings: TocItem[]; activeId: string; onClick?: () => void }) {
  return (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}>
          <a
            href={`#${heading.id}`}
            onClick={onClick}
            className={`text-sm block py-0.5 pl-3 border-l-2 transition-colors ${
              activeId === heading.id
                ? 'border-[var(--accent-text)] text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}
