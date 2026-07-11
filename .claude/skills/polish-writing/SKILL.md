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
