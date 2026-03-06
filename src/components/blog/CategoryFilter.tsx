'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const t = useTranslations('blog')

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/blog"
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          !activeCategory
            ? 'bg-[var(--accent-bg-active)] text-[var(--accent-text)]'
            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]'
        }`}
      >
        {t('allCategories')}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/blog?category=${encodeURIComponent(cat)}`}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            activeCategory === cat
              ? 'bg-[var(--accent-bg-active)] text-[var(--accent-text)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  )
}
