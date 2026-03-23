'use client'

import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'
import { GlowOrb } from '../components/GlowOrb'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#a78bfa',
  backend: '#c4a35a',
  tools: '#818cf8',
}

interface SkillsSectionProps {
  skills: Skill[]
  locale: string
}

export function SkillsSection({ skills, locale }: SkillsSectionProps) {
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
      <SectionLabel position={[0, sectionY + 4, 0]} label="Skills" />
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
