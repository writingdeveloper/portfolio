import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import type { Project, Tombstone } from '@/types/content'
import type { PostMeta } from '@/lib/mdx'
import { predecessorOf } from '@/lib/lineage'

// ── Builder's Ledger home ──────────────────────────────────────────────────
// Immersive, full-bleed redesign generated in Claude Design and ported here:
// near-black + acid-green editorial "ledger" system, Bricolage Grotesque
// (display) · Space Mono (labels) · Pretendard (Korean/body). English chrome +
// locale-aware content, matching the reference.

const ACCENT = 'var(--l-accent)'
const INK = 'var(--l-ink)'
const MUTED = 'var(--l-muted)'
const DIM = 'var(--l-dim)'
const CARD = 'var(--l-card)'
const ELEV = 'var(--l-elev)'
const BORDER = 'var(--l-border)'

const STACK = ['TypeScript', 'Next.js', 'React', 'Three.js', 'NestJS', 'Electron', 'Python']

// ALL WORK grouping — implies the 32-project scale without listing everything.
const CATEGORY: Record<'products' | 'games' | 'tools', string[]> = {
  products: ['soursea', 'healframe', 'drymora', 'fitcheck', 'rentrights', 'receipt-tracker', 'zodiacly', 'transit-la', 'kindling', 'growgle', 'argus-fusion', 'observer-of-lines'],
  games: ['hoverslam', 'normandy-cliff-defense', 'mini-games', 'tantrum-tower', 'unclog-la', 'youtube-rhythm-game', 'liminal-bestiary', 'studio-apartment'],
  tools: ['devdeck', 'sitedeck', 'marketdeck', 'notro', 'kl125-controller', 'studios', 'ai-4080-ops', 'nag-coach', 'piano-scribe', 'comfyui-web', 'shipwright', 'dont-touch'],
}

// YAML frontmatter dates (`publishedAt: 2026-06-10`) parse to a Date at runtime
// even though PostMeta types it as string — normalize to a YYYY-MM-DD string so
// it never renders as a raw [object Date] React child.
function fmtDate(d: string): string {
  try {
    return new Date(d).toISOString().slice(0, 10)
  } catch {
    return String(d)
  }
}

function SectionLabel({ index, title, aside }: { index: string; title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div className="flex items-baseline gap-3">
        <span className="ledger-mono text-xs" style={{ color: ACCENT }}>{index}</span>
        <h2 className="ledger-mono text-sm tracking-[0.25em]" style={{ color: INK }}>{title}</h2>
      </div>
      {aside}
    </div>
  )
}

function GooglePlayBadge({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Google Play"
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 transition-opacity hover:opacity-85"
      style={{ background: '#000', border: '1px solid rgba(255,255,255,0.16)' }}>
      <svg width="15" height="17" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id="lg-gp" x1="4" y1="2.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00c3ff" /><stop offset="0.35" stopColor="#00e0a8" />
            <stop offset="0.7" stopColor="#ffce00" /><stop offset="1" stopColor="#ff3d5a" />
          </linearGradient>
        </defs>
        <path fill="url(#lg-gp)" d="M4 2.5v19a1 1 0 0 0 1.5.87l16.5-9.5a1 1 0 0 0 0-1.74L5.5 1.63A1 1 0 0 0 4 2.5Z" />
      </svg>
      <span className="flex flex-col leading-none text-left text-white">
        <span className="text-[9px] uppercase tracking-wide opacity-80">Get it on</span>
        <span className="text-sm font-semibold">Google Play</span>
      </span>
    </a>
  )
}

function statusColor(status: string): string {
  if (status === 'active' || status === 'launched') return ACCENT
  return MUTED
}

