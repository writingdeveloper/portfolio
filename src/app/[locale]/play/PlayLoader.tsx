'use client'

import dynamic from 'next/dynamic'
import type { Project, Skill, TimelineItem } from '@/types/content'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayLoaderProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

const PlayClient = dynamic(() => import('./PlayClient').then((m) => m.PlayClient), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#050510]">
      <div className="text-[#a78bfa] text-lg tracking-[0.3em] uppercase animate-pulse">
        Loading
      </div>
    </div>
  ),
})

export function PlayLoader(props: PlayLoaderProps) {
  return <PlayClient {...props} />
}
