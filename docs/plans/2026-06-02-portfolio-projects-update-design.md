# 포트폴리오 프로젝트 갱신 설계 (2026-06-02)

## 배경 & 목표

GitHub에 최근(2025–2026) 작업한 레포가 ~36개 있으나 포트폴리오(`content/projects.json`)에는
Soursea·Don't Touch 2개만 등록되어 있다. 9개 병렬 조사 에이전트로 후보 레포를 전수 검토한 뒤,
대표성·기술 깊이·카테고리 다양성 기준으로 **총 12개**를 선별해 반영한다.

Private 레포는 **핵심 로직이 아닌 구현·기능 중심**으로 기술하며, 공개 코드 링크 대신 `Private` 뱃지로 표시한다.

## 승인된 결정

1. **수록 범위**: 엄선 12개 (기존 2 + 신규 10)
2. **홈 노출(featured)**: 대표작 5개만 featured, 나머지 7개는 `/projects` 목록
3. **Private 링크 정책 (A · 정제안)**: `Private` 뱃지 표시 + **코드(GitHub) 링크 숨김** +
   **공개된 제품/데모 사이트 링크는 유지**. (기존 Soursea의 soursea.io 노출 방식과 동일)

## 라이브 URL 검증 결과 (2026-06-02)

| URL | 상태 | 링크 사용 |
|---|---|---|
| soursea.io | 403(봇 차단, 사람 정상) | 유지 |
| healframe.app | LIVE | 사용 |
| argus-fusion.vercel.app | LIVE(피드 간헐적) | 사용 |
| zodiacly.vercel.app | LIVE | 사용 |
| minddump-seven.vercel.app | LIVE | 사용 |
| transitla.devmanage.duckdns.org | LIVE | 사용 |
| itembox.ai / itembox-frontend.vercel.app | 연결거부 / 404 | **링크 없음** |

## 최종 프로젝트 데이터 (12)

순서: featured 5개 먼저, 이어서 목록 7개. 모든 항목에 `private` 플래그 포함.

### Featured (홈 노출)

**1. Soursea** — `private: true`, `status: active`, `featured: true`, `website: https://soursea.io` *(기존 유지, private 플래그만 추가)*

**2. ItemBox** — `private: true`, `status: launched`, `featured: true`, 링크 없음
- KO: 이커머스 셀러를 위해 1인 풀스택으로 구축한 멀티서비스 SaaS 플랫폼. React 셀러 대시보드와 NestJS 백엔드를 중심으로 Shopify·Cafe24 마켓 연동, Stripe 구독 결제, GPU 기반 OCR 마이크로서비스, AI 이미지 인페인팅, 캔버스 에디터, Chrome 확장까지 8개 서비스를 직접 설계·개발했습니다.
- EN: A multi-service e-commerce SaaS I built solo end-to-end for online sellers. Around a React seller dashboard and a NestJS backend, I designed and shipped eight services — Shopify and Cafe24 marketplace integration, Stripe subscription billing, a GPU-backed OCR microservice, AI image inpainting, a canvas editor, and a Chrome extension.
- tech: TypeScript, React, NestJS, PostgreSQL, TypeORM, Shopify API, Stripe, AWS S3, Python, FastAPI, vLLM, Chrome Extension

**3. healframe** — `private: true`, `status: building`, `featured: true`, `website: https://healframe.app`
- KO: Judith Herman의 트라우마 회복 3단계 모델을 기반으로 직접 설계한 AI 멘탈헬스 SaaS. Gemini로 회복 단계별 글쓰기 프롬프트와 위기 신호(GREEN/AMBER/RED) 안전 파이프라인을 구현하고, 동료 지지 서클·Stripe 구독·Capacitor 기반 Android 앱까지 웹·모바일을 1인 풀스택으로 개발했습니다.
- EN: A mental health SaaS I designed around Judith Herman's three-stage trauma recovery model. I built AI-guided journaling with a Gemini-powered crisis-detection safety pipeline (GREEN/AMBER/RED), evidence-based peer support circles, Stripe billing, and an Android build via Capacitor — solo full-stack across web and mobile.
- tech: TypeScript, Next.js, React, PostgreSQL, Prisma, NextAuth, Google Gemini, Stripe, Capacitor, Upstash Redis, next-intl

