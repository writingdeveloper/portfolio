'use client'

import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SectionDivider } from '../components/SectionDivider'
import { SECTION_SPACING } from '../scene/CameraRig'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface BlogSectionProps {
  posts: PostSummary[]
  sectionLabel: string
  onSelect: (post: PostSummary) => void
}

export function BlogSection({ posts, sectionLabel, onSelect }: BlogSectionProps) {
  const sectionY = -SECTION_SPACING * 4

  return (
    <group>
      <SectionDivider position={[0, sectionY + 5, 0]} number="04" />
      <SectionLabel position={[0, sectionY + 4, 0]} label={sectionLabel} />
      {posts.map((post, i) => {
        const x = (i - (posts.length - 1) / 2) * 4
        const z = -Math.abs(i - (posts.length - 1) / 2) * 1.5
        return (
          <FloatingCard
            key={post.slug}
            position={[x, sectionY, z]}
            title={post.title}
            subtitle={post.excerpt.length > 50 ? post.excerpt.slice(0, 50) + '...' : post.excerpt}
            onClick={() => onSelect(post)}
            accentColor="#a78bfa"
            floatSpeed={1.3 + i * 0.2}
          />
        )
      })}
    </group>
  )
}
