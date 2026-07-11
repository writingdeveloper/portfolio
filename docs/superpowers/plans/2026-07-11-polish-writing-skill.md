# polish-writing 스킬 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CC로 잡은 블로그/프로젝트 초안을 저자 목소리로 다듬고 팩트를 검증하는 재사용 `.claude/skills/polish-writing/` 스킬을 만든다.

**Architecture:** 실행 코드가 아니라 마크다운 지식 자산이다. `SKILL.md`(워크플로 오케스트레이터) + `references/` 4개 지식 파일(voice / ai-tells / editorial-rules / deep-review). 스킬은 리라이터가 아니라 "목소리와 팩트를 아는 라인 에디터"로, 변경안을 diff로 제시하고 저자가 승인한다.

**Tech Stack:** Markdown, YAML frontmatter (Claude Code 스킬 규약). 대상 콘텐츠는 `content/posts/{ko,en}/<슬러그>/index.mdx`, `content/projects.json`, `content/graveyard.json`.

## Global Constraints

- 스킬 위치: `.claude/skills/polish-writing/`. `SKILL.md`는 `name: polish-writing` + 트리거 어구를 담은 `description`을 가진 YAML frontmatter 필수.
- **모든 예시·인용은 실제 글에서 가져온다 — 절대 발명 금지.** (스킬 자신의 원칙을 파일 저작에도 적용.) 인용을 넣을 땐 출처 슬러그를 병기한다.
- **비파괴적:** 스킬은 변경안을 카테고리별 before→after로 제시하고, 저자가 채택한 것만 적용한다. 팩트 문제는 자동 수정하지 않고 질문으로만 올린다.
- **em 대시:** 한국어는 제거(문장/괄호로), 영어는 절제된 사용 보존.
- **위기자원 푸터 규칙은 제외됨(2026-07-11 결정).** 어떤 파일에도 이 규칙을 추가하지 말 것.
- 작업 브랜치: `feat/polish-writing-skill` (스펙 커밋이 이미 올라가 있음).
- 스펙 원본: `docs/superpowers/specs/2026-07-11-polish-writing-skill-design.md`.

---

### Task 1: `references/voice.md` — 이시형 보이스 프로필

**Files:**
- Create: `.claude/skills/polish-writing/references/voice.md`
- Source(참고): `content/posts/ko/*/index.mdx`, `content/posts/en/*/index.mdx`

**Interfaces:**
- Produces: `SKILL.md`와 `deep-review.md`가 "저자 목소리 기준"으로 참조하는 파일. 목소리 특성 각각에 실제 인용 예시를 붙인 형식.

- [ ] **Step 1: 파일을 아래 내용으로 작성**

```markdown
# 이시형 보이스 프로필

이 블로그 글은 한 사람의 일관된 목소리로 읽혀야 한다. 아래는 기존 글에서
추출한, 반드시 **보존·모방**해야 할 특성이다. 각 항목의 인용은 실제 글에서
가져온 것이며(슬러그 병기), 추상 규칙이 아니라 모방할 예시로 쓴다.

## 한국어

- **과장 없는 존댓말(`~습니다`).** 독자 호명("여러분") 없음. 마케팅·감탄사 없음.
- **정직·불확실성을 숨기지 않고 그대로 적는다.**
  - "AI의 추천이어도 맞는 추천은 맞다고 적어둡니다." — building-sobriety-app
  - "모른다는 것도 그대로 적어둡니다." — thoughts-about-giving-back
  - "이 질문은 개발 내내 사라지지 않았고, 지금도 사라지지 않았습니다." — healframe-safety-pipeline
  - "그 이야기는 여기까지만 하겠습니다." (개인사를 여는 대신 경계를 긋는 정직함) — healframe-safety-pipeline
- **구체적 숫자·고유명사로 말한다** (추상 대신 물건·수치): 313개 테스트, 반나절,
  석 달 반, 음주측정기, fail-closed, GREEN/AMBER/RED.
- **리듬:** 짧은 선언문이 다수, 문단마다 긴 반성문이 하나. 문단을 **조용히 닫는다.**
  - "사실 제가 쓰려고 만들었습니다." — recent-builds-2026
  - "그 기준 위에서는 아직 이 선택이 맞습니다." — introducing-keystatic-cms
- **구조:** 개인적 훅 → 구체적 메커니즘 → 정직한 한계 → 조용한 결론.
  - "여기까지는 엔지니어링 이야기고, 솔직한 이야기는 지금부터입니다." — healframe-safety-pipeline
- **괄호 보조설명·원어 병기**로 부연한다(영어식 em 대시 삽입구 대신):
  『트라우마』(원제 *Trauma and Recovery*), commitment device, fail-closed.

## 영어

- 위 목소리를 그대로 옮긴 담백한 1인칭. 동일한 정직 tics.
  - "I don't know yet what shape that takes. I'm writing down that I don't know, too." — thoughts-about-giving-back (en)
- **em 대시를 절제해서 올바르게** 쓴다 — 이는 AI 티가 아니라 저자 스타일이므로 보존.
  - "There was friction too, of course — it's people, after all." — thoughts-about-giving-back (en)

## 손대지 않는 예외

- `studying-english-with-chatgpt`의 영어판은 저자의 진짜 비원어민 목소리로 **원문 그대로 보존.** "고치지" 않는다.
- 2023년 기준 에세이(`thoughts-about-giving-back`, `studying-english-with-chatgpt`)는
  자연 목소리 baseline이라 기존 스타일을 유지한다.
```