**4. argus-fusion** — `private: true`, `status: launched`, `featured: true`, `website: https://argus-fusion.vercel.app`
- KO: 정보기관 감시실을 콘셉트로 만든 실시간 OSINT 상황인식 웹앱. USGS·OpenSky·CISA·NASA 등 10개 이상의 공개 API를 config 기반 피드 레지스트리와 서버 캐싱 레이어로 통합하고, Three.js 3D 지구본·사이버 취약점 보드·위성 궤도 추적 등 4개 뷰로 시각화했습니다.
- EN: A real-time OSINT situational-awareness web app styled as an intelligence watch floor. I aggregated 10+ live public feeds (USGS, OpenSky ADS-B, CISA KEV, NASA, GDELT, CelesTrak…) through a config-driven feed registry with server-side caching, and visualized them across four views — a Three.js 3D globe, a cyber-vulnerability board, and satellite/orbital tracking.
- tech: TypeScript, Next.js, React, Three.js, react-three-fiber, satellite.js, Zustand, Vitest, Vercel

**5. Don't Touch** — `private: false`, `status: active`, `featured: true`, github 링크 유지 *(기존 유지, private:false 플래그만 추가)*

### 목록 (Listed)

**6. zodiacly** — `private: true`, `status: launched`, `website: https://zodiacly.vercel.app`
- KO: 미국·남미 시장을 겨냥해 기획·개발한 AI 운세 웹 플랫폼. astronomy-engine으로 실제 행성 위치를 계산하고, 별자리·궁합·주간/월간 운세 페이지를 6개 언어 SEO 구조로 정적 생성해 오가닉 트래픽을 확보하도록 설계했습니다.
- EN: An AI horoscope platform I built for the US and Latin American market. It computes real planetary positions with astronomy-engine and statically generates zodiac, compatibility, and weekly/monthly horoscope pages in a six-language SEO architecture designed to capture organic traffic.
- tech: TypeScript, Next.js, React, Tailwind CSS, Supabase, astronomy-engine, Claude API, next-intl

**7. transit-la** — `private: true`, `status: launched`, `website: https://transitla.devmanage.duckdns.org`
- KO: 차 없이 대중교통으로 갈 수 있는 LA의 장소(해변·하이킹·데이트 코스)를 탐색하는 웹앱. LA Metro GTFS 데이터를 직접 파이프라인으로 가공해 PostGIS 도달성 스코어링을 구현하고, 자체 호스팅한 OpenTripPlanner 2로 실시간 환승 경로를 제공하며 GitHub Actions CI/CD와 Docker로 배포했습니다.
- EN: A web app for discovering places across Greater LA — beaches, hikes, date courses — reachable without a car. I built the full data pipeline (GTFS ingestion, OSM scraping, PostGIS reachability scoring) and ran a self-hosted OpenTripPlanner 2 instance for live multimodal routing, deployed through a GitHub Actions CI/CD pipeline on Docker.
- tech: TypeScript, Next.js, React, PostgreSQL, PostGIS, Drizzle ORM, MapLibre GL, OpenTripPlanner 2, Docker, Playwright

**8. hoverslam** — `private: false`, `status: launched`, `github: https://github.com/writingdeveloper/hoverslam`
- KO: SpaceX 메카질라 부스터 캐치에서 영감을 받은 멀티플레이 브라우저 게임. 공개 데이터로 보정한 수어사이드 번 물리를 직접 구현하고, Colyseus 권위 서버로 실시간 경쟁과 리더보드를, Three.js WebGL로 9개 카메라 모드와 한·영 UI를 만들었습니다.
- EN: A real-physics multiplayer browser game inspired by SpaceX's Mechazilla booster catch. I implemented suicide-burn physics calibrated against public SpaceX data, real-time competition and a leaderboard on an authoritative Colyseus server, and Three.js WebGL rendering with nine camera modes and a bilingual EN/KO UI.
- tech: TypeScript, Three.js, Colyseus, WebGL, Vite, Docker

