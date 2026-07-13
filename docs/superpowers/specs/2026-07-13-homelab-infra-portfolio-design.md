# Homelab / Self-Hosted Infra — Portfolio Design Spec

**Date:** 2026-07-13
**Status:** Approved
**Author:** Si Hyeong Lee (with Claude Code)

## Motivation

The portfolio currently represents work only at GitHub-repo granularity
(`content/projects.json`): each entry is a shippable product with a repo
and/or a live URL. The author also designs, builds, and operates a
self-hosted infrastructure layer (home GPU compute + a cloud VM, tied
together with a mesh VPN, reverse proxy, secrets manager, and monitoring)
that several existing projects (`ai-4080-ops`, `studios`, `ComfyUI Web`)
already depend on — but that operational layer itself is invisible. A
visitor sees the apps it runs, never the systems/networking/security work
that keeps them running.

Goal: make that capability legible fast, in the place visitors already look
(About page skills + timeline), backed by a deep-dive blog post for anyone
who wants to verify the claim.

## Confirmed facts (do not extend beyond these — no invented tooling)

- **Compute:** Windows RTX 4080 workstation at home, no hypervisor — Docker
  containers and Python venvs run directly on the host. Runs `studios`
  (image/video/3D/voice/music generation), ComfyUI, and Ollama (local LLM).
- **Ops tooling:** `ai-4080-ops` — a PowerShell toolkit for remote,
  SSH-driven operation of the 4080 box (GPU/port/Funnel/Caddy health checks).
- **Cloud:** an Oracle Cloud Ubuntu VM runs always-on lightweight services —
  Infisical (self-hosted secrets manager) and Plane (self-hosted project
  management), so the home box doesn't need to stay always-on for those.
- **Network:** Tailscale mesh VPN connects the home box, the cloud VM, and
  dev clients. Caddy (reverse proxy) + DuckDNS (dynamic DNS) expose only the
  services that need to be public.
- **Monitoring:** PowerShell health-check scripts (already shipped as
  `ai-4080-ops`) plus Uptime Kuma.
- **Not confirmed / explicitly out:** no Proxmox or other hypervisor, no
  dedicated NAS/backup system. Do not imply either exists.

## Scope

**In scope:**
1. New `infra` skill category in `content/about.json`, rendered as a peer of
   `frontend`/`backend`/`tools` (requires touching the 4 files that hardcode
   the 3-category set — see Architecture).
2. One new `timeline` entry in `content/about.json` narrating the homelab as
   ongoing work, cross-referencing `ai-4080-ops`/`studios` by implication.
3. One new blog post (ko + en) under `content/posts/` walking through the
   actual setup. Uses the existing posts content type — no schema change.

**Out of scope:**
- A dedicated `/homelab` or `/infra` route (rejected in brainstorming —
  lower visibility than the About page for the "generalist" impression this
  is meant to create, and higher dev cost: new Keystatic collection, route,
  i18n namespace, nav entry).
- A `href`/link field on `timeline` items (would require another schema +
  rendering change for one usage site; the About page and Blog nav already
  make the post discoverable).