- [ ] **Step 2: 인용 보강 — 나머지 글에서 예시 2~3개 추가**

아직 안 읽은 글을 읽고, 위 각 범주(정직 tics / 구체성 / 조용한 마무리)에 맞는 실제 문장을 2~3개 더 뽑아 넣는다. 대상 파일:
`content/posts/ko/building-dont-touch/index.mdx`, `content/posts/ko/rentrights-honest-estimator/index.mdx`, `content/posts/ko/studying-english-with-chatgpt/index.mdx`.
넣는 인용마다 슬러그를 병기한다. **문장을 지어내지 말 것 — 실제 원문만.**

- [ ] **Step 3: 검증 — 인용이 실제 원문인지 대조**

각 인용을 원본 파일에서 grep으로 확인한다. 예:
Run: `grep -rn "모른다는 것도 그대로 적어둡니다" content/posts/`
Expected: `thoughts-about-giving-back` 파일에서 매치. 모든 인용이 하나 이상 매치해야 한다(매치 없으면 발명이므로 삭제).

- [ ] **Step 4: 플레이스홀더 스캔**

Run: `grep -nE "TBD|TODO|채워|예시 추가" .claude/skills/polish-writing/references/voice.md`
Expected: 매치 없음.

- [ ] **Step 5: 커밋**

```bash
git add .claude/skills/polish-writing/references/voice.md
git commit -m "feat(polish-writing): add voice profile reference"
```

---

### Task 2: `references/ai-tells.md` — 색출/보존 이중 목록

**Files:**
- Create: `.claude/skills/polish-writing/references/ai-tells.md`

**Interfaces:**
- Produces: `SKILL.md` 빠른 모드와 `deep-review.md` 페르소나 5가 참조하는 "무엇을 제거하고 무엇을 보존하는가" 목록.

- [ ] **Step 1: 파일을 아래 내용으로 작성**

