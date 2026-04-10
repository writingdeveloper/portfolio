'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import type { PostMeta } from '@/lib/mdx'

interface SearchBarProps {
  posts: PostMeta[]
}

export function SearchBar({ posts }: SearchBarProps) {
  const t = useTranslations('blog')
  const ta = useTranslations('accessibility')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(
    () => new Fuse(posts, { keys: ['title', 'excerpt', 'tags'], threshold: 0.3 }),
    [posts]
  )

  const results = useMemo(
    () => (query.length >= 2 ? fuse.search(query).map((r) => r.item) : []),
    [fuse, query]
  )
  const isExpanded = query.length >= 2
  const activeOptionId =
    activeIndex >= 0 && results[activeIndex]
      ? `${listboxId}-option-${results[activeIndex].slug}`
      : undefined

  // Reset highlight whenever the query / results change
  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1)
  }, [query, results.length])

  // Keep the active option scrolled into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const navigateTo = useCallback(
    (slug: string) => {
      setQuery('')
      setActiveIndex(-1)
      router.push(`/blog/${slug}`)
    },
    [router]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isExpanded || results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setActiveIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setActiveIndex(results.length - 1)
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault()
          navigateTo(results[activeIndex].slug)
        }
      } else if (e.key === 'Escape') {
        setQuery('')
        setActiveIndex(-1)
      }
    },
    [activeIndex, isExpanded, navigateTo, results]
  )

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder')}
          role="combobox"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-label={t('searchPlaceholder')}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-text)] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setActiveIndex(-1)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-emphasis)]"
            aria-label={ta('clearSearch')}
            type="button"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {/* Result count announcer */}
      <span className="sr-only" aria-live="polite" role="status">
        {isExpanded ? ta('searchResultsCount', { count: results.length }) : ''}
      </span>
      {isExpanded && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-10 top-full mt-2 w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {results.length > 0 ? (
            results.map((post, i) => {
              const isActive = i === activeIndex
              return (
                <div
                  key={post.slug}
                  id={`${listboxId}-option-${post.slug}`}
                  role="option"
                  aria-selected={isActive}
                  data-option-index={i}
                  onClick={() => navigateTo(post.slug)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`block px-4 py-3 transition-colors border-b border-[var(--border-default)] last:border-b-0 cursor-pointer ${
                    isActive ? 'bg-[var(--bg-elevated)]' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                    {post.excerpt}
                  </p>
                </div>
              )
            })
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
              {t('noSearchResults')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
