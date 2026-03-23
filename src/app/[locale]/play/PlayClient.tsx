'use client'

import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import type { Project, Skill, TimelineItem } from '@/types/content'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  return (
    <div className="fixed inset-0 bg-[#050510]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#050510']} />
        <ScrollControls pages={5} damping={0.3}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#7c6cf0" />
          </mesh>
        </ScrollControls>
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  )
}