**9. minddump** — `private: true`, `status: building`, `website: https://minddump-seven.vercel.app`
- KO: 감정을 글로 쏟아내고 3D 화염 애니메이션으로 태워버리는 익명 감정 해소 앱. React Three Fiber와 Blender CG 파이프라인으로 burn 연출을 만들고, AES-256 암호화 에스크로 구조로 익명 위로 메시지를 안전하게 전달합니다. Turborepo 모노레포에서 Next.js 웹과 Expo 모바일을 함께 개발했습니다.
- EN: An anonymous emotional-release app where you pour out what's weighing on you and burn it with a 3D fire animation. I built the burn effect with React Three Fiber and a Blender CG pipeline, routed anonymous comfort messages through an AES-256 encrypted escrow design, and shipped it as a Turborepo monorepo spanning a Next.js web app and an Expo mobile app.
- tech: TypeScript, Turborepo, Next.js, Expo, React Native, PostgreSQL, Prisma, Three.js, react-three-fiber, Google Gemini

**10. sobriety-app** — `private: true`, `status: building`, 링크 없음
- KO: 금전적 공약을 걸고 매일 셀피 체크인으로 금주를 지키는 모바일 앱. Stripe Connect 비수탁(manual-capture) 구조로 실패 시 스테이크가 자선단체에 자동 기부되도록 설계하고, Expo + Fastify 모노레포로 313개 테스트와 GitHub Actions CI까지 갖춰 구현했습니다.
- EN: A sobriety commitment app where you stake real money and verify each day with a selfie check-in. I designed a non-custodial Stripe Connect flow that auto-donates the stake to charity on failure (the platform never holds funds), and built it as an Expo + Fastify monorepo with 313+ tests and full CI.
- tech: TypeScript, Expo, React Native, Fastify, PostgreSQL, Stripe Connect, Clerk, i18next, Docker

**11. voice-studio** — `private: false`, `status: building`, `github: https://github.com/writingdeveloper/voice-studio`
- KO: 영상 속 특정 인물의 목소리를 골라 GPT-SoVITS v4 TTS 모델을 자동으로 파인튜닝하는 로컬 웹 스튜디오. 보컬 분리 → 화자 분리 → 클러스터링 → 전사 → 학습까지 흩어져 있던 스크립트를 GPU 작업 큐로 묶어 클릭 한 번의 파이프라인으로 만들었습니다.
- EN: A local web studio that automates voice cloning — pick a speaker from any video and it fine-tunes a GPT-SoVITS v4 model end to end. I collapsed a scattered set of scripts (vocal separation, diarization, clustering, transcription, training) into a single one-click pipeline orchestrated by a GPU job queue.
- tech: Python, FastAPI, React, GPT-SoVITS, pyannote, faster-whisper, CUDA, TypeScript

**12. comfyui-web** — `private: true`, `status: building`, 링크 없음
- KO: Claude Code를 프롬프트 엔지니어로 활용하는 셀프호스팅 이미지·영상 생성 플랫폼. 자연어(한/영) 입력을 최적화된 프롬프트와 ComfyUI API 워크플로 JSON으로 자동 변환하고, 순차 작업 큐·썸네일 생성·좋아요·댓글·갤러리까지 멀티유저 기능을 풀스택으로 구현했습니다.
- EN: A self-hosted image and video generation platform that uses Claude Code as an automated prompt engineer — turning Korean or English input into optimized prompts and ComfyUI API-format workflow JSON. I built the full multi-user layer around it: a sequential job queue, thumbnail pipeline, and a social gallery with likes and comments.
- tech: TypeScript, Next.js, React, Prisma, SQLite, NextAuth, Claude Code, ComfyUI, sharp