```markdown
# AI 티: 색출 vs 보존

두 목록을 함께 본다. "색출"만 보고 기계적으로 지우면 저자의 정당한 스타일까지
망가진다 — 반드시 "보존" 목록으로 걸러낸다.

## 색출 (제거 대상)

### 영어
- em 대시 **남발**(장식적 과용만 — 절제된 사용은 보존)
- "It's not just X, it's Y" / "not only… but also" 대조 프레임
- "delve / dive into / unpack / realm / tapestry / testament to"
- 접속사 남발: "Furthermore / Moreover / In conclusion / Additionally"
- "In today's fast-paced world" / "It's important to note" / "It's worth noting"
- 만능 3단 나열("fast, simple, and reliable")
- 허세 형용사: "powerful / seamless / robust / cutting-edge / game-changer / revolutionary"
- 균일한 문장 길이(리듬 없음), 공허한 요약 결론("In summary, …"), 과잉 hedge

### 한국어 (2026-06-12 사용자 검증 de-polishing 기준)
1. 영어식 em 대시(—) 삽입구 → 문장 또는 괄호로 (한국어 2026 글은 이미 em 대시 0)
2. 극적인 문장 중간 **볼드** 강조 → 볼드는 제품명·라벨 등 스캔용 명사에만
3. 매 글을 깔끔한 경구형으로 닫기("A하지 않습니다. 다만 B할 뿐입니다") → 마무리 변주
4. 문단마다 과밀한 대구/대조("A가 아니라 B")
5. 아기자기한 프레이밍 장치·헤더("입구쯤으로 읽어주세요", "선 하나")
- 그 외: 번역투("~에 대해 / ~을 통해 / ~라는 점에서"), 접속사 남발("또한 / 게다가 /
  뿐만 아니라 / 따라서 / 결론적으로"), 허세 형용사("혁신적인 / 강력한 / 놀라운 /
  완벽한 / 손쉽게"), "~라고 할 수 있습니다" 남발, 균일한 `~습니다` 리듬,
  불필요한 리스티클, 마케팅 감탄사·이모지, 독자 호명("여러분")

## 보존 (건드리지 말 것 — 저자의 정당한 스타일)

- **절제되고 올바른 em 대시 — 영어 한정.** (한국어는 위 색출대로 제거. 단 2023 baseline
  에세이는 기존 스타일 유지.)
- 정직 tics: "솔직히", "솔직히 말하면", "그대로 적어둡니다", "~라고만 적어두겠습니다",
  "아직 고민 중", "모르겠습니다"
- 짧은 선언문 + 긴 반성문의 리듬 변주, 문단을 조용히 닫기
- 구체 숫자·고유명사, 한계·불확실성 인정, 괄호 보조설명·원어 병기
```

- [ ] **Step 2: 검증 — 보존 목록이 색출 목록과 충돌하지 않는지 확인**

리뷰 체크: 영어 em 대시가 색출("남발")과 보존("절제된 사용")에 모두 있고 조건이 명확한가? 한국어 em 대시는 보존에 없고 색출에만 있는가(2023 예외만 명시)? 두 항목이 모순되면 조건을 더 분명히 한다.

- [ ] **Step 3: 플레이스홀더 스캔**

Run: `grep -nE "TBD|TODO|예시 추가|채워" .claude/skills/polish-writing/references/ai-tells.md`
Expected: 매치 없음.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/polish-writing/references/ai-tells.md
git commit -m "feat(polish-writing): add AI-tells strip/preserve lists"
```

---

### Task 3: `references/editorial-rules.md` — 편집 규칙·팩트 소스

**Files:**
- Create: `.claude/skills/polish-writing/references/editorial-rules.md`
- Source(참고): `content/projects.json`, `content/graveyard.json`

**Interfaces:**
- Produces: `SKILL.md` 빠른 모드의 팩트체크·규칙 강제 단계와 페르소나 4(인디해커)가 참조하는 규칙 집합.

- [ ] **Step 1: 파일을 아래 내용으로 작성**

```markdown
# 편집 규칙 (팩트·정직·동기화)

## 팩트 소스 (우선순위)
1. `content/projects.json` = 기술 사실의 **단일 출처.** 여기 없는 기능·수치·구현
   디테일은 쓰지 않는다.
2. 저자의 인터뷰/기존 원고 = 개인 서사(동기·일화)의 출처.
3. 둘 다 없으면 "확인 필요"로 표시하고 **묻는다 — 발명하지 않는다.**

## 발명 금지
서사·일화·인용·수치를 새로 창작하지 않는다. 근거 없는 기술 주장은 수정하지 말고
**플래그**한다 (예: "이 '313개 테스트'가 projects.json에 없습니다 — 확인 필요").

## 알려진 '확인 필요' 항목 (사실이 없어 의도적으로 비워 둠 — 채우지 말 것)
- RentRights: 13–55초 → 1초 폴백 메커니즘의 내부 동작
- HealFrame: 평가셋(eval-set) 크기, 라벨 출처(provenance)

## 스코프된 주장 (절대 보증 금지)
절대적 보증은 금지. 예: HealFrame "위기 신호 누락 0"은 항상 "평가 세트 기준, 증명이
아닌 통과 기준, LLM-judge 순환성 인정"으로 한정한다.

## 정직한 자기규정 (과대약속 금지)
도구가 무엇인지/아닌지를 과장 없이 적는다(예: "치료가 아니다"). 별도의 안전 규칙이
아니라 위 발명 금지·정직한 한계 인정의 일부다.

