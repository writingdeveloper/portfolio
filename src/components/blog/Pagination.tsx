'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  queryString?: string
}

export function Pagination({ currentPage, totalPages, basePath, queryString = '' }: PaginationProps) {
  const t = useTranslations('blog')

  if (totalPages <= 1) return null

  const separator = queryString ? '&' : '?'

  function pageUrl(page: number) {
    if (page === 1) return `${basePath}${queryString}`
    return `${basePath}${queryString}${separator}page=${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label={t('pagination')}>
      {currentPage > 1 && (
        <a
          href={pageUrl(currentPage - 1)}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          aria-label={t('previousPage')}
        >
          <ChevronLeft size={18} />
        </a>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <a
          key={page}
          href={pageUrl(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
            page === currentPage
              ? 'bg-[var(--accent-bg-active)] text-[var(--accent-text)]'
              : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          }`}
        >
          {page}
        </a>
      ))}
      {currentPage < totalPages && (
        <a
          href={pageUrl(currentPage + 1)}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          aria-label={t('nextPage')}
        >
          <ChevronRight size={18} />
        </a>
      )}
    </nav>
  )
}
