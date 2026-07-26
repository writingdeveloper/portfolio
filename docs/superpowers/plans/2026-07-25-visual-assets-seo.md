# 시각 에셋 도입 (이미지 1단계) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포트폴리오 사이트에 프로젝트 실물 스크린샷과 블로그 추상 히어로 이미지를 도입하고, JSON-LD·사이트맵·OG에 배선해 소셜 CTR과 이미지 검색 유입을 확보한다.

**Architecture:** 이미지는 `public/images/` 아래에 WebP로 정적 커밋하고 `next/image`가 AVIF 변환을 담당한다. 프로젝트 스크린샷은 Playwright 스크립트로 재현 가능하게 캡처하고, 블로그 히어로는 image-studio MCP로 생성하되 기계 팔레트 검증(Gate A)과 부정형 체크리스트 시각 판정(Gate B)을 통과한 것만 채택한다. 모든 렌더링은 조건부라 이미지가 없는 항목이 섞여도 레이아웃이 깨지지 않는다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Vitest, sharp, Playwright, image-studio MCP

## Global Constraints

- 실제 출시된 제품의 UI는 **실물 스크린샷만** 사용한다. AI 생성 이미지를 제품 화면처럼 제시하지 않는다.
- 브랜드 토큰은 `src/app/globals.css`가 단일 출처다: `--bg-primary: #0a0a0b`, `--accent-text: #c6f24e` (HSL hue 약 76도).
- 히어로 금지 모티브: 사람, 손, 얼굴, 로봇, 회로기판, 뇌, 전구, 육각형 HUD, 렌즈플레어, 렌더링된 글자.
- 커밋 소스 포맷은 **WebP**. AVIF는 `next/image`가 런타임 생성한다 (`next.config.ts`의 `images.formats`에 이미 설정됨).
- 저장 경로는 기존 Keystatic 규약을 따른다: 히어로 `public/images/posts/`, 스크린샷 `public/images/projects/`.
- 히어로 규격: 16:9, 폭 1600px 이상, WebP 200KB 이하.
- alt 텍스트는 이미지를 정직하게 서술한다. 키워드 스터핑 금지.
- 모든 이미지 렌더링은 조건부다. 값이 빈 문자열이면 기존 레이아웃을 그대로 유지해야 한다.
- 커밋 메시지는 영어, 기존 리포 컨벤션(`feat:`, `fix:`, `docs:`, `chore:`)을 따른다.

---

### Task 1: image-studio 파일 회수 경로 확인 (스파이크)

스펙의 유일한 미결 사항이다. image-studio가 로컬에서 도는지 원격인지에 따라 Task 8의 설계가 달라지므로 먼저 해소한다.

**Files:**
- Modify: `docs/superpowers/specs/2026-07-25-visual-assets-seo-design.md` (미결 사항 절 갱신)

**Interfaces:**
- Consumes: 없음
- Produces: Task 8이 쓸 파일 회수 방법에 대한 확정 사실

- [ ] **Step 1: 테스트 이미지 1장 생성**

`mcp__image-studio__generate_image`를 다음 인자로 호출한다:

```
prompt: "abstract geometric composition, dark near-black background #0a0a0b, thin precise grid lines, single acid-green #c6f24e accent, fine film grain texture, layered planes, non-representational, no text, no people, flat graphic design"
count: 1
size: "1600x896"
```

`size`가 16의 배수로 내림 조정될 수 있다 (`data.size_adjusted=true`). 1600x896은 16의 배수이며 비율 1.786으로 16:9(1.778)에 근접한다.

- [ ] **Step 2: 반환된 path가 로컬에서 읽히는지 확인**

응답의 `path`를 Read 도구로 읽어본다.

- 읽히면 → **로컬 모드**. Task 8은 `out` 파라미터로 목적지를 직접 지정한다.
- 읽히지 않으면 → **원격 모드**. Task 8은 대체 회수 경로가 필요하다. 이 경우 즉시 중단하고 사용자에게 보고한 뒤 설계를 조정한다.

- [ ] **Step 3: 스펙 문서의 미결 사항 절을 확정 사실로 교체**

`## 구현 전 확인이 필요한 미결 사항` 절 제목을 `## image-studio 파일 회수 방식 (확정)`으로 바꾸고, 본문을 Step 2에서 관측한 사실로 교체한다. 관측하지 않은 내용은 쓰지 않는다.

- [ ] **Step 4: 커밋**

```bash
git add docs/superpowers/specs/2026-07-25-visual-assets-seo-design.md
git commit -m "docs(spec): resolve image-studio file retrieval mode"
```

---

### Task 2: 팔레트 판정 순수 함수

Gate A의 핵심이다. 파일 I/O 없이 픽셀 배열만 받아 판정하므로 단위 테스트가 가능하다.

**Files:**
- Create: `src/lib/hero-palette.ts`
- Test: `src/lib/__tests__/hero-palette.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number }` — h는 0~360, s와 l은 0~1
  - `type PixelClass = 'background' | 'accent' | 'stray' | 'neutral'`
  - `classifyPixel(r: number, g: number, b: number): PixelClass`
  - `interface PaletteStats { background: number; accent: number; stray: number; neutral: number; total: number }`
  - `summarizePixels(data: Uint8Array | number[], channels: number): PaletteStats`
  - `interface PaletteVerdict { ok: boolean; failures: string[]; ratios: { background: number; accent: number; stray: number } }`
  - `evaluatePalette(stats: PaletteStats): PaletteVerdict`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

