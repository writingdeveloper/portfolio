'use client'

import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { CameraRig } from './scene/CameraRig'
import { PostEffects } from './scene/PostEffects'
import { IntroSection } from './sections/IntroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { TimelineSection } from './sections/TimelineSection'
import { BlogSection } from './sections/BlogSection'

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
  const introText = locale === 'ko'
    ? { name: '이시형', role: '개발자 & 창업가', scrollHint: '↓ 스크롤하여 탐험하기' }
    : { name: 'Sihyung Lee', role: 'Developer & Entrepreneur', scrollHint: '↓ Scroll to explore' }

  return (
    <div className="fixed inset-0 bg-[#050510]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
        <ScrollControls pages={5} damping={0.3}>
          <CameraRig />
          <AuroraParticles />
          <IntroSection name={introText.name} role={introText.role} scrollHint={introText.scrollHint} />
          <ProjectsSection projects={projects} locale={locale} onSelect={() => {}} />
          <SkillsSection skills={skills} locale={locale} />
          <TimelineSection timeline={timeline} locale={locale} onSelect={() => {}} />
          <BlogSection posts={posts} onSelect={() => {}} />
        </ScrollControls>
        <PostEffects />
      </Canvas>
    </div>
  )
}
