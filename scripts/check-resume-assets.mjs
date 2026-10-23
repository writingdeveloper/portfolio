import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Candidate résumé-release invariant.
 * These are SHA-256 fingerprints of the three reviewed September 22 PDF
 * artifacts; a regeneration requires updating this manifest in the same PR.
 */
const resumes = [
  {
    file: 'Sihyeong-Lee-Resume.pdf',
    sha256: 'ab4933e15c7516cf455d0547daf4ba4b766c8d1d06a4fddfd8b4ab50a28b6b64',
  },
  {
    file: 'Sihyeong-Lee-Resume-DevEx.pdf',
    sha256: '9850dc45ed639d0e0998876ea2983bd3ee092c6f88ff45d3a62a9f30f3c4449f',
  },
  {
    file: 'Sihyeong-Lee-Resume-FDE.pdf',
    sha256: '406ab1da5b66058b831530ad3b99d46a4299586207a586665e7aba5db9919350',
  },
]

const hirePage = readFileSync(resolve('src/app/[locale]/hire/page.tsx'), 'utf8')
const checks = []

for (const { file, sha256 } of resumes) {
  const path = resolve('public/resume', file)
  if (!existsSync(path)) throw new Error(`Résumé PDF missing: ${file}`)
  const bytes = readFileSync(path)
  const hash = createHash('sha256').update(bytes).digest('hex')
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`Invalid PDF header: ${file}`)
  if (hash !== sha256) throw new Error(`Résumé PDF SHA mismatch: ${file}`)
  if (!hirePage.includes(file)) throw new Error(`Hire page has no path to ${file}`)
  if (statSync(path).size < 25_000) throw new Error(`Résumé PDF truncated: ${file}`)
  checks.push({ file, sha256, bytes: bytes.length })
}

console.log('PASS all 3 résumé PDF payloads and Hire CTAs')
for (const item of checks) console.log(`- ${item.file}: ${item.bytes} bytes, SHA-256 ${item.sha256.slice(0, 12)}…`)
