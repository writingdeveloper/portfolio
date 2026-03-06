# Keystatic CMS 한국어 UX 및 글쓰기 편의성 개선

**날짜:** 2026-03-06
**상태:** 승인됨

## 목표

Keystatic CMS 에디터의 한국어 사용 경험을 개선하고, 이미지 업로드/카테고리 관리/번역 현황 확인 기능을 추가한다.

## 요구사항

1. CMS 에디터 라벨을 영어에서 한국어로 변경
2. 커버 이미지 업로드 기능 (텍스트 입력 → 이미지 필드)
3. 카테고리를 Keystatic UI에서 관리 가능한 선택 목록으로 변경
4. `/keystatic` 진입 시 미번역 포스트 배너 표시
5. Claude Code 대화로 번역 실행 (스크립트 불필요)

## 설계

### 1. keystatic.config.ts 변경

#### 한국어 라벨 + 이미지 필드 + 카테고리 select

```typescript
import { config, fields, collection, singleton } from '@keystatic/core'

const postSchema = {
  title: fields.slug({ name: { label: '제목' } }),
  excerpt: fields.text({ label: '요약', multiline: true }),
  publishedAt: fields.date({ label: '발행일' }),
  author: fields.text({ label: '작성자', defaultValue: '이시형' }),
  category: fields.select({
    label: '카테고리',
    options: [], // 런타임에 categories singleton에서 로드
    defaultValue: 'development',
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
```

#### 카테고리 Singleton

```typescript
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
}
```

#### 카테고리 연동 방식

`fields.select()`의 options는 정적이므로, categories singleton의 YAML 파일을 빌드/런타임에 읽어 options 배열을 동적으로 구성한다.

### 2. content/categories.yaml (신규)

```yaml
categories:
  - value: development
    label: Development
  - value: essay
    label: Essay
```

### 3. 이미지 저장 구조

```
public/images/posts/
  └── {이미지파일}    # fields.image()가 자동 관리
```

- `coverImage` 필드: `fields.text()` → `fields.image()`
- 기존 포스트의 `coverImage: ""` 는 빈 값으로 호환 가능
- `src/lib/mdx.ts`에서 coverImage 경로 처리 로직 최소 수정 필요

### 4. 번역 현황 배너 (src/app/keystatic/layout.tsx)

`/keystatic` 접속 시 상단에 미번역 포스트 배너 표시:

```
+--------------------------------------------------+
| 번역 필요: "new-post-title" 외 N건                |
+--------------------------------------------------+
|  Keystatic CMS 기본 UI                            |
```

구현:
- 서버 컴포넌트에서 `content/posts/ko/`와 `content/posts/en/` 비교
- 미번역 포스트가 있으면 경고 배너 렌더링
- 없으면 배너 숨김

### 5. 번역 워크플로우

- Claude Code 대화에서 수동 번역 요청
- 기존 `npm run untranslated` 스크립트는 CLI 확인용으로 유지

## 변경 파일

| 파일 | 변경 |
|------|------|
| `keystatic.config.ts` | 한국어 라벨, image 필드, select 필드, singleton 추가 |
| `content/categories.yaml` | 신규 - 카테고리 데이터 |
| `src/app/keystatic/layout.tsx` | 번역 현황 배너 추가 |
| `src/lib/mdx.ts` | coverImage 경로 처리 수정 |
| `content/posts/ko/*.mdx` | frontmatter 마이그레이션 (필요 시) |

## 비파괴적 변경

- 기존 MDX 콘텐츠 본문 변경 없음
- 블로그 프론트엔드 렌더링 최소 수정
- `coverImage: ""` 기존 포스트 호환
