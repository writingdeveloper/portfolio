import { chromium, type Page } from 'playwright'

const BASE_URL = (process.env.QA_BASE_URL ?? 'http://127.0.0.1:3100').replace(/\/$/, '')
const LOCALE = process.env.QA_LOCALE ?? 'en'
const prefix = LOCALE === 'ko' ? '' : `/${LOCALE}`

const primaryNav = [
  { index: '01', label: 'WORK', path: '/projects' },
  { index: '02', label: 'GRAVEYARD', path: '/graveyard' },
  { index: '03', label: 'BLOG', path: '/blog' },
  { index: '04', label: 'ABOUT', path: '/about' },
  { index: '05', label: 'HIRE', path: '/hire' },
  { index: '06', label: 'EXPLORE', path: '/play' },
] as const

const failures: string[] = []

function url(path = '') {
  return `${BASE_URL}${prefix}${path}`
}

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`PASS  ${name}`)
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
    failures.push(`${name}: ${message}`)
    console.error(`FAIL  ${name}\n      ${message}`)
  }
}

async function expectCount(page: Page, selector: string, expected: number, context: string) {
  const actual = await page.locator(selector).count()
  if (actual !== expected) throw new Error(`${context}: expected ${expected} × ${selector}, got ${actual}`)
}

async function gotoSettled(page: Page, target: string) {
  await page.goto(target, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(250)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' })
  const page = await context.newPage()

  try {
    await check('direct regular routes render the standard shell', async () => {
      for (const item of primaryNav.filter((item) => item.path !== '/play')) {
        await gotoSettled(page, url(item.path))
        await expectCount(page, '#main-content', 1, item.path)
        const brand = page
          .locator('header')
          .getByRole('link', { name: /WRITINGDEVELOPER/i })
          .first()
        if (!(await brand.isVisible())) throw new Error(`${item.path}: site header brand is not visible`)
      }
    })

    await check('home client navigation restores the standard shell on every regular route', async () => {
      for (const item of primaryNav.filter((item) => item.path !== '/play')) {
        await gotoSettled(page, url())
        const link = page.getByRole('link', { name: new RegExp(`${item.index}\\s+${item.label}`, 'i') }).first()
        if (!(await link.isVisible())) throw new Error(`home link ${item.index} ${item.label} is not visible`)
        await link.click()
        await page.waitForURL(`**${prefix}${item.path}`, { timeout: 15_000 })
        await page.waitForTimeout(400)
        await expectCount(page, '#main-content', 1, `home -> ${item.path}`)
        const text = (await page.locator('body').innerText()).trim()
        if (/^Loading…?$/.test(text)) throw new Error(`home -> ${item.path}: route is stuck on Loading`)
      }
    })

    await check('regular route client navigation back home removes the standard shell', async () => {
      await gotoSettled(page, url('/projects'))
      await page
        .locator('header')
        .getByRole('link', { name: /WRITINGDEVELOPER/i })
        .first()
        .click()
      await page.waitForURL(`**${prefix || '/'}`, { timeout: 15_000 })
      await page.waitForTimeout(400)
      await expectCount(page, '#main-content', 0, 'projects -> home')
      await expectCount(page, '.ledger', 1, 'projects -> home')
    })

    await check('regular route client navigation to Explore becomes immersive', async () => {
      await gotoSettled(page, url('/projects'))
      const explore = page.getByRole('link', { name: /(?:06\s+)?EXPLORE/i }).first()
      if (!(await explore.isVisible())) throw new Error('Explore link is not visible from a regular route')
      await explore.click()
      await page.waitForURL(`**${prefix}/play`, { timeout: 15_000 })
      await page.waitForTimeout(400)
      await expectCount(page, '#main-content', 0, 'projects -> play')
    })

    await check('home and standard header expose the same canonical primary navigation', async () => {
      await gotoSettled(page, url())
      const homeNav = page.locator('header nav').filter({ visible: true }).first()
      for (const item of primaryNav) {
        const link = homeNav.getByRole('link', { name: new RegExp(`${item.index}\\s+${item.label}`, 'i') })
        if ((await link.count()) !== 1) throw new Error(`home nav missing ${item.index} ${item.label}`)
        const href = await link.getAttribute('href')
        if (href !== `${prefix}${item.path}`)
          throw new Error(`home ${item.label}: expected href ${prefix}${item.path}, got ${href}`)
      }

      await gotoSettled(page, url('/projects'))
      const standardNav = page.locator('header nav[aria-label="Main navigation"]')
      for (const item of primaryNav) {
        const link = standardNav.getByRole('link', { name: new RegExp(`${item.index}\\s+${item.label}`, 'i') })
        if ((await link.count()) !== 1) throw new Error(`standard nav missing ${item.index} ${item.label}`)
        const href = await link.getAttribute('href')
        if (href !== `${prefix}${item.path}`)
          throw new Error(`standard ${item.label}: expected href ${prefix}${item.path}, got ${href}`)
      }
      if ((await standardNav.getByRole('link', { name: /^Home$/i }).count()) !== 0) {
        throw new Error('standard nav still contains redundant Home text link; the brand already links home')
      }
    })
  } finally {
    await context.close()
    await browser.close()
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} navigation QA failure(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('\nNavigation QA passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
