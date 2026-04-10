'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { type CategoryItem } from '@/lib/mdx'

interface CategoryFilterProps {
  categories: CategoryItem[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const t = useTranslations('blog')

  return (
    <nav
      aria-label={t('categoryFilter')}
      className="flex flex-wrap gap-2 mb-8"
    >
      <Link
        href="/blog"
        aria-current={!activeCategory ? 'page' : undefined}
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
          key={cat.value}
          href={`/blog?category=${encodeURIComponent(cat.value)}`}
          aria-current={activeCategory === cat.value ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            activeCategory === cat.value
              ? 'bg-[var(--accent-bg-active)] text-[var(--accent-text)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]'
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </nav>
  )
}
