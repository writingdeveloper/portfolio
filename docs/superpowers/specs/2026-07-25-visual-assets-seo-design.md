# 시각 에셋 도입 설계 (이미지 1단계)

작성일: 2026-07-25

## 배경

포트폴리오 사이트는 현재 완전한 텍스트 사이트다. `public/`에는 폰트 1개와 `og-default.svg`만 있고, 프로젝트 32개와 블로그 포스트 9개 어디에도 이미지가 없다. OG 이미지는 `/api/og`에서 satori로 제목과 설명만 담은 텍스트 카드를 동적 생성한다.

Studio(image-studio 등) MCP로 고품질 에셋 생성이 가능해지면서, 이를 사이트에 도입해 SEO·GEO 개선과 시각적 풍부함을 함께 얻을 수 있는지 검토했다.

## 기대 효과에 대한 사실 정리

에셋 도입의 효과는 목표별로 크게 다르다. 과대평가를 막기 위해 명시한다.

| 목표 | 실제 효과 |
| --- | --- |
| SEO (구글) | 간접적. 이미지 자체는 랭킹 요인이 약하다. 실제 경로는 ① 이미지 사이트맵 + alt 텍스트를 통한 이미지 검색 유입 ② 체류시간·이탈률 개선 ③ Discover 노출 자격 |
| GEO (AI 답변엔진) | 거의 없음. AI 크롤러는 텍스트와 구조화 데이터를 소비한다. `llms.txt`는 손대지 않는다 |
| 소셜 CTR | 가장 큼. 현재 OG가 텍스트뿐이라 이미지 카드 전환의 실질 개선폭이 크다 |
| 시각적 풍부함 | 직접적. 단 Builder's Ledger 아이덴티티(near-black + acid-green)와 어긋나면 순손실 |

## 결정 사항

### 1. 에셋 진정성 원칙

실제 출시된 제품의 UI는 **실물 스크린샷만** 사용한다. AI로 생성한 "스크린샷처럼 보이는" 이미지는 허위 표현이므로 금지한다. Studio 생성물은 제품과 무관한 영역(블로그 히어로, 추상 배경)에만 쓴다.

이는 기존 편집 원칙(`projects.json` = 기술 사실 단일 출처, 발명 금지)의 연장이다.

### 2. 범위

1단계(이미지)만 진행한다. 영상 데모와 음성 낭독판은 이번 범위에서 제외한다.

### 3. 아트 디렉션

블로그 히어로는 **추상 기하·텍스처** 방향으로 간다.

- 고정 요소: near-black 배경, acid-green 단일 액센트, 그리드/노이즈/물질감, 16:9, 비구상
- 금지 요소: 사람, 손, 얼굴, 로봇, 회로기판, 뇌, 전구, 육각형 HUD, 렌즈플레어
- 포스트별 변주는 형태 은유만 사용한다 (예: homelab → 층상 구조, keystatic → 격자 정렬)

### 4. 저장 방식

정적 커밋 방식을 택한다. 이미지를 리포에 커밋하고 `next/image`로 서빙한다.

Vercel Blob 등 원격 스토리지는 40여 장 규모에서 `remotePatterns`·CSP 수정·외부 의존이라는 복잡도만 추가하고 이점이 없다. 런타임 동적 생성(satori 확장)은 추상 텍스처와 실물 스크린샷을 만들 수 없어 방향과 맞지 않는다.

**경로 규약은 기존 Keystatic 설정을 따른다.** `keystatic.config.ts`에 이미 `directory: 'public/images/posts'`, `publicPath: '/images/posts/'`가 설정돼 있다. 새 디렉터리 규약을 만들지 않는다.

- 블로그 히어로: `public/images/posts/<slug>.webp`
- 프로젝트 스크린샷: `public/images/projects/<slug>.webp`

**소스 포맷은 WebP로 커밋한다.** `next.config.ts`의 `images.formats`가 `['image/avif', 'image/webp']`이므로 AVIF 변환은 `next/image`가 런타임에 처리한다. 리포에 AVIF를 직접 커밋할 필요가 없다.

생성물(PNG)과 캡처물(PNG)을 WebP로 압축하는 단계가 필요하므로 `sharp`와 `playwright`를 devDependency로 추가한다.