## 정직한 AI 기여 표기
모든 프로젝트는 Claude Code로 만들어졌고, 글은 이를 정직하게 다룬다. "직접 구현"이
아니라 "Claude Code에 자료를 읽혀 구현"으로 적는다 (예: Hoverslam 수어사이드 번 물리).
과대표기보다 정직한 AI 표기를 택한다.

## 손대지 않는 예외
`studying-english-with-chatgpt`의 영어판은 저자의 진짜 비원어민 목소리 — 원문 그대로 보존.

## ko/en 동기화
두 파일(`content/posts/ko/<슬러그>`, `content/posts/en/<슬러그>`)의 구조·사실·메시지
대칭, 슬러그 일치, frontmatter 필드 대응(coverImage·faqs 양쪽 존재). 관용구는 각
언어의 등가물로 치환. ko는 `/blog/...`, en은 `/en/blog/...` 링크.

## frontmatter 보존
title, excerpt, publishedAt, updatedAt, author, category, tags, coverImage, faqs
스키마를 깨지 않는다.

## 위기자원 푸터 — 의도적 제외 (결정 기록, 2026-07-11)
자살예방/정신건강 상담번호 같은 위기자원 푸터는 규칙에서 **제외한다.** 개인 블로그의
친밀한 목소리와 충돌하고, 모든 멘탈헬스 글에 기계적으로 붙으면 오히려 AI가 갖다 붙인
느낌을 준다. 스킬은 이를 **자동 추가하지도, 플래그하지도 않는다.** 개별 글에 저자가
직접 넣는 것은 저자 재량이며 스킬 관여 밖. **미래 세션이 "안전"을 이유로 이 규칙을
되살리지 말 것.**
```

- [ ] **Step 2: 검증 — projects.json 구조 확인**

Run: `head -40 content/projects.json`
Expected: 프로젝트 배열이 보이고, 규칙 문서가 이 파일을 "단일 출처"로 올바르게 지목하는지 확인. (구조가 예상과 다르면 규칙 문서의 경로/설명을 실제에 맞게 고친다.)

- [ ] **Step 3: 플레이스홀더 스캔**

Run: `grep -nE "TBD|TODO|채워|예시 추가" .claude/skills/polish-writing/references/editorial-rules.md`
Expected: 매치 없음.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/polish-writing/references/editorial-rules.md
git commit -m "feat(polish-writing): add editorial rules and fact sources"
```

---

### Task 4: `references/deep-review.md` — 5-페르소나 프로토콜

**Files:**
- Create: `.claude/skills/polish-writing/references/deep-review.md`

**Interfaces:**
- Consumes: `voice.md`, `ai-tells.md`, `editorial-rules.md` (각 페르소나가 참조).
- Produces: `SKILL.md` 깊은 모드가 호출하는 리뷰 프로토콜.

- [ ] **Step 1: 파일을 아래 내용으로 작성**

```markdown
# 깊은 모드: 5-페르소나 리뷰

딥다이브·민감한 글용. 아래 다섯은 저자가 2026-06-12에 실제로 돌려 효과를 본 구성이다.
각 페르소나가 **독립적으로** 원고를 읽고 지적한 뒤 종합한다.

| # | 페르소나 | 관점 / 묻는 것 |
|---|---------|---------------|
| 1 | KR 시니어 개발자 | 기술 서사가 한국 개발자에게 설득력 있는가? 과장·허세 없이 정확한가? |
| 2 | US 엔지니어링 매니저 | 영어판이 채용·평판 관점에서 프로페셔널하고 신뢰가 가는가? |
| 3 | 멘탈헬스 경험 독자 | 개인·민감 소재를 무례하거나 자극적으로 다루지 않는가? 과대약속은 없는가? |
| 4 | 인디 해커 (projects.json 대조) | 모든 기술 주장이 projects.json과 일치하는가? 발명·미근거 주장은 없는가? |
| 5 | 이중언어 대칭 에디터 | ko/en이 사실·구조·메시지에서 대칭인가? 관용구가 각 언어에 자연스럽게 치환됐는가? |

## 종합 규칙
- 각 페르소나 지적을 합의(consensus)로 모아 중복 병합
- 심각도순 정렬: 팩트 > 명료성 > 스타일
- 빠른 모드와 동일한 **비파괴적 승인제** 출력 (before→after, 저자 채택)
- 기술 사실 수정은 필요 시 별도 에이전트(예: Fable 5)에 위임할 수 있다
```

- [ ] **Step 2: 검증 — 페르소나가 참조 파일과 연결되는지 확인**

