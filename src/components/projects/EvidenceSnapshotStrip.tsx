import { Link } from '@/i18n/navigation'
import evidence from '../../../content/evidence.json'
import { evidenceUrl } from '@/lib/evidence-policy'

/**
 * Public claims are read from the exact reviewed manifest used by /hire.
 * Never copy a passing-test figure into free-form copy or imply a live release.
 */
export function EvidenceSnapshotStrip({ locale }: { locale: string }) {
  const ko = locale === 'ko'

  return (
    <section
      id="verified-work"
      aria-labelledby="verified-work-title"
      className="border-t py-14 sm:py-16"
      style={{ borderColor: 'var(--l-border)' }}
    >
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="ledger-mono text-xs tracking-[0.18em]" style={{ color: 'var(--l-accent)' }}>
            {ko ? '§01 · 근거가 남는 작업' : '§01 · PROOF OVER PROMPTS'}
          </span>
          <h2
            id="verified-work-title"
            className="ledger-display mt-3 text-2xl font-bold sm:text-3xl"
            style={{ color: 'var(--l-ink)' }}
          >
            {ko ? 'AI 사용보다 검증 가능한 결과' : 'What survives verification'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>
            {ko
              ? '생성한 코드의 양이 아니라, 고정된 소스·측정 조건·검증하지 못한 범위를 함께 공개합니다.'
              : 'Not how much code an AI helped produce. Each record has a source commit, dated measurement, and explicit limits.'}
          </p>
        </div>
        <Link
          href="/hire#engineering-evidence"
          className="ledger-mono shrink-0 text-xs underline underline-offset-4"
          style={{ color: 'var(--l-accent)' }}
        >
          {ko ? '근거의 범위 확인' : 'Review the evidence scope'} →
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {evidence.records.map((record) => (
          <article
            key={record.id}
            className="flex min-w-0 flex-col gap-3 rounded-xl border p-5 sm:p-6"
            style={{ background: 'var(--l-card)', borderColor: 'var(--l-border)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="ledger-mono text-xs uppercase tracking-wider" style={{ color: 'var(--l-muted)' }}>
                {record.project}
              </span>
              <time dateTime={record.snapshotAt} className="ledger-mono text-xs" style={{ color: 'var(--l-dim)' }}>
                {record.snapshotAt}
              </time>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--l-ink)' }}>
              {ko ? record.titleKo : record.titleEn}
            </h3>
            <p className="ledger-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--l-accent)' }}>
              {record.value}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>
              {ko ? record.scopeKo : record.scopeEn}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
              <Link
                href={record.project === 'devdeck' ? '/projects/devdeck#failure-investigation' : '/projects/citefirst'}
                className="ledger-mono text-xs underline underline-offset-4"
                style={{ color: 'var(--l-ink)' }}
              >
                {ko ? '문제·결정·결과' : 'Problem, decision, result'} →
              </Link>
              <a
                href={evidenceUrl(record)}
                target="_blank"
                rel="noopener noreferrer"
                className="ledger-mono text-xs underline underline-offset-4"
                style={{ color: 'var(--l-accent)' }}
              >
                {ko ? '고정된 원본' : 'Pinned source'} ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
