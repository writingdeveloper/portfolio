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
              const approach = page.locator('#delivery-method')
              assert(await approach.isVisible(), 'Evidence-led delivery method missing')
              assert(
                (await approach.locator('a[href*="/projects/"]').count()) === 3,
                'Delivery examples must link three real case studies'
              )
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
              const proof = page.locator('#verified-work')
              assert(await proof.isVisible(), 'Source-pinned proof section missing')
              assert((await proof.locator('article').count()) === 2, 'Expected both pinned evidence records')
              assert(
                (await proof.locator('a[href*="/blob/"]').count()) === 2,
                'Evidence links must resolve to pinned Git commits'
              )
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
  for (const prefix of ['', '/en']) {
    const incidentCtx = await browser.newContext()
    const incidentPage = await incidentCtx.newPage()
    const route = prefix + '/projects/devdeck'
    const response = await incidentPage.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 })
    assert(response?.ok(), 'DevDeck failure case route missing: ' + route)
    const caseStudy = incidentPage.locator('#failure-investigation')
    assert(await caseStudy.isVisible(), 'Visible failure investigation missing: ' + route)
    assert((await caseStudy.locator('img').count()) === 2, 'Expected before/after source screenshot crops')
    assert(
      (await caseStudy.locator('a[href*="github.com/writingdeveloper/devdeck/"]').count()) === 6,
      'Need six immutable source and CI links'
    )
    const body = await caseStudy.innerText()
    assert(body.includes('20/20') && body.includes('8/8'), 'Case study test counts missing')
    assert(
      body.includes(prefix ? 'What this does not prove' : '검증하지 않은 범위'),
      'Unverified scope disclaimer missing: ' + route + ' heading=' + (await caseStudy.locator('h2').innerText())
    )
    for (const img of await caseStudy.locator('img').all()) {
      await img.scrollIntoViewIfNeeded()
      const loaded = await img.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0)
      assert(loaded, 'QA fixture screenshot failed to load')
    }
    results.push({ route, status: response?.status(), imagesLoaded: 2, pinnedLinks: 6, incident: true })
    console.log('PASS INCIDENT', route, 'before/after images, 6 source links, scope')
    await incidentCtx.close()
  }
  for (const prefix of ['', '/en']) {
    const freshContext = await browser.newContext()
    const freshPage = await freshContext.newPage()
    const npcRoute = prefix + '/projects/brain-vat-siege'
    const npcResponse = await freshPage.goto(base + npcRoute, { waitUntil: 'networkidle', timeout: 30000 })
    assert(npcResponse?.ok(), 'BRAIN//VAT project route unavailable')
    const npcEvidence = freshPage.locator('#verified-demo')
    assert(await npcEvidence.isVisible(), 'Verified NPC demo missing')
    const liveNpc = npcEvidence.locator('a[href="https://brain-vat-siege.vercel.app/npc"]')
    assert((await liveNpc.count()) === 1, 'NPC live demonstration link missing')
    const npcImage = npcEvidence.locator('img')
    await npcImage.scrollIntoViewIfNeeded()
    assert(
      await npcImage.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0),
      'Real NPC production screenshot did not load'
    )
    const npcText = await npcEvidence.innerText()
    assert(npcText.includes('200/200'), 'NPC test-count evidence missing')
    assert(npcText.includes(prefix ? 'no trained policy' : '학습된 정책'), 'Missing NPC limitation at ' + npcRoute)
    results.push({ route: npcRoute, verifiedDemo: true, screenshotLoaded: true })
    console.log('PASS VERIFIED DEMO', npcRoute)

    const creatorRoute = prefix + '/projects/creator-learning-os'
    const creatorResponse = await freshPage.goto(base + creatorRoute, { waitUntil: 'networkidle' })
    assert(creatorResponse?.ok(), 'Creator OS pilot product detail unavailable')
    assert(
      (await freshPage.locator('a[href="https://creator.writingdeveloper.blog/demo"]').count()) >= 1,
      'Creator OS no-login public demo missing'
    )
    const creatorDescription = await freshPage.locator('header').last().innerText()
    assert(
      creatorDescription.includes(prefix ? 'Testing-only' : '승인된 테스트 사용자'),
      'Creator OS pilot access restrictions missing'
    )
    results.push({ route: creatorRoute, pilotStatus: 'testing-only', demoLinked: true })
    console.log('PASS CREATOR PILOT', creatorRoute)
    await freshContext.close()
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
