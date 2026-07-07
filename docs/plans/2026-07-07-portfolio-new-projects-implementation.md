# 포트폴리오 신규 프로젝트·Play Store·SEO 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub 폴더의 최근 작업 14개를 포트폴리오에 추가하고, 살아있는 앱에 Play Store/사이트 URL을 붙이며, 폐기 3건을 `/graveyard`에 안장하고, 앱에 `MobileApplication` 구조화데이터를 더한다.

**Architecture:** `content/*.json`이 단일 출처. `Project`에 `playStore?` 필드 1개를 더하고, `ProjectCard`가 Play Store 링크를, `lib/seo.ts`가 스토어 보유 앱을 `MobileApplication`으로 방출한다. 순수 로직(seo 분기·featured 정렬)은 Vitest로 TDD, JSON 콘텐츠·카드 JSX는 빌드+렌더로 검증.

**Tech Stack:** Next.js 16(App Router), TypeScript, next-intl, Tailwind, Vitest, lucide-react.

---

## 파일 구조

- `src/types/content.ts` — `Project.playStore?` 추가 (수정)
- `src/lib/seo.ts` — `generateProjectListJsonLd` MobileApplication 분기 (수정)
- `src/lib/__tests__/seo.test.ts` — MobileApplication 케이스 (수정)
- `src/lib/projects.ts` — `sortProjectsFeaturedFirst` 순수 헬퍼 (신규)
- `src/lib/__tests__/projects.test.ts` — 정렬 테스트 (신규)
- `src/components/projects/ProjectCard.tsx` — Play Store 링크 + 인라인 아이콘 (수정)
- `src/app/[locale]/projects/page.tsx` — featured 정렬 + playStore/appCategory 전달 (수정)
- `messages/ko.json`, `messages/en.json` — `projects.googlePlay` + metaDescription 카운트 (수정)
- `content/projects.json` — 신규 14, 갱신 2, 제거 2 (수정)
- `content/graveyard.json` — tombstone 3 (수정)

---

## Task 1: 데이터 모델 — `Project.playStore?`

**Files:** Modify `src/types/content.ts:1-12`

- [ ] **Step 1: `playStore?` 필드 추가**

`Project` 인터페이스의 `github?` 아래에 추가:

```ts
export interface Project {
  name: string
  slug: string
  descriptionKo: string
  descriptionEn: string
  techStack: string[]
  status: 'active' | 'building' | 'launched' | 'archived'
  website?: string
  github?: string
  playStore?: string
  private?: boolean
  featured: boolean
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 통과(기존 코드 영향 없음 — 옵셔널 필드).

- [ ] **Step 3: Commit**

```bash
git add src/types/content.ts
git commit -m "feat(types): add optional Project.playStore field"
```

---

## Task 2: SEO — `MobileApplication` 분기 (TDD)

**Files:** Modify `src/lib/__tests__/seo.test.ts`, `src/lib/seo.ts:122-149`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/lib/__tests__/seo.test.ts`의 `describe('generateProjectListJsonLd', ...)` 안에 추가:

```ts
  it('emits a MobileApplication when playStore is present', () => {
    const result = generateProjectListJsonLd(
      [{ name: 'Drymora', description: 'Sobriety', playStore: 'https://play.google.com/store/apps/details?id=com.soursea.drymora', appCategory: 'HealthApplication', techStack: ['Next.js'] }],
      'en',
    )
    const item = result.itemListElement[0].item
    expect(item['@type']).toBe('MobileApplication')
    expect(item.operatingSystem).toBe('ANDROID')
    expect(item.applicationCategory).toBe('HealthApplication')
    expect(item.installUrl).toBe('https://play.google.com/store/apps/details?id=com.soursea.drymora')
    expect(item.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' })
    expect(item).toHaveProperty('keywords', 'Next.js')
  })

  it('defaults applicationCategory to LifestyleApplication', () => {
    const result = generateProjectListJsonLd(
      [{ name: 'X', description: 'Y', playStore: 'https://play.google.com/store/apps/details?id=x' }],
      'en',
    )
    expect(result.itemListElement[0].item.applicationCategory).toBe('LifestyleApplication')
  })

  it('keeps CreativeWork when playStore is absent', () => {
    const result = generateProjectListJsonLd([{ name: 'Web', description: 'D', url: 'https://w.dev' }], 'en')
    expect(result.itemListElement[0].item['@type']).toBe('CreativeWork')
  })
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/__tests__/seo.test.ts`
Expected: FAIL — 신규 3개 케이스에서 `@type`이 여전히 `CreativeWork`.

- [ ] **Step 3: `generateProjectListJsonLd` 구현 수정**

