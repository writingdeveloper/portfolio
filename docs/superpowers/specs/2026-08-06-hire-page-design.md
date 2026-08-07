# `/hire` — 함께 일하기 페이지 설계

2026-08-06

## 왜 만드는가

측정된 사실 세 가지에서 출발한다.

**1. 연락 경로가 죽어 있다.** GA4 28일(7/9–8/5) 실측: 세션 88건 중 참여 15건.
아웃바운드 이벤트는 `code_click` 2 · `contact_click` 1 · `demo_click` 1 ·
`play_store_click` 1 — 이 분포는 8월 5일 계측 검증 때 직접 누른 클릭 패턴과
정확히 일치한다. 단정할 수는 없으나 **실사용자가 데모·저장소·이메일 중 무엇도
누르지 않았다고 보는 편이 사실에 가깝다.**

**2. 관객은 이미 있는데 다른 곳에 있다.**

| 채널 | 관객 | 상태 |
|---|---|---|
| LinkedIn | 팔로워 1,159 · 1촌 500+ | 마지막 글 2개월 전, 7일 게시물 노출 1건 |
| GitHub | 팔로워 13 | 포트폴리오 핵심이벤트의 86%를 혼자 만듦 |
| 포트폴리오 | 월 66명(94% 첫 방문) | — |
| 검색 | 월 2세션 | — |

GA4 소스 상위 5개(direct 61 · github 22 · google 2 · 기타 1 · 1)가 88 중 87을
채운다. **LinkedIn → 포트폴리오 유입은 28일간 최대 1세션.** 팔로워 1,159명이
아무데도 흐르지 않는다.

**3. 세 채널이 서로 다른 제안을 한다.** LinkedIn은 `#OPENTOWORK` + "구직 중 ·
CTO 및 소프트웨어 엔지니어 역할"(정규직), GitHub README는 "Open to select
freelance"(외주), 포트폴리오는 푸터 `EMAIL` 한 줄(제안 없음). 읽는 사람이
취업을 원하는지 외주를 원하는지 판단할 수 없다.

따라서 이 페이지의 목적은 **포트폴리오 트래픽 전환이 아니다.** 월 10~15명을
위해 만드는 게 아니라, **LinkedIn 관객을 보낼 목적지가 없어서** 만든다. 그래서
공유 가능한 전용 URL이 결과물이고, 만들자마자 쓸모가 생긴다.

## 결정 사항

사용자 확인을 거친 값이다. 추정하지 않는다.

| 항목 | 값 |
|---|---|
| 경로 | `/hire` (KO), `/en/hire` (EN) |
| 제안 | 정규직 **과** 프로젝트 의뢰 — 둘 다, 각각 구체적으로 |
| 근무 형태 | 원격 우선 · 전 세계 |
| 가용 상태 | 지금 바로 시작 가능 |
| 요율 | 비공개 |
| `/about` | 손대지 않는다 (전기와 제안은 다른 문서다) |

"둘 다"를 뭉뚱그리면 둘 다 약해진다. **두 제안을 나란히, 각각 구체적으로** 놓아
읽는 사람이 자기 쪽만 보고 판단하게 한다. 이것이 이 페이지의 핵심 장치다.

## 페이지 구조

```
1. 헤드      한 줄 제안 + 상태 배지(원격 우선 · 전 세계 · 지금 가능)
2. 두 갈래   정규직 | 프로젝트 의뢰 — 나란히
3. 증거      projects.json에서 파생한 숫자 + 대표 사례 3건
4. 스택      about.json의 skills 34개 재사용
5. 연락      mailto + LinkedIn
```

### 2. 두 갈래에 들어가는 내용

문구의 출처를 명시한다. **모든 문장은 본인이 이미 공개한 텍스트에서 오거나,
위 "결정 사항" 표에서 온다. 그 밖의 사실은 쓰지 않는다.**

| 칸 | 정규직 | 프로젝트 의뢰 |
|---|---|---|
| 찾는 것 | CTO · 시니어 풀스택 · AI 통합 <br>*출처: LinkedIn 구직 설정* | Claude API 파이프라인 · 커스텀 MCP 서버 · RAG · Next.js/NestJS/Python 제품 <br>*출처: LinkedIn 소개글, GitHub README* |
| 형태 | 원격 우선 · 전 세계 <br>*출처: 결정 사항* | 원격 우선 · 전 세계 <br>*출처: 결정 사항* |
| 근거 | CTO 5년+ · 아키텍처에서 결제·인프라까지 <br>*출처: LinkedIn 소개글* | 짧은 사이클 — "in days, not months" <br>*출처: LinkedIn 소개글* |
| 시작 | 이메일 | 이메일 — 문제를 한 문단으로 |

### 3. 증거 — 파생 숫자만 쓴다

숫자를 본문에 적지 않는다. `projects.json`에서 계산한다. About 페이지가
`{count}`로 프로젝트 수를 뽑는 것과 같은 방식이라 **데이터가 바뀌면 페이지도
따라오고, 낡을 수 없다.**

- **공개 데모·스토어가 있는 제품** = `website || playStore`인 프로젝트 수 (현재 19)
- **Play Store 앱** = `playStore`가 있는 프로젝트 수 (현재 6)
- **총 빌드** = 전체 프로젝트 수 (현재 39)

"출시 31건"(`active` + `launched`) 같은 더 큰 숫자를 쓰지 않는 이유: 클릭해서
확인할 수 있는 것만 세야 "보여달라"는 요청에 버틴다. 19는 본인이 이미 공개적으로
말하는 "15+ shipped products"와 모순되지 않으면서 그보다 강하다.

