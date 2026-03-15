'use client'

import { useTranslations } from 'next-intl'
import type { Project, Skill, TimelineItem } from '@/types/content'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  const t = useTranslations('play')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
      <p className="text-[var(--text-secondary)]">{t('description')}</p>
      <p className="text-sm text-[var(--text-muted)]">{t('controls')}</p>
      <p className="text-xs text-[var(--text-muted)]">
        Projects: {projects.length} | Skills: {skills.length} |
        Timeline: {timeline.length} | Posts: {posts.length}
      </p>
    </div>
  )
}