`src/lib/seo.ts`의 함수를 교체:

```ts
export function generateProjectListJsonLd(
  projects: { name: string; description: string; url?: string; techStack?: string[]; playStore?: string; appCategory?: string }[],
  locale: string,
) {
  const authorName = locale === 'ko' ? '이시형' : 'Si Hyeong Lee'
  const author = { '@type': 'Person', name: authorName, url: `${SITE_URL}/about` }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'ko' ? '프로젝트' : 'Projects',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => {
      const common = {
        name: project.name,
        description: project.description,
        ...(project.url ? { url: project.url } : {}),
        ...(project.techStack?.length ? { keywords: project.techStack.join(', ') } : {}),
        author,
      }
      const item = project.playStore
        ? {
            '@type': 'MobileApplication',
            ...common,
            operatingSystem: 'ANDROID',
            applicationCategory: project.appCategory ?? 'LifestyleApplication',
            installUrl: project.playStore,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : { '@type': 'CreativeWork', ...common }
      return { '@type': 'ListItem', position: index + 1, item }
    }),
  }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/__tests__/seo.test.ts`
Expected: PASS(기존 케이스 포함 전부).

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts src/lib/__tests__/seo.test.ts
git commit -m "feat(seo): emit MobileApplication JSON-LD for projects with a Play Store URL"
```

---

## Task 3: featured 우선 정렬 헬퍼 (TDD)

**Files:** Create `src/lib/projects.ts`, `src/lib/__tests__/projects.test.ts`

- [ ] **Step 1: 실패하는 테스트**

`src/lib/__tests__/projects.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sortProjectsFeaturedFirst } from '../projects'
import type { Project } from '@/types/content'

const p = (name: string, featured: boolean): Project => ({
  name, slug: name.toLowerCase(), descriptionKo: '', descriptionEn: '',
  techStack: [], status: 'active', featured,
})

