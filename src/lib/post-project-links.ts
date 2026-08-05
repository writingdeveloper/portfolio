/**
 * Links a deep-dive post to the project it is about, in both directions.
 *
 * The two content clusters were previously unconnected: posts linked to other
 * posts (RelatedPosts) and projects linked outward to demos and repos, but a
 * reader on the RentRights card had no way to reach the post explaining how it
 * was built, and vice versa. That is a dead end for readers and a missed
 * internal link for search.
 *
 * A post declares the relationship with a `project:` slug in its frontmatter,
 * so the mapping lives with the content rather than in a table someone has to
 * remember to update.
 */
import type { PostMeta } from './mdx'

export interface LinkedPost {
  slug: string
  title: string
}

/**
 * Build project-slug → post lookup.
 *
 * Unknown project slugs are dropped rather than trusted: a typo would
 * otherwise render a "read the build log" link on nothing, or point a post at
 * a project that does not exist. `knownProjectSlugs` is the authority.
 *
 * If two posts claim the same project, the most recently published one wins —
 * a project's current deep dive is the newest one written about it.
 */
export function buildProjectPostMap(
  posts: Pick<PostMeta, 'slug' | 'title' | 'project' | 'publishedAt'>[],
  knownProjectSlugs: Iterable<string>,
): Map<string, LinkedPost> {
  const known = new Set(knownProjectSlugs)
  const chosen = new Map<string, { post: LinkedPost; publishedAt: string }>()

  for (const post of posts) {
    const projectSlug = (post.project ?? '').trim()
    if (!projectSlug || !known.has(projectSlug)) continue

    const existing = chosen.get(projectSlug)
    // String compare is safe for the YYYY-MM-DD these dates normalise to.
    if (existing && String(existing.publishedAt) >= String(post.publishedAt)) continue

    chosen.set(projectSlug, {
      post: { slug: post.slug, title: post.title },
      publishedAt: String(post.publishedAt),
    })
  }

  return new Map([...chosen].map(([projectSlug, v]) => [projectSlug, v.post]))
}
