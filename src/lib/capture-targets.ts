import type { Project } from '@/types/content'

export interface CaptureTarget {
  slug: string
  url: string
}

/** Projects whose live site can be screenshotted. `private` only hides the code
 *  link, so a private project with a public website is still a valid target. */
export function selectCaptureTargets(projects: Project[]): CaptureTarget[] {
  return projects
    .filter((p): p is Project & { website: string } =>
      typeof p.website === 'string' && /^https?:\/\//.test(p.website),
    )
    .map((p) => ({ slug: p.slug, url: p.website }))
}
