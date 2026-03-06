# Keystatic CMS 한국어 UX 개선 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keystatic CMS 에디터를 한국어화하고, 이미지 업로드/카테고리 관리/번역 현황 배너 기능을 추가한다.

**Architecture:** keystatic.config.ts에서 라벨 한국어화 + 필드 타입 변경, 카테고리를 singleton으로 분리하여 동적 select 옵션 구성, layout.tsx에서 파일시스템 비교로 미번역 배너 렌더링.

**Tech Stack:** Keystatic CMS, Next.js App Router, TypeScript, gray-matter, MDX

---

### Task 1: 카테고리 데이터 파일 생성

**Files:**
- Create: `content/categories.yaml`

**Step 1: 카테고리 YAML 파일 생성**

```yaml
categories:
  - value: development
    label: Development
  - value: essay
    label: Essay
```

**Step 2: 커밋**

```bash
git add content/categories.yaml
git commit -m "feat: add categories data file for Keystatic singleton"
```

---

### Task 2: keystatic.config.ts 한국어화 + 필드 변경

**Files:**
- Modify: `keystatic.config.ts`

**Step 1: 카테고리 YAML 읽기 + 한국어 라벨 + image 필드 + select 필드 + singleton 추가**

카테고리 파일을 읽어 `fields.select()` options로 변환한다. `fields.select()`는 정적 options 배열이 필요하므로 config 파일 평가 시점에 YAML을 읽는다.

```typescript
import { config, fields, collection, singleton } from '@keystatic/core'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// 카테고리 YAML에서 select options 동적 로드
function loadCategoryOptions(): { value: string; label: string }[] {
  try {
    const filePath = path.join(process.cwd(), 'content', 'categories.yaml')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = yaml.load(raw) as { categories: { value: string; label: string }[] }
    return data.categories || []
  } catch {
    return [{ value: 'development', label: 'Development' }]
  }
}

const categoryOptions = loadCategoryOptions()

const postSchema = {
  title: fields.slug({ name: { label: '제목' } }),
  excerpt: fields.text({ label: '요약', multiline: true }),
  publishedAt: fields.date({ label: '발행일' }),
  author: fields.text({ label: '작성자', defaultValue: '이시형' }),
  category: fields.select({
    label: '카테고리',
    options: categoryOptions,
    defaultValue: categoryOptions[0]?.value || 'development',
  }),
  tags: fields.array(fields.text({ label: '태그' }), {
    label: '태그 목록',
    itemLabel: (props) => props.value,
  }),
  coverImage: fields.image({
    label: '커버 이미지',
    directory: 'public/images/posts',
    publicPath: '/images/posts/',
  }),
  content: fields.mdx({ label: '본문' }),
}

export default config({
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: 'github', repo: 'writingdeveloper/portfolio' }
    : { kind: 'local' },
  ui: {
    brand: { name: '블로그 관리' },
  },
  collections: {
    'posts-ko': collection({
      label: '포스트 (한국어)',
      slugField: 'title',
      path: 'content/posts/ko/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    'posts-en': collection({
      label: '포스트 (English)',
      slugField: 'title',
      path: 'content/posts/en/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
  singletons: {
    categories: singleton({
      label: '카테고리 관리',
      path: 'content/categories',
      schema: {
        categories: fields.array(
          fields.object({
            value: fields.text({ label: '값 (영문, URL용)' }),
            label: fields.text({ label: '표시 이름' }),
          }),
          {
            label: '카테고리 목록',
            itemLabel: (props) => props.fields.label.value,
          }
        ),
      },
    }),
  },
})
```

**Step 2: js-yaml 의존성 설치**

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

**Step 3: dev 서버 실행 후 /keystatic 접속하여 확인**

```bash
npm run dev
```

확인사항:
- 모든 라벨이 한국어로 표시되는지
- 카테고리 필드가 드롭다운인지
- 커버 이미지 필드에 업로드 UI가 있는지
- '카테고리 관리' singleton이 사이드바에 표시되는지
- 카테고리 singleton에서 항목 추가/삭제 가능한지

**Step 4: 커밋**

```bash
git add keystatic.config.ts package.json package-lock.json
git commit -m "feat: Korean labels, image upload, category select in Keystatic"
```

---

### Task 3: 기존 포스트 frontmatter 마이그레이션

**Files:**
- Modify: `content/posts/ko/introducing-keystatic-cms.mdx`
- Modify: `content/posts/ko/studying-english-with-chatgpt.mdx`
- Modify: `content/posts/ko/thoughts-about-giving-back.mdx`
- Modify: `content/posts/en/introducing-keystatic-cms.mdx`
- Modify: `content/posts/en/studying-english-with-chatgpt.mdx`
- Modify: `content/posts/en/thoughts-about-giving-back.mdx`

**Step 1: 각 포스트의 category 값을 소문자 value로 변경**

기존: `category: "Development"` → 변경: `category: development`
기존: `category: "Essay"` → 변경: `category: essay`

`coverImage: ""` 는 그대로 유지 (image 필드와 호환).

**Step 2: 커밋**

```bash
git add content/posts/
git commit -m "chore: migrate post categories to lowercase values"
```

---

### Task 4: src/lib/mdx.ts coverImage 호환 처리

**Files:**
- Modify: `src/lib/mdx.ts:70`

**Step 1: coverImage 필드 처리 수정**

`fields.image()`는 이미지 경로를 상대 경로로 저장한다. 기존 빈 문자열과 새 경로 모두 처리하도록 수정.

