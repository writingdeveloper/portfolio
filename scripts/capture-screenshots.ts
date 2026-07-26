/**
 * Capture real screenshots of every project that has a public website.
 *
 * Real screenshots only: the portfolio never shows a generated image as if it
 * were a product's UI. Failures (dead links, login walls, timeouts) are skipped
 * and reported rather than faked.
 *
 * Usage: npx tsx scripts/capture-screenshots.ts
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

async function main() {
  const targets = selectCaptureTargets(projectsData.projects as Project[])
  console.log(`${targets.length} project(s) have a public website`)

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
      const png = await page.screenshot({ type: 'png' })

      await sharp(png)
        .resize(1440, 900, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(path.join(OUT_DIR, `${target.slug}.webp`))

      succeeded.push(target.slug)
      console.log(`OK    ${target.slug}  ${target.url}`)
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
