import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PageTransition } from '@/components/ui/PageTransition'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/mdx'
import { generateBreadcrumbJsonLd, safeJsonLd } from '@/lib/seo'
import { WALK_HOPS, WALK_REJECTS } from '@/lib/studio-walk'
import projectsData from '../../../../content/projects.json'
import type { Project } from '@/types/content'

// Same cadence as /hire and /about: the copy is static, and the only moving
// part is the blog cover list, which changes when a post ships.
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'studio' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/studio`

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      url: pageUrl,
      title: t('metaTitle'),
      description: t('metaDescription'),
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? ['en_US'] : ['ko_KR'],
      type: 'article',
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: `${SITE_URL}/studio`,
        en: `${SITE_URL}/en/studio`,
        'x-default': `${SITE_URL}/studio`,
      },
    },
  }
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <StudioContent />
}

/** One row of the machine's record, rendered as a definition pair. */
function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] py-2 last:border-b-0">
      <dt className="ledger-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="ledger-mono text-right text-xs text-[var(--text-secondary)]">{value}</dd>
    </div>
  )
}

function StudioContent() {
  const t = useTranslations('studio')
  const locale = useLocale()

  // The blog covers are the factory's standing job, and the section says so —
  // a claim about where they came from, so it needs a source. They were made
  // by the same image-studio server with the same krea2 model and ruled on
  // through the same verify_asset call: see docs/media/hero-generation-report.md
  // and the machine gate those files had to pass in src/lib/hero-palette.ts.
  //
  // Read from the posts rather than listed by hand so the section cannot drift
  // out of date — and, more to the point, so nothing here ever reaches into
  // the studio library.
  const covers = getAllPosts(locale)
    .filter((post) => post.coverImage)
    .slice(0, 8)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: t('title'), url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/studio` },
  ])

  // The chip row is the ledger's own techStack for `studios`, not a second
  // hand-kept list. Two places naming the same stack is two places to disagree.
  const studios = (projectsData.projects as Project[]).find((p) => p.slug === 'studios')

  const badges = [t('badgeModalities'), t('badgeLocal'), t('badgeTests')]
  const steps = ['step1', 'step2', 'step3', 'step4'] as const
  const projectsHref = locale === 'ko' ? '/projects/studios' : `/${locale}/projects/studios`
  const hireHref = locale === 'ko' ? '/hire' : `/${locale}/hire`

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="ledger-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{t('description')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="ledger-mono text-[11px] tracking-[0.15em] px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--accent-text)] border border-[var(--border-hover)]"
              >
                {badge}
              </span>
            ))}
          </div>
        </header>

        {/* Two disclosures, both load-bearing. The first stops the page from
            implying five modalities were demonstrated when three were; the
            second keeps generated art from being mistaken for product UI,
            which is the one thing this site never does. */}
        <div className="mb-14 space-y-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">{t('shownNote')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('generatedNote')}</p>
        </div>

        {/* The walk. One subject through the factory, each hop carrying the
            record the machine wrote — not a grid of pretty outputs, which
            would prove nothing that a subscription cannot buy. */}
        <section className="mb-16">
          <h2 className="ledger-display text-2xl font-bold mb-3">{t('walk.heading')}</h2>
          <p className="text-[var(--text-secondary)] mb-2">{t('walk.intro')}</p>
          <p className="text-sm text-[var(--text-muted)] mb-8">{t('walk.why')}</p>

          <div className="space-y-10">
            {WALK_HOPS.map((hop) => (
              <article
                key={hop.key}
                className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start"
              >
                <div className="overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)]">
                  {/* The page's largest image and the first one a reader
                      scrolls to, so it is the LCP candidate here. Left lazy it
                      arrives after the fold has already been read past. */}
                  <Image
                    src={hop.src}
                    alt={t(`hops.${hop.key}.alt`)}
                    width={hop.width}
                    height={hop.height}
                    priority
                    sizes="(max-width: 640px) 100vw, 420px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="ledger-display text-lg font-bold mb-2">
                    {t(`hops.${hop.key}.heading`)}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {t(`hops.${hop.key}.body`)}
                  </p>
                  <dl>
                    {hop.record.map((row) => (
                      <RecordRow key={row.key} label={t(`record.${row.key}`)} value={row.value} />
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Rejects. A pipeline that only publishes its hits is a gallery. */}
        <section className="mb-16">
          <h2 className="ledger-display text-2xl font-bold mb-3">{t('rejects.heading')}</h2>
          <p className="text-[var(--text-secondary)] mb-6">{t('rejects.body')}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {WALK_REJECTS.map((reject) => (
              <figure key={reject.src} className="overflow-hidden rounded-lg border border-[var(--border-default)]">
                <div className="relative">
                  <Image
                    src={reject.src}
                    alt={t(`rejects.${reject.noteKey}Alt`)}
                    width={reject.width}
                    height={reject.height}
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="w-full opacity-60"
                  />
                  <span className="ledger-mono absolute left-3 top-3 rounded-full border border-[var(--border-hover)] bg-[var(--bg-primary)] px-2.5 py-1 text-[10px] tracking-[0.2em] text-[var(--text-muted)]">
                    {t('rejects.verdictBadge')}
                  </span>
                </div>
                <figcaption className="bg-[var(--bg-elevated)] p-4">
                  <span className="ledger-mono block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {t('record.seed')} {reject.seed}
                  </span>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                    {t(`rejects.${reject.noteKey}`)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="ledger-display text-2xl font-bold mb-6">{t('how.heading')}</h2>
          <ol className="grid gap-px overflow-hidden rounded-lg bg-[var(--border-default)] sm:grid-cols-2">
            {steps.map((step, i) => (
              <li key={step} className="bg-[var(--bg-elevated)] p-5">
                <span className="ledger-mono text-[10px] tracking-[0.25em] text-[var(--accent-text)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="ledger-display mt-1 text-base font-bold">{t(`how.${step}.heading`)}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{t(`how.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The factory has a standing job, and the reader is looking at its
            output already. Stronger than any showreel. */}
        {covers.length > 0 && (
          <section className="mb-16">
            <h2 className="ledger-display text-2xl font-bold mb-3">{t('inUse.heading')}</h2>
            <p className="text-[var(--text-secondary)] mb-6">{t('inUse.body')}</p>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {covers.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={locale === 'ko' ? `/blog/${post.slug}` : `/${locale}/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-lg border border-[var(--border-default)] transition-colors group-hover:border-[var(--border-hover)]">
                      <Image
                        src={post.coverImage!}
                        alt=""
                        width={320}
                        height={200}
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </div>
                    <span className="mt-2 block text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-16">
          <h2 className="ledger-display text-2xl font-bold mb-4">{t('inside.heading')}</h2>
          <p className="text-[var(--text-secondary)] mb-6">{t('inside.body')}</p>
          <ul className="flex flex-wrap gap-2">
            {(studios?.techStack ?? []).map((tech) => (
              <li
                key={tech}
                className="ledger-mono rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6">{t('links.heading')}</h2>
          <div className="grid gap-px overflow-hidden rounded-lg bg-[var(--border-default)] sm:grid-cols-2">
            <Link
              href={projectsHref}
              className="flex flex-col gap-1 bg-[var(--bg-elevated)] p-5 transition-opacity hover:opacity-90"
            >
              <span className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
                LEDGER
              </span>
              <span className="text-sm text-[var(--text-primary)]">{t('links.project')}</span>
            </Link>
            <Link
              href={hireHref}
              className="flex flex-col gap-1 bg-[var(--bg-elevated)] p-5 transition-opacity hover:opacity-90"
            >
              <span className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
                HIRE
              </span>
              <span className="text-sm text-[var(--text-primary)]">{t('links.hire')}</span>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