리뷰 체크: 페르소나 4가 `editorial-rules.md`의 팩트 규칙을, 페르소나 5가 `editorial-rules.md`의 ko/en 동기화를 실제로 적용하도록 서술됐는가? 다섯 페르소나가 스펙 §6과 일치하는가?

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/polish-writing/references/deep-review.md
git commit -m "feat(polish-writing): add 5-persona deep review protocol"
```

---

### Task 5: `SKILL.md` — 워크플로 오케스트레이터

**Files:**
- Create: `.claude/skills/polish-writing/SKILL.md`

**Interfaces:**
- Consumes: `references/voice.md`, `references/ai-tells.md`, `references/editorial-rules.md`, `references/deep-review.md`.
- Produces: 저자가 이름/트리거로 호출하는 진입점. Claude Code가 frontmatter로 자동 발견.

- [ ] **Step 1: 파일을 아래 내용으로 작성**

```markdown
---
name: polish-writing
description: 블로그/프로젝트 초안을 저자 목소리로 다듬고 팩트를 검증한다. 사람처럼 읽히게, AI 티 제거, 초안 교정/폴리싱, 5-페르소나 리뷰가 필요할 때. content/posts 의 mdx 나 projects.json 프로젝트 설명문 대상.
---

# polish-writing

CC로 잡은 초안을 저자 목소리로 다듬는 **라인 에디터**다. 리라이터가 아니다 —
문장을 갈아엎지 않고, 목소리에서 벗어난 곳과 AI 티만 손질하며, 팩트를 검증한다.

## 언제
- `content/posts/{ko,en}/<슬러그>/index.mdx` 초안을 다듬을 때
- `content/projects.json`·`content/graveyard.json` 프로젝트 설명문을 다듬을 때

## 절대 규칙 (먼저 읽는다)
- **발명 금지.** 근거 없는 기술 주장은 고치지 말고 플래그한다. (`references/editorial-rules.md`)
- **비파괴적.** 변경안을 카테고리별 before→after로 제시하고, 저자가 채택한 것만 적용한다.
- **팩트 문제는 자동 수정하지 않는다** — 질문으로만 올린다.
- **위기자원 푸터를 추가하지 않는다** (규칙에서 제외됨). "안전"을 이유로 되살리지 말 것.

## 빠른 모드 (기본)
1. 대상 글의 ko/en 쌍을 모두 읽는다.
2. `references/editorial-rules.md`대로 모든 기술 주장을 `projects.json`(필요 시
   `graveyard.json`)과 대조한다. 근거 없으면 **플래그**(수정 안 함).
3. `references/voice.md` 기준으로 리듬·정직 tics·구체성을 손질하고,
   `references/ai-tells.md`의 "색출"로 AI 티만 제거한다. "보존" 목록은 건드리지 않는다.
   (em 대시: 한국어 제거, 영어 보존.)
4. `references/editorial-rules.md`의 ko/en 동기화·frontmatter 스키마·과대약속 금지를 점검한다.
5. **결과 제시** — 아래 출력 형식.

## 깊은 모드 (`--deep`, 딥다이브·민감한 글)
`references/deep-review.md`의 5-페르소나 프로토콜을 실행한다. 각 페르소나가 독립적으로
읽고 지적 → 종합 → 아래 출력 형식.

## 출력 형식
- 몰래 갈아엎지 않는다. 변경안을 **카테고리별(목소리 / AI티 / 규칙)로 before→after** 나열.
- 저자가 "전체 적용" 또는 항목별 채택. 채택된 것만 Edit으로 적용해 git diff로 보이게 한다.
- **팩트 플래그는 별도 섹션에 질문으로** 올린다 (자동 수정 금지).
- 라인 편집은 가벼운 손질 원칙. 이미 잘 작동하는 문장은 보존한다.
```

- [ ] **Step 2: 검증 — frontmatter/참조 경로 확인**

리뷰 체크: (a) frontmatter에 `name: polish-writing`과 트리거 어구를 담은 `description`이 있는가? (b) 본문이 네 참조 파일을 모두 올바른 상대경로로 가리키는가? (c) "위기자원 푸터 추가 안 함", "비파괴적", "발명 금지"가 명시됐는가?

Run: `ls .claude/skills/polish-writing/references/`
Expected: `ai-tells.md  deep-review.md  editorial-rules.md  voice.md` — SKILL.md가 참조하는 네 파일이 모두 존재.

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/polish-writing/SKILL.md
git commit -m "feat(polish-writing): add skill workflow entrypoint"
```

