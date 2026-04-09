'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { PostMeta } from '@/lib/mdx'

interface SearchBarProps {
  posts: PostMeta[]
}

export function SearchBar({ posts }: SearchBarProps) {
  const t = useTranslations('blog')
  const ta = useTranslations('accessibility')
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () => new Fuse(posts, { keys: ['title', 'excerpt', 'tags'], threshold: 0.3 }),
    [posts]
  )

  const results = query.length >= 2 ? fuse.search(query).map((r) => r.item) : []
  const isExpanded = query.length >= 2

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          role="combobox"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? "search-results" : undefined}
          aria-autocomplete="list"
          aria-label={t('searchPlaceholder')}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-text)] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-emphasis)]"
            aria-label={ta('clearSearch')}
            type="button"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {/* Announce result count to screen readers */}
      <span className="sr-only" aria-live="polite" role="status">
        {query.length >= 2 ? ta('searchResultsCount', { count: results.length }) : ''}
      </span>
      {query.length >= 2 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute z-10 top-full mt-2 w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {results.length > 0 ? (
            results.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                role="option"
                aria-selected={false}
                className="block px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-default)] last:border-b-0"
              >
                <p className="text-sm font-medium">{post.title}</p>
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">{post.excerpt}</p>
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">{t('noSearchResults')}</p>
          )}
        </div>
      )}
    </div>
  )
}
