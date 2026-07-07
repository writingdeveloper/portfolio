import type { Project } from '@/types/content'

/** featured 프로젝트를 앞으로 정렬한다. 그룹 내 원래 순서는 보존(안정 정렬). */
export function sortProjectsFeaturedFirst(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}
