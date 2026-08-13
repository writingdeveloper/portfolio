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
 * Projects that have a page on this site showing the work itself.
 *
 * A private project publishes no repo link, and some have no website either,
 * which leaves the detail page as a description with nowhere to go — exactly
 * the shape `hasIndexablePage` filters out of the sitemap. Where a showcase
 * page exists on this site, this points the detail page at it.
 *
 * Locale-relative, so callers join it to their own locale prefix. Kept here
 * rather than as a slug check inside the page for the same reason
 * APP_CATEGORY lives here: one map beats a conditional copied per call site.
 */
export const PROJECT_SHOWCASE: Record<string, string> = {
  studios: '/studio',
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
 *
 * A showcase page counts too, and for the same reason the rest of this list
 * does: "nowhere to go" stops being true the moment the page carries a link
 * to a substantial page of its own. This is what un-thins `studios`, whose
 * work is private and therefore had no other way to qualify.
 */
export function hasIndexablePage(
  project: Pick<Project, 'slug' | 'screenshot' | 'website' | 'github' | 'playStore' | 'private'>,
  hasRelatedPost = false,
): boolean {
  const codeLink = project.private ? undefined : project.github
  return Boolean(
    project.screenshot ||
      project.website ||
      project.playStore ||
      codeLink ||
      PROJECT_SHOWCASE[project.slug] ||
      hasRelatedPost,
  )
}

export interface HireStats {
  /** Products with a destination a visitor can open right now. */
  shipped: number
  /** Android apps with a Play Store listing. */
  playStore: number
  /** Everything in the ledger, shipped or not. */
  total: number
}

/**
 * The counts the hire page claims.
 *
 * `shipped` deliberately counts a public destination rather than the `launched`
 * and `active` statuses, which together are a larger and more flattering
 * number. A hire page invites "show me", and only a row with a website or a
 * store listing survives that. Deriving these from the ledger — the way the
 * about page derives its project count — means the page cannot drift out of
 * date behind the data.
 */
export function getHireStats(
  projects: Pick<Project, 'website' | 'playStore'>[],
): HireStats {
  return {
    shipped: projects.filter((p) => p.website || p.playStore).length,
    playStore: projects.filter((p) => p.playStore).length,
    total: projects.length,
  }
}

/**
 * Three projects that prove three different things: public-data GIS with an
 * open repo, an AI safety pipeline shipped to web and Android, and real-time
 * multi-feed aggregation. Chosen for spread, not for being the biggest.
 * A slug that stops resolving fails the test suite rather than the page.
 */
export const HIRE_CASE_STUDIES = ['rentrights', 'healframe', 'argus-fusion'] as const