`src/lib/mdx.ts` 70행 부근:
```typescript
// 기존
coverImage: data.coverImage || '',
// 변경
coverImage: data.coverImage || '',
```

실제로 현재 `coverImage: data.coverImage || ''` 로직은 문자열이면 그대로 반환하므로 변경 불필요. 다만 `page.tsx:30-31`에서 ogImage 경로 처리 확인 필요.

`src/app/[locale]/blog/[slug]/page.tsx:30-31` 확인:
```typescript
const ogImage = post.coverImage || `${SITE_URL}/api/og?...`
```

`fields.image()`가 저장하는 경로는 `/images/posts/filename.jpg` 형식이므로 절대 URL로 변환 필요:

```typescript
// 변경
const ogImage = post.coverImage
  ? (post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`)
  : `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}`
```

이 수정을 `generateMetadata`와 렌더링 함수 양쪽에 적용.

**Step 2: 커밋**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "fix: handle coverImage path from Keystatic image field"
```

---

### Task 5: 카테고리 표시 로직 수정

**Files:**
- Modify: `src/lib/mdx.ts:112-116` (getCategories 함수)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx:118-120` (카테고리 표시)

**Step 1: getCategories를 categories.yaml에서 읽도록 수정**

```typescript
export function getCategories(_locale: string = 'ko'): string[] {
  try {
    const filePath = path.join(process.cwd(), 'content', 'categories.yaml')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = yaml.load(raw) as { categories: { value: string; label: string }[] }
    return (data.categories || []).map((c) => c.label)
  } catch {
    return []
  }
}
```

`js-yaml` import 추가:
```typescript
import yaml from 'js-yaml'
```

**Step 2: 포스트 상세 페이지에서 카테고리 value → label 변환**

카테고리 value(소문자)를 label(표시용)로 매핑하는 유틸 추가:

```typescript
export function getCategoryLabel(value: string): string {
  try {
    const filePath = path.join(process.cwd(), 'content', 'categories.yaml')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = yaml.load(raw) as { categories: { value: string; label: string }[] }
    const found = (data.categories || []).find((c) => c.value === value)
    return found?.label || value
  } catch {
    return value
  }
}
```

`page.tsx`에서 `post.category` 표시 부분:
```typescript
// 기존
{post.category}
// 변경
{getCategoryLabel(post.category)}
```

**Step 3: CategoryFilter 컴포넌트도 label 사용하도록 확인**

CategoryFilter가 받는 categories props가 label 배열인지 확인하고 필요시 수정.

**Step 4: 커밋**

```bash
git add src/lib/mdx.ts src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: read categories from YAML, display labels in blog"
```

---

### Task 6: 번역 현황 배너 (Keystatic layout)

**Files:**
- Modify: `src/app/keystatic/layout.tsx`
- Create: `src/lib/translation-status.ts`

**Step 1: 번역 상태 유틸 함수 생성**

```typescript
// src/lib/translation-status.ts
import fs from 'fs'
import path from 'path'

export interface TranslationStatus {
  translated: string[]
  untranslated: string[]
}

export function getTranslationStatus(): TranslationStatus {
  const postsDir = path.join(process.cwd(), 'content', 'posts')
  const koDir = path.join(postsDir, 'ko')
  const enDir = path.join(postsDir, 'en')

  const getMdxFiles = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
  }

  const koFiles = getMdxFiles(koDir)
  const enFiles = new Set(getMdxFiles(enDir))

  return {
    translated: koFiles.filter((f) => enFiles.has(f)).map((f) => f.replace('.mdx', '')),
    untranslated: koFiles.filter((f) => !enFiles.has(f)).map((f) => f.replace('.mdx', '')),
  }
}
```

**Step 2: layout.tsx에 배너 추가**

```tsx
// src/app/keystatic/layout.tsx
import KeystaticApp from './keystatic'
import { getTranslationStatus } from '@/lib/translation-status'

function TranslationBanner() {
  const { untranslated } = getTranslationStatus()
  if (untranslated.length === 0) return null

  const names = untranslated.slice(0, 3).join(', ')
  const extra = untranslated.length > 3 ? ` 외 ${untranslated.length - 3}건` : ''

  return (
    <div style={{
      padding: '10px 16px',
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontSize: '14px',
      borderBottom: '1px solid #fcd34d',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ fontSize: '16px' }}>&#9888;</span>
      <span>
        <strong>번역 필요:</strong> {names}{extra} ({untranslated.length}건)
      </span>
    </div>
  )
}

export default function KeystaticLayout() {
  return (
    <html>
      <body>
        <TranslationBanner />
        <KeystaticApp />
      </body>
    </html>
  )
}
```

**Step 3: dev 서버에서 배너 동작 확인**

- 모든 포스트가 번역된 상태 → 배너 숨김
- 한국어 포스트 추가 후 영어 번역 없으면 → 배너 표시

**Step 4: 커밋**

```bash
git add src/lib/translation-status.ts src/app/keystatic/layout.tsx
git commit -m "feat: add translation status banner to Keystatic layout"
```

---

### Task 7: 빌드 검증

**Files:** (없음, 검증만)

**Step 1: 빌드 테스트**

```bash
npm run build
```

Expected: 빌드 성공, 에러 없음

**Step 2: lint 검사**

```bash
npm run lint
```

Expected: 에러 없음

**Step 3: 최종 커밋 (필요 시)**

빌드/lint 오류 수정 후 커밋.