## 파이프라인

성격이 다른 두 갈래를 분리한다.

### A. 프로젝트 스크린샷 (재현 가능한 자동화)

`scripts/capture-screenshots.ts`

- `content/projects.json`에서 `website`가 있는 항목만 대상
- Playwright headless, 1440x900 뷰포트, `prefers-color-scheme: dark`로 사이트 톤에 맞춤
- 출력: `public/images/projects/<slug>.avif`
- **실패는 스킵하고 리포트에 기록한다.** 죽은 링크와 로그인 벽이 있는 프로젝트가 32개 중 상당수일 것이므로 전량 성공을 전제하지 않는다
- `private: true` 프로젝트도 `website`가 공개면 캡처 대상이다 (Private 배지는 코드 링크만 숨기는 규칙이므로 충돌하지 않는다)

### B. 블로그 히어로 (생성 + 자동 검토 게이트)

Claude가 `image-studio` MCP로 생성하고 직접 검토한다. 자기 결과물을 자기가 검토하는 구조는 통과 편향에 빠지기 쉬우므로, **주 방어선을 주관적 판단이 아니라 기계 검증에 둔다.**

#### Gate A: 기계 검증

`scripts/verify-hero.ts`가 이미지 파일을 분석한다. 판정이 숫자로 나오므로 통과 도장을 찍을 수 없다.

기준값은 `src/app/globals.css`의 실제 토큰에서 가져온다. 배경 `--bg-primary: #0a0a0b`, 액센트 `--accent-text: #c6f24e` (HSL 기준 hue 약 76도).

- 해상도·비율: 16:9, 폭 1600px 이상
- 팔레트 준수 (HSL 변환 후 픽셀 분류)
  - 지배색이 near-black 대역인가: L < 15%인 픽셀이 전체의 50% 이상
  - acid-green 대역(hue 60~95도, S >= 40%, L 40~80%) 픽셀 비율이 0.5~15% 구간인가
  - 이탈 색상(위 두 대역 밖이면서 S >= 40%인 픽셀) 비율이 3% 미만인가
- 파일 크기: WebP 200KB 이하

팔레트 판정 로직은 순수 함수로 분리해 단위 테스트한다.

#### Gate B: 시각 판정

Claude가 `generate_image` 응답의 썸네일을 실제로 보고 판정한다. 체크리스트는 통과 편향을 피하기 위해 **탈락 조건(부정형)** 으로 구성한다.

1. 사람·손·얼굴·신체 일부가 있는가 → 탈락
2. 글자·텍스트·기호가 렌더링돼 있는가 → 탈락 (AI 이미지 최대 실패 지점)
3. 클리셰(회로기판, 뇌, 전구, 로봇, 육각형 HUD, 렌즈플레어)가 있는가 → 탈락
4. 잘림·왜곡·구조적 오류가 있는가 → 탈락
5. 워터마크·서명 흔적이 있는가 → 탈락
6. 포스트 주제와 형태 은유가 연결되는가 → 유일한 긍정 항목

**각 이미지마다 6개 항목에 대해 무엇이 보이는지 한 줄씩 서술한 뒤 판정한다.** "전부 통과"라고만 기록하는 것은 금지하며, 서술이 없는 판정은 무효로 취급한다.

#### Gate C: 실패 처리

- 포스트당 `count=4` 배리에이션 생성 후 게이트 통과분 중 선택
- 전량 탈락 시 프롬프트를 수정해 1회 재시도한다 (최대 8장)
- **그래도 실패하면 그 포스트는 히어로 없이 간다.** 나쁜 이미지가 없는 것보다 낫다는 전제는 틀렸다
- 최종 판정을 `verify_asset(id, verdict, note)`로 Studio에 기록한다

#### 리포트

`docs/media/hero-generation-report.md`에 포스트별 시도 횟수, 탈락 사유, 최종 채택 seed, 프롬프트를 기록해 재현 가능하게 한다.

## 데이터 모델 변경

기존 배관을 최대한 재사용한다. `coverImage` 필드는 이미 존재한다 (frontmatter에 빈 문자열, `src/lib/mdx.ts`의 `PostMeta`, `keystatic.config.ts` 모두).