---

### Task 6: End-to-end 시연 검증

스킬이 실제로 (a) AI 티를 잡고 (b) 발명된 팩트를 플래그하고 (c) 저자의 정당한 스타일을 보존하는지, 심어놓은 초안으로 확인한다.

**Files:**
- Create(임시, 스크래치패드): `<scratchpad>/polish-test-draft.md` — 리포 밖. 커밋하지 않는다.

**Interfaces:**
- Consumes: 완성된 `.claude/skills/polish-writing/` 전체.

- [ ] **Step 1: 티를 심은 테스트 초안 작성**

스크래치패드에 아래 한국어 문단을 만든다. 의도적으로 심은 것: (A) em 대시 삽입구,
(B) 허세 형용사, (C) 경구형 마무리, (D) projects.json에 없는 발명 수치, (E) 보존해야 할
정직 tic.

```markdown
저는 강력하고 혁신적인 금주 앱을 만들었습니다 — 정말 놀라운 결과였습니다.
이 앱은 무려 512개의 테스트를 통과했고, 완벽하게 동작합니다.
솔직히 아직 고민 중인 부분도 있습니다.
실패하지 않습니다. 다만 배울 뿐입니다.
```

- [ ] **Step 2: 스킬을 이 초안에 돌린다**

polish-writing 스킬을 스크래치패드 초안에 대해 빠른 모드로 실행한다.

- [ ] **Step 3: 결과를 성공 기준과 대조**

다음을 **모두** 만족해야 한다(하나라도 실패면 해당 참조 파일을 고치고 재실행):
- (A) em 대시 삽입구가 **색출**돼 문장/괄호로 바뀐다.
- (B) "강력하고 혁신적인", "놀라운", "완벽하게"가 허세 형용사로 **색출**된다.
- (C) "실패하지 않습니다. 다만 배울 뿐입니다."가 경구형 마무리로 **지적**된다.
- (D) "512개의 테스트"가 projects.json에 없어 **플래그**된다 — **자동 수정되지 않고 질문으로** 올라온다.
- (E) "솔직히 아직 고민 중인" 정직 tic은 **보존**된다(AI 티로 오인 제거 안 됨).
- 출력이 before→after 카테고리 형식이고, 저자 승인 전에는 파일을 바꾸지 않는다.
- 어디에도 위기자원 푸터가 추가되지 않는다.

- [ ] **Step 4: 스크래치 파일 정리**

Run: 스크래치패드의 `polish-test-draft.md` 삭제. (리포에 남기지 않는다.)

- [ ] **Step 5: 검증 결과를 스펙에 기록하고 커밋**

스펙 §9 하단에 "검증: 2026-07-11 end-to-end 시연 통과 (A–E 확인)" 한 줄을 추가한다.

```bash
git add docs/superpowers/specs/2026-07-11-polish-writing-skill-design.md
git commit -m "docs(polish-writing): record end-to-end verification"
```

---

## Self-Review (계획 저자용)

**1. Spec coverage:**
- 스펙 §4 파일구조 → Task 1–5가 각 파일 생성. ✓
- §5 빠른 모드 → Task 5 SKILL.md + Task 6 시연. ✓
- §6 깊은 모드 5-페르소나 → Task 4. ✓
- §7.1 voice.md → Task 1. §7.2 ai-tells.md → Task 2. §7.3 editorial-rules.md → Task 3. §7.4 deep-review.md → Task 4. ✓
- §7.3의 위기자원 제외·스코프주장·확인필요·studying-english 예외·AI표기 → Task 3에 전부 포함. ✓
- §9 성공 기준 → Task 6 Step 3의 (A)–(E)로 관측 검증. ✓

**2. Placeholder scan:** 각 파일 내용을 실제 문구로 채웠고, 각 Task에 grep 플레이스홀더 스캔 스텝 포함. Task 1 Step 2의 "인용 보강"은 열린 지시가 아니라 대상 파일·범주를 명시한 구체 작업. ✓

**3. Type consistency:** 파일명·상대경로가 전 Task에서 일치(`references/voice.md` 등). SKILL.md가 참조하는 네 파일명이 Task 1–4 산출물과 정확히 일치. ✓
