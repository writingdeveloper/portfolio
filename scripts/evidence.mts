import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import manifest from '../content/evidence.json'
import resume from '../content/resume-manifest.json'
import { EVIDENCE_SOURCES, evidenceProblems, evidenceValue, extractMeasurements } from '../src/lib/evidence-policy'

const sha = (text: string | Buffer) => createHash('sha256').update(text).digest('hex')
const args = new Set(process.argv.slice(2))
const allowed = new Set(['--collect', '--verify-local', '--require-current-review'])
for (const arg of args) if (!allowed.has(arg)) throw new Error('Unsupported evidence option: ' + arg)
const errors = evidenceProblems(manifest)
const expectedFiles = new Set([
  'Sihyeong-Lee-Resume.pdf',
  'Sihyeong-Lee-Resume-DevEx.pdf',
  'Sihyeong-Lee-Resume-FDE.pdf',
])
for (const entry of resume.files) {
  if (!expectedFiles.delete(entry.file)) {
    errors.push('Unknown/duplicate résumé file')
    continue
  }
  const file = fs.readFileSync(path.join('public/resume', entry.file))
  if (file.subarray(0, 5).toString() !== '%PDF-' || sha(file) !== entry.sha256)
    errors.push('Résumé bytes changed: ' + entry.file)
}
if (expectedFiles.size) errors.push('Missing résumé manifest entries')
const reviewDue = new Date().toISOString().slice(0, 10) > manifest.reviewAfter
if (reviewDue && args.has('--require-current-review')) errors.push('Evidence review overdue: ' + manifest.reviewAfter)
if (errors.length) throw new Error(errors.join('\n'))

if (args.has('--collect') || args.has('--verify-local')) {
  const sourceRoot = path.resolve(process.env.PORTFOLIO_SOURCE_ROOT ?? '..')
  const candidates = []
  for (const record of manifest.records) {
    const spec = EVIDENCE_SOURCES[record.id]
    const cwd = path.resolve(sourceRoot, spec.localDirectory)
    const git = (a: string[]) =>
      execFileSync('git', a, { cwd, encoding: 'utf8', timeout: 15_000, maxBuffer: 2_000_000 })
        .replace(/\r\n/g, '\n')
        .trimEnd()
    // git show reads the committed blob, never a worktree file, secret or arbitrary command.
    const pinned = execFileSync('git', ['show', record.source.commit + ':' + spec.path], {
      cwd,
      encoding: 'utf8',
      timeout: 15_000,
      maxBuffer: 2_000_000,
    }).replace(/\r\n/g, '\n')
    if (sha(pinned) !== record.source.sha256) throw new Error('Pinned source digest mismatch: ' + record.id)
    const parsed = extractMeasurements(record.id, pinned)
    if (JSON.stringify(parsed) !== JSON.stringify(record.measurements))
      throw new Error('Measurement/source mismatch: ' + record.id)
    const commit = git(['log', '-1', '--format=%H', '--', spec.path])
    if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Source revision missing')
    const text = execFileSync('git', ['show', commit + ':' + spec.path], {
      cwd,
      encoding: 'utf8',
      timeout: 15_000,
      maxBuffer: 2_000_000,
    }).replace(/\r\n/g, '\n')
    const measurements = extractMeasurements(record.id, text)
    const candidate = {
      id: record.id,
      source: { repository: spec.repository, path: spec.path, commit, sha256: sha(text) },
      measurements,
      changed:
        commit !== record.source.commit ||
        sha(text) !== record.source.sha256 ||
        JSON.stringify(measurements) !== JSON.stringify(record.measurements),
      requiresReview: true,
    }
    const worktreeText = fs.readFileSync(path.join(cwd, spec.path), 'utf8').replace(/\r\n/g, '\n')
    const worktreeDiffers = sha(worktreeText) !== sha(text)
    let worktreeMeasurements: Record<string, number> | null = null
    if (worktreeDiffers) {
      try {
        worktreeMeasurements = extractMeasurements(record.id, worktreeText)
      } catch {
        /* report changed bytes, do not guess */
      }
    }
    candidates.push({ ...candidate, worktreeDiffers, worktreeMeasurements, worktreePublished: false })
    console.log('SOURCE VERIFIED', record.id, evidenceValue(record))
  }
  if (args.has('--collect')) {
    fs.mkdirSync('.qa', { recursive: true })
    fs.writeFileSync(
      '.qa/evidence-candidates.json',
      JSON.stringify({ collectedAt: new Date().toISOString(), publicContentModified: false, candidates }, null, 2) +
        '\n'
    )
    console.log(
      'COLLECTED',
      candidates.length,
      'candidates; changed:',
      candidates.filter((c) => c.changed || c.worktreeDiffers).length,
      '; public content unchanged'
    )
  }
}
console.log(
  'PASS evidence structure, scope, résumé bytes; next review:',
  manifest.reviewAfter,
  reviewDue ? '(DUE)' : ''
)