**블로그**
- `coverImageAlt` 필드 신규 추가 (`src/lib/mdx.ts`의 `PostMeta`, `keystatic.config.ts`)
- ko/en이 각자 mdx를 가지므로 로케일별 alt가 자연히 분리된다

**프로젝트**
- `content/projects.json`에 `screenshot`, `screenshotAltKo`, `screenshotAltEn` 추가

**alt 텍스트 규칙**

추상 이미지는 정직하게 서술한다 (예: "어두운 배경에 층상 구조를 이룬 추상 기하 이미지"). 키워드 스터핑은 금지한다. 발명 금지 원칙과 같은 선상이다.

## 렌더링

모든 이미지 렌더링은 조건부다. 이미지가 없는 항목이 섞여도 레이아웃이 깨지지 않아야 한다.

1. `PostCard` — 카드 상단 16:9 썸네일. `coverImage`가 빈 문자열이면 현재 레이아웃을 그대로 유지한다
2. 포스트 상세 페이지 — 제목 아래 히어로. LCP 요소가 되므로 `priority`와 `sizes`를 명시한다
3. `ProjectCard` — 스크린샷 썸네일. 캡처 성공분만 표시한다
4. 전부 `next/image`를 쓴다 (AVIF/WebP 변환은 `next.config.ts`에 이미 설정돼 있다)
5. 레이아웃 점프 방지를 위해 `aspect-ratio` 고정 컨테이너를 쓴다

### 성능 가드

블로그 목록은 카드가 많으므로 첫 화면 밖은 기본 lazy로 두고 상단 2~3장만 `priority`를 준다.

현재 사이트는 텍스트뿐이라 매우 빠르다. 이미지 추가로 Core Web Vitals가 역행하면 **SEO에는 순손실**이다. 구현 후 실측으로 확인한다.

## SEO 배선

실제 이득의 대부분이 여기서 나온다.

1. `src/lib/seo.ts` — Article JSON-LD에 `image`, CreativeWork/MobileApplication에 `image`와 `screenshot` 추가 (현재 전부 비어 있음)
2. `generateMetadata` — `openGraph.images`를 실제 히어로로 교체. 히어로가 없으면 기존 `/api/og` 텍스트 카드로 폴백
3. `src/app/sitemap.ts` — 포스트·프로젝트 엔트리에 `images: [절대 URL]` 추가. `MetadataRoute.Sitemap`이 지원하며 이를 통해 이미지 사이트맵이 생성돼 구글 이미지 검색 색인 대상이 된다
4. `llms.txt`·`llms-full.txt`는 손대지 않는다

**OG 카드 전략**: 히어로가 있는 포스트는 히어로를 1200x630으로 크롭해 OG 이미지로 쓴다. satori 합성보다 실패 지점이 적다. 히어로가 없으면 기존 텍스트 카드를 유지한다.

## 테스트

- `src/lib/__tests__/seo.test.ts`에 image 필드 추가분 케이스를 확장한다
- `verify-hero.ts`의 팔레트 판정 순수 함수에 대한 단위 테스트를 추가한다
- 이미지가 없는 포스트/프로젝트에서 렌더링이 정상 동작하는지 확인한다 (조건부 분기)

## 구현 전 확인이 필요한 미결 사항

`generate_image` 문서에 "서버가 원격에서 돌면 path는 서버 머신 경로라 Read 불가"라는 단서가 있다. image-studio가 로컬에서 도는지 원격인지에 따라 생성된 파일을 `public/images/posts/`로 가져오는 방법이 달라진다.

- 로컬인 경우: `out` 파라미터로 목적지를 직접 지정한다
- 원격인 경우: 별도 전송 경로가 필요하며 설계를 조정한다

**구현 첫 단계에서 테스트 이미지 1장을 생성해 즉시 확인한다.** 원격으로 판명되면 이 문서를 갱신한다.

## 범위 밖

- 영상 데모와 `VideoObject` 구조화 데이터
- 블로그 포스트 음성 낭독판과 `AudioObject` 구조화 데이터
- `llms.txt` 계열 파일 변경
- 사이트 전반의 시각 아이덴티티 재설계
