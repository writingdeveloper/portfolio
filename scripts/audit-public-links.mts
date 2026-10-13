import fs from 'node:fs'
import path from 'node:path'
import projects from '../content/projects.json'

interface Target {
  kind: 'route' | 'demo' | 'public-source'
  id: string
  url: string
}
interface Result extends Target {
  status: number | null
  resolvedUrl?: string
  error?: string
  elapsedMs: number
}

const origin = (process.env.PORTFOLIO_AUDIT_ORIGIN || 'https://writingdeveloper.blog').replace(/\/$/, '')
const includeAllProjects = process.argv.includes('--all-projects')
const internalRoutes = [
  '/',
  '/en',
  '/hire',
  '/en/hire',
  '/projects',
  '/en/projects',
  '/blog',
  '/en/blog',
  '/studio',
  '/en/studio',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/resume/Sihyeong-Lee-Resume.pdf',
  '/resume/Sihyeong-Lee-Resume-DevEx.pdf',
  '/resume/Sihyeong-Lee-Resume-FDE.pdf',
  '/projects/devdeck',
  '/en/projects/devdeck',
  '/projects/brain-vat-siege',
  '/en/projects/brain-vat-siege',
  '/projects/creator-learning-os',
  '/en/projects/creator-learning-os',
]
const urls: Target[] = internalRoutes.map((id) => ({ kind: 'route', id, url: origin + id }))
if (includeAllProjects) {
  for (const project of projects.projects) {
    for (const lang of ['', '/en']) {
      urls.push({
        kind: 'route',
        id: lang + '/projects/' + project.slug,
        url: origin + lang + '/projects/' + project.slug,
      })
    }
  }
}
for (const project of projects.projects) {
  if (project.website) urls.push({ kind: 'demo', id: project.slug, url: project.website })
  // Private source URLs are never linked to the user. An unauthenticated 404
  // from a private GitHub repository is NOT evidence of a broken public CTA.
  if (project.github && !project.private) urls.push({ kind: 'public-source', id: project.slug, url: project.github })
}
const seen = new Set<string>()
const targets = urls.filter((item) => {
  if (seen.has(item.url)) return false
  seen.add(item.url)
  return true
})

async function check(item: Target): Promise<Result> {
  const start = performance.now()
  const result: Result = { ...item, status: null, elapsedMs: 0 }
  try {
    const response = await fetch(item.url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (PortfolioLinkQA; review-only)' },
      signal: AbortSignal.timeout(11000),
    })
    result.status = response.status
    result.resolvedUrl = response.url
    await response.body?.cancel()
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
  }
  result.elapsedMs = Math.round(performance.now() - start)
  return result
}

const results: Result[] = []
let index = 0
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (index < targets.length) {
      const item = targets[index++]
      results.push(await check(item))
    }
  })
)
const brokenInternal = results.filter((r) => r.kind === 'route' && r.status !== null && r.status >= 400)
const externalProblems = results.filter((r) => r.kind !== 'route' && r.status !== null && r.status >= 400)
const uncertain = results.filter((r) => r.status === null)
const summary = {
  checkedAt: new Date().toISOString(),
  origin,
  source: 'candidate project ledger; read-only HTTP headers, not functional browser QA',
  checked: results.length,
  ok: results.filter((r) => r.status !== null && r.status < 400).length,
  brokenInternal: brokenInternal.length,
  externalProblems: externalProblems.length,
  uncertain: uncertain.length,
  results: results.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)),
}
const directory = path.resolve('.qa/portfolio')
fs.mkdirSync(directory, { recursive: true })
const file = path.join(directory, 'public-link-audit-latest.json')
fs.writeFileSync(file, JSON.stringify(summary, null, 2) + '\n')
console.log(
  `Checked ${summary.checked} URLs: ${summary.ok} reachable, ${summary.brokenInternal} broken internal, ${summary.externalProblems} external HTTP errors, ${summary.uncertain} inconclusive`
)
for (const row of [...brokenInternal, ...externalProblems, ...uncertain]) {
  console.log(`[${row.status ?? 'unknown'}] ${row.kind} ${row.id} ${row.url} ${row.error || ''}`)
}
console.log('Evidence:', file)
if (brokenInternal.length) process.exitCode = 1
