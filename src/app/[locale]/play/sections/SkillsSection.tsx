'use client'

import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'
import { GlowOrb } from '../components/GlowOrb'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#7b6f99',
  backend: '#8b7355',
  tools: '#6b6891',
}

interface SkillsSectionProps {
  skills: Skill[]
  locale: string
  sectionLabel: string
}

export function SkillsSection({ skills, locale, sectionLabel }: SkillsSectionProps) {
  const sectionY = -SECTION_SPACING * 2

  const grouped = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }

  const categoryLabel = (cat: string) =>
    skillCategories[cat as keyof typeof skillCategories]?.[locale as 'ko' | 'en'] ?? cat

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label={sectionLabel} />
      {Object.entries(grouped).map(([category, items], catIdx) => {
        const catX = (catIdx - 1) * 5
        return (
          <group key={category}>
            <SectionLabel
              position={[catX, sectionY + 2.5, 0]}
              label={categoryLabel(category)}
            />
            {items.map((skill, i) => {
              const row = Math.floor(i / 3)
              const col = i % 3
              const x = catX + (col - 1) * 1.4
              const y = sectionY - row * 1.4 + 1
              const z = -(i % 3) * 0.5
              return (
                <GlowOrb
                  key={skill.name}
                  position={[x, y, z]}
                  label={skill.name}
                  color={CATEGORY_COLORS[category] ?? '#7c6cf0'}
                />
              )
            })}
          </group>
        )
      })}
    </group>
  )
}
