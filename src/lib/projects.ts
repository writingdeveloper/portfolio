import type { Project } from '@/types/content'

/** featured 프로젝트를 앞으로 정렬한다. 그룹 내 원래 순서는 보존(안정 정렬). */
export function sortProjectsFeaturedFirst(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}

/**
 * schema.org applicationCategory per shipped app.
 *
 * Shared by the projects list and each project's own page — two places
 * describing the same app to the same crawler must not disagree, which is
 * exactly what happens when a map like this is copied. Anything unlisted falls
 * back per generator (Lifestyle for stores, WebApplication for sites).
 */
export const APP_CATEGORY: Record<string, string> = {
  drymora: 'HealthApplication',
  healframe: 'HealthApplication',
  kindling: 'HealthApplication',
  'receipt-tracker': 'FinanceApplication',
  coinrace: 'GameApplication',
}

/** Locale-aware path to a project's own page. */
export function projectHref(slug: string, locale: string): string {
  return locale === 'ko' ? `/projects/${slug}` : `/${locale}/projects/${slug}`
}
