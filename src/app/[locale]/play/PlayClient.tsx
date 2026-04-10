'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, type ScrollControlsState } from '@react-three/drei'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Project, Skill, TimelineItem, PostSummary } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { StarField } from './scene/StarField'
import { NebulaCloud } from './scene/NebulaCloud'
import { LightTrails } from './scene/LightTrails'
import { FloatingGeometry } from './scene/FloatingGeometry'
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

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  const t = useTranslations('play')
  const th = useTranslations('home')
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [isMobile] = useState(
    () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  )
  const scrollRef = useRef<ScrollControlsState | null>(null)

  const sectionLabels: Record<string, string> = {
    intro: t('sections.intro'),
    projects: t('sections.projects'),
    skills: t('sections.skills'),
    timeline: t('sections.timeline'),
    blog: t('sections.blog'),
  }

  // Use translated hero text rather than hardcoded per-locale strings.
  const introText = {
    name: th('hero.name'),
    role: th('hero.role'),
  }

  const handleNavigate = useCallback((index: number) => {
    if (scrollRef.current?.el) {
      const scrollEl = scrollRef.current.el
      scrollEl.scrollTop = (index / 4) * (scrollEl.scrollHeight - scrollEl.clientHeight)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60]" style={{ background: '#06060f' }}>
      {/* Exit button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-[70] flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors tracking-widest uppercase"
      >
        <ArrowLeft size={16} />
        {t('exit')}
      </Link>

      {/* Section nav */}
      <SectionNav labels={sectionLabels} activeIndex={activeSection} onNavigate={handleNavigate} />

      {/* Accessible semantic fallback is rendered server-side by
          PlaySemanticFallback so it exists in the initial HTML response
          (PlayClient itself is dynamically imported with ssr:false). */}

      {/* 3D Canvas is purely decorative; hide from assistive tech. */}
      <Canvas
        aria-hidden="true"
        role="presentation"
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#06060f']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#8b82a8" />
        <ScrollControls pages={5} damping={0.3}>
          <CameraRig onSectionChange={setActiveSection} scrollRef={scrollRef} />
          <StarField count={isMobile ? 1500 : 3000} />
          <NebulaCloud />
          <LightTrails />
          <FloatingGeometry />
          <AuroraParticles dustCount={isMobile ? 150 : 350} />
          <IntroSection {...introText} scrollHint={`↓ ${t('scrollHint')}`} />
          <ProjectsSection
            projects={projects}
            locale={locale}
            sectionLabel={sectionLabels.projects}
            onSelect={(p) => setSelectedItem({ type: 'project', data: p })}
          />
          <SkillsSection skills={skills} locale={locale} sectionLabel={sectionLabels.skills} />
          <TimelineSection
            timeline={timeline}
            locale={locale}
            sectionLabel={sectionLabels.timeline}
            onSelect={(ti) => setSelectedItem({ type: 'timeline', data: ti })}
          />
          <BlogSection
            posts={posts}
            sectionLabel={sectionLabels.blog}
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
