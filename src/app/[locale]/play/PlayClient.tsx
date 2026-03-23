'use client'

import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { CameraRig } from './scene/CameraRig'
import { PostEffects } from './scene/PostEffects'
import { IntroSection } from './sections/IntroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { TimelineSection } from './sections/TimelineSection'
import { BlogSection } from './sections/BlogSection'
import { DetailOverlay } from './ui/DetailOverlay'
import type { DetailItem } from './ui/DetailOverlay'
import { SectionNav } from './ui/SectionNav'

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
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [isMobile] = useState(
    () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollRef = useRef<any>(null)

  const sectionLabels: Record<string, string> =
    locale === 'ko'
      ? { intro: '소개', projects: '프로젝트', skills: '스킬', timeline: '타임라인', blog: '블로그' }
      : { intro: 'Intro', projects: 'Projects', skills: 'Skills', timeline: 'Timeline', blog: 'Blog' }

  const introText =
    locale === 'ko'
      ? { name: '이시형', role: '개발자 & 창업가', scrollHint: '↓ 스크롤하여 탐험하기' }
      : { name: 'Sihyung Lee', role: 'Developer & Entrepreneur', scrollHint: '↓ Scroll to explore' }

  const handleNavigate = useCallback((index: number) => {
    if (scrollRef.current?.el) {
      const scrollEl = scrollRef.current.el
      scrollEl.scrollTop = (index / 4) * (scrollEl.scrollHeight - scrollEl.clientHeight)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#050510]">
      {/* Exit button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-40 flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors tracking-widest uppercase"
      >
        <ArrowLeft size={16} />
        {locale === 'ko' ? '나가기' : 'Exit'}
      </Link>

      {/* Section nav */}
      <SectionNav labels={sectionLabels} activeIndex={activeSection} onNavigate={handleNavigate} />

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
        <ScrollControls pages={5} damping={0.3}>
          <CameraRig onSectionChange={setActiveSection} scrollRef={scrollRef} />
          <AuroraParticles dustCount={isMobile ? 100 : 200} />
          <IntroSection {...introText} />
          <ProjectsSection
            projects={projects}
            locale={locale}
            onSelect={(p) => setSelectedItem({ type: 'project', data: p })}
          />
          <SkillsSection skills={skills} locale={locale} />
          <TimelineSection
            timeline={timeline}
            locale={locale}
            onSelect={(t) => setSelectedItem({ type: 'timeline', data: t })}
          />
          <BlogSection
            posts={posts}
            onSelect={(p) => setSelectedItem({ type: 'post', data: p })}
          />
        </ScrollControls>
        {!isMobile && <PostEffects />}
      </Canvas>

      {/* Detail overlay */}
      <DetailOverlay item={selectedItem} locale={locale} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
