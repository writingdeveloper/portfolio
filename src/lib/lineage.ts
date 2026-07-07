import projectsData from '../../content/projects.json'
import graveyardData from '../../content/graveyard.json'
import type { Project, Tombstone } from '@/types/content'

/** The live project a tombstone was rebuilt into, or null if unset/unresolved. */
export function successorOf(tomb: Pick<Tombstone, 'supersededBy'>): { name: string; url?: string } | null {
  if (!tomb.supersededBy) return null
  const p = (projectsData.projects as Project[]).find((x) => x.slug === tomb.supersededBy)
  return p ? { name: p.name, url: p.website } : null
}

/** The dead project a live one was rebuilt from, or null if unset/unresolved. */
export function predecessorOf(project: Pick<Project, 'succeeds'>): { name: string } | null {
  if (!project.succeeds) return null
  const t = (graveyardData.tombstones as Tombstone[]).find((x) => x.slug === project.succeeds)
  return t ? { name: t.name } : null
}
