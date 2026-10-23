import { describe, expect, it } from 'vitest'
import {
  evaluateAudit,
  type AuditException,
  type AuditGateResult,
  type LockPackages,
  type NpmAdvisory,
  type NpmAuditReport,
  type NpmVulnerability,
  type Severity,
} from '../audit-gate'

// Shapes mirror `npm audit --json` (auditReportVersion 2) and package-lock.json
// from npm 10.9.2 on 2026-10-22: braces carries the advisory, and every package
// above it inherits the severity through a string `via`.
const bracesAdvisory: NpmAdvisory = {
  source: 1240992,
  name: 'braces',
  dependency: 'braces',
  title: 'braces vulnerable to stack-exhaustion denial of service through deeply nested patterns',
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  severity: 'high',
  cwe: ['CWE-674'],
  cvss: { score: 7.5, vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H' },
  range: '<=3.0.3',
}

const eslintFix = { name: 'eslint-config-next', version: '14.2.35', isSemVerMajor: true }

function bracesChain(
  bracesNodes = ['node_modules/braces'],
  extraAdvisories: NpmAdvisory[] = []
): Record<string, NpmVulnerability> {
  const derived = (name: string, via: string, effects: string[], range: string): NpmVulnerability => ({
    name,
    severity: 'high',
    isDirect: name === 'eslint-config-next',
    via: [via],
    effects,
    range,
    nodes: [`node_modules/${name}`],
    fixAvailable: eslintFix,
  })
  return {
    braces: {
      name: 'braces',
      severity: 'high',
      isDirect: false,
      via: [bracesAdvisory, ...extraAdvisories],
      effects: ['micromatch'],
      range: '*',
      nodes: bracesNodes,
      fixAvailable: eslintFix,
    },
    micromatch: derived('micromatch', 'braces', ['fast-glob'], '>=0.2.0'),
    'fast-glob': derived('fast-glob', 'micromatch', ['@next/eslint-plugin-next'], '*'),
    '@next/eslint-plugin-next': derived(
      '@next/eslint-plugin-next',
      'fast-glob',
      ['eslint-config-next'],
      '>=14.3.0-canary.0'
    ),
    'eslint-config-next': derived('eslint-config-next', '@next/eslint-plugin-next', [], '>=14.3.0-canary.0'),
  }
}

function report(vulnerabilities: Record<string, NpmVulnerability>): NpmAuditReport {
  return { auditReportVersion: 2, vulnerabilities }
}

const bracesPackage = {
  version: '3.0.3',
  resolved: 'https://registry.npmjs.org/braces/-/braces-3.0.3.tgz',
  integrity: 'sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==',
  license: 'MIT',
  dependencies: { 'fill-range': '^7.1.1' },
  engines: { node: '>=8' },
}
// npm marks a package `dev` only when nothing but devDependencies reach it.
const devOnly = { ...bracesPackage, dev: true }
// `devOptional` means an optional dependency of a production package also
// reaches it, so it ships unless optional dependencies are omitted.
const devOptional = { ...bracesPackage, devOptional: true }
const devLock: LockPackages = { 'node_modules/braces': devOnly }

const bracesException: AuditException = {
  id: 'GHSA-vfj7-8cjw-p6xm',
  package: 'braces',
  approvedBy: 'writingdeveloper',
  approvedOn: '2026-10-22',
  expires: '2026-12-31',
  review: 'docs/reviews/2026-10-22-braces-dev-audit-exception.md',
}

const reasons = (result: AuditGateResult) => result.blocking.map(({ id, reason }) => ({ id, reason }))

describe('evaluateAudit', () => {
  it('passes the dev-only braces chain through the last day of its exception', () => {
    const result = evaluateAudit(report(bracesChain()), devLock, [bracesException], '2026-12-31')
    expect(result.blocking).toEqual([])
    expect(result.excepted).toEqual([
      {
        id: 'GHSA-vfj7-8cjw-p6xm',
        package: 'braces',
        severity: 'high',
        expires: '2026-12-31',
        nodes: ['node_modules/braces'],
      },
    ])
  })

  it('fails the day after the exception expires', () => {
    const result = evaluateAudit(report(bracesChain()), devLock, [bracesException], '2027-01-01')
    expect(reasons(result)).toEqual([{ id: 'GHSA-vfj7-8cjw-p6xm', reason: 'expired' }])
    expect(result.excepted).toEqual([])
  })

  it('fails the advisory when no exception lists it', () => {
    const result = evaluateAudit(report(bracesChain()), devLock, [], '2026-10-22')
    expect(reasons(result)).toEqual([{ id: 'GHSA-vfj7-8cjw-p6xm', reason: 'no-exception' }])
  })

  it.each<[string, LockPackages]>([
    [
      'is not marked dev',
      { 'node_modules/braces': devOnly, 'node_modules/chokidar/node_modules/braces': bracesPackage },
    ],
    ['is dev-optional', { 'node_modules/braces': devOnly, 'node_modules/chokidar/node_modules/braces': devOptional }],
    ['is missing from the lockfile', { 'node_modules/braces': devOnly }],
  ])('fails an excepted advisory when a second installed copy %s', (_label, lock) => {
    const chain = bracesChain(['node_modules/braces', 'node_modules/chokidar/node_modules/braces'])
    const result = evaluateAudit(report(chain), lock, [bracesException], '2026-10-22')
    expect(reasons(result)).toEqual([{ id: 'GHSA-vfj7-8cjw-p6xm', reason: 'not-dev-only' }])
    expect(result.excepted).toEqual([])
  })

  it('does not let one exception cover a second advisory on the same package', () => {
    // Hypothetical second advisory against the same braces release.
    const second: NpmAdvisory = {
      ...bracesAdvisory,
      source: 1250001,
      title: 'braces hypothetical second advisory',
      url: 'https://github.com/advisories/GHSA-9q2f-7hm4-cjwx',
    }
    const result = evaluateAudit(
      report(bracesChain(['node_modules/braces'], [second])),
      devLock,
      [bracesException],
      '2026-10-22'
    )
    expect(reasons(result)).toEqual([{ id: 'GHSA-9q2f-7hm4-cjwx', reason: 'no-exception' }])
    expect(result.excepted.map((item) => item.id)).toEqual(['GHSA-vfj7-8cjw-p6xm'])
  })

  it.each<[Severity, number]>([
    ['low', 0],
    ['moderate', 0],
    ['high', 1],
    ['critical', 1],
  ])('treats an unlisted %s advisory as blocking only at high or above', (severity, blocking) => {
    const advisory: NpmAdvisory = {
      source: 1250002,
      name: 'left-pad',
      dependency: 'left-pad',
      title: 'left-pad hypothetical advisory',
      url: 'https://github.com/advisories/GHSA-r7xg-2hcm-qp3v',
      severity,
      cwe: [],
      cvss: { score: 0, vectorString: null },
      range: '<1.3.1',
    }
    const vulnerabilities: Record<string, NpmVulnerability> = {
      'left-pad': {
        name: 'left-pad',
        severity,
        isDirect: true,
        via: [advisory],
        effects: [],
        range: '<1.3.1',
        nodes: ['node_modules/left-pad'],
        fixAvailable: true,
      },
    }
    const lock: LockPackages = { 'node_modules/left-pad': { version: '1.3.0', dev: true } }
    expect(evaluateAudit(report(vulnerabilities), lock, [], '2026-10-22').blocking).toHaveLength(blocking)
  })

  it('lists an exception that no advisory matches so it can be removed', () => {
    const result = evaluateAudit(report({}), devLock, [bracesException], '2026-10-22')
    expect(result.blocking).toEqual([])
    expect(result.unused.map((exception) => exception.id)).toEqual(['GHSA-vfj7-8cjw-p6xm'])
  })

  it('fails when npm audit returns an error instead of a report', () => {
    // npm 10.9.2 prints this shape and no vulnerabilities when the registry
    // audit endpoint cannot be reached.
    const failed: NpmAuditReport = {
      message:
        'request to https://registry.npmjs.org/-/npm/v1/security/audits/quick failed, reason: getaddrinfo ENOTFOUND registry.npmjs.org',
      error: { summary: '', detail: '' },
    }
    const result = evaluateAudit(failed, devLock, [bracesException], '2026-10-22')
    expect(reasons(result)).toEqual([{ id: 'npm audit', reason: 'audit-error' }])
  })

  it('fails when the exception names a different package than the advisory', () => {
    const result = evaluateAudit(
      report(bracesChain()),
      devLock,
      [{ ...bracesException, package: 'micromatch' }],
      '2026-10-22'
    )
    expect(reasons(result)).toEqual([{ id: 'GHSA-vfj7-8cjw-p6xm', reason: 'package-mismatch' }])
  })

  it.each<[string, Partial<AuditException>]>([
    ['has no approver', { approvedBy: '' }],
    ['has no review record', { review: '' }],
    ['is not a GHSA identifier', { id: 'CVE-2026-93687' }],
    ['expires before it was approved', { expires: '2026-10-21' }],
    ['runs longer than 90 days', { expires: '2027-01-21' }],
    ['uses an impossible date', { expires: '2026-11-31' }],
  ])('ignores an exception that %s and fails its advisory', (_label, change) => {
    const result = evaluateAudit(report(bracesChain()), devLock, [{ ...bracesException, ...change }], '2026-10-22')
    expect(result.blocking.map((item) => item.reason)).toEqual(['invalid-exception', 'no-exception'])
  })

  it('accepts an exception that runs exactly 90 days', () => {
    const result = evaluateAudit(
      report(bracesChain()),
      devLock,
      [{ ...bracesException, expires: '2027-01-20' }],
      '2026-10-22'
    )
    expect(result.blocking).toEqual([])
  })
})