대표 사례 3건은 **서로 다른 역량**을 증명하도록 고른다.

| 사례 | 증명하는 것 |
|---|---|
| `rentrights` | 공개 데이터 · PostGIS · 시빅테크, 저장소 공개라 검증 가능 |
| `healframe` | AI 안전 파이프라인 + 웹/안드로이드 동시 출하 |
| `argus-fusion` | 실시간 다중 피드 수집 + 3D 시각화 |

슬러그는 코드에 고정하되, **누락되면 테스트가 실패**하게 한다. 프로젝트가
삭제됐을 때 페이지에 빈칸이 생기는 대신 CI가 먼저 잡는다.

숫자를 계산하는 `getHireStats()`와 대표 사례 슬러그 상수는
**`src/lib/projects.ts`**에 둔다. `hasIndexablePage`·`sortProjectsFeaturedFirst`와
같은 자리이고, 페이지 컴포넌트가 아니라 순수 함수라 직접 테스트할 수 있다.

## 기술 설계

### 라우트

`src/app/[locale]/hire/page.tsx`. `/about`의 구조를 그대로 따른다 —
`generateMetadata` + `setRequestLocale` + `PageTransition`, `revalidate = 3600`.

### i18n

`messages/{ko,en}.json`에 `hire` 네임스페이스 신설. 본문 텍스트는 전부 여기에
둔다(컴포넌트에 한국어/영어 문자열을 박지 않는다). `nav.hire`도 함께 추가.

### 내비게이션

`Header.tsx`의 `navLinks`에 `{ href: '/hire', key: 'hire' }` 추가. 7개가 되어
데스크톱 내비가 빡빡해지므로, 구현 중 좁은 뷰포트에서 줄바꿈이 생기면
`/graveyard`를 모바일 전용으로 내리는 것까지가 이 작업의 범위다.

### 메타데이터 · 구조화 데이터

`/about`과 동일한 패턴: canonical + `alternates.languages`(ko/en/x-default),
OG 이미지는 기존 `/api/og`, `generatePersonJsonLd` + `generateBreadcrumbJsonLd`.
새 스키마 타입은 도입하지 않는다.

### 사이트맵

`src/app/sitemap.ts`의 `staticPages`에 `'/hire'` 추가, priority `0.7`
(`/projects`와 동급). 얇은 페이지가 아니므로 `hasIndexablePage` 필터와 무관하다.

### 계측 — 기존 버그 하나를 같이 고친다

`mailto:`는 `classifyOutboundLink`가 이미 `contact_click`으로 분류하므로
**이메일 링크에는 새 코드가 필요 없다.**

그런데 **LinkedIn 링크는 `demo_click`으로 분류된다.** `classifyOutboundLink`가
Play Store와 코드 호스트만 특수 처리하고 나머지 전부를 `demo_click`으로 떨어뜨리기
때문이다. 푸터에 LinkedIn이 이미 전 페이지에 깔려 있으므로 **이건 이 페이지가
만드는 문제가 아니라 이미 존재하는 오분류다.** 지금까지 `demo_click`이 28일에
1건이라 드러나지 않았을 뿐이고, LinkedIn이 주요 CTA가 되는 이 페이지에서는
데모 지표를 그대로 오염시킨다.

**고치는 방법: LinkedIn을 `contact_click`으로 분류한다.** 새 이벤트 이름을
만들지 않는 이유가 있다 — GA4는 이미 처리한 이벤트만 별표를 달 수 있고 그
테이블은 약 24시간 지연되므로, 새 이름은 하루를 더 기다려야 핵심 이벤트가 된다
(`portfolio-ga4-key-events` 참조). `contact_click`은 이미 핵심 이벤트로 지정돼
있고, **채용 페이지에서 LinkedIn을 누르는 것은 의미상으로도 연락 행동이다.**
`link_domain`이 `linkedin.com`으로 남으므로 GA4에서 이메일과 분리해 볼 수 있다.

### 테스트

`src/lib/__tests__/`에 추가한다.

- `getHireStats()` — 파생 숫자 3개가 `projects.json` 실데이터와 일치
- 대표 사례 3건의 슬러그가 `projects.json`에 **존재**한다 (누락 시 실패)
- `classifyOutboundLink('https://www.linkedin.com/in/…')` → `contact_click`,
  `link_domain === 'linkedin.com'` (`www.` 정규화 포함)
- 기존 `demo_click` 케이스가 깨지지 않는다

## 범위 밖

- **LinkedIn·GitHub 프로필 수정.** 문안은 작성해 드리되 적용은 본인이 한다.
  두 곳 모두 이 저장소 밖이고, 공개 프로필 변경은 본인 결정이다.
- **디스코드(원래 계획 B).** 보류 결정됨.
- **요율표.** 비공개로 결정됨.
- **LinkedIn 게시 재개.** 별도 작업이며 이 페이지와 독립적이다.

## 완료 기준

1. `/hire`와 `/en/hire`가 렌더되고 hreflang이 서로를 가리킨다
2. 숫자가 `projects.json`에서 파생되어 하드코딩된 값이 본문에 없다
3. LinkedIn 클릭이 `contact_click` + `link_domain=linkedin.com`으로 보고된다
4. 사이트맵에 두 URL이 올라간다
5. 타입체크 · 린트 · 테스트 · CI 통과
