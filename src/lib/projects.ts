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

/**
 * Is there anything on this project's page beyond the blurb?
 *
 * Every project gets a page, but a handful are a name, two lines of
 * description and some tech chips — no image, nowhere to go, because the work
 * is private and has no public surface. Those are thin pages. Listing them in
 * the sitemap spends crawl budget asking Google to rank something it files
 * under "crawled - currently not indexed", and a fifth of the sitemap reading
 * that way is a signal about the whole site.
 *
 * They stay reachable from /projects and keep working as permalinks — they
 * just aren't advertised as pages worth ranking. Note the code link follows
 * the Private rule: a private repo's URL is withheld from the page, so it
 * cannot count as something the page offers.
 */
export function hasIndexablePage(
  project: Pick<Project, 'screenshot' | 'website' | 'github' | 'playStore' | 'private'>,
  hasRelatedPost = false,
): boolean {
  const codeLink = project.private ? undefined : project.github
  return Boolean(
    project.screenshot || project.website || project.playStore || codeLink || hasRelatedPost,
  )
}