describe('sortProjectsFeaturedFirst', () => {
  it('places featured projects before non-featured', () => {
    const out = sortProjectsFeaturedFirst([p('A', false), p('B', true), p('C', false), p('D', true)])
    expect(out.map((x) => x.name)).toEqual(['B', 'D', 'A', 'C'])
  })

  it('preserves original order within each group (stable)', () => {
    const out = sortProjectsFeaturedFirst([p('A', true), p('B', true), p('C', false)])
    expect(out.map((x) => x.name)).toEqual(['A', 'B', 'C'])
  })

  it('does not mutate the input array', () => {
    const input = [p('A', false), p('B', true)]
    sortProjectsFeaturedFirst(input)
    expect(input.map((x) => x.name)).toEqual(['A', 'B'])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/__tests__/projects.test.ts`
Expected: FAIL — 모듈 `../projects` 없음.

- [ ] **Step 3: 구현**

`src/lib/projects.ts`:

```ts
import type { Project } from '@/types/content'

/** featured 프로젝트를 앞으로 정렬한다. 그룹 내 원래 순서는 보존(안정 정렬). */
export function sortProjectsFeaturedFirst(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/__tests__/projects.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects.ts src/lib/__tests__/projects.test.ts
git commit -m "feat(projects): add stable featured-first sort helper"
```

---

## Task 4: ProjectCard — Play Store 링크 + 인라인 아이콘

**Files:** Modify `src/components/projects/ProjectCard.tsx`

- [ ] **Step 1: 인라인 PlayStoreIcon 추가**

`import` 아래(컴포넌트 밖)에 작은 삼각형 SVG를 정의. lucide에 브랜드 아이콘이 없어 자체 정의:

```tsx
function PlayStoreIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 2.3a1 1 0 0 0-.6.92v17.56a1 1 0 0 0 1.52.86l10.2-6.1-3.1-3.1L3.6 2.3Zm13.9 8.3-2.5-1.5-2.9 2.9 2.9 2.9 2.5-1.5a1.4 1.4 0 0 0 0-2.8ZM4.9 1.7l7.9 7.9 2.7-2.7L5.6 1.2a1 1 0 0 0-.7.5Z" />
    </svg>
  )
}
```

- [ ] **Step 2: 링크 렌더 추가**

`ProjectCard`의 링크 `<div className="flex gap-3">` 안, github 링크 블록 **다음**에 추가:

```tsx
        {project.playStore && (
          <a href={project.playStore} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
            <PlayStoreIcon /> {t('googlePlay')}
          </a>
        )}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 통과. (`t('googlePlay')`는 Task 6에서 메시지 추가 — next-intl는 런타임 키라 tsc는 통과)

- [ ] **Step 4: Commit**

```bash
git add src/components/projects/ProjectCard.tsx
git commit -m "feat(projects): show a Google Play link on cards with a Play Store URL"
```

---

## Task 5: projects 페이지 — 정렬 + JSON-LD에 playStore 전달

**Files:** Modify `src/app/[locale]/projects/page.tsx`

- [ ] **Step 1: import 추가**

상단 import에 추가:

```tsx
import { sortProjectsFeaturedFirst } from '@/lib/projects'
```

- [ ] **Step 2: appCategory 매핑 + 정렬 + JSON-LD 매핑 수정**

`ProjectsContent()` 안에서, `projectListJsonLd` 계산 부분을 교체하고 렌더용 정렬 목록을 만든다:

```tsx
  const APP_CATEGORY: Record<string, string> = {
    drymora: 'HealthApplication',
    healframe: 'HealthApplication',
    'receipt-tracker': 'FinanceApplication',
  }
  const allProjects = sortProjectsFeaturedFirst(projectsData.projects as Project[])
  const projectListJsonLd = generateProjectListJsonLd(
    allProjects.map((project) => ({
      name: project.name,
      description: locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      url: project.website ?? (!project.private && project.github ? project.github : undefined),
      techStack: project.techStack,
      ...(project.playStore ? { playStore: project.playStore, appCategory: APP_CATEGORY[project.slug] } : {}),
    })),
    locale,
  )
```

- [ ] **Step 3: 렌더 목록을 `allProjects`로 교체**

그리드 렌더 부분:

```tsx
        <div className="grid gap-6 sm:grid-cols-2">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
```

- [ ] **Step 4: 타입체크 + 빌드**

Run: `npx tsc --noEmit`
Expected: 통과.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/projects/page.tsx"
git commit -m "feat(projects): sort featured-first and pass Play Store data into JSON-LD"
```

---

## Task 6: i18n — googlePlay 라벨 + 카운트 문구

**Files:** Modify `messages/ko.json`, `messages/en.json`

- [ ] **Step 1: ko.json `projects`에 googlePlay 추가**

`messages/ko.json`의 `"projects"` 객체에서 `"viewCode": "코드 보기",` 아래 줄에 추가:

```json
    "googlePlay": "Google Play",
```

- [ ] **Step 2: ko.json `projects.metaDescription` 카운트 갱신**

`"20여 개"` → `"30여 개"`로 교체(신규 추가로 규모 반영).

- [ ] **Step 3: en.json 동일 반영**

`messages/en.json`의 `projects`에 `"googlePlay": "Google Play",` 추가하고, metaDescription의 프로젝트 개수 표현이 있으면 동일하게 상향(없으면 생략).

- [ ] **Step 4: JSON 유효성**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/ko.json','utf8'));JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));console.log('ok')"`
Expected: `ok`.

- [ ] **Step 5: Commit**

```bash
git add messages/ko.json messages/en.json
git commit -m "i18n(projects): add Google Play link label; refresh project-count copy"
```

---

## Task 7: 콘텐츠 — projects.json (신규 14 / 갱신 2 / 제거 2)

**Files:** Modify `content/projects.json`

> 설명은 각 레포 README·package.json에서 도출한 사실 기반 초안. 톤: 1인칭·기술 구체성(기존 항목과 동일).

- [ ] **Step 1: 기존 2건 갱신**

`HealFrame` 객체: `"status": "building"` → `"status": "active"`, 그리고 `"website": "https://healframe.app",` 아래에 추가:

```json
      "playStore": "https://play.google.com/store/apps/details?id=app.healframe",
```

`Receipt Tracker` 객체: `"website": "https://receo.writingdeveloper.blog",` 아래에 추가:

```json
      "playStore": "https://play.google.com/store/apps/details?id=com.soursea.receo",
```

- [ ] **Step 2: 기존 2건 제거**

`"slug": "sobriety-app"` 객체와 `"slug": "minddump"` 객체를 `projects` 배열에서 **삭제**(Task 8에서 묘지로 이동). 앞뒤 콤마 정합성 주의.

- [ ] **Step 3: 신규 14건 추가**

`projects` 배열에 아래 객체들을 추가(Drymora는 featured 그룹이 되도록 배열 앞쪽, 나머지는 순서 무방):

```json
    {
      "name": "Drymora",
      "slug": "drymora",
      "descriptionKo": "근거 기반으로 설계한 이중언어(영/스페인어) 금주 PWA이자 Android 앱. Better Auth·Drizzle·Postgres 위에 web-push 알림과 오프라인(IndexedDB) 지원을 얹고, PWA를 TWA로 감싸 Google Play에 출시했습니다. 의료기기가 아닌 일반 웰니스 도구로 포지셔닝했습니다.",
      "descriptionEn": "An evidence-based, bilingual (EN/es-US) sobriety PWA that also ships as an Android app. Built on Better Auth, Drizzle, and Postgres with web-push notifications and offline (IndexedDB) support, wrapped as a TWA and published to Google Play. Positioned as a general-wellness tool, not a medical device.",
      "techStack": ["TypeScript", "Next.js", "React", "PostgreSQL", "Drizzle ORM", "better-auth", "next-intl", "web-push", "Vitest"],
      "status": "active",
      "website": "https://drymora.writingdeveloper.blog",
      "playStore": "https://play.google.com/store/apps/details?id=com.soursea.drymora",
      "private": true,
      "featured": true
    },
    {
      "name": "FitCheck",
      "slug": "fitcheck",
      "descriptionKo": "사진 한 장을 올리면 AI가 코디를 색상·핏·사이즈·신발·상황 적합성 항목별로 솔직하게 점수 매기고 직설적으로 조언하는 웹앱. Next.js 16·React 19에 Gemini 2.5 Flash Lite 비전을 responseSchema 기반 구조화 응답으로 붙였고, 가입 없이 무료로 쓰며 업로드 사진은 저장하지 않습니다. 영·한·스페인어를 지원합니다.",
      "descriptionEn": "A web app that scores your outfit honestly from a single photo — rating color, fit, sizing, shoes, and situational appropriateness, then giving blunt advice. Next.js 16 and React 19 with Gemini 2.5 Flash Lite vision (structured responseSchema output); free, no sign-up, and uploaded photos are never stored. Trilingual EN/KO/ES.",
      "techStack": ["TypeScript", "Next.js", "React", "Google Gemini", "Tailwind CSS"],
      "status": "launched",
      "website": "https://fitcheck.writingdeveloper.blog",
      "private": true,
      "featured": false
    },
    {
      "name": "Studio Apartment",
      "slug": "studio-apartment",
      "descriptionKo": "대만의 오래된 아파트(老공우) 원베드를 1인칭으로 걸어다니는 포토리얼 워크스루. 빌드 단계 없는 순수 정적 사이트로, importmap으로 Three.js r184를 불러와 주야 사이클·문·선풍기 상호작용·PBR 텍스처를 구현했습니다. 가구·가전 3D 에셋은 자체 파이프라인(3d-asset-studio)으로 생성했습니다.",
      "descriptionEn": "A first-person, photorealistic walkthrough of an old one-bed Taiwanese apartment. A build-free static site that loads Three.js r184 via importmap, with a day/night cycle, door and fan interactions, and PBR textures. The furniture and appliance 3D assets were generated by my own pipeline (3d-asset-studio).",
      "techStack": ["JavaScript", "Three.js", "WebGL", "GLB"],
      "status": "launched",
      "website": "https://studio-apartment.vercel.app",
      "github": "https://github.com/writingdeveloper/studio-apartment",
      "private": false,
      "featured": false
    },
    {
      "name": "SiteDeck",
      "slug": "sitedeck",
      "descriptionKo": "여러 Google Analytics 4 속성의 핵심 지표를 한 화면에 요약해 주는 로컬 Electron 대시보드. OAuth 2.0 루프백으로 한 번 로그인하면 접근 가능한 모든 GA4 속성을 모아 활성 사용자·세션·핵심 이벤트를 전기 대비 Δ%와 함께 보여줍니다. MIT 오픈소스이며 5개 언어를 지원합니다. DevDeck·MarketDeck과 함께 -deck 3형제입니다.",
      "descriptionEn": "A local Electron dashboard that summarizes the key metrics of many Google Analytics 4 properties on one screen. Sign in once via OAuth 2.0 loopback and it aggregates every GA4 property you can access — active users, sessions, key events — each with a Δ% vs. the prior period. MIT open source with five UI languages; the third of the -deck family alongside DevDeck and MarketDeck.",
      "techStack": ["TypeScript", "Electron", "Google Analytics Data API", "esbuild", "Vitest"],
      "status": "active",
      "github": "https://github.com/writingdeveloper/SiteDeck",
      "private": false,
      "featured": false
    },
    {
      "name": "MarketDeck",
      "slug": "marketdeck",
      "descriptionKo": "약 40개 프로젝트 전체의 마케팅 준비도를 한 화면에서 관리하는 로컬 우선 Electron 도구. 로컬 git 레포를 스캔해 14개 결정론적 신호(README 스크린샷·데모 URL 도달성·SEO 메타·JSON-LD·CHANGELOG 신선도 등)로 0–100점과 신호등을 매기고, 준비가 덜 된 프로젝트를 먼저 정렬합니다. 계정·텔레메트리 없이 전부 로컬에서 돌아가며 MIT입니다.",
      "descriptionEn": "A local-first Electron tool that manages the marketing readiness of your whole ~40-project portfolio on one screen. It scans local git repos and scores each with 14 deterministic signals (README screenshot, demo-URL reachability, SEO meta, JSON-LD, CHANGELOG freshness…), producing a 0–100 score and a traffic light, sorting the least-ready first. No accounts, no telemetry — all local, MIT.",
      "techStack": ["TypeScript", "Electron", "Model Context Protocol", "Playwright", "esbuild", "Vitest"],
      "status": "active",
      "private": false,
      "featured": false
    },
    {
      "name": "Liminal Bestiary",
      "slug": "liminal-bestiary",
      "descriptionKo": "순수 Three.js 지오메트리만으로 절차 생성한 로우폴리 백룸 공포 크리처 6종 갤러리. Blender도 텍스처도 없이, 검색 가능한 카드에서 크리처를 골라 안개 낀 공허 속 뷰어로 감상하고, 너무 가까이서 오래 바라보면 크리처별 점프스케어 시퀀스가 발동합니다. 각 크리처는 재사용 가능한 .glb로 내보낼 수 있습니다.",
      "descriptionEn": "A gallery of six procedurally-generated low-poly Backrooms horror creatures, built from pure Three.js geometry — no Blender, no textures. Browse searchable cards, drop a creature into a fog-filled void viewer, and stare too long up close to trigger its per-creature jumpscare. Every creature exports as a reusable .glb.",
      "techStack": ["TypeScript", "Three.js", "WebGL", "Vite", "Playwright"],
      "status": "launched",
      "website": "https://liminal-bestiary.vercel.app",
      "private": false,
      "featured": false
    },
    {
      "name": "ClipShrink",
      "slug": "clipshrink",
      "descriptionKo": "픽픽 등으로 캡처한 이미지가 디스코드 무료 업로드 한도(10MB)를 넘으면 클립보드 이미지를 자동 압축해 바로 붙여넣게 해주는 Windows 트레이 상주 프로그램. 해상도를 유지한 채 WebP→JPEG 순으로 9.5MB 이하까지 낮추고, 그래도 크면 단계적으로 축소합니다. Python·MIT·다국어(영/한/스페인어).",
      "descriptionEn": "A Windows tray app that auto-compresses clipboard images when a screenshot exceeds Discord's 10 MB free-upload limit, so you can paste and upload immediately. It keeps resolution and steps WebP→JPEG down to ≤9.5 MB, scaling resolution only if needed. Python, MIT, multilingual (EN/KO/ES).",
      "techStack": ["Python", "Pillow", "pystray", "PyInstaller"],
      "status": "active",
      "github": "https://github.com/writingdeveloper/ClipShrink",
      "private": false,
      "featured": false
    },
    {
      "name": "YouTube Rhythm Game",
      "slug": "youtube-rhythm-game",
      "descriptionKo": "유튜브 URL을 넣으면 오디오를 추출·분석해 브라우저에서 플레이하는 낙하 레인 리듬게임으로 만들어 주는 도구. yt-dlp로 오디오를 뽑고 librosa로 BPM·비트·온셋을 분석해 채보 JSON을 만든 뒤 Web Audio API로 재생합니다. FastAPI 백엔드 + 웹 프런트, 개인 사용·오픈소스 목적.",
      "descriptionEn": "A tool that turns any YouTube URL into a falling-lane rhythm game you play in the browser. It pulls audio with yt-dlp, analyzes BPM/beats/onsets with librosa to build a chart JSON, then plays it back via the Web Audio API. FastAPI backend + web frontend; personal-use and open source.",
      "techStack": ["Python", "FastAPI", "librosa", "yt-dlp", "TypeScript", "Web Audio API"],
      "status": "building",
      "github": "https://github.com/writingdeveloper/youtube-rhythm-game",
      "private": false,
      "featured": false
    },
    {
      "name": "Unclog LA",
      "slug": "unclog-la",
      "descriptionKo": "차 중심의 LA를 대중교통 도시로 바꿔 보는 브라우저 시뮬레이터. deck.gl·MapLibre로 실제 지도 위에 노선과 3D 차량 메시를 렌더링하고, Neon Postgres를 데이터 레이어로 씁니다. Vite·Zustand로 만들었습니다.",
      "descriptionEn": "A browser simulator for turning car-centric LA into a transit city. It renders lines and 3D vehicle meshes over a real map with deck.gl and MapLibre, backed by Neon Postgres as the data layer. Built with Vite and Zustand.",
      "techStack": ["TypeScript", "deck.gl", "MapLibre GL", "Neon", "Zustand", "Vite"],
      "status": "launched",
      "website": "https://unclog-la.vercel.app",
      "github": "https://github.com/writingdeveloper/unclog-la",
      "private": false,
      "featured": false
    },
    {
      "name": "shipwright",
      "slug": "shipwright",
      "descriptionKo": "여러 MVP를 빠르게 찍어내기 위해 직접 조립해 '소유'하는 AI-native Next.js + Turborepo 스타터. 임대형 SaaS 보일러플레이트도 블랙박스 포크도 아니라, Next.js·Drizzle·Better Auth·Stripe·shadcn/ui 같은 검증된 라이브러리를 pnpm 제너레이터로 필요한 만큼만 조립합니다. 루트 CLAUDE.md와 .claude/ 스킬·서브에이전트로 Claude Code가 몰기 좋게 설계했습니다. 오픈소스.",
      "descriptionEn": "An AI-native Next.js + Turborepo starter you assemble and own for shipping many MVPs fast — not a rented SaaS boilerplate, not a black-box fork. You wire vetted libraries (Next.js, Drizzle, Better Auth, Stripe, shadcn/ui) with pnpm generators, composing only what you need. Built to be driven by Claude Code via a root CLAUDE.md and a .claude/ directory of skills and subagents. Open source.",
      "techStack": ["TypeScript", "Next.js", "Turborepo", "Drizzle ORM", "better-auth", "shadcn/ui", "pnpm"],
      "status": "building",
      "github": "https://github.com/writingdeveloper/shipwright",
      "private": false,
      "featured": false
    },
    {
      "name": "Kindling",
      "slug": "kindling",
      "descriptionKo": "감정을 익명으로 쏟아내는 PWA(Minddump의 후속). shipwright 스타터 위에 Better Auth·오프라인 PWA·파일 업로드를 얹어 만들었고, 'Kindling: Vent Anonymously'로 Google Play 출시를 준비 중입니다.",
      "descriptionEn": "An anonymous venting PWA — the successor to Minddump. Built on the shipwright starter with Better Auth, an offline PWA shell, and file upload, with a Google Play release ('Kindling: Vent Anonymously') in preparation.",
      "techStack": ["TypeScript", "Next.js", "Turborepo", "Drizzle ORM", "better-auth", "PWA"],
      "status": "building",
      "website": "https://kindling.writingdeveloper.blog",
      "private": true,
      "featured": false
    },
    {
      "name": "3d-asset-studio",
      "slug": "3d-asset-studio",
      "descriptionKo": "이미지나 텍스트를 넣으면 게임용 텍스처 3D 에셋(.glb)을 로컬에서 생성하는 파이프라인. RTX 4080 SUPER에서 Hunyuan3D 2.1 + ComfyUI로 구동하고, SDXL→rembg→Hunyuan3D 경로와 자동 품질 게이트(메트릭·albedo 추출·다각도 contact sheet 검수)를 Claude Code로 오케스트레이션합니다. Studio Apartment의 3D 에셋 공급원.",
      "descriptionEn": "A local pipeline that turns an image or text prompt into a game-ready textured 3D asset (.glb). It runs Hunyuan3D 2.1 + ComfyUI on an RTX 4080 SUPER, orchestrating an SDXL→rembg→Hunyuan3D path and an automated quality gate (metrics, albedo extraction, multi-angle contact-sheet review) with Claude Code. The asset source behind Studio Apartment.",
      "techStack": ["Python", "ComfyUI", "Hunyuan3D", "PowerShell", "Playwright"],
      "status": "building",
      "private": true,
      "featured": false
    },
    {
      "name": "ai-4080-ops",
      "slug": "ai-4080-ops",
      "descriptionKo": "4080 AI 서버(Tailscale)에 SSH로 접속해 작업을 처리하는 운영 툴킷. PowerShell 코드를 EncodedCommand로 안전하게 원격 전송하는 래퍼, ssh 별칭 멱등 설치, GPU·포트·Funnel·Caddy 상태 점검 스크립트를 갖췄고 Claude Code 세션에서 바로 4080을 다루도록 설계했습니다. 내부용.",
      "descriptionEn": "An operations toolkit for driving my 4080 AI server over SSH (via Tailscale). It ships a wrapper that sends PowerShell safely as an EncodedCommand, idempotent ssh-alias setup, and status checks for GPU/ports/Funnel/Caddy — designed so a Claude Code session can operate the box directly. Internal tooling.",
      "techStack": ["PowerShell", "SSH", "Tailscale", "Caddy"],
      "status": "active",
      "private": true,
      "featured": false
    },
    {
      "name": "nag-coach",
      "slug": "nag-coach",
      "descriptionKo": "무시하면 더 집요해지는 삐진 AI 코치. 고정 시간에 짧은 운동 미션을 던지고 안 하면 점점 집요하게 재촉하는 디스코드 기반 압박 봇으로, 폰은 버튼·워치는 음성 자연어로 이중 응답하고 스트릭·에스컬레이션·셀프체크를 갖췄습니다. Python·discord.py·Claude(Haiku).",
      "descriptionEn": "A sulky AI coach that gets more persistent the more you ignore it. A Discord-based accountability bot that fires short workout missions on a schedule and escalates its nagging when you skip — with dual input (phone = buttons, watch = spoken natural language), streaks, escalation, and self-check. Python, discord.py, Claude (Haiku).",
      "techStack": ["Python", "discord.py", "APScheduler", "Claude", "SQLite"],
      "status": "building",
      "private": true,
      "featured": false
    },
```

- [ ] **Step 4: JSON 유효성 + 슬러그 유일성**

Run:
```bash
node -e "const d=require('./content/projects.json');const s=d.projects.map(p=>p.slug);const dup=s.filter((x,i)=>s.indexOf(x)!==i);if(dup.length)throw new Error('dup slugs: '+dup);if(s.includes('sobriety-app')||s.includes('minddump'))throw new Error('removed slug still present');console.log('projects ok:',s.length)"
```
Expected: `projects ok: 32` (기존 20 − 2 + 14).

- [ ] **Step 5: 잔여 참조 확인**

Run: `git grep -n "sobriety-app\|\"minddump\"" -- ':!content/graveyard.json' ':!docs'`
Expected: 결과 없음(제거된 slug를 참조하는 코드/리다이렉트 없음). 있으면 개별 검토.

- [ ] **Step 6: Commit**

```bash
git add content/projects.json
git commit -m "content(projects): add 14 projects, Play Store URLs for HealFrame/Receipt Tracker, drop entombed apps"
```

---

## Task 8: 콘텐츠 — graveyard.json (tombstone 3)

**Files:** Modify `content/graveyard.json`

> `bornAt`/`diedAt`은 **연도 문자열**(`formatLifespan` 계약). 비문·회고는 사실 기반 초안 — 사용자가 이후 개선.

- [ ] **Step 1: tombstone 3건 추가**

`content/graveyard.json`을 아래로 교체:

```json
{
  "tombstones": [
    {
      "name": "Sobriety App",
      "slug": "sobriety-app",
      "bornAt": "2026",
      "diedAt": "2026",
      "causeOfDeath": "pivoted",
      "epitaphKo": "돈을 걸고 셀피로 증명하던 금주 앱. 스테이크는 자선으로, 코드는 Drymora로.",
      "epitaphEn": "A sobriety app where you staked money and proved it with a selfie. The stake went to charity; the code went to Drymora.",
      "retroKo": "Expo + Fastify 모노레포에 Stripe Connect 비수탁 스테이크 구조까지 313개 테스트로 갖췄지만, 실사용 흐름을 다시 그리며 PWA인 Drymora로 재구축했습니다. 아키텍처를 갈아엎은 결정 자체는 옳았다고 봅니다.",
      "retroEn": "I got as far as an Expo + Fastify monorepo with a non-custodial Stripe Connect stake flow under 313 tests, but rebuilt the whole thing as a PWA (Drymora) while redrawing the real usage flow. Rewriting the architecture was the right call.",
      "techStack": ["TypeScript", "Expo", "React Native", "Fastify", "Stripe Connect", "Clerk"],
      "private": true
    },
    {
      "name": "Minddump",
      "slug": "minddump",
      "bornAt": "2026",
      "diedAt": "2026",
      "causeOfDeath": "pivoted",
      "epitaphKo": "감정을 3D 화염으로 태우던 앱. 불씨는 Kindling으로 옮겨붙었다.",
      "epitaphEn": "An app that burned your feelings in a 3D fire. The embers caught on Kindling.",
      "retroKo": "React Three Fiber와 Blender 파이프라인으로 burn 연출까지 만들고 Play Store 리스팅도 올렸지만 결국 삭제했습니다. 익명 감정 배출이라는 핵심만 남겨 shipwright 기반의 Kindling으로 다시 시작했습니다.",
      "retroEn": "I built the burn effect with React Three Fiber and a Blender pipeline and even put up a Play Store listing, but ultimately took it down. I kept only the core — anonymous emotional release — and restarted as Kindling on the shipwright starter.",
      "techStack": ["TypeScript", "Turborepo", "Next.js", "Expo", "Three.js", "React Three Fiber"],
      "website": "https://minddump-seven.vercel.app",
      "private": true
    },
    {
      "name": "rockgaze",
      "slug": "rockgaze",
      "bornAt": "2026",
      "diedAt": "2026",
      "causeOfDeath": "lost-interest",
      "epitaphKo": "힐링을 노렸지만, 정작 힐링되지 않았다.",
      "epitaphEn": "It aimed for healing but never quite healed.",
      "retroKo": "수묵 감성의 명상형 성장 게임으로 기획해 이틀 만에 135커밋을 쏟았지만, 조작감이 의도한 '실질적인 힐링감'을 끝내 살리지 못했습니다. 마음이 다른 게임들로 옮겨가며 추진력을 잃었습니다.",
      "retroEn": "I poured 135 commits into it in two days as a meditative, ink-wash growth game, but the controls never delivered the 'actually healing' feel I was after. My attention drifted to other games and it lost momentum.",
      "techStack": ["TypeScript", "Three.js", "WebGL", "Vite"],
      "website": "https://rockgaze.vercel.app",
      "private": true
    }
  ]
}
```

- [ ] **Step 2: JSON 유효성 + 스키마 확인**

Run: `npx vitest run src/lib/__tests__/graveyard.test.ts`
Expected: PASS(형태 계약 유지). 추가로:
```bash
node -e "const d=require('./content/graveyard.json');d.tombstones.forEach(t=>['name','slug','bornAt','diedAt','causeOfDeath','epitaphKo','epitaphEn','retroKo','retroEn','techStack'].forEach(k=>{if(t[k]===undefined)throw new Error(t.slug+' missing '+k)}));console.log('tombstones ok:',d.tombstones.length)"
```
Expected: `tombstones ok: 3`.

- [ ] **Step 3: Commit**

```bash
git add content/graveyard.json
git commit -m "content(graveyard): entomb Sobriety App, Minddump, and rockgaze"
```

---

## Task 9: 통합 검증

**Files:** 없음(검증만)

- [ ] **Step 1: 전체 테스트**

Run: `npx vitest run`
Expected: 전부 PASS.

- [ ] **Step 2: 타입체크 + 프로덕션 빌드**

Run: `npm run build`
Expected: 빌드 성공(라우트 `/`, `/projects`, `/graveyard`, `/en/*` prerender).

- [ ] **Step 3: 렌더 확인(dev)**

`npm run dev` 후 확인:
- `/projects` — featured 6개(Drymora 포함)가 상단, 카드 총 32개, Play Store 링크가 Drymora·HealFrame·Receipt Tracker에 노출
- `/graveyard` — tombstone 3개 렌더, 수명 "2026"
- 페이지 소스에서 `application/ld+json`에 `"@type":"MobileApplication"` 3건 존재

- [ ] **Step 4: 스크린샷(선택)**

`/projects`, `/graveyard`를 캡처해 사용자에게 공유.

- [ ] **Step 5: 최종 정리 커밋(있으면)**

```bash
git add -A && git commit -m "chore(portfolio): verification pass for new projects & graveyard" || echo "nothing to commit"
```

---

## 자체 리뷰 체크리스트 결과

- **스펙 커버리지:** playStore 필드(T1)·MobileApplication(T2)·카드 배지(T4)·featured 정렬(T3/T5)·i18n(T6)·신규14/갱신2/제거2(T7)·안장3(T8) — 스펙 §1–5 전부 태스크에 매핑됨.
- **플레이스홀더:** 코드·JSON 전부 실제 값. 설명은 사실 기반 완성 초안(리뷰 대상).
- **타입 일관성:** `sortProjectsFeaturedFirst`(T3=T5), `generateProjectListJsonLd` 확장 시그니처(T2=T5), `playStore` 필드명(T1·T4·T5·T7) 일치.

## 열린 항목(구현 후 사용자 확인)

1. 묘지 비문·회고 3건 문구 개선.
2. **MarketDeck**: `github` 필드 없음(미푸시). 푸시하면 `"github": "https://github.com/writingdeveloper/MarketDeck"` 추가.
3. **nag-coach** 설명은 README(운동 압박봇) 기준 — opsdeck 통합으로 범위가 늘었다면 문구 보완.
4. featured=6 확정(홈 3×2). 5로 원하면 1건 강등.
5. 신규 Ko/En 설명 실제 diff 최종 확인.
