export type Severity = 'info' | 'low' | 'moderate' | 'high' | 'critical'

export interface NpmAdvisory {
  source: number
  name: string
  dependency: string
  title: string
  url: string
  severity: Severity
  cwe: string[]
  cvss: { score: number; vectorString: string | null }
  range: string
}

export interface NpmVulnerability {
  name: string
  severity: Severity
  isDirect: boolean
  via: (string | NpmAdvisory)[]
  effects: string[]
  range: string
  nodes: string[]
  fixAvailable: boolean | { name: string; version: string; isSemVerMajor: boolean }
}

export interface NpmAuditReport {
  auditReportVersion?: number
  vulnerabilities?: Record<string, NpmVulnerability>
  message?: string
  error?: { summary?: string; detail?: string }
}

export type LockPackages = Record<string, { dev?: boolean; [field: string]: unknown }>

export interface AuditException {
  id: string
  package: string
  approvedBy: string
  approvedOn: string
  expires: string
  review: string
}

export type BlockingReason =
  'audit-error' | 'invalid-exception' | 'no-exception' | 'package-mismatch' | 'expired' | 'not-dev-only'

export interface AuditGateResult {
  blocking: { id: string; reason: BlockingReason; detail: string }[]
  excepted: { id: string; package: string; severity: Severity; expires: string; nodes: string[] }[]
  unused: AuditException[]
}

const SEVERITY_RANK: Record<Severity, number> = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }
// Same threshold as `npm audit --audit-level=high`.
const BLOCKING_RANK = SEVERITY_RANK.high
// An exception is a dated decision, not a standing waiver: renewing one means
// a new approval date and a new review.
const MAX_EXCEPTION_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

function parseDay(value: string): number | null {
  const time = Date.parse(`${value}T00:00:00Z`)
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) return null
  return time
}

function invalidReason(exception: AuditException): string | null {
  if (!/^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(exception.id)) return 'id is not a GHSA identifier'
  if (!exception.package) return 'package is missing'
  if (!exception.approvedBy) return 'approvedBy is missing'
  if (!exception.review) return 'review record is missing'
  const approvedOn = parseDay(exception.approvedOn)
  const expires = parseDay(exception.expires)
  if (approvedOn === null || expires === null) return 'approvedOn and expires must be YYYY-MM-DD dates'
  if (expires < approvedOn) return 'expires before it was approved'
  if (expires - approvedOn > MAX_EXCEPTION_DAYS * DAY_MS) return `runs longer than ${MAX_EXCEPTION_DAYS} days`
  return null
}

function advisoryId(advisory: NpmAdvisory): string {
  return advisory.url.match(/GHSA(-[a-z0-9]{4}){3}$/)?.[0] ?? `npm-${advisory.source}`
}

/**
 * Applies `--audit-level=high` to a full `npm audit --json` report, letting an
 * advisory through only when an exception lists it, the exception is valid and
 * unexpired (`today` and `expires` are UTC YYYY-MM-DD, `expires` inclusive), and
 * every installed copy of the package is dev-only in package-lock.json.
 */
export function evaluateAudit(
  report: NpmAuditReport,
  lockPackages: LockPackages,
  exceptions: AuditException[],
  today: string
): AuditGateResult {
  if (report.error || !report.vulnerabilities) {
    const detail = report.message || report.error?.summary || report.error?.detail || 'no vulnerability report'
    return { blocking: [{ id: 'npm audit', reason: 'audit-error', detail }], excepted: [], unused: [] }
  }

  const result: AuditGateResult = { blocking: [], excepted: [], unused: [] }
  const valid = new Map<string, AuditException>()
  for (const exception of exceptions) {
    const problem = invalidReason(exception)
    if (problem) result.blocking.push({ id: exception.id, reason: 'invalid-exception', detail: problem })
    else valid.set(exception.id, exception)
  }

  const matched = new Set<string>()
  for (const vulnerability of Object.values(report.vulnerabilities)) {
    for (const advisory of vulnerability.via) {
      // A string names another vulnerable package; its advisory is judged there.
      if (typeof advisory === 'string' || SEVERITY_RANK[advisory.severity] < BLOCKING_RANK) continue

      const id = advisoryId(advisory)
      const exception = valid.get(id)
      if (!exception) {
        result.blocking.push({ id, reason: 'no-exception', detail: `${advisory.severity} in ${advisory.name}` })
        continue
      }
      matched.add(id)
      if (exception.package !== advisory.name) {
        const detail = `the exception names ${exception.package}, the advisory affects ${advisory.name}`
        result.blocking.push({ id, reason: 'package-mismatch', detail })
      } else if (today > exception.expires) {
        result.blocking.push({ id, reason: 'expired', detail: `the exception expired on ${exception.expires}` })
      } else {
        const shipped = vulnerability.nodes.filter((node) => lockPackages[node]?.dev !== true)
        if (shipped.length > 0) {
          result.blocking.push({ id, reason: 'not-dev-only', detail: `not dev-only: ${shipped.join(', ')}` })
        } else {
          result.excepted.push({
            id,
            package: advisory.name,
            severity: advisory.severity,
            expires: exception.expires,
            nodes: vulnerability.nodes,
          })
        }
      }
    }
  }

  result.unused = [...valid.values()].filter((exception) => !matched.has(exception.id))
  return result
}
