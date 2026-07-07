# 포트폴리오: 신규 프로젝트·Play Store URL·디자인·SEO — 설계 스펙

- **날짜:** 2026-07-07
- **상태:** 초안 (사용자 리뷰 대기)
- **범위 선택(사용자 확정):** 핵심+선택+내부툴(private) 전부 반영 / 카드 배지 + `MobileApplication` 스키마 / 묘지 안장 3건

---

## 목표

GitHub 폴더의 최근 작업과 Play Console 게시 앱을 검토해, 포트폴리오에 누락된 프로젝트를 반영하고,
살아있는 앱에 **Play Store·사이트 URL**을 붙이며, 폐기/실패 프로젝트는 `/graveyard`에 안장한다.
카드에 Play Store 링크·앱 구조화데이터(`MobileApplication`)를 더해 SEO 리치결과 적격성을 높인다.

## 비목표 (이번 범위 아님)

- 프로젝트 페이지 레이아웃 전면 리디자인 (그리드 유지, featured 우선 정렬만)
- 프로젝트별 개별 상세 페이지 생성 (현재 카드형 그리드 유지)
- iOS 앱스토어 필드 (YAGNI — 현재 전부 Android)
- 3D 쇼케이스(`play/`) 오버레이에 Play Store 노출 (기존대로 미지의 필드는 무시)

## 사실 확인 결과 (검증 완료)

- **Play Store 게시 확정(HTTP 200):** Drymora `com.soursea.drymora`, HealFrame `app.healframe`, Receo `com.soursea.receo`
- **사이트 라이브 확정(HTTP 200):** drymora / fitcheck / studio-apartment / liminal-bestiary / unclog-la / kindling(.writingdeveloper.blog | .vercel.app)
- **배포 정체 교정:** "LA Metro Simulator" → 실제 제품명 **Unclog LA**("turn car-city LA into a transit city"), Liminal Bestiary 배포 타이틀 "좀비 정원 · The Liminal Bestiary"
- **로컬 전용(원격 없음):** kindling, MarketDeck, liminal-bestiary, rockgaze, ai-4080-ops → 코드 링크 없음/보류

---

## 1. 데이터 모델 (`src/types/content.ts`)

`Project`에 선택 필드 하나 추가. `Tombstone`은 변경 없음(폐기 앱의 스토어 링크는 이미 죽었으므로 불필요).

```ts
export interface Project {
  // ...기존...
  website?: string
  github?: string
  playStore?: string   // ← 신규: 전체 Play Store URL. website?/github?와 동일 패턴.
  private?: boolean
  featured: boolean
}
```

**규칙:** `playStore`는 `website`처럼 `private` 여부와 무관하게 항상 노출(공개 스토어 링크). `github`만 `private`일 때 숨김.

---

## 2. 콘텐츠 계획

### 2a. 신규 프로젝트 14건 (`content/projects.json` 추가)

`private` 관례: **제품 = private:true**(코드 숨김, Private 배지, 데모 유지) / **OSS·쇼케이스·유틸 = private:false**(코드 노출). 기존 정책과 일치.

