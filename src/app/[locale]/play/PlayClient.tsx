'use client'

import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { CameraRig } from './scene/CameraRig'
import { PostEffects } from './scene/PostEffects'

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
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
        <ScrollControls pages={5} damping={0.3}>
          <CameraRig />
          <AuroraParticles />
        </ScrollControls>
        <PostEffects />
      </Canvas>
    </div>
  )
}
