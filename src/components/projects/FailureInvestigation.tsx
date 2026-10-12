import Image from 'next/image'
import reports from '../../../content/failure-cases.json'

/** Reviewed incident evidence, rendered only on the matching project. */
export function FailureInvestigation({ projectSlug, locale }: { projectSlug: string; locale: string }) {
  const item = reports.incidents.find((entry) => entry.project === projectSlug)
  if (!item) return null
  const ko = locale === 'ko'

  return (
    <section
      id="failure-investigation"
      aria-labelledby="failure-investigation-title"
      className="mb-12 scroll-mt-24 border-y border-[var(--border-default)] py-10"
    >
      <div className="mb-7">
        <p className="ledger-mono mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--accent-text)]">
          {ko ? '실패 → 원인 → 수정 → 검증' : 'Engineering incident / failure to verification'}
        </p>
        <h2
          id="failure-investigation-title"
          className="ledger-display text-2xl font-extrabold leading-tight sm:text-3xl"
        >
          {ko ? item.titleKo : item.titleEn}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{ko ? item.introKo : item.introEn}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-[var(--border-hover)] px-3 py-1.5 text-[var(--text-secondary)]">
            {ko ? item.statusKo : item.statusEn}
          </span>
          <span className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-[var(--text-muted)]">
            {ko ? '최초 실패 기록' : 'Baseline recorded'}: <time dateTime={item.recordedAt}>{item.recordedAt}</time>
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[item.before, item.after].map((frame, index) => (
          <figure
            key={frame.image}
            className="min-w-0 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]"
          >
            <div className="border-b border-[var(--border-default)] px-4 py-3">
              <span className="ledger-mono text-[10px] uppercase tracking-[0.15em] text-[var(--accent-text)]">
                {index === 0 ? (ko ? '실패' : 'Before') : ko ? '수정 후' : 'After'}
              </span>
              <h3 className="mt-1 text-sm font-semibold">{ko ? frame.titleKo : frame.titleEn}</h3>
            </div>
            <Image
              src={frame.image}
              width={1030}
              height={420}
              alt={ko ? frame.altKo : frame.altEn}
              sizes="(max-width: 640px) 100vw, 350px"
              className="h-auto w-full"
            />
            <figcaption className="px-4 pb-4 pt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              {ko ? frame.noteKo : frame.noteEn}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-9 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="ledger-display text-lg font-bold">
            {ko ? item.reproduction.titleKo : item.reproduction.titleEn}
          </h3>
          <ol className="mt-4 space-y-3">
            {(ko ? item.reproduction.stepsKo : item.reproduction.stepsEn).map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="ledger-mono shrink-0 text-[11px] text-[var(--accent-text)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="ledger-display text-lg font-bold">{ko ? item.rootCause.titleKo : item.rootCause.titleEn}</h3>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            {ko ? item.rootCause.textKo : item.rootCause.textEn}
          </p>
          <p className="mt-4 border-l-2 border-[var(--accent-text)] pl-4 text-xs leading-relaxed text-[var(--text-muted)]">
            {ko
              ? '전송 성공은 실제 화면과 영속 상태가 올바르다는 증거가 아닙니다.'
              : 'A successful transport response is not proof that the UI or persistent record is correct.'}
          </p>
        </div>
      </div>

      <div className="mt-9">
        <h3 className="ledger-display text-lg font-bold">
          {ko ? '수정: 상태 소유권·쓰기 순서·초안 보호' : 'Fix: ownership, write ordering, and draft protection'}
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {item.changes.map((change, i) => (
            <article
              key={change.titleEn}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4"
            >
              <span className="ledger-mono text-xs text-[var(--accent-text)]">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="mt-2 text-sm font-semibold">{ko ? change.titleKo : change.titleEn}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {ko ? change.bodyKo : change.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-9 rounded-xl border border-[var(--border-hover)] bg-[var(--bg-card)] p-5 sm:p-6">
        <h3 className="ledger-display text-lg font-bold">
          {ko ? item.verification.titleKo : item.verification.titleEn}
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="ledger-display text-3xl font-bold text-[var(--accent-text)]">
              {item.verification.focusedTests}/{item.verification.focusedTests}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {ko ? '관련 단위 테스트 통과' : 'Focused unit tests passed'}
            </p>
          </div>
          <div>
            <p className="ledger-display text-3xl font-bold text-[var(--accent-text)]">
              {item.verification.electronJourneys}/{item.verification.electronJourneys}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {ko ? 'Electron 3개 앱 검증 통과' : 'Three-app Electron journeys passed'}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
          {ko ? '재실행' : 'Rerun'}: <time dateTime={item.verifiedAt}>{item.verifiedAt}</time>.{' '}
          {ko ? item.verification.environmentKo : item.verification.environmentEn}
        </p>
        <ul className="mt-5 grid gap-x-5 gap-y-2 sm:grid-cols-2">
          {item.verification.journeys.map((journey) => (
            <li
              key={journey.en}
              className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-secondary)]"
            >
              <span aria-hidden="true" className="shrink-0 text-[var(--accent-text)]">
                ✓
              </span>
              {ko ? journey.ko : journey.en}
            </li>
          ))}
        </ul>
        <h4 className="mt-6 text-sm font-semibold">{ko ? '재검증 명령' : 'Reproduce the checks'}</h4>
        <div className="mt-2 space-y-2">
          {item.verification.commands.map((command) => (
            <code
              key={command}
              className="block min-w-0 overflow-x-auto rounded-md bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
            >
              {command}
            </code>
          ))}
        </div>
      </div>

      <aside
        className="mt-6 rounded-lg border border-[var(--border-default)] px-5 py-4"
        aria-label={ko ? '검증하지 않은 사항' : 'What remains unverified'}
      >
        <h3 className="text-sm font-semibold">{ko ? '검증하지 않은 범위' : 'What this does not prove'}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {ko ? item.verification.limitationsKo : item.verification.limitationsEn}
        </p>
      </aside>

      <nav aria-label={ko ? '근거가 되는 소스 링크' : 'Pinned source evidence'} className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">
          {ko ? '원본 코드·변경 기록·동일 커밋 CI' : 'Pinned code, incident review, and same-commit CI'}
        </h3>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {item.sources.map((source) => (
            <a
              key={source.kind}
              href={source.href}
              rel="noopener noreferrer"
              target="_blank"
              className="text-xs underline underline-offset-4 text-[var(--accent-text)] hover:opacity-85"
            >
              {ko ? source.labelKo : source.labelEn} ↗
            </a>
          ))}
        </div>
      </nav>
    </section>
  )
}