function FeaturedCard({ project, locale }: { project: Project; locale: string }) {
  const desc = locale === 'ko' ? project.descriptionKo : project.descriptionEn
  const predecessor = predecessorOf(project)
  return (
    <article className="flex flex-col gap-5 rounded-2xl p-7 sm:p-8" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="ledger-display text-2xl font-bold" style={{ color: INK }}>{project.name}</h3>
        <span className="ledger-mono text-[10px] tracking-widest px-2 py-1 rounded" style={{ color: statusColor(project.status), border: `1px solid ${statusColor(project.status)}` }}>
          {project.status.toUpperCase()}
        </span>
        {project.private && (
          <span className="ledger-mono text-[10px] tracking-widest px-2 py-1 rounded" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>PRIVATE</span>
        )}
      </div>
      <p className="text-[0.95rem] leading-relaxed" style={{ color: MUTED }}>{desc}</p>
      <div className="flex flex-wrap gap-2">
        {project.techStack.slice(0, 6).map((t) => (
          <span key={t} className="ledger-mono text-[11px] px-2 py-1 rounded" style={{ background: ELEV, color: MUTED }}>{t}</span>
        ))}
      </div>
      {predecessor && (
        <Link href="/graveyard" className="ledger-mono text-[11px] transition-colors hover:opacity-80" style={{ color: DIM }}>
          ← {predecessor.name}{locale === 'ko' ? '에서 이어받음' : ' rebuilt'}
        </Link>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-4 pt-1">
        {project.website && (
          <a href={project.website} target="_blank" rel="noopener noreferrer" className="ledger-mono text-sm transition-colors hover:opacity-80" style={{ color: INK }}>
            {locale === 'ko' ? '프로젝트 보기' : 'View project'} →
          </a>
        )}
        {project.github && !project.private && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="ledger-mono text-sm transition-colors hover:opacity-80" style={{ color: MUTED }}>
            Code →
          </a>
        )}
        {project.playStore && <GooglePlayBadge href={project.playStore} />}
      </div>
    </article>
  )
}

export function LedgerHome({ projects, tombstones, posts, locale }: {
  projects: Project[]
  tombstones: Tombstone[]
  posts: PostMeta[]
  locale: string
}) {
  const featured = projects.filter((p) => p.featured)
  const bySlug = new Map(projects.map((p) => [p.slug, p]))
  const playCount = projects.filter((p) => p.playStore).length

  const groups = (Object.keys(CATEGORY) as Array<keyof typeof CATEGORY>).map((key) => {
    const items = CATEGORY[key].map((slug) => bySlug.get(slug)).filter(Boolean) as Project[]
    return { key, items }
  })

  const stats = [
    { n: String(projects.length).padStart(2, '0'), label: 'SHIPPED', hot: true },
    { n: String(tombstones.length).padStart(2, '0'), label: 'BURIED', hot: false },
    { n: String(playCount).padStart(2, '0'), label: 'ON PLAY', hot: false },
    { n: String(featured.length).padStart(2, '0'), label: 'FEATURED', hot: false },
  ]

  const nav = [
    { i: '01', label: 'WORK', href: '/projects' as const },
    { i: '02', label: 'GRAVEYARD', href: '/graveyard' as const },
    { i: '03', label: 'BLOG', href: '/blog' as const },
    { i: '04', label: 'ABOUT', href: '/about' as const },
  ]

  return (
    <div className="ledger ledger-grain">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur" style={{ background: 'rgba(10,10,11,0.72)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="ledger-mono text-sm font-bold tracking-widest flex items-center gap-1.5" style={{ color: INK }}>
            <span style={{ color: ACCENT }}>▪</span> WRITINGDEVELOPER <span className="ledger-cursor" />
          </Link>
          <nav className="hidden items-center gap-7 sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="ledger-mono text-xs tracking-widest transition-colors hover:opacity-80" style={{ color: MUTED }}>
                <span style={{ color: ACCENT }}>{n.i}</span> {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 sm:px-10">
        {/* Hero */}
        <section className="pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="mb-10 flex flex-col gap-2 border-b pb-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: BORDER }}>
            <span className="ledger-mono text-[11px] tracking-[0.2em]" style={{ color: MUTED }}>이시형 · SI HYEONG LEE</span>
            <span className="ledger-mono text-[11px] tracking-[0.2em]" style={{ color: MUTED }}>SOLO FULL-STACK BUILDER</span>
            <span className="ledger-mono text-[11px] tracking-[0.2em]" style={{ color: MUTED }}>LEDGER NO. <span style={{ color: ACCENT }}>001</span></span>
          </div>
          <h1 className="ledger-display font-extrabold leading-[0.9] text-[clamp(2.75rem,11vw,8.5rem)]" style={{ color: INK }}>
            <span className="block">I build<span style={{ color: ACCENT }}>.</span></span>
            <span className="block">I ship<span style={{ color: ACCENT }}>.</span></span>
            <span className="block">I bury the</span>
            <span className="block" style={{ color: DIM }}>dead<span style={{ color: ACCENT }}>.</span></span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: MUTED }}>
            {locale === 'ko'
              ? '30여 개의 웹·모바일·데스크톱·AI·게임 프로젝트를 직접 기획하고 출시합니다. 살아남은 것은 배포하고, 실패한 것은 정직하게 묻습니다.'
              : 'I design and ship 30+ web, mobile, desktop, AI, and game projects solo. What survives gets shipped; what fails gets an honest burial.'}
          </p>
        </section>

        {/* Stats ribbon */}
        <section className="grid grid-cols-2 gap-y-8 border-t py-10 sm:grid-cols-4" style={{ borderColor: BORDER }}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="ledger-display text-5xl font-extrabold sm:text-6xl" style={{ color: s.hot ? ACCENT : INK }}>{s.n}</span>
              <span className="ledger-mono text-[11px] tracking-[0.2em]" style={{ color: MUTED }}>{s.label}</span>
            </div>
          ))}
        </section>

        {/* Featured */}
        <section className="py-16 sm:py-20">
          <SectionLabel index="§01" title="FEATURED WORK" aside={
            <Link href="/projects" className="ledger-mono text-xs tracking-widest transition-colors hover:opacity-80" style={{ color: MUTED }}>
              ALL {projects.length} →
            </Link>
          } />
          <div className="grid gap-6 lg:grid-cols-2">
            {featured.map((p) => <FeaturedCard key={p.slug} project={p} locale={locale} />)}
          </div>
        </section>

        {/* All work */}
        <section className="py-16 sm:py-20">
          <SectionLabel index="§02" title="ALL WORK" />
          <div className="grid gap-10 sm:grid-cols-3">
            {groups.map(({ key, items }) => (
              <div key={key} className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: ACCENT }}>
                  <span className="ledger-mono text-xs tracking-[0.2em]" style={{ color: INK }}>{key.toUpperCase()}</span>
                  <span className="ledger-mono text-xs" style={{ color: ACCENT }}>{String(items.length).padStart(2, '0')}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {items.slice(0, 6).map((p) => (
                    <li key={p.slug} className="text-sm" style={{ color: MUTED }}>{p.name}</li>
                  ))}
                  {items.length > 6 && (
                    <li className="ledger-mono text-xs" style={{ color: DIM }}>+{items.length - 6} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Graveyard teaser */}
        <section className="py-16 sm:py-20">
          <SectionLabel index="§03" title="THE GRAVEYARD" aside={
            <Link href="/graveyard" className="ledger-mono text-xs tracking-widest transition-colors hover:opacity-80" style={{ color: MUTED }}>
              {locale === 'ko' ? '실패에서 배운 기록' : 'What I learned'} →
            </Link>
          } />
          <div className="grid gap-6 sm:grid-cols-3">
            {tombstones.map((t) => {
              const successor = t.supersededBy ? bySlug.get(t.supersededBy) : undefined
              const epitaph = locale === 'ko' ? t.epitaphKo : t.epitaphEn
              return (
                <div key={t.slug} className="flex flex-col items-center gap-3 rounded-b-xl rounded-t-[2.5rem] p-6 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <span className="ledger-mono text-[10px] tracking-[0.35em]" style={{ color: DIM }}>R.I.P</span>
                  <span className="ledger-display text-lg font-bold" style={{ color: INK }}>{t.name}</span>
                  <span className="ledger-mono text-xs" style={{ color: MUTED }}>{t.bornAt}</span>
                  <p className="text-sm italic leading-relaxed" style={{ color: MUTED }}>&ldquo;{epitaph}&rdquo;</p>
                  {successor && (
                    <span className="ledger-mono text-xs font-semibold" style={{ color: ACCENT }}>→ {successor.name}</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* From the log */}
        {posts.length > 0 && (
          <section className="py-16 sm:py-20">
            <SectionLabel index="§04" title="FROM THE LOG" aside={
              <Link href="/blog" className="ledger-mono text-xs tracking-widest transition-colors hover:opacity-80" style={{ color: MUTED }}>
                {locale === 'ko' ? '모든 글' : 'All posts'} →
              </Link>
            } />
            <div className="flex flex-col">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-1 border-t py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8" style={{ borderColor: BORDER }}>
                  <span className="ledger-display text-lg font-semibold transition-colors group-hover:opacity-80" style={{ color: INK }}>{post.title}</span>
                  <span className="ledger-mono shrink-0 text-xs" style={{ color: DIM }}>{fmtDate(post.publishedAt)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        <section className="py-16 sm:py-20">
          <SectionLabel index="§05" title="ABOUT" />
          <p className="max-w-2xl text-lg leading-relaxed" style={{ color: INK }}>
            {locale === 'ko'
              ? '기술로 문제를 해결하는 개발자이자 창업가입니다. 빠르게 만들고, 배우고, 다시 만듭니다.'
              : 'A developer and entrepreneur who solves problems with technology. I build fast, learn, and rebuild.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span key={s} className="ledger-mono text-xs px-3 py-1.5 rounded" style={{ background: ELEV, color: MUTED }}>{s}</span>
            ))}
          </div>
        </section>
      </main>

      {/* Ledger footer */}
      <footer style={{ borderTop: `2px solid ${ACCENT}` }}>
        <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-10">
          <p className="ledger-display text-2xl font-bold sm:text-3xl" style={{ color: INK }}>
            Build something that survives<span style={{ color: ACCENT }}>.</span>
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg sm:grid-cols-3" style={{ background: BORDER }}>
            {[
              { k: 'EMAIL', v: 'sihyeongdev@gmail.com', href: 'mailto:sihyeongdev@gmail.com' },
              { k: 'GITHUB', v: 'github.com/writingdeveloper', href: 'https://github.com/writingdeveloper' },
              { k: 'LINKEDIN', v: 'in/sihyeonglee', href: 'https://www.linkedin.com/in/sihyeonglee/' },
            ].map((row) => (
              <a key={row.k} href={row.href} target={row.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex flex-col gap-1 p-5 transition-colors hover:opacity-90" style={{ background: CARD }}>
                <span className="ledger-mono text-[10px] tracking-[0.25em]" style={{ color: DIM }}>{row.k}</span>
                <span className="ledger-mono text-sm" style={{ color: INK }}>{row.v}</span>
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: BORDER }}>
            <span className="ledger-mono text-xs" style={{ color: DIM }}>© 2026 WRITINGDEVELOPER · LEDGER NO. 001</span>
            <Link href="/play" className="ledger-mono text-xs tracking-widest transition-colors hover:opacity-80" style={{ color: MUTED }}>
              EXPLORE 3D →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