| # | name | slug | status | website | github | playStore | private | featured | 정체(사실) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Drymora** | drymora | active | drymora.writingdeveloper.blog | – | `com.soursea.drymora` | true | **true** | 근거기반 이중언어(EN/es) 금주 PWA + Android. Next.js·Better Auth·Drizzle·Postgres·web-push. *general-wellness, 의료기기 아님* |
| 2 | **FitCheck** | fitcheck | launched | fitcheck.writingdeveloper.blog | – | – | true | false | 사진 1장으로 코디를 AI가 점수·직설 조언. Next.js 16·React 19·Gemini 2.5 vision·i18n(en/ko/es) |
| 3 | **Studio Apartment** | studio-apartment | launched | studio-apartment.vercel.app | writingdeveloper/studio-apartment | – | false | false | 대만 老아파트 원베드를 1인칭으로 걷는 포토리얼 Three.js 워크스루(빌드리스, r184). 명시적 포트폴리오 작품 |
| 4 | **SiteDeck** | sitedeck | active | – | writingdeveloper/SiteDeck | – | false | false | 여러 GA4 사이트 지표를 한 화면에 요약하는 Electron 대시보드. MIT·OAuth 루프백·다국어 |
| 5 | **MarketDeck** | marketdeck | active | – | writingdeveloper/MarketDeck ⚠️ | – | false | false | 전체 레포의 마케팅 준비도를 14신호로 스캔·점수화하는 로컬 Electron(MCP). DevDeck·SiteDeck과 -deck 3형제. MIT |
| 6 | **Liminal Bestiary** | liminal-bestiary | launched | liminal-bestiary.vercel.app | – | – | false | false | 순수 Three.js 절차생성 백룸 공포 크리처 6종 갤러리(수동 GLB export) |
| 7 | **ClipShrink** | clipshrink | active | – | writingdeveloper/ClipShrink | – | false | false | 디스코드 10MB 초과 캡처를 자동 압축하는 Windows 트레이앱. Python·MIT·v1.2.0 |
| 8 | **YouTube Rhythm Game** | youtube-rhythm-game | building | – | writingdeveloper/youtube-rhythm-game | – | false | false | 유튜브 URL→오디오 분석(yt-dlp·librosa)→낙하 레인 리듬게임(Web Audio) |
| 9 | **Unclog LA** | unclog-la | launched | unclog-la.vercel.app | writingdeveloper/unclog-la | – | false | false | 차 중심 LA를 대중교통 도시로 바꾸는 브라우저 시뮬레이터. deck.gl·MapLibre·Neon |
| 10 | **shipwright** | shipwright | building | – | writingdeveloper/shipwright | – | false | false | 여러 MVP를 빠르게 찍는 AI-native Next.js+Turborepo 스타터(오픈소스, own-it). 나머지를 만든 메타 도구 |
| 11 | **Kindling** | kindling | building | kindling.writingdeveloper.blog | – | – (Draft, 출시예정) | true | false | 익명 감정 배출 PWA(Minddump 후속). shipwright 기반. Play Store "Vent Anonymously" 심사 준비 |
| 12 | **3d-asset-studio** | 3d-asset-studio | building | – | – | – | true | false | 이미지/텍스트→3D `.glb` 로컬 파이프라인(Hunyuan3D 2.1+ComfyUI on RTX 4080, Claude 자동 QC). Studio Apartment 에셋 공급원 |
| 13 | **ai-4080-ops** | ai-4080-ops | active | – | – | – | true | false | 4080 AI 서버 SSH 운영 툴킷(EncodedCommand 원격 실행·상태 점검). 내부용 |
| 14 | **nag-coach** | nag-coach | building | – | – | – | true | false | 무시하면 더 집요해지는 디스코드 압박 코치봇(Claude Haiku). 폰=버튼/워치=음성 이중입력. *opsdeck 통합분 반영* |

**⚠️ MarketDeck** — 원격 미푸시(로컬 전용). 코드 링크가 404되지 않도록 **구현 시 GitHub 푸시하거나, 미푸시면 `github` 필드 제거(website/코드 없이 Private 취급)**. 구현 단계에서 확정.

**설명 초안 원칙:** 각 레포 README·package.json에서 **사실 기반**으로 Ko/En 2~4문장, 기존 항목 톤(1인칭·기술 구체성) 유지. `descriptionEn`은 `descriptionKo` 대응으로 작성. 구현 시 실제 projects.json diff로 재리뷰 요청.

### 2b. 기존 항목 갱신

| 항목 | 변경 |
|---|---|
| **HealFrame** | `playStore: …?id=app.healframe` 추가. status `building`→`active`(Production). website/private/featured 유지 |
| **Receipt Tracker** | `playStore: …?id=com.soursea.receo` 추가(스토어명 "Receo - AI Receipt Scanner"). 나머지 유지 |
| **Zodiacly** | Android **심사중(Draft/In review)** — 공개 링크 **보류**. 이번엔 변경 없음(공개 시 `playStore` 추가) |

### 2c. 묘지 안장 3건 (`content/graveyard.json` 추가 + `projects.json`에서 제거)

`Tombstone` 필드: name, slug, bornAt, diedAt, causeOfDeath, epitaphKo/En, retroKo/En, techStack, website?, github?, private?.
비문·회고는 **사실 기반 초안 → 사용자가 덧붙여 개선**(확정).

| slug | born→died | causeOfDeath | 계승 | tech | website |
|---|---|---|---|---|---|
| **sobriety-app** | ~2026-05 → ~2026-06 ⚠️ | `pivoted` | → Drymora(PWA, Play Store) | Expo·React Native·Fastify·Stripe Connect·Clerk | – |
| **minddump** | 2026-03-23 → 2026-07-03 | `pivoted` | → Kindling(shipwright 기반) | Turborepo·Next.js·Expo·Three.js·R3F·Gemini | minddump-seven.vercel.app(선택) |
| **rockgaze** | 2026-06-02 → 2026-06-04 | `lost-interest` | (없음) | TypeScript·Three.js·WebGL·Vite | rockgaze.vercel.app(선택) |

**⚠️ sobriety-app 날짜** — 로컬 레포 부재로 정확한 born/died 미상. 초안은 추정치, 사용자 확정 필요.

