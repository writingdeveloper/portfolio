'use client'

import type { Project } from '@/types/content'
import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

interface ProjectsSectionProps {
  projects: Project[]
  locale: string
  sectionLabel: string
  onSelect: (project: Project) => void
}

export function ProjectsSection({ projects, locale, sectionLabel, onSelect }: ProjectsSectionProps) {
  const sectionY = -SECTION_SPACING * 1

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label={sectionLabel} />
      {projects.map((project, i) => {
        const count = projects.length
        const x = (i - (count - 1) / 2) * 4
        const z = -Math.abs(i - (count - 1) / 2) * 1.5
        const y = sectionY + (i % 2 === 0 ? 0.3 : -0.3)
        const desc = locale === 'ko' ? project.descriptionKo : project.descriptionEn
        return (
          <FloatingCard
            key={project.slug}
            position={[x, y, z]}
            title={project.name}
            subtitle={desc.length > 40 ? desc.slice(0, 40) + '...' : desc}
            onClick={() => onSelect(project)}
            accentColor={i === 0 ? '#8b7355' : '#5b5291'}
            floatSpeed={1.5 + i * 0.3}
          />
        )
      })}
    </group>
  )
}