Create `src/lib/__tests__/hero-palette.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  rgbToHsl,
  classifyPixel,
  summarizePixels,
  evaluatePalette,
  type PaletteStats,
} from '../hero-palette'

describe('rgbToHsl', () => {
  it('converts the brand accent #c6f24e to hue ~76', () => {
    const { h, s, l } = rgbToHsl(198, 242, 78)
    expect(h).toBeCloseTo(76.1, 0)
    expect(s).toBeGreaterThan(0.8)
    expect(l).toBeCloseTo(0.63, 1)
  })

  it('reports zero saturation for greys', () => {
    expect(rgbToHsl(128, 128, 128).s).toBe(0)
  })
})

describe('classifyPixel', () => {
  it('classifies the brand background #0a0a0b as background', () => {
    expect(classifyPixel(10, 10, 11)).toBe('background')
  })

  it('classifies the brand accent #c6f24e as accent', () => {
    expect(classifyPixel(198, 242, 78)).toBe('accent')
  })

  it('classifies saturated red as stray', () => {
    expect(classifyPixel(255, 0, 0)).toBe('stray')
  })

  it('classifies mid grey as neutral', () => {
    expect(classifyPixel(160, 160, 160)).toBe('neutral')
  })

  it('prefers background over accent for very dark green', () => {
    // A dark green pixel is part of the backdrop, not an accent highlight.
    expect(classifyPixel(12, 20, 6)).toBe('background')
  })
})

describe('summarizePixels', () => {
  it('counts one pixel per channel group and ignores the alpha channel', () => {
    // 2 pixels, RGBA: background then accent
    const data = [10, 10, 11, 255, 198, 242, 78, 255]
    const stats = summarizePixels(data, 4)
    expect(stats.total).toBe(2)
    expect(stats.background).toBe(1)
    expect(stats.accent).toBe(1)
  })
})

describe('evaluatePalette', () => {
  const base: PaletteStats = {
    background: 800,
    accent: 60,
    stray: 5,
    neutral: 135,
    total: 1000,
  }

  it('passes an on-brand distribution', () => {
    const verdict = evaluatePalette(base)
    expect(verdict.ok).toBe(true)
    expect(verdict.failures).toEqual([])
  })

  it('fails when the image is not predominantly dark', () => {
    const verdict = evaluatePalette({ ...base, background: 300, neutral: 635 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('background')
  })

  it('fails when the accent is absent', () => {
    const verdict = evaluatePalette({ ...base, accent: 2, neutral: 193 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('accent')
  })

  it('fails when the accent floods the image', () => {
    const verdict = evaluatePalette({ ...base, accent: 400, background: 460 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('accent')
  })

  it('fails when off-palette saturated colour exceeds the budget', () => {
    const verdict = evaluatePalette({ ...base, stray: 50, neutral: 90 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('stray')
  })

  it('fails an empty image rather than dividing by zero', () => {
    const verdict = evaluatePalette({
      background: 0, accent: 0, stray: 0, neutral: 0, total: 0,
    })
    expect(verdict.ok).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm test -- hero-palette`
Expected: FAIL — `Failed to resolve import "../hero-palette"`

- [ ] **Step 3: 최소 구현을 작성한다**

Create `src/lib/hero-palette.ts`:

```ts
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
```

- [ ] **Step 4: 테스트를 실행해 통과를 확인한다**

Run: `npm test -- hero-palette`
Expected: PASS (13개 테스트)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/hero-palette.ts src/lib/__tests__/hero-palette.test.ts
git commit -m "feat(media): add pure palette gate for generated hero images"
```

---

### Task 3: 히어로 검증 CLI

Task 2의 순수 함수에 실제 파일을 먹이고, 규격·용량까지 함께 판정하는 실행 가능한 게이트.

**Files:**
- Create: `scripts/verify-hero.ts`
- Modify: `package.json` (devDependency `sharp`, `tsx`; script `verify:hero`)

**Interfaces:**
- Consumes: `summarizePixels`, `evaluatePalette`, `PaletteVerdict` (Task 2)
- Produces: CLI `npx tsx scripts/verify-hero.ts <파일경로...>` — 전량 통과 시 exit 0, 하나라도 실패하면 exit 1

- [ ] **Step 1: 의존성을 설치한다**

`tsx`는 `untranslated` 스크립트가 이미 `npx tsx`로 쓰고 있으나 devDependency로 선언돼 있지 않다. 함께 고정한다.

```bash
npm install --save-dev sharp tsx
```

- [ ] **Step 2: 검증 스크립트를 작성한다**

Create `scripts/verify-hero.ts`:

```ts
/**
 * Gate A for generated hero images: format, dimensions, file size, palette.
 *
 * Usage: npx tsx scripts/verify-hero.ts public/images/posts/*.webp
 * Exit code 0 when every file passes, 1 otherwise.
 */
import fs from 'fs'
import sharp from 'sharp'
import { summarizePixels, evaluatePalette } from '../src/lib/hero-palette'

const MIN_WIDTH = 1600
const TARGET_RATIO = 16 / 9
const RATIO_TOLERANCE = 0.02
const MAX_BYTES = 200 * 1024

interface FileVerdict {
  file: string
  ok: boolean
  failures: string[]
  detail: string
}