**비문 초안(Ko, 회고는 구현 시 초안):**
- **Sobriety App** — "돈을 걸고 셀피로 증명하던 금주 앱. 스테이크는 자선으로, 코드는 Drymora로." → 회고: Expo+Stripe Connect 비수탁 스테이크 구조까지 갔으나, 실사용 흐름을 PWA(Drymora)로 재구축하며 접음.
- **Minddump** — "감정을 3D 화염으로 태우던 앱. 불씨는 Kindling으로 옮겨붙었다." → 회고: Play Store 리스팅까지 갔으나 삭제, 익명 배출 컨셉을 shipwright 기반 Kindling으로 재출발.
- **rockgaze** — "힐링을 노렸지만, 정작 힐링되지 않았다." → 회고: 수묵 감성 성장 게임으로 기획했으나 조작감이 의도한 '실질적 힐링감'을 못 살렸고, 다른 게임들로 추진력이 옮겨가며 2일 만에 멈춤.

### 2d. 완전 제외 (노출 안 함)

- **opsdeck** — nag-coach로 통합·종료. projects.json·graveyard.json **어디에도 넣지 않음**.

---

## 3. ProjectCard 디자인 (`src/components/projects/ProjectCard.tsx`)

경량 변경(Q4=카드+배지, 리디자인 아님):

1. **Play Store 링크** — `project.playStore` 있으면 링크 추가: 인라인 Play 삼각형 SVG + 라벨. website/github 링크와 같은 줄, `target=_blank rel="noopener noreferrer"`. `private`와 무관하게 노출.
2. **아이콘** — lucide에 Play 브랜드 아이콘 없음 → 작은 인라인 SVG(삼각형) 컴포넌트를 카드 파일 내 정의.
3. **정렬** — `/projects` 그리드에서 **featured 우선**, 그다음 기존 배열 순서 유지(`projects/page.tsx`에서 정렬).
4. 링크 라벨은 i18n(§5).

## 4. SEO — `MobileApplication` 스키마 (`src/lib/seo.ts`, `projects/page.tsx`)

`generateProjectListJsonLd`가 프로젝트별 `playStore`를 받도록 확장. 스토어 URL 보유 항목은 `CreativeWork` 대신:

```jsonc
{
  "@type": "MobileApplication",
  "name": "...", "description": "...",
  "operatingSystem": "ANDROID",
  "applicationCategory": "HealthApplication", // Drymora/HealFrame=Health, Receo=Finance
  "installUrl": "<playStore>",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "...", "url": ".../about" }
}
```

- 웹앱(스토어 없음)은 기존 `CreativeWork` 유지.
- `applicationCategory` 매핑: Drymora→HealthApplication, HealFrame→HealthApplication, Receipt Tracker→FinanceApplication.
- `projects/page.tsx`의 매핑에 `playStore` 전달 추가.

## 5. i18n (`messages/ko.json`, `messages/en.json`)

`projects` 네임스페이스에 라벨 키 1개 추가:
- ko: `"googlePlay": "Google Play"` (또는 `"Play Store에서 보기"`)
- en: `"googlePlay": "Google Play"`

## 6. 검증

- `pnpm build` / 타입체크 통과(`playStore` 옵셔널 필드).
- `/projects`·`/graveyard`·홈(featured 6) 렌더 확인.
- JSON-LD 유효성(구조화데이터 파서) — `MobileApplication` 3건 방출 확인.
- 삽입한 모든 URL HTTP 200 재확인(이미 검증됨).
- 기존 테스트(`vitest`) 영향 없음 확인.

## 7. 열린 항목 (사용자 리뷰/확정)

1. **묘지 비문·회고** — 초안 반영 후 사용자가 문구 개선(확정된 워크플로).
2. **sobriety-app born/died 날짜** — 추정치 → 실제 값 확인.
3. **MarketDeck 코드 링크** — GitHub 푸시 여부(안 하면 링크 제거).
4. **featured 6개 확정** — Drymora 승격으로 홈 6개(3행 2열). 정확히 5 원하면 1개 강등.
5. 신규 설명(Ko/En) 실제 projects.json diff 재리뷰.

---

## 영향 파일 요약

- `src/types/content.ts` — `Project.playStore?` 추가
- `content/projects.json` — 신규 14, 갱신 2(HealFrame·Receipt Tracker), 제거 2(Sobriety App·Minddump)
- `content/graveyard.json` — tombstone 3 추가
- `src/components/projects/ProjectCard.tsx` — Play Store 링크/배지
- `src/app/[locale]/projects/page.tsx` — featured 정렬 + `playStore` JSON-LD 전달
- `src/lib/seo.ts` — `MobileApplication` 분기
- `messages/ko.json`·`messages/en.json` — `projects.googlePlay`
