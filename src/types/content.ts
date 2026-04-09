export interface Project {
  name: string
  slug: string
  descriptionKo: string
  descriptionEn: string
  techStack: string[]
  status: 'active' | 'building' | 'launched' | 'archived'
  website?: string
  github?: string
  featured: boolean
}

export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}

export interface TimelineItem {
  date: string
  titleKo: string
  titleEn: string
  descriptionKo: string
  descriptionEn: string
  type: 'work' | 'education' | 'project'
}

export interface PostSummary {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  category: string
}

export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
} as const
