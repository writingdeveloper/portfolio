/**
 * Full dependency audit with dated, dev-only exceptions.
 *
 * Usage: npm run audit:deps
 * Fails on any high or critical advisory unless .github/audit-exceptions.json
 * lists it, the exception has not expired, and every installed copy of the
 * package is dev-only in package-lock.json. CI also runs
 * `npm audit --omit=dev --audit-level=high`, which takes no exceptions at all.
 */
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { evaluateAudit, type AuditException, type LockPackages, type NpmAuditReport } from '../src/lib/audit-gate'

const EXCEPTIONS_FILE = '.github/audit-exceptions.json'
const inActions = process.env.GITHUB_ACTIONS === 'true'

// In GitHub Actions these lines become annotations on the run summary, so an
// excepted advisory stays visible on every run instead of passing silently.
function annotate(level: 'warning' | 'error', message: string) {
  console.log(inActions ? `::${level}::${message}` : `${level.toUpperCase()}  ${message}`)
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8')) as T
}

function runAudit(): NpmAuditReport {
  // npm audit exits 1 whenever it finds anything, so only its JSON is used.
  const audit = spawnSync('npm', ['audit', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === 'win32',
  })
  try {
    return JSON.parse(audit.stdout) as NpmAuditReport
  } catch {
    return { message: audit.error?.message || audit.stderr?.trim() || 'npm audit printed no JSON' }
  }
}

const { exceptions } = readJson<{ exceptions: AuditException[] }>(EXCEPTIONS_FILE)
const lock = readJson<{ packages: LockPackages }>('package-lock.json')
const today = new Date().toISOString().slice(0, 10)
const result = evaluateAudit(runAudit(), lock.packages, exceptions, today)

for (const item of result.excepted) {
  annotate(
    'warning',
    `${item.id} (${item.severity}, ${item.package}) passes as dev-only until ${item.expires}: ${item.nodes.join(', ')}`
  )
}
for (const exception of result.unused) {
  annotate('warning', `${exception.id} no longer appears in npm audit; remove it from ${EXCEPTIONS_FILE}`)
}
for (const item of result.blocking) {
  annotate('error', `${item.id} ${item.reason}: ${item.detail}`)
}

console.log(`\n${result.blocking.length} blocking, ${result.excepted.length} excepted (UTC ${today})`)
process.exit(result.blocking.length === 0 ? 0 : 1)
