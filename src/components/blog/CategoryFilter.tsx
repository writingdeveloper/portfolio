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
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  )
}
