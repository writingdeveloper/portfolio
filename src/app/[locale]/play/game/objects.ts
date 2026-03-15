import type { RoomId, InteractableObject, Position } from './types'
import { TILE_SIZE } from './tilemap'

interface ProjectData {
  name: string
  slug: string
  descriptionKo: string
  descriptionEn: string
  techStack: string[]
  status: string
  website: string
  github: string
  featured: boolean
}

interface SkillData {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}

interface TimelineData {
  date: string
  titleKo: string
  titleEn: string
  descriptionKo: string
  descriptionEn: string
  type: string
}

interface PostData {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PortfolioData {
  projects: ProjectData[]
  skills: SkillData[]
  timeline: TimelineData[]
  posts: PostData[]
  locale: string
}

export function generateRoomObjects(
  roomId: RoomId,
  data: PortfolioData,
): InteractableObject[] {
  switch (roomId) {
    case 'lobby':
      return generateLobbyObjects()
    case 'projects':
      return generateProjectObjects(data.projects, data.locale)
    case 'skills':
      return generateSkillObjects(data.skills)
    case 'history':
      return generateHistoryObjects(data.timeline, data.locale)
    case 'library':
      return generateLibraryObjects(data.posts)
    default:
      return []
  }
}

function generateLobbyObjects(): InteractableObject[] {
  return [
    {
      id: 'npc-guide',
      type: 'npc',
      position: { x: 10 * TILE_SIZE + 16, y: 5 * TILE_SIZE + 16 },
      size: { width: 24, height: 24 },
      data: {
        name: 'Guide',
        greeting: 'Welcome to my portfolio! Explore the rooms to learn more about me.',
      },
    },
  ]
}

function generateProjectObjects(
  projects: ProjectData[],
  locale: string,
): InteractableObject[] {
  return projects.slice(0, 4).map((project, i) => ({
    id: `project-${project.slug}`,
    type: 'project' as const,
    position: { x: (3 + i * 4) * TILE_SIZE + 16, y: 4 * TILE_SIZE + 16 },
    size: { width: 32, height: 32 },
    data: {
      name: project.name,
      slug: project.slug,
      description:
        locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      techStack: project.techStack,
      status: project.status,
      website: project.website,
      github: project.github,
      featured: project.featured,
    },
  }))
}

function generateSkillObjects(skills: SkillData[]): InteractableObject[] {
  const categories = ['frontend', 'backend', 'tools'] as const
  const objects: InteractableObject[] = []

  categories.forEach((cat, catIndex) => {
    const catSkills = skills.filter((s) => s.category === cat)
    const yBase = 3 + catIndex * 4

    catSkills.slice(0, 5).forEach((skill, i) => {
      objects.push({
        id: `skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'skill',
        position: {
          x: (3 + i * 3) * TILE_SIZE + 16,
          y: yBase * TILE_SIZE + 16,
        },
        size: { width: 24, height: 24 },
        data: {
          name: skill.name,
          category: skill.category,
        },
      })
    })
  })

  return objects
}

function generateHistoryObjects(
  timeline: TimelineData[],
  locale: string,
): InteractableObject[] {
  return timeline.slice(0, 4).map((item, i) => ({
    id: `timeline-${i}`,
    type: 'timeline' as const,
    position: { x: (3 + i * 4) * TILE_SIZE + 16, y: 3 * TILE_SIZE + 16 },
    size: { width: 32, height: 32 },
    data: {
      date: item.date,
      title: locale === 'ko' ? item.titleKo : item.titleEn,
      description:
        locale === 'ko' ? item.descriptionKo : item.descriptionEn,
      type: item.type,
    },
  }))
}

function generateLibraryObjects(posts: PostData[]): InteractableObject[] {
  return posts.slice(0, 12).map((post, i) => ({
    id: `post-${post.slug}`,
    type: 'post' as const,
    position: {
      x: (2 + (i % 6) * 3) * TILE_SIZE + 16,
      y: (3 + Math.floor(i / 6) * 4) * TILE_SIZE + 16,
    },
    size: { width: 24, height: 32 },
    data: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
    },
  }))
}

export function findNearbyObject(
  playerPos: Position,
  objects: InteractableObject[],
  radius: number = 48,
): InteractableObject | null {
  let closest: InteractableObject | null = null
  let closestDist = Infinity

  for (const obj of objects) {
    const dx = playerPos.x - obj.position.x
    const dy = playerPos.y - obj.position.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius && dist < closestDist) {
      closest = obj
      closestDist = dist
    }
  }

  return closest
}
