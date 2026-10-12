import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chromium } from 'playwright'
import resumes from '../content/resume-manifest.json'

const base = (process.env.QA_BASE_URL ?? 'http://localhost:3100').replace(/\/$/, '')
const output = path.resolve('.qa/portfolio')
fs.mkdirSync(output, { recursive: true })
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex')
const sources = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((p) => /^(src|content|messages|scripts)\//.test(p) || /^(package.*json|next.config.ts)$/.test(p))
  .sort()
const sourceFingerprint = sha(sources.map((p) => p + ':' + sha(fs.readFileSync(p))).join('\n'))
const results: object[] = []
const failures: string[] = []
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}
function luminance(css: string) {
  const rgb = css
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number)
  if (!rgb || rgb.length !== 3) throw new Error('Unrecognized computed color: ' + css)
  const c = rgb.map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const browser = await chromium.launch({ headless: true })
try {
  for (const locale of ['en', 'ko'])
    for (const width of [1440, 390])
      for (const theme of ['dark', 'light'] as const) {
        const label = locale + '-' + width + '-' + theme
        const ctx = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
          colorScheme: theme,
        })
        await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme)
        const page = await ctx.newPage()
        const errors: string[] = []
        const requests: string[] = []
        page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push('console: ' + m.text() + ' @ ' + m.location().url)
        })
        // ERR_ABORTED is an expected browser cancellation when deliberately navigating; all other failures are fatal.
        page.on('requestfailed', (req) => {
          if (req.failure()?.errorText !== 'net::ERR_ABORTED')
            errors.push('request: ' + req.url() + ' ' + req.failure()?.errorText)
        })
        page.on('response', (r) => {
          if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url())
        })
        page.on('request', (r) => requests.push(r.url()))
        const prefix = locale === 'ko' ? '' : '/en'
        try {
          for (const route of ['/hire', '/about', '']) {
            const response = await page.goto(base + prefix + route, { waitUntil: 'networkidle', timeout: 30000 })
            assert(response?.ok(), 'route unavailable: ' + route)
            await page.evaluate(() => document.fonts.ready)
            assert((await page.locator('h1').count()) === 1, 'Expected one H1 at ' + route)
            assert(
              !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
              'Horizontal overflow at ' + route
            )
            if (route === '/hire') {
              const contact = page
                .getByRole('link', { name: locale === 'ko' ? /이메일로 연락하기/ : /Email me/ })
                .first()
              assert(await contact.isVisible(), 'Above-fold contact CTA missing')
              const rect = await contact.boundingBox()
              assert(rect && rect.y < (width === 390 ? 844 : 1000), 'Contact CTA not visible in initial viewport')
              assert(await page.locator('a[href="#resume"]').isVisible(), 'Résumé shortcut missing')
              assert((await page.locator('#resume').count()) === 1, 'Résumé anchor missing')
              const primary = page.locator('a[href="/resume/Sihyeong-Lee-Resume.pdf"]')
              assert(await primary.isVisible(), 'Primary résumé CTA missing')
              const colors = await primary.evaluate((el) => ({
                bg: getComputedStyle(el).backgroundColor,
                fg: getComputedStyle(el).color,
              }))
              assert(colors.bg !== 'rgba(0, 0, 0, 0)', 'Résumé CTA background is transparent')
              const a = luminance(colors.bg),
                b = luminance(colors.fg)
              const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
              assert(contrast >= 4.5, 'Résumé CTA contrast ' + contrast.toFixed(2))
              assert(await page.locator('#engineering-evidence').isVisible(), 'Evidence section missing')
              assert((await page.locator('a[href*="/blob/"]').count()) >= 2, 'Pinned evidence links missing')
              await page.screenshot({ path: path.join(output, label + '-hire.png'), fullPage: true })
              results.push({ label, route, contrast: Number(contrast.toFixed(2)), screenshot: label + '-hire.png' })
            }
            if (route === '/about')
              assert(
                (await page.locator('body').innerText()).includes(
                  locale === 'ko' ? 'AI / 에이전트 시스템' : 'AI / Agent Systems'
                ),
                'AI skill category missing'
              )
            if (!route) {
              const link = page.locator('a[href="' + prefix + '/projects/studios"]').first()
              assert((await link.count()) === 1, 'Private studios card has no case-study link')
              await link.click()
              await page.waitForURL('**' + prefix + '/projects/studios')
              assert(
                (await page.locator('h1').innerText()).toLowerCase().includes('studios'),
                'Case study navigation failed'
              )
            }
          }
          assert(
            !requests.some((url) => /_vercel\/(?:insights|speed-insights)/.test(url)),
            'Local preview requested Vercel-only endpoints'
          )
          assert(errors.length === 0, errors.join(' | '))
          console.log('PASS', label, 'home/hire/about/case-study; console/network clean')
        } catch (e) {
          failures.push(label + ': ' + (e instanceof Error ? e.message : String(e)))
          await page.screenshot({ path: path.join(output, label + '-failure.png'), fullPage: true }).catch(() => {})
        } finally {
          await ctx.close()
        }
      }
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  for (const prefix of ['', '/en'])
    for (const route of ['/projects/creator-learning-os', '/blog/agent-engineering-ownership']) {
      const r = await page.goto(base + prefix + route, { waitUntil: 'domcontentloaded' })
      assert(r?.ok() && (await page.locator('h1').count()) === 1, 'New content failed: ' + route)
      results.push({ route: prefix + route, status: r?.status() })
    }
  for (const file of resumes.files) {
    const r = await ctx.request.get(base + '/resume/' + file.file)
    assert(r.ok() && r.headers()['content-type']?.includes('application/pdf'), 'PDF response invalid')
    assert(sha(await r.body()) === file.sha256, 'Served résumé bytes mismatch: ' + file.file)
    results.push({ file: file.file, hashVerified: true })
    console.log('PASS PDF', file.file)
  }
  await ctx.close()
} catch (e) {
  failures.push(e instanceof Error ? e.message : String(e))
} finally {
  await browser.close()
  const report = {
    checkedAt: new Date().toISOString(),
    base,
    sourceFingerprint,
    status: failures.length ? 'FAIL' : 'PASS',
    browser: 'Chromium headless',
    humanVisualAcceptance: false,
    productionDeploymentVerified: false,
    results,
    failures,
  }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(report.status, 'portfolio QA; report:', path.join(output, 'report.json'))
  if (failures.length) {
    console.error(failures.join('\n'))
    process.exitCode = 1
  }
}
