/**
 * Capture real screenshots of every project that has a public website.
 *
 * Real screenshots only: the portfolio never shows a generated image as if it
 * were a product's UI. Failures (dead links, login walls, timeouts) are skipped
 * and reported rather than faked.
 *
 * Usage:
 *   npx tsx scripts/capture-screenshots.ts                     # every target
 *   npx tsx scripts/capture-screenshots.ts healframe kindling  # named slugs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { chromium } from 'playwright'
import { selectCaptureTargets } from '../src/lib/capture-targets'
import projectsData from '../content/projects.json'
import type { Project } from '../src/types/content'

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'projects')
const VIEWPORT = { width: 1440, height: 900 }
const NAV_TIMEOUT_MS = 30_000
/** Let late-loading fonts and hero animations settle before the shutter. */
const SETTLE_MS = 2_000
/** A dismissal is a nicety, never a reason to lose the shot. */
const DISMISS_CLICK_TIMEOUT_MS = 2_000
/** Let the banner's exit transition finish before the next look. */
const DISMISS_SETTLE_MS = 700
/** A cookie bar and a first-run dialog can both be up; more than that and we
 *  are no longer dismissing chrome, we are driving the app. */
const MAX_DISMISSALS = 2

/**
 * Consent bars and first-run dialogs cover the very thing a screenshot exists
 * to show, so the capture tries to clear them before the shutter.
 *
 * This is deliberately generic rather than a per-site selector list: matching
 * is by accessible name against a small allowlist of acknowledgement labels, so
 * a site with no banner is simply left alone. It is also strictly best-effort —
 * nothing here may fail a capture.
 */
const DISMISS_LABELS: RegExp[] = [
  // Consent: accept.
  /^(accept|accept all|accept all cookies|accept cookies|allow all|i accept|i agree|agree)$/i,
  // Consent: refuse. Just as good for us, and kinder to the reader.
  /^(essentials only|only essential|essential only|necessary only|reject all|reject non-essential|decline)$/i,
  // First-run acknowledgements.
  /^(ok|okay|got it|understood|dismiss|close|no thanks|let'?s go|let’s go)$/i,
]

/**
 * Refused outright even when the accessible name matches above. The allowlist is
 * already exact-match, so this is belt-and-braces against a stray "OK" that
 * confirms something we would regret.
 */
const NEVER_CLICK =
  /\b(buy|pay|purchase|checkout|order|subscribe|upgrade|donate|delete|remove|erase|reset|sign\s?in|sign\s?up|log\s?in|login|register|submit|send|confirm|unsubscribe)\b/i

/**
 * Best-effort: clear consent bars and first-run dialogs. Returns the labels it
 * actually clicked, for the run log. Never throws — a page with no banner, a
 * detached node, an overlay that eats the click: all of it is fine, and the
 * capture proceeds either way.
 */
async function dismissOverlays(page: import('playwright').Page): Promise<string[]> {
  const dismissed: string[] = []

  try {
    for (let round = 0; round < MAX_DISMISSALS; round++) {
      let clickedThisRound = false

      for (const label of DISMISS_LABELS) {
        // Buttons only. Links and generic elements navigate, and a screenshot
        // of the page after we wandered off it is worse than a cookie bar.
        const candidates = page.getByRole('button', { name: label }).filter({ visible: true })

        // count() resolves immediately, so a page with no banner costs nothing.
        const count = await candidates.count().catch(() => 0)
        if (count === 0) continue

        const button = candidates.first()
        const name = ((await button.textContent().catch(() => '')) ?? '').trim().slice(0, 40)
        if (NEVER_CLICK.test(name)) continue

        await button.click({ timeout: DISMISS_CLICK_TIMEOUT_MS })
        dismissed.push(name || label.source)
        clickedThisRound = true
        await page.waitForTimeout(DISMISS_SETTLE_MS)
        break
      }

      if (!clickedThisRound) break
    }
  } catch {
    // Swallowed on purpose: see the contract in this function's docblock.
  }

  return dismissed
}

async function main() {
  const only = new Set(process.argv.slice(2))
  const allTargets = selectCaptureTargets(projectsData.projects as Project[])
  const targets = only.size > 0 ? allTargets.filter((t) => only.has(t.slug)) : allTargets

  if (only.size > 0) {
    const unknown = [...only].filter((slug) => !allTargets.some((t) => t.slug === slug))
    if (unknown.length > 0) {
      console.error(`no capture target for: ${unknown.join(', ')}`)
      process.exit(1)
    }
    console.log(`capturing ${targets.length} of ${allTargets.length} target(s)`)
  } else {
    console.log(`${targets.length} project(s) have a public website`)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
    deviceScaleFactor: 2,
  })

  const succeeded: string[] = []
  const failed: { slug: string; reason: string }[] = []

  for (const target of targets) {
    let page: Awaited<ReturnType<typeof context.newPage>> | undefined
    try {
      page = await context.newPage()
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS })
      await page.waitForTimeout(SETTLE_MS)
      const dismissed = await dismissOverlays(page)
      const png = await page.screenshot({ type: 'png' })

      await sharp(png)
        .resize(1440, 900, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(path.join(OUT_DIR, `${target.slug}.webp`))

      succeeded.push(target.slug)
      const note = dismissed.length > 0 ? `  (dismissed: ${dismissed.join(', ')})` : ''
      console.log(`OK    ${target.slug}  ${target.url}${note}`)
    } catch (error) {
      const reason = error instanceof Error ? error.message.split('\n')[0] : String(error)
      failed.push({ slug: target.slug, reason })
      console.log(`SKIP  ${target.slug}  ${target.url}\n        ${reason}`)
    } finally {
      await page?.close().catch(() => {})
    }
  }

  await browser.close()

  console.log(`\ncaptured ${succeeded.length}/${targets.length}`)
  if (failed.length > 0) {
    console.log('skipped:')
    for (const f of failed) console.log(`  ${f.slug}: ${f.reason}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
