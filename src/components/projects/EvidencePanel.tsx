import { useLocale } from 'next-intl'
import manifest from '../../../content/evidence.json'
import { evidenceUrl } from '@/lib/evidence-policy'

export function EvidencePanel() {
  const ko = useLocale() === 'ko'
  return (
    <section className="mb-12" aria-labelledby="engineering-evidence">
      <h2 id="engineering-evidence" className="text-xl font-bold mb-3">
        {ko ? '검증 범위가 있는 엔지니어링 증거' : 'Engineering evidence, with scope'}
      </h2>
      <p className="mb-5 text-sm text-[var(--text-secondary)]">
        {ko
          ? '숫자만 제시하지 않습니다. 기록 시점, 소스 버전, 검증하지 않은 범위를 함께 남깁니다.'
          : 'Each figure is tied to a dated source version and states what was not validated.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {manifest.records.map((record) => (
          <article key={record.id} className="rounded-lg border border-[var(--border-default)] p-5 min-w-0">
            <h3 className="font-semibold">{ko ? record.titleKo : record.titleEn}</h3>
            <p className="mt-3 text-lg font-bold text-[var(--accent-text)]">{record.value}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              {ko ? record.scopeKo : record.scopeEn}
            </p>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              {ko ? '검증 기록' : 'Recorded snapshot'}: <time dateTime={record.snapshotAt}>{record.snapshotAt}</time>
            </p>
            <a
              href={evidenceUrl(record)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm underline underline-offset-4 text-[var(--accent-text)]"
            >
              {ko ? '고정된 소스 기록 확인' : 'Inspect the pinned source'} ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
