'use client'

import type { TimelineItem } from '@/types/content'
import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SectionDivider } from '../components/SectionDivider'
import { SECTION_SPACING } from '../scene/CameraRig'

const TYPE_COLORS: Record<string, string> = {
  work: '#8b7355',
  education: '#6b6891',
  project: '#7b6f99',
}

interface TimelineSectionProps {
  timeline: TimelineItem[]
  locale: string
  sectionLabel: string
  onSelect: (item: TimelineItem) => void
}

export function TimelineSection({ timeline, locale, sectionLabel, onSelect }: TimelineSectionProps) {
  const sectionY = -SECTION_SPACING * 3

  return (
    <group>
      <SectionDivider position={[0, sectionY + 5, 0]} number="03" />
      <SectionLabel position={[0, sectionY + 4, 0]} label={sectionLabel} />

      {/* Vertical line */}
      <mesh position={[0, sectionY, -1]}>
        <planeGeometry args={[0.01, timeline.length * 2.5 + 2]} />
        <meshBasicMaterial color="#c4a35a" transparent opacity={0.3} />
      </mesh>

      {timeline.map((item, i) => {
        const isLeft = i % 2 === 0
        const x = isLeft ? -3 : 3
        const y = sectionY + 2 - i * 2.5
        const title = locale === 'ko' ? item.titleKo : item.titleEn
        return (
          <FloatingCard
            key={`${item.date}-${i}`}
            position={[x, y, -i * 0.5]}
            title={title}
            subtitle={item.date}
            width={3}
            height={1.8}
            onClick={() => onSelect(item)}
            accentColor={TYPE_COLORS[item.type] ?? '#7c6cf0'}
            floatSpeed={1.2}
            floatIntensity={0.15}
          />
        )
      })}
    </group>
  )
}