## 제외 (기록용)

- `netplex` (로컬 정리 스크립트·하드코딩 경로), `eznet-limiter` (빈 레포), `dashy` (Lissy93/dashy 원본 복제), `waifu-talk-machine` (개인 포크), `dont-touch-python` (등록된 Electron판의 구버전)
- 보류(tier-2, 원하면 스왑): Mini-Games, kl125-blink, Anchor-ElectronJS, toga-bot, search-item-space, product-parser, Growgle, stockhub, observer-of-lines, reddit-idea-miner, reddit-grabber

## 스키마 / 코드 변경

1. **`keystatic.config.ts`** — projects 스키마에 `github` 다음 줄에 추가:
   `private: fields.checkbox({ label: '비공개 (Private)' })`
2. **`src/types/content.ts`** — `Project` 인터페이스에 `private?: boolean` 추가.
3. **`content/projects.json`** — 위 12개 항목으로 교체. 각 항목 키 순서는 기존과 동일하게 유지하고 `private` 추가.
4. **`messages/ko.json` / `messages/en.json`** — `projects` 네임스페이스에 `"private"` 키 추가 (KO: "비공개", EN: "Private").
5. **`src/components/projects/ProjectCard.tsx`**
   - 상태 뱃지 옆에 `project.private` 일 때 `Private` 뱃지 렌더 (`t('private')`).
   - GitHub 링크는 `project.github && !project.private` 일 때만 렌더 (정책 A: private은 코드 링크 숨김). website 링크는 그대로.
6. **`content/about.json`**
   - skills 추가: Three.js(frontend), React Native(frontend), Python(backend), FastAPI(backend), Prisma(backend), Redis(backend), Playwright(tools), Google Gemini(tools), OpenAI(tools), Turborepo(tools).
   - timeline 추가(최신순, 기존 항목 앞): 2026 ItemBox 출시, 2026 AI 제품 연속 출시. (about 페이지 정렬 방식 확인 후 위치 조정)

## 검증 계획

- `npm run type-check` (tsc --noEmit) 통과
- `npm run lint` 통과
- `npm run test` (vitest) 통과 — 기존 테스트(seo/mdx/layout) 영향 없음 확인
- `npm run build` 성공 (projects 페이지·홈 featured·/play 3D 카드 렌더 확인)
- featured 필터(홈)와 /play 3D가 12개/5개 데이터로 정상 동작하는지 코드 확인

## 비고

- `/play` 3D `ProjectsSection`은 동일 `projects.json`을 사용하므로 자동 반영된다. 카드 배치는 index 기반 자동 스케일.
- 홈 featured 개수 표시 로직은 구현 중 `src/app/[locale]/page.tsx` 확인.

## 정정 반영 (최종, 2026-06-02)

사용자 추가 피드백으로 다음을 변경:

1. **ItemBox 제외** — 서비스 종료 + 퇴사 처리된 폐기 프로젝트. 프로젝트 카드에서 제거하고,
   `about.json` 타임라인에 **경력(work)** 항목으로만 정직하게 기재("1인 풀스택" → "개발에 참여").
2. **Soursea 링크 제거** — `soursea.io`가 Shopify 스토어 도메인으로 전환 예정이라 링크를 빼고
   `private: true`(뱃지 + 설명·기술스택만)로 유지. featured 유지.
3. **minddump를 featured로 승격** (ItemBox 자리 대체).

→ **최종 11개** (featured 5: Soursea, HealFrame, Argus Fusion, Minddump, Don't Touch /
목록 6: Zodiacly, TransitLA, Hoverslam, Sobriety App, Voice Studio, ComfyUI Web).
필요 시 tier-2(kl125-blink 등)로 12개까지 확장 가능.