async function verifyFile(file: string): Promise<FileVerdict> {
  const failures: string[] = []

  const bytes = fs.statSync(file).size
  if (bytes > MAX_BYTES) {
    failures.push(`file size ${(bytes / 1024).toFixed(0)}KB exceeds the 200KB ceiling`)
  }

  const image = sharp(file)
  const meta = await image.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0

  if (meta.format !== 'webp') {
    failures.push(`format is ${meta.format}, expected webp`)
  }
  if (width < MIN_WIDTH) {
    failures.push(`width ${width}px is below the ${MIN_WIDTH}px floor`)
  }
  const ratio = height > 0 ? width / height : 0
  if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
    failures.push(`aspect ratio ${ratio.toFixed(3)} is not 16:9 (${TARGET_RATIO.toFixed(3)})`)
  }

  // Sample the image at full resolution: downscaling blends neighbouring
  // pixels and would dilute a thin accent line into the background.
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  const stats = summarizePixels(data, info.channels)
  const palette = evaluatePalette(stats)
  failures.push(...palette.failures)

  const detail =
    `${width}x${height} ${(bytes / 1024).toFixed(0)}KB | ` +
    `bg ${(palette.ratios.background * 100).toFixed(1)}% ` +
    `accent ${(palette.ratios.accent * 100).toFixed(2)}% ` +
    `stray ${(palette.ratios.stray * 100).toFixed(2)}%`

  return { file, ok: failures.length === 0, failures, detail }
}

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error('usage: npx tsx scripts/verify-hero.ts <file.webp...>')
    process.exit(1)
  }

  let failed = 0
  for (const file of files) {
    const verdict = await verifyFile(file)
    if (verdict.ok) {
      console.log(`PASS  ${file}  ${verdict.detail}`)
    } else {
      failed += 1
      console.log(`FAIL  ${file}  ${verdict.detail}`)
      for (const reason of verdict.failures) console.log(`        - ${reason}`)
    }
  }

  console.log(`\n${files.length - failed}/${files.length} passed`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

- [ ] **Step 3: package.json에 스크립트를 추가한다**

`"untranslated"` 항목 아래에 추가:

```json
    "verify:hero": "tsx scripts/verify-hero.ts"
```

- [ ] **Step 4: 합성 이미지로 게이트가 양방향 동작하는지 확인한다**

통과해야 하는 이미지와 탈락해야 하는 이미지를 만들어 게이트가 실제로 걸러내는지 본다. 통과만 확인하면 게이트가 무조건 통과하는 버그를 놓친다.

임시 픽스처 스크립트를 만든다. `scripts/`가 아니라 스크래치패드에 두어 리포에 커밋되지 않게 한다.

Create a temporary file at `scripts/.tmp-hero-fixture.mts`:

```ts
import fs from 'fs'
import sharp from 'sharp'

const W = 1600
const H = 900
const dir = 'scripts/.tmp-hero-fixture'
fs.mkdirSync(dir, { recursive: true })

// on-brand: near-black field with a ~4% acid-green band
const good = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  const y = Math.floor(i / W)
  const accent = y > 430 && y < 466
  good[i * 3] = accent ? 198 : 10
  good[i * 3 + 1] = accent ? 242 : 10
  good[i * 3 + 2] = accent ? 78 : 11
}
await sharp(good, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 80 })
  .toFile(`${dir}/good.webp`)

// off-brand: saturated red field
const bad = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  bad[i * 3] = 220
  bad[i * 3 + 1] = 20
  bad[i * 3 + 2] = 30
}
await sharp(bad, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 80 })
  .toFile(`${dir}/bad.webp`)

console.log('fixtures written to', dir)
```

Run:

```bash
npx tsx scripts/.tmp-hero-fixture.mts
npx tsx scripts/verify-hero.ts scripts/.tmp-hero-fixture/good.webp
npx tsx scripts/verify-hero.ts scripts/.tmp-hero-fixture/bad.webp
```

확인 후 정리한다:

```bash
rm -rf scripts/.tmp-hero-fixture scripts/.tmp-hero-fixture.mts
```

Expected: `good.webp`는 `PASS`, `bad.webp`는 `FAIL`이며 background와 stray 사유가 출력된다. 두 결과가 모두 나와야 이 단계를 통과한 것이다.

- [ ] **Step 5: 커밋**

```bash
git add scripts/verify-hero.ts package.json package-lock.json
git commit -m "feat(media): add hero image verification CLI"
```

---

### Task 4: 프로젝트 스크린샷 캡처 스크립트

**Files:**
- Create: `src/lib/capture-targets.ts`
- Create: `scripts/capture-screenshots.ts`
- Test: `src/lib/__tests__/capture-targets.test.ts`
- Modify: `package.json` (devDependency `playwright`; script `capture:screenshots`)

**Interfaces:**
- Consumes: `Project` from `@/types/content`
- Produces:
  - `interface CaptureTarget { slug: string; url: string }`
  - `selectCaptureTargets(projects: Project[]): CaptureTarget[]`
  - CLI `npx tsx scripts/capture-screenshots.ts` → `public/images/projects/<slug>.webp`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

Create `src/lib/__tests__/capture-targets.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { selectCaptureTargets } from '../capture-targets'
import type { Project } from '@/types/content'

function project(overrides: Partial<Project>): Project {
  return {
    name: 'Example',
    slug: 'example',
    descriptionKo: '',
    descriptionEn: '',
    techStack: [],
    status: 'active',
    featured: false,
    ...overrides,
  }
}

describe('selectCaptureTargets', () => {
  it('selects projects that have a website', () => {
    const targets = selectCaptureTargets([
      project({ slug: 'a', website: 'https://a.example' }),
      project({ slug: 'b' }),
    ])
    expect(targets).toEqual([{ slug: 'a', url: 'https://a.example' }])
  })

  it('includes private projects whose website is public', () => {
    // `private` hides the code link, not the live site.
    const targets = selectCaptureTargets([
      project({ slug: 'p', website: 'https://p.example', private: true }),
    ])
    expect(targets).toHaveLength(1)
  })

  it('skips non-http urls', () => {
    const targets = selectCaptureTargets([
      project({ slug: 'x', website: 'ftp://x.example' }),
    ])
    expect(targets).toEqual([])
  })

  it('returns an empty list when nothing qualifies', () => {
    expect(selectCaptureTargets([])).toEqual([])
  })
})
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm test -- capture-targets`
Expected: FAIL — `Failed to resolve import "../capture-targets"`

- [ ] **Step 3: 최소 구현을 작성한다**

Create `src/lib/capture-targets.ts`:

```ts
import type { Project } from '@/types/content'

export interface CaptureTarget {
  slug: string
  url: string
}

/** Projects whose live site can be screenshotted. `private` only hides the code
 *  link, so a private project with a public website is still a valid target. */
export function selectCaptureTargets(projects: Project[]): CaptureTarget[] {
  return projects
    .filter((p): p is Project & { website: string } =>
      typeof p.website === 'string' && /^https?:\/\//.test(p.website),
    )
    .map((p) => ({ slug: p.slug, url: p.website }))
}
```

- [ ] **Step 4: 테스트를 실행해 통과를 확인한다**

Run: `npm test -- capture-targets`
Expected: PASS (4개 테스트)

- [ ] **Step 5: Playwright를 설치한다**

```bash
npm install --save-dev playwright
npx playwright install chromium
```

- [ ] **Step 6: 캡처 스크립트를 작성한다**

Create `scripts/capture-screenshots.ts`:

```ts
/**
 * Capture real screenshots of every project that has a public website.
 *
 * Real screenshots only: the portfolio never shows a generated image as if it
 * were a product's UI. Failures (dead links, login walls, timeouts) are skipped
 * and reported rather than faked.
 *
 * Usage: npx tsx scripts/capture-screenshots.ts
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { chromium } from 'playwright'
import { selectCaptureTargets } from '../src/lib/capture-targets'
import projectsData from '../content/projects.json'
import type { Project } from '../src/types/content'

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'projects')
const VIEWPORT = { width: 1440, height: 900 }
const NAV_TIMEOUT_MS = 30_000
/** Let late-loading fonts and hero animations settle before the shutter. */
const SETTLE_MS = 2_000

async function main() {
  const targets = selectCaptureTargets(projectsData.projects as Project[])
  console.log(`${targets.length} project(s) have a public website`)

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
    deviceScaleFactor: 2,
  })

  const succeeded: string[] = []
  const failed: { slug: string; reason: string }[] = []

  for (const target of targets) {
    const page = await context.newPage()
    try {
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS })
      await page.waitForTimeout(SETTLE_MS)
      const png = await page.screenshot({ type: 'png' })

      await sharp(png)
        .resize(1440, 900, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(path.join(OUT_DIR, `${target.slug}.webp`))

      succeeded.push(target.slug)
      console.log(`OK    ${target.slug}  ${target.url}`)
    } catch (error) {
      const reason = error instanceof Error ? error.message.split('\n')[0] : String(error)
      failed.push({ slug: target.slug, reason })
      console.log(`SKIP  ${target.slug}  ${target.url}\n        ${reason}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()

  console.log(`\ncaptured ${succeeded.length}/${targets.length}`)
  if (failed.length > 0) {
    console.log('skipped:')
    for (const f of failed) console.log(`  ${f.slug}: ${f.reason}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

- [ ] **Step 7: package.json에 스크립트를 추가한다**

`"verify:hero"` 항목 아래에 추가:

```json
    "capture:screenshots": "tsx scripts/capture-screenshots.ts"
```

- [ ] **Step 8: 캡처를 실행한다**

```bash
npm run capture:screenshots
```

Expected: 일부는 `OK`, 일부는 `SKIP`. **전량 성공을 기대하지 않는다.** 죽은 링크와 로그인 벽이 있는 프로젝트는 정상적으로 건너뛴다. 출력된 성공/실패 목록을 다음 단계에서 쓰므로 보관한다.

- [ ] **Step 9: 커밋**

```bash
git add src/lib/capture-targets.ts src/lib/__tests__/capture-targets.test.ts scripts/capture-screenshots.ts package.json package-lock.json public/images/projects
git commit -m "feat(media): capture real project screenshots via Playwright"
```

---

### Task 5: 데이터 모델 확장

alt 텍스트와 스크린샷 경로를 담을 필드를 추가한다. `coverImage`는 이미 존재하므로 건드리지 않는다.

**Files:**
- Modify: `src/lib/mdx.ts` (`PostMeta` 인터페이스, frontmatter 파싱)
- Modify: `keystatic.config.ts` (`postSchema`)
- Modify: `src/types/content.ts` (`Project` 인터페이스)

**Interfaces:**
- Consumes: 없음
- Produces:
  - `PostMeta.coverImageAlt: string` — 빈 문자열이 기본값
  - `Project.screenshot?: string`, `Project.screenshotAltKo?: string`, `Project.screenshotAltEn?: string`

- [ ] **Step 1: PostMeta에 coverImageAlt를 추가한다**

`src/lib/mdx.ts`의 `PostMeta` 인터페이스에서 `coverImage: string` 바로 아래에 추가:

```ts
  coverImage: string
  /** Describes the cover image for screen readers and image search. Empty when
   *  the post has no cover. */
  coverImageAlt: string
```

같은 파일의 frontmatter 파싱부에서 `coverImage: data.coverImage || '',` 바로 아래에 추가:

```ts
          coverImage: data.coverImage || '',
          coverImageAlt: data.coverImageAlt || '',
```

- [ ] **Step 2: Keystatic 스키마에 필드를 추가한다**

`keystatic.config.ts`의 `postSchema`에서 `coverImage: fields.image({...}),` 블록 바로 아래에 추가:

```ts
  coverImageAlt: fields.text({
    label: '커버 이미지 대체 텍스트',
    description: '이미지를 정직하게 서술하세요. 키워드를 나열하지 마세요.',
  }),
```

- [ ] **Step 3: Project 타입에 스크린샷 필드를 추가한다**

`src/types/content.ts`의 `Project` 인터페이스에서 `private?: boolean` 바로 위에 추가:

```ts
  /** Path to a real screenshot of the live site, e.g. /images/projects/slug.webp.
   *  Never a generated image — the portfolio only shows real product UI. */
  screenshot?: string
  screenshotAltKo?: string
  screenshotAltEn?: string
```

- [ ] **Step 4: 타입 검사와 전체 테스트를 실행한다**

Run: `npm run type-check && npm test`
Expected: 둘 다 통과. `coverImageAlt`는 선택적 frontmatter이므로 기존 포스트 9개는 빈 문자열로 파싱된다.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/mdx.ts keystatic.config.ts src/types/content.ts
git commit -m "feat(content): add alt-text and screenshot fields to post and project schemas"
```

---

### Task 6: 조건부 이미지 렌더링

**Files:**
- Modify: `src/components/blog/PostCard.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx:163` (`</header>` 직후)
- Modify: `src/components/projects/ProjectCard.tsx`

**Interfaces:**
- Consumes: `PostMeta.coverImage`, `PostMeta.coverImageAlt`, `Project.screenshot`, `Project.screenshotAltKo`, `Project.screenshotAltEn` (Task 5)
- Produces: 없음 (표현 계층)

- [ ] **Step 1: PostCard에 썸네일을 추가한다**

`src/components/blog/PostCard.tsx` 상단 import에 추가:

```tsx
import Image from 'next/image'
```

`<article ...>` 여는 태그 바로 다음, `<div className="p-4 sm:p-5">` 바로 앞에 삽입:

```tsx
        {post.coverImage && (
          <div className="relative aspect-video bg-[var(--bg-elevated)]">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
```

`aspect-video`가 16:9 박스를 미리 차지하므로 이미지 로드 중 레이아웃 점프가 없다. `coverImage`가 빈 문자열이면 블록 전체가 렌더링되지 않아 기존 카드 모양이 유지된다.

- [ ] **Step 2: 포스트 상세에 히어로를 추가한다**

`src/app/[locale]/blog/[slug]/page.tsx` 상단 import에 추가:

```tsx
import Image from 'next/image'
```

163행 `</header>` 바로 다음 줄에 삽입:

```tsx
          {post.coverImage && (
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          )}
```

이 이미지는 LCP 요소가 되므로 `priority`를 준다.

- [ ] **Step 3: ProjectCard에 스크린샷을 추가한다**

`src/components/projects/ProjectCard.tsx` 상단 import에 추가:

```tsx
import Image from 'next/image'
```

`ProjectCard` 함수 안, `const graveyardHref = ...` 다음 줄에 추가:

```tsx
  const screenshotAlt =
    (locale === 'en' ? project.screenshotAltEn : project.screenshotAltKo) ?? ''
```

바깥 `<div className="rounded-xl border ... p-4 sm:p-6 ...">`의 클래스에서 패딩을 옮긴다. 카드 상단까지 이미지가 꽉 차야 하므로 컨테이너에서 패딩을 제거하고 내용에 다시 준다.

여는 태그를 다음으로 교체:

```tsx
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--border-hover)] transition-all">
      {project.screenshot && (
        <div className="relative aspect-[16/10] bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
          <Image
            src={project.screenshot}
            alt={screenshotAlt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      )}
      <div className="p-4 sm:p-6">
```

그리고 이 컴포넌트의 최종 닫는 `</div>` 바로 앞에 닫는 `</div>`를 하나 추가해 새로 연 내용 래퍼를 닫는다.

스크린샷은 1440x900(비율 1.6)으로 캡처하므로 `aspect-[16/10]`이 정확히 맞아 크롭이 발생하지 않는다.

- [ ] **Step 4: 타입 검사, 린트, 빌드를 실행한다**

Run: `npm run type-check && npm run lint && npm run build`
Expected: 전부 통과. 이 시점에는 `coverImage`가 전부 빈 문자열이고 `screenshot`도 아직 `projects.json`에 없으므로 **사이트 외관은 Task 4에서 캡처한 파일이 있어도 변하지 않는다** (경로가 데이터에 아직 없다). 빌드가 깨지지 않는 것이 이 단계의 확인 사항이다.

- [ ] **Step 5: 커밋**

```bash
git add src/components/blog/PostCard.tsx "src/app/[locale]/blog/[slug]/page.tsx" src/components/projects/ProjectCard.tsx
git commit -m "feat(ui): render cover images and project screenshots when present"
```

---

### Task 7: SEO 배선

블로그 JSON-LD와 OG는 `getOgImageUrl`이 이미 `coverImage`를 쓰고 있어 배선이 끝나 있다. 비어 있는 곳은 **프로젝트 JSON-LD의 image**와 **사이트맵의 images**, 그리고 **OG 이미지 치수 하드코딩** 세 곳이다.

**Files:**
- Modify: `src/lib/seo.ts` (`generateProjectListJsonLd`)
- Modify: `src/lib/__tests__/seo.test.ts`
- Modify: `src/app/[locale]/projects/page.tsx:63-72`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx:69` (openGraph 치수)
- Modify: `docs/superpowers/specs/2026-07-25-visual-assets-seo-design.md` (OG 크롭 결정 변경 기록)

**Interfaces:**
- Consumes: `Project.screenshot` (Task 5), `PostMeta.coverImage` (기존)
- Produces: `generateProjectListJsonLd`의 항목 타입에 `image?: string` 추가 (절대 URL)

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/lib/__tests__/seo.test.ts`의 `generateProjectListJsonLd` describe 블록 안에 추가:

```ts
  it('includes an absolute image url on the item when one is supplied', () => {
    const jsonLd = generateProjectListJsonLd(
      [{ name: 'A', description: 'd', image: 'https://example.com/images/projects/a.webp' }],
      'ko',
    )
    const item = (jsonLd.itemListElement[0] as { item: Record<string, unknown> }).item
    expect(item.image).toBe('https://example.com/images/projects/a.webp')
  })

  it('omits the image key entirely when no image is supplied', () => {
    const jsonLd = generateProjectListJsonLd([{ name: 'A', description: 'd' }], 'ko')
    const item = (jsonLd.itemListElement[0] as { item: Record<string, unknown> }).item
    expect(item).not.toHaveProperty('image')
  })

  it('exposes the image as a screenshot on mobile app items', () => {
    const jsonLd = generateProjectListJsonLd(
      [{
        name: 'A',
        description: 'd',
        playStore: 'https://play.google.com/store/apps/details?id=x',
        image: 'https://example.com/images/projects/a.webp',
      }],
      'ko',
    )
    const item = (jsonLd.itemListElement[0] as { item: Record<string, unknown> }).item
    expect(item['@type']).toBe('MobileApplication')
    expect(item.screenshot).toBe('https://example.com/images/projects/a.webp')
  })
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm test -- seo`
Expected: FAIL — `image` 파라미터가 타입에 없고 결과에 `image` 키가 없다

- [ ] **Step 3: generateProjectListJsonLd에 image를 추가한다**

`src/lib/seo.ts`의 `generateProjectListJsonLd` 시그니처에서 파라미터 객체 타입에 `image?: string`를 추가:

```ts
  projects: {
    name: string
    description: string
    url?: string
    techStack?: string[]
    playStore?: string
    appCategory?: string
    /** Absolute URL of a real screenshot of the project. */
    image?: string
  }[],
```

같은 함수의 `common` 객체에 `image`를 추가:

```ts
      const common = {
        name: project.name,
        description: project.description,
        ...(project.url ? { url: project.url } : {}),
        ...(project.techStack?.length ? { keywords: project.techStack.join(', ') } : {}),
        ...(project.image ? { image: project.image } : {}),
        author,
      }
```

그리고 `MobileApplication` 분기에 `screenshot`을 추가한다. `schema.org`에서 `screenshot`은 `SoftwareApplication`의 고유 속성이라 앱 항목에 더 정확한 신호가 된다:

```ts
      const item = project.playStore
        ? {
            '@type': 'MobileApplication',
            ...common,
            operatingSystem: 'ANDROID',
            applicationCategory: project.appCategory ?? 'LifestyleApplication',
            installUrl: project.playStore,
            ...(project.image ? { screenshot: project.image } : {}),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : { '@type': 'CreativeWork', ...common }
```

- [ ] **Step 4: 테스트를 실행해 통과를 확인한다**

Run: `npm test -- seo`
Expected: PASS

- [ ] **Step 5: 프로젝트 페이지에서 image를 넘긴다**

`src/app/[locale]/projects/page.tsx`의 `generateProjectListJsonLd` 호출부 map 콜백에 추가. `SITE_URL` import가 없으면 `import { SITE_URL } from '@/lib/constants'`를 추가한다:

```tsx
    allProjects.map((project) => ({
      name: project.name,
      description: locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      url: project.website ?? (!project.private && project.github ? project.github : undefined),
      techStack: project.techStack,
      ...(project.screenshot ? { image: `${SITE_URL}${project.screenshot}` } : {}),
      ...(project.playStore ? { playStore: project.playStore, appCategory: APP_CATEGORY[project.slug] } : {}),
    })),
```

- [ ] **Step 6: 사이트맵에 이미지를 추가한다**

`src/app/sitemap.ts`의 `koPostUrls`와 `enPostUrls` 두 map 콜백에서, 각각 반환 객체에 `images`를 추가한다. 한국어 쪽:

```ts
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(post.coverImage ? { images: [`${SITE_URL}${post.coverImage}`] } : {}),
      alternates: { languages },
    }
```

영어 쪽도 동일하게 `...(post.coverImage ? { images: [`${SITE_URL}${post.coverImage}`] } : {}),`를 `alternates` 앞에 추가한다.

- [ ] **Step 7: OG 이미지 치수 하드코딩을 고친다**

`src/app/[locale]/blog/[slug]/page.tsx:69`가 `width: 1200, height: 630`을 항상 선언하는데, 커버 이미지는 16:9다. 잘못된 치수를 광고하면 크롤러가 카드를 잘못 렌더링한다.

`getOgImageUrl` 함수 바로 아래에 추가:

```tsx
/** Cover images ship at 16:9; the satori fallback card is 1200x630. Declaring
 *  the wrong ratio makes crawlers letterbox or crop the card badly. */
function getOgImageSize(post: { coverImage: string }) {
  return post.coverImage ? { width: 1600, height: 900 } : { width: 1200, height: 630 }
}
```

69행의 `images` 항목을 교체:

```tsx
      images: [{ ...getOgImageSize(post), url: ogImage, alt: post.title }],
```

- [ ] **Step 8: 스펙에 결정 변경을 기록한다**

스펙의 `**OG 카드 전략**` 문단에서 "히어로를 1200x630으로 크롭해 OG 이미지로 쓴다"를 다음으로 교체한다:

```markdown
**OG 카드 전략**: 히어로가 있는 포스트는 히어로를 그대로 OG 이미지로 쓰고 실제 치수(16:9)를 선언한다. 1200x630 크롭본을 따로 만들지 않는다. 파일이 두 배로 늘고 동기화 실패 지점이 생기는 데 비해, 16:9(1.78)와 트위터 요약 카드 비율(1.91)의 차이는 플랫폼이 알아서 흡수할 만큼 작다. 히어로가 없으면 기존 satori 텍스트 카드(1200x630)를 유지한다.
```

- [ ] **Step 9: 전체 검증을 실행한다**

Run: `npm test && npm run type-check && npm run lint && npm run build`
Expected: 전부 통과

- [ ] **Step 10: 커밋**

```bash
git add src/lib/seo.ts src/lib/__tests__/seo.test.ts "src/app/[locale]/projects/page.tsx" src/app/sitemap.ts "src/app/[locale]/blog/[slug]/page.tsx" docs/superpowers/specs/2026-07-25-visual-assets-seo-design.md
git commit -m "feat(seo): wire project screenshots into JSON-LD, sitemap, and OG cards"
```

---

### Task 8: 히어로 이미지 생성 및 게이트 통과분 채택

이 태스크는 Claude가 이미지를 생성하고 직접 검토한다. **자기 결과물을 자기가 심사하는 구조이므로 절차를 그대로 따른다.** Gate A는 기계가, Gate B는 서술로 강제된다.

**Files:**
- Create: `public/images/posts/<slug>.webp` (게이트 통과분만)
- Create: `scripts/to-hero-webp.ts`
- Create: `docs/media/hero-generation-report.md`
- Modify: `content/posts/ko/<slug>/index.mdx` (frontmatter `coverImage`, `coverImageAlt`)
- Modify: `content/posts/en/<slug>/index.mdx` (동일)

**Interfaces:**
- Consumes: Task 1의 파일 회수 방식, Task 3의 `npm run verify:hero`, Task 5의 `coverImageAlt` 필드
- Produces: 값이 채워진 `coverImage` 경로 — Task 7이 배선한 SEO 경로가 이 값으로 활성화된다

대상 포스트 9개: `building-dont-touch`, `building-my-homelab`, `building-sobriety-app`, `healframe-safety-pipeline`, `introducing-keystatic-cms`, `recent-builds-2026`, `rentrights-honest-estimator`, `studying-english-with-chatgpt`, `thoughts-about-giving-back`

- [ ] **Step 1: 포스트별 형태 은유를 정한다**

각 포스트의 `index.mdx`를 읽고 **형태 은유 한 줄**을 정한다. 주제를 그림으로 옮기지 않고 구조만 빌린다. 예: homelab → 층상 구조, keystatic → 격자 정렬. 9개 목록을 리포트 초안에 적는다.

- [ ] **Step 2: 포스트당 배리에이션 4장을 생성한다**

`mcp__image-studio__generate_image`를 포스트마다 호출한다. 프롬프트 템플릿:

```
abstract geometric composition, <형태 은유>, dark near-black background #0a0a0b,
single acid-green #c6f24e accent used sparingly, thin precise lines, fine film
grain, layered flat planes, editorial graphic design, non-representational,
no text, no letters, no people, no hands, no faces, no robots, no circuit
boards, no brains, no lightbulbs, no lens flare, no hexagonal HUD
```

인자: `count: 4`, `size: "1600x896"`

- [ ] **Step 3: Gate B — 반환된 썸네일을 보고 항목별로 서술한다**

각 후보 이미지마다 6개 항목에 대해 **무엇이 보이는지 한 줄씩** 쓴다. "전부 통과"라고만 쓰면 그 판정은 무효다.

1. 사람·손·얼굴·신체 일부가 있는가 → 있으면 탈락
2. 글자·텍스트·기호가 렌더링돼 있는가 → 있으면 탈락
3. 클리셰(회로기판, 뇌, 전구, 로봇, 육각형 HUD, 렌즈플레어)가 있는가 → 있으면 탈락
4. 잘림·왜곡·구조적 오류가 있는가 → 있으면 탈락
5. 워터마크·서명 흔적이 있는가 → 있으면 탈락
6. 형태 은유가 포스트 주제와 연결되는가 → 연결되지 않으면 탈락

- [ ] **Step 4: Gate B 통과분을 WebP로 변환한다**

재사용할 변환 스크립트를 만든다.

Create `scripts/to-hero-webp.ts`:

```ts
/**
 * Convert a generated image into a committable hero: 1600x900 WebP under 200KB.
 *
 * Usage: npx tsx scripts/to-hero-webp.ts <source> <slug> [quality]
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const [source, slug, qualityArg] = process.argv.slice(2)
if (!source || !slug) {
  console.error('usage: npx tsx scripts/to-hero-webp.ts <source> <slug> [quality]')
  process.exit(1)
}

const quality = qualityArg ? Number(qualityArg) : 80
const outDir = path.join(process.cwd(), 'public', 'images', 'posts')
fs.mkdirSync(outDir, { recursive: true })
const out = path.join(outDir, `${slug}.webp`)

await sharp(source).resize(1600, 900, { fit: 'cover' }).webp({ quality }).toFile(out)

const kb = fs.statSync(out).size / 1024
console.log(`${out}  ${kb.toFixed(0)}KB (quality ${quality})`)
if (kb > 200) {
  console.log('over the 200KB ceiling — rerun with a lower quality')
  process.exit(1)
}
```

Task 1에서 확인한 회수 방식으로 원본을 확보한 뒤 실행한다:

```bash
npx tsx scripts/to-hero-webp.ts <원본경로> <slug>
```

exit 1이면 quality를 70, 그래도 넘으면 60으로 낮춰 재실행한다. **60에서도 200KB를 넘으면 그 후보는 탈락 처리한다.** 이 스크립트는 Task 8 마지막에 함께 커밋한다.

- [ ] **Step 5: Gate A — 기계 검증을 실행한다**

```bash
npm run verify:hero -- public/images/posts/<slug>.webp
```

Expected: `PASS`. `FAIL`이면 그 파일을 삭제하고 같은 포스트의 다른 후보로 넘어간다. **실패 사유를 무시하고 진행하지 않는다.**

- [ ] **Step 6: Studio에 판정을 기록한다**

각 후보에 대해 `mcp__image-studio__verify_asset(id, verdict, note)`를 호출한다. `verdict`는 `'approved'` 또는 `'rejected'`, `note`에는 Gate B의 탈락 사유 또는 채택 사유를 적는다.

- [ ] **Step 7: 전량 탈락한 포스트는 1회만 재시도한다**

4장 모두 탈락하면 프롬프트에서 실패 원인을 보정해 (예: 글자가 나왔으면 `no text` 관련 문구를 강화) 4장을 다시 생성하고 Step 3~6을 반복한다.

**두 번째 시도도 전량 탈락하면 그 포스트는 히어로 없이 간다.** `coverImage`를 빈 문자열로 두고 다음 포스트로 넘어간다. 나쁜 이미지를 넣지 않는다.

- [ ] **Step 8: frontmatter를 채운다**

게이트를 통과한 포스트만, ko와 en 양쪽 `index.mdx`의 frontmatter를 수정한다:

```yaml
coverImage: "/images/posts/<slug>.webp"
coverImageAlt: "<이미지를 정직하게 서술한 문장>"
```

alt는 로케일에 맞는 언어로 쓴다. 이미지에 실제로 보이는 것만 쓴다. 포스트 제목이나 키워드를 alt에 밀어 넣지 않는다.

- [ ] **Step 9: 리포트를 작성한다**

Create `docs/media/hero-generation-report.md`. 포스트별로 형태 은유, 시도 횟수, 후보별 Gate B 서술과 판정, Gate A 출력, 최종 채택 여부와 seed, 사용한 프롬프트를 기록한다. 히어로 없이 간 포스트는 사유를 명시한다.

- [ ] **Step 10: 전체 게이트를 다시 돌리고 빌드한다**

```bash
npm run verify:hero -- public/images/posts/*.webp
npm test && npm run type-check && npm run build
```

Expected: 모든 히어로가 `PASS`, 테스트와 빌드 통과

- [ ] **Step 11: 커밋**

```bash
git add public/images/posts scripts/to-hero-webp.ts docs/media/hero-generation-report.md content/posts
git commit -m "content(media): add verified abstract hero images to blog posts"
```

---

### Task 9: 스크린샷 데이터 배선 및 성능 실측

캡처된 스크린샷 경로를 `projects.json`에 넣고, 이미지 도입이 Core Web Vitals를 역행시키지 않았는지 확인한다.

**Files:**
- Modify: `content/projects.json`
- Create: `docs/media/performance-check.md`

**Interfaces:**
- Consumes: Task 4의 캡처 결과물, Task 5의 `Project.screenshot` 필드, Task 6의 렌더링, Task 7의 JSON-LD 배선
- Produces: 없음 (최종 태스크)

- [ ] **Step 1: 캡처 성공한 slug 목록을 확인한다**

```bash
ls public/images/projects
```

- [ ] **Step 2: projects.json에 경로와 alt를 채운다**

파일이 존재하는 프로젝트에만 추가한다:

```json
  "screenshot": "/images/projects/<slug>.webp",
  "screenshotAltKo": "<한국어 서술>",
  "screenshotAltEn": "<영어 서술>"
```

alt는 스크린샷에 실제로 보이는 화면을 서술한다 (예: "Drymora 대시보드 화면. 금주 일수 카운터와 주간 기록 차트가 보인다"). 제품 설명문을 복사해 넣지 않는다. `projects.json`이 기술 사실 단일 출처라는 원칙과 어긋나지 않게, 화면에서 확인되지 않는 기능을 alt에 쓰지 않는다.

- [ ] **Step 3: 스크린샷이 실물인지 육안 확인한다**

`public/images/projects/`의 파일 몇 장을 Read로 열어 실제 제품 화면인지 확인한다. 에러 페이지, 쿠키 배너로 덮인 화면, 로그인 벽이 캡처된 파일은 삭제하고 `projects.json`에서도 뺀다. 깨진 화면을 제품 화면으로 내보내는 것은 실물 스크린샷 원칙을 지킨 것이 아니다.

- [ ] **Step 4: 빌드하고 프로덕션 모드로 띄운다**

```bash
npm run build && npm start
```

- [ ] **Step 5: 성능을 실측한다**

`/`, `/blog`, `/projects`, 히어로가 있는 포스트 상세 한 곳에 대해 Lighthouse를 돌린다:

```bash
npx lighthouse http://localhost:3000/projects --only-categories=performance --preset=desktop --quiet --chrome-flags="--headless"
```

LCP, CLS, Performance 점수를 기록한다.

- [ ] **Step 6: 결과를 기록하고 회귀를 판정한다**

Create `docs/media/performance-check.md`에 페이지별 측정값을 적는다.

**판정 기준**: CLS가 0.1을 넘거나 LCP가 2.5초를 넘으면 회귀로 본다. 회귀가 있으면 원인을 찾아 고친 뒤 재측정한다 (`sizes` 속성 부정확, `priority` 누락 또는 남용, 이미지 용량 과다가 흔한 원인이다). **회귀를 기록만 하고 넘어가지 않는다.**

- [ ] **Step 7: 커밋**

```bash
git add content/projects.json docs/media/performance-check.md
git commit -m "feat(projects): wire captured screenshots into project data"
```

---

## 완료 조건

- `npm test`, `npm run type-check`, `npm run lint`, `npm run build` 전부 통과
- `npm run verify:hero -- public/images/posts/*.webp`가 exit 0
- 히어로가 있는 포스트의 `coverImage`와 `coverImageAlt`가 ko/en 양쪽에 채워져 있음
- 스크린샷이 있는 프로젝트의 `screenshot`, `screenshotAltKo`, `screenshotAltEn`이 채워져 있음
- `docs/media/hero-generation-report.md`와 `docs/media/performance-check.md`가 존재
- CLS 0.1 이하, LCP 2.5초 이하
