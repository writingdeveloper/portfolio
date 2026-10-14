import Image from 'next/image'
import demos from '../../../content/verified-demos.json'

/** A dated, externally usable demonstration, with its measurement limits attached. */
export function VerifiedProjectDemo({ projectSlug, locale }: { projectSlug: string; locale: string }) {
  const item = demos.demos.find((demo) => demo.project === projectSlug)
  if (!item) return null
  const ko = locale === 'ko'
  return (
    <section
      id="verified-demo"
      aria-labelledby="verified-demo-title"
      className="mb-12 scroll-mt-24 overflow-hidden rounded-xl border border-[var(--border-default)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="ledger-mono text-[11px] uppercase tracking-wider text-[var(--accent-text)]">
            {ko ? '실제 운영 검증 데모' : 'Verified public demonstration'}
          </span>
          <span className="ledger-mono text-xs text-[var(--text-muted)]">
            <time dateTime={item.verifiedAt}>{item.verifiedAt}</time>
          </span>
        </div>
        <h2 id="verified-demo-title" className="ledger-display mt-3 text-xl font-bold sm:text-2xl">
          {ko ? item.titleKo : item.titleEn}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {ko ? item.descriptionKo : item.descriptionEn}
        </p>
        <a
          href={item.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-md border border-[var(--border-hover)] px-4 py-2 text-sm font-medium text-[var(--accent-text)] transition-opacity hover:opacity-85"
        >
          {ko ? '공개 NPC 데모 직접 실행' : 'Try the live NPC demonstration'} ↗
        </a>
      </div>
      <figure className="border-y border-[var(--border-default)] bg-[var(--bg-primary)]">
        <Image
          src={item.image}
          alt={ko ? item.titleKo : item.titleEn}
          width={1100}
          height={898}
          sizes="(max-width: 768px) 100vw, 768px"
          className="h-auto w-full"
        />
        <figcaption className="px-5 py-3 text-xs leading-relaxed text-[var(--text-muted)]">
          {ko ? item.captureNoteKo : item.captureNoteEn}
        </figcaption>
      </figure>
      <div className="grid gap-4 bg-[var(--bg-elevated)] p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold">{ko ? '검증된 범위' : 'What passed'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {ko ? item.testLineKo : item.testLineEn}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{ko ? '아직 증명하지 않은 범위' : 'What was not validated'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {ko ? item.caveatKo : item.caveatEn}
          </p>
        </div>
      </div>
    </section>
  )
}
