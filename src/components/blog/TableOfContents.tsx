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
  const [activeId, setActiveId] = useState<string>('')
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
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          {t('tableOfContents')}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <nav className="mt-3 pl-1 border-l border-gray-800">
            <TocList headings={headings} activeId={activeId} onClick={() => setIsOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-sm font-medium text-gray-400 mb-3">{t('tableOfContents')}</p>
          <nav className="pl-1 border-l border-gray-800">
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
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}
