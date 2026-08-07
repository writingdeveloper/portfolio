import { useLocale } from 'next-intl'
import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'

/**
 * The stack, grouped by category.
 *
 * Two pages need this grid: /about tells the story behind the work, /hire
 * proves the range. It lives here rather than inside either page because a
 * copied grouping is one where a newly added category lands on one page and
 * quietly not the other.
 */
export function SkillGrid({ skills }: { skills: Skill[] }) {
  const locale = useLocale()
  const grouped = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
    infra: skills.filter((s) => s.category === 'infra'),
  }

  return (
    <div className="space-y-6">
      {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            {skillCategories[category][locale as 'ko' | 'en']}
          </h3>
          <div className="flex flex-wrap gap-2">
            {grouped[category].map((skill) => (
              <span
                key={skill.name}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)] border border-[var(--border-hover)]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
