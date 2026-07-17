export interface Project {
  name: string
  slug: string
  descriptionKo: string
  descriptionEn: string
  techStack: string[]
  status: 'active' | 'building' | 'launched' | 'archived'
  website?: string
  github?: string
  playStore?: string
  /** slug of a graveyard tombstone this project was rebuilt from (lineage). */
  succeeds?: string
  private?: boolean
  featured: boolean
}

export type CauseOfDeath =
  | 'no-pmf'
  | 'burnout'
  | 'outcompeted'
  | 'pivoted'
  | 'too-complex'
  | 'lost-interest'
  | 'funding'
  | 'consolidated'
  | 'other'

export interface Tombstone {
  name: string
  slug: string
  bornAt: string
  diedAt: string
  causeOfDeath: CauseOfDeath
  epitaphKo: string
  epitaphEn: string
  retroKo: string
  retroEn: string
  techStack: string[]
  website?: string
  github?: string
  /** slug of the live project that superseded this one (lineage). */
  supersededBy?: string
  private?: boolean
}

export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'infra'
}

export interface TimelineItem {
  date: string
  titleKo: string
  titleEn: string
  descriptionKo: string
  descriptionEn: string
  type: 'work' | 'education' | 'project'
  /** optional locale-relative path (e.g. /blog/slug) the entry links to */
  href?: string
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
  infra: { ko: '인프라', en: 'Infra' },
} as const
