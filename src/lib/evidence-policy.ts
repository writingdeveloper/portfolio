export interface EvidenceRecord {
  id: string
  project: string
  kind: string
  snapshotAt: string
  reviewedAt: string
  titleEn: string
  titleKo: string
  value: string
  measurements: Record<string, number | undefined>
  scopeEn: string
  scopeKo: string
  source: { repository: string; path: string; commit: string; sha256: string }
}
export interface EvidenceManifest {
  schemaVersion: number
  reviewAfter: string
  records: EvidenceRecord[]
}

// A repository/filename allowlist prevents the collector from reading arbitrary private files.
export const EVIDENCE_SOURCES: Record<string, { repository: string; path: string; localDirectory: string }> = {
  'devdeck-maintenance': {
    repository: 'writingdeveloper/devdeck',
    path: 'docs/quality-review-2026-09-08.md',
    localDirectory: 'devdeck',
  },
  'citefirst-retrieval': { repository: 'writingdeveloper/citefirst', path: 'README.md', localDirectory: 'citefirst' },
}
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value

export function evidenceProblems(manifest: EvidenceManifest, now = new Date()): string[] {
  const issues: string[] = []
  if (manifest.schemaVersion !== 1) issues.push('Unsupported evidence schema')
  if (!validDate(manifest.reviewAfter)) issues.push('Invalid reviewAfter')
  const seen = new Set<string>()
  for (const record of manifest.records) {
    if (seen.has(record.id)) issues.push('Duplicate evidence: ' + record.id)
    seen.add(record.id)
    const source = EVIDENCE_SOURCES[record.id]
    if (!source || source.repository !== record.source.repository || source.path !== record.source.path)
      issues.push('Source not allowlisted: ' + record.id)
    const m = record.measurements
    const nonnegativeInt = (v: number | undefined) => typeof v === 'number' && Number.isInteger(v) && v >= 0
    const fraction = (v: number | undefined) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1
    const validMeasurements =
      Boolean(m) &&
      (record.id === 'devdeck-maintenance'
        ? nonnegativeInt(m.passed) && nonnegativeInt(m.skipped)
        : record.id === 'citefirst-retrieval'
          ? nonnegativeInt(m.questions) && m.questions! > 0 && fraction(m.recall5) && fraction(m.mrr10)
          : false)
    if (!validMeasurements) issues.push('Invalid measurements')
    else if (evidenceValue(record) !== record.value) issues.push('Display value differs from measurements')
    if (record.kind !== 'source-snapshot') issues.push('Only source snapshots may be published here')
    if (!/^[a-f0-9]{40}$/.test(record.source.commit)) issues.push('Source must use a full commit SHA')
    if (!/^[a-f0-9]{64}$/.test(record.source.sha256)) issues.push('Invalid source digest')
    for (const date of [record.snapshotAt, record.reviewedAt])
      if (!validDate(date) || Date.parse(date) > now.getTime()) issues.push('Invalid/future evidence date')
    if (record.snapshotAt > record.reviewedAt) issues.push('Review predates snapshot')
    if (record.reviewedAt > manifest.reviewAfter) issues.push('Review deadline predates verification')
    for (const text of [record.titleEn, record.titleKo, record.scopeEn, record.scopeKo, record.value])
      if (!text?.trim()) issues.push('Missing localized evidence/scope')
  }
  if (manifest.records.length === 0) issues.push('Missing evidence records')
  return issues
}
export function evidenceUrl(record: EvidenceRecord): string {
  return 'https://github.com/' + record.source.repository + '/blob/' + record.source.commit + '/' + record.source.path
}

/** These narrow parsers fail when upstream formats change instead of inventing a new count. */
export function extractMeasurements(id: string, text: string): Record<string, number> {
  if (id === 'devdeck-maintenance') {
    const match = text.match(/Unit suite including[^|]*\|\s*\d+ files; ([\d,]+) passed, (\d+) pre-existing skip/)
    if (!match) throw new Error('DevDeck validation row not recognized')
    return { passed: Number(match[1].replaceAll(',', '')), skipped: Number(match[2]) }
  }
  if (id === 'citefirst-retrieval') {
    const questions = text.match(/(\d+) questions, in the shipped configuration/)
    const recall = text.match(/^\| recall@5 \|[^\n]*?\*\*([\d.]+)\*\*/m)
    const mrr = text.match(/^\| MRR@10 \|[^\n]*?\*\*([\d.]+)\*\*/m)
    if (!questions || !recall || !mrr) throw new Error('citefirst evaluation table not recognized')
    return { questions: Number(questions[1]), recall5: Number(recall[1]), mrr10: Number(mrr[1]) }
  }
  throw new Error('Unapproved evidence source: ' + id)
}
export function evidenceValue(record: EvidenceRecord): string {
  const m = record.measurements
  if (record.id === 'devdeck-maintenance')
    return m.passed!.toLocaleString('en-US') + ' passed · ' + m.skipped + ' skipped'
  if (record.id === 'citefirst-retrieval')
    return 'recall@5 ' + m.recall5!.toFixed(3) + ' · MRR@10 ' + m.mrr10!.toFixed(3)
  throw new Error('Unknown evidence kind')
}
