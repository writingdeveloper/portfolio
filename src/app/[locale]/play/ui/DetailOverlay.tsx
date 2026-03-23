'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X, ExternalLink, Github } from 'lucide-react'
import type { Project, TimelineItem } from '@/types/content'

type DetailItem =
  | { type: 'project'; data: Project }
  | { type: 'timeline'; data: TimelineItem }
  | { type: 'post'; data: { slug: string; title: string; excerpt: string; category: string } }

interface DetailOverlayProps {
  item: DetailItem | null
  locale: string
  onClose: () => void
}

export type { DetailItem }

export function DetailOverlay({ item, locale, onClose }: DetailOverlayProps) {
  const t = useTranslations('play')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-w-lg w-full mx-4 p-8 rounded-2xl border border-[#7c6cf0]/30 bg-[#0a0a1a]/90 backdrop-blur-md shadow-2xl shadow-purple-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a78bfa] hover:text-[#e8d5a3] transition-colors"
        >
          <X size={20} />
        </button>

        {item.type === 'project' && <ProjectDetail project={item.data} locale={locale} />}
        {item.type === 'timeline' && <TimelineDetail item={item.data} locale={locale} />}
        {item.type === 'post' && <PostDetail post={item.data} locale={locale} readMoreLabel={t('readMore')} />}
      </div>
    </div>
  )
}

function ProjectDetail({ project, locale }: { project: Project; locale: string }) {
  const desc = locale === 'ko' ? project.descriptionKo : project.descriptionEn
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-[#e8d5a3]">{project.name}</h2>
      <p className="text-[#a78bfa]/80 text-sm leading-relaxed">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-xs rounded-full border border-[#7c6cf0]/30 text-[#a78bfa]"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
          >
            <ExternalLink size={14} /> Website
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
          >
            <Github size={14} /> GitHub
          </a>
        )}
      </div>
    </div>
  )
}

function TimelineDetail({ item, locale }: { item: TimelineItem; locale: string }) {
  const title = locale === 'ko' ? item.titleKo : item.titleEn
  const desc = locale === 'ko' ? item.descriptionKo : item.descriptionEn
  return (
    <div className="space-y-3">
      <span className="text-xs text-[#c4a35a] tracking-widest uppercase">{item.date}</span>
      <h2 className="text-xl font-semibold text-[#e8d5a3]">{title}</h2>
      <p className="text-[#a78bfa]/80 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PostDetail({
  post,
  locale,
  readMoreLabel,
}: {
  post: { slug: string; title: string; excerpt: string }
  locale: string
  readMoreLabel: string
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-[#e8d5a3]">{post.title}</h2>
      <p className="text-[#a78bfa]/80 text-sm leading-relaxed">{post.excerpt}</p>
      <a
        href={`/${locale}/blog/${post.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
      >
        <ExternalLink size={14} /> {readMoreLabel}
      </a>
    </div>
  )
}
