export interface Project {
  name: string
  slug: string
  description: string
  techStack: string[]
  status: 'active' | 'building' | 'launched' | 'archived'
  links: { website?: string; github?: string }
  featured: boolean
}

export const projects: Project[] = [
  {
    name: 'Soursea',
    slug: 'soursea',
    description: 'AI 기반 이커머스 소싱 어시스턴트. Alibaba/1688에서 제품을 분석하고 수익성을 계산합니다.',
    techStack: ['Next.js', 'NestJS', 'Electron', 'TypeScript', 'Supabase', 'Stripe'],
    status: 'active',
    links: { website: 'https://soursea.com' },
    featured: true,
  },
]
