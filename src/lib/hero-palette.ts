/**
 * Machine gate for generated hero images (Gate A of the review pipeline).
 *
 * Thresholds derive from the brand tokens in src/app/globals.css:
 *   --bg-primary  #0a0a0b  (near-black backdrop)
 *   --accent-text #c6f24e  (acid green, hue ~76deg)
 *
 * These functions are pure so the verdict is a number, not a matter of taste —
 * an image that drifts off-palette cannot be waved through by a reviewer who
 * is grading their own work.
 */

/** Accent hue band, in degrees. #c6f24e sits at ~76. */
const ACCENT_HUE_MIN = 60
const ACCENT_HUE_MAX = 95
/** Below this saturation a pixel reads as grey, not as colour. */
const SATURATION_FLOOR = 0.4
/** Accent pixels must sit in this lightness band to read as a highlight. */
const ACCENT_LIGHTNESS_MIN = 0.4
const ACCENT_LIGHTNESS_MAX = 0.8
/** At or below this lightness a pixel counts as backdrop. */
const BACKGROUND_LIGHTNESS_MAX = 0.15

/** At least this share of the image must be near-black backdrop. */
const MIN_BACKGROUND_RATIO = 0.5
/** The accent must be present, but must not take over. */
const MIN_ACCENT_RATIO = 0.005
const MAX_ACCENT_RATIO = 0.15
/** Budget for saturated colour that is neither backdrop nor accent. */
const MAX_STRAY_RATIO = 0.03

export interface Hsl {
  /** 0-360 */
  h: number
  /** 0-1 */
  s: number
  /** 0-1 */
  l: number
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let h: number
  if (max === rn) h = ((gn - bn) / delta) % 6
  else if (max === gn) h = (bn - rn) / delta + 2
  else h = (rn - gn) / delta + 4
  h *= 60
  if (h < 0) h += 360

  return { h, s, l }
}

export type PixelClass = 'background' | 'accent' | 'stray' | 'neutral'

export function classifyPixel(r: number, g: number, b: number): PixelClass {
  const { h, s, l } = rgbToHsl(r, g, b)

  // Backdrop wins first: a very dark green belongs to the background, not to
  // the accent budget.
  if (l <= BACKGROUND_LIGHTNESS_MAX) return 'background'

  if (
    s >= SATURATION_FLOOR &&
    h >= ACCENT_HUE_MIN &&
    h <= ACCENT_HUE_MAX &&
    l >= ACCENT_LIGHTNESS_MIN &&
    l <= ACCENT_LIGHTNESS_MAX
  ) {
    return 'accent'
  }

  if (s >= SATURATION_FLOOR) return 'stray'

  return 'neutral'
}

export interface PaletteStats {
  background: number
  accent: number
  stray: number
  neutral: number
  total: number
}

/** Walk a raw pixel buffer. `channels` is 3 (RGB) or 4 (RGBA); alpha is ignored. */
export function summarizePixels(data: Uint8Array | number[], channels: number): PaletteStats {
  const stats: PaletteStats = { background: 0, accent: 0, stray: 0, neutral: 0, total: 0 }
  for (let i = 0; i + channels - 1 < data.length; i += channels) {
    stats[classifyPixel(data[i], data[i + 1], data[i + 2])] += 1
    stats.total += 1
  }
  return stats
}

export interface PaletteVerdict {
  ok: boolean
  failures: string[]
  ratios: { background: number; accent: number; stray: number }
}

export function evaluatePalette(stats: PaletteStats): PaletteVerdict {
  const failures: string[] = []

  if (stats.total === 0) {
    return {
      ok: false,
      failures: ['empty image: no pixels sampled'],
      ratios: { background: 0, accent: 0, stray: 0 },
    }
  }

  const ratios = {
    background: stats.background / stats.total,
    accent: stats.accent / stats.total,
    stray: stats.stray / stats.total,
  }

  const pct = (n: number) => `${(n * 100).toFixed(2)}%`

  if (ratios.background < MIN_BACKGROUND_RATIO) {
    failures.push(
      `background ${pct(ratios.background)} is below the ${pct(MIN_BACKGROUND_RATIO)} floor`,
    )
  }
  if (ratios.accent < MIN_ACCENT_RATIO) {
    failures.push(`accent ${pct(ratios.accent)} is below the ${pct(MIN_ACCENT_RATIO)} floor`)
  } else if (ratios.accent > MAX_ACCENT_RATIO) {
    failures.push(`accent ${pct(ratios.accent)} exceeds the ${pct(MAX_ACCENT_RATIO)} ceiling`)
  }
  if (ratios.stray > MAX_STRAY_RATIO) {
    failures.push(`stray colour ${pct(ratios.stray)} exceeds the ${pct(MAX_STRAY_RATIO)} budget`)
  }

  return { ok: failures.length === 0, failures, ratios }
}
