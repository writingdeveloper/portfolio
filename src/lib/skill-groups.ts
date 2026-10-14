import { skillCategories, type Skill } from '@/types/content'

/** Shared by the standard pages and the 3D scene: categories cannot silently disappear. */
export function groupSkills(skills: Skill[]): Record<Skill['category'], Skill[]> {
  return Object.fromEntries(
    Object.keys(skillCategories).map((category) => [category, skills.filter((skill) => skill.category === category)])
  ) as Record<Skill['category'], Skill[]>
}
