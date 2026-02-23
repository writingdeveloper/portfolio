export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}

export interface TimelineItem {
  date: string
  title: Record<string, string>
  description: Record<string, string>
  type: 'work' | 'education' | 'project'
}

export const skills: Skill[] = [
  { name: 'React', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'Electron', category: 'frontend' },
  { name: 'NestJS', category: 'backend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Supabase', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'Git', category: 'tools' },
  { name: 'Docker', category: 'tools' },
  { name: 'Vercel', category: 'tools' },
  { name: 'Stripe', category: 'tools' },
]

export const timeline: TimelineItem[] = [
  {
    date: '2024 - Present',
    title: { ko: 'Soursea 개발', en: 'Building Soursea' },
    description: {
      ko: 'AI 기반 이커머스 소싱 어시스턴트 개발 및 운영',
      en: 'Developing and operating an AI-powered e-commerce sourcing assistant',
    },
    type: 'project',
  },
]

export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
} as const