- A new `timeline.type` enum value for "infra" (reusing `project` avoids
  touching `TYPE_COLORS` in `TimelineSection.tsx` for no visible benefit —
  color-coding by type isn't part of what sells this).
- Reclassifying `Docker` out of the existing `tools` skill category.
- Any NAS/backup/hypervisor content (not real — see confirmed facts above).

## Security guardrail

No raw Tailscale IPs, no the Oracle VM's public IP, no the literal DuckDNS
subdomain string appear in any public-facing content (About page or blog
post). Describe the technology and architecture; never print the specific
hostnames/addresses discovered during research.

## Architecture — files touched

Adding `infra` as a real category (not folding it into `tools`) requires
code changes in exactly these 4 places; nothing else references the
category set:

```
keystatic.config.ts        # about.skills.category select: + { value: 'infra', label: '인프라' }
src/types/content.ts       # Skill.category union: + 'infra'
                            # skillCategories: + infra: { ko: '인프라', en: 'Infra' }
src/app/[locale]/about/page.tsx                 # groupedSkills: + infra: skills.filter(...)
src/app/[locale]/play/sections/SkillsSection.tsx # grouped: + infra: skills.filter(...)
                                                  # CATEGORY_COLORS: + infra: '#5f8b7a' (muted teal, same desaturated family as the other 3)
```

`SkillsSection.tsx` layout note: `catX = (catIdx - 1) * 5` currently assumes
exactly 3 categories centered on x=0 (`-5, 0, 5`). With a 4th category this
must generalize to stay centered, e.g.
`catX = (catIdx - (categories.length - 1) / 2) * 5`, computed from
`Object.keys(grouped).length` rather than the hardcoded `1`. `TYPE_COLORS`
in `TimelineSection.tsx` is untouched (no new `type` value — see Out of
scope).

`messages/ko.json` / `messages/en.json` are **not** touched — category
labels live in `skillCategories` in `src/types/content.ts`, confirmed by
investigation (no `frontend|backend|tools` matches in either messages file).

## Content

### `content/about.json` — new skills (category: `infra`)

Tailscale, Caddy, Oracle Cloud, Infisical, Uptime Kuma, Ollama.

### `content/about.json` — new timeline entry

```json
{
  "date": "2025 - Present",
  "titleKo": "홈서버·셀프호스팅 인프라 구축·운영",
  "titleEn": "Building & running self-hosted infrastructure",
  "descriptionKo": "집 GPU 워크스테이션(RTX 4080)과 Oracle Cloud VM을 Tailscale 사설망으로 묶어 self-host 인프라를 구축. Caddy·DuckDNS로 필요한 서비스만 공개 노출하고, Infisical(시크릿)·Plane(프로젝트 관리)을 직접 운영하며 PowerShell 상태점검 스크립트와 Uptime Kuma로 모니터링. 이 인프라 위에서 studios·ai-4080-ops 같은 생성 파이프라인이 돌아감.",
  "descriptionEn": "Tied a home GPU workstation (RTX 4080) and an Oracle Cloud VM together over a Tailscale mesh to run self-hosted infrastructure. Caddy and DuckDNS expose only what needs to be public; Infisical (secrets) and Plane (project management) run self-hosted, monitored via PowerShell health-check scripts and Uptime Kuma. The generative pipelines in studios and ai-4080-ops run on top of this.",
  "type": "project"
}
```

Exact wording may be refined during implementation, but must stay within
the confirmed facts above — no invented tooling.

### Blog post (ko + en)

Outline, to be drafted via the `polish-writing` skill (author interview for
narrative, `projects.json`/this spec as the factual source of truth per the
project's editorial principles):

1. Why split home GPU box vs. cloud VM (cost/uptime trade-off).
2. Tailscale as the connective layer — why mesh VPN over exposing ports.
3. What's actually public (Caddy + DuckDNS) vs. Tailscale-only.
4. Self-hosting Infisical and Plane instead of paid SaaS — what that bought
   and what it cost.
5. Monitoring: PowerShell scripts + Uptime Kuma, what they catch.
6. Ties back to `ai-4080-ops` and `studios` as the concrete proof.

No new content schema needed — uses the existing bilingual posts pipeline.

## Testing / QA

- `type-check`, `lint`, `test`, `build` after the 4-file skill-category
  change.
- Manual: `/about` and `/en/about` show the Infra skill group; `/play` 3D
  scene renders 4 evenly-spaced category clusters (not lopsided); Keystatic
  admin UI (`/keystatic`) shows "인프라" as a selectable category and saves
  correctly.
- Blog post goes through the standard `polish-writing` review before
  publish.

## Rollout

Feature branch → local QA green → push (Vercel preview) → confirm preview →
merge to `main` for production (promotion confirmed with user). Blog post
can ship in the same branch or a follow-up — not blocking the About page
change.
