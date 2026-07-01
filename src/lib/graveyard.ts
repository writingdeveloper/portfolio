import type { Tombstone } from '@/types/content'

/**
 * Resolve the locale-dependent copy for a tombstone. English falls back to the
 * Korean text when an English field is empty, mirroring the ProjectCard rule so
 * a half-translated entry still renders something rather than a blank.
 */
export function tombstoneCopy(
  tomb: Tombstone,
  locale: string,
): { epitaph: string; retro: string; lifespan: string } {
  const en = locale === 'en'
  return {
    epitaph: en ? tomb.epitaphEn || tomb.epitaphKo : tomb.epitaphKo,
    retro: en ? tomb.retroEn || tomb.retroKo : tomb.retroKo,
    lifespan: formatLifespan(tomb.bornAt, tomb.diedAt),
  }
}

/**
 * `2024–2025`, collapsing to a single value when birth and death coincide or a
 * bound is missing, so a card never shows a dangling en-dash.
 */
export function formatLifespan(bornAt: string, diedAt: string): string {
  const born = bornAt.trim()
  const died = diedAt.trim()
  if (!born) return died
  if (!died || born === died) return born
  return `${born}–${died}`
}
