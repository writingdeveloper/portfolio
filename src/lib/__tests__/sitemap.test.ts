import { describe, it, expect } from 'vitest'
import sitemap from '../../app/sitemap'
import { SITE_URL } from '../constants'
import projectsData from '../../../content/projects.json'
import type { Project } from '@/types/content'

describe('sitemap', () => {
  it('attaches every project screenshot as an absolute URL to the ko and en /projects entries', async () => {
    const entries = await sitemap()
    const expectedImages = (projectsData.projects as Project[])
      .filter((p) => p.screenshot)
      .map((p) => `${SITE_URL}${p.screenshot}`)

    const koProjects = entries.find((e) => e.url === `${SITE_URL}/projects`)
    const enProjects = entries.find((e) => e.url === `${SITE_URL}/en/projects`)

    expect(koProjects).toBeDefined()
    expect(enProjects).toBeDefined()
    expect(koProjects?.images).toEqual(expectedImages)
    expect(enProjects?.images).toEqual(expectedImages)

    // Every attached image must be an absolute http(s) URL.
    for (const url of koProjects?.images ?? []) {
      expect(url.startsWith('http')).toBe(true)
    }
  })

  it('omits the images key entirely on entries with no images', async () => {
    const entries = await sitemap()
    const home = entries.find((e) => e.url === SITE_URL)
    const graveyard = entries.find((e) => e.url === `${SITE_URL}/graveyard`)

    expect(home).toBeDefined()
    expect(graveyard).toBeDefined()
    expect(home).not.toHaveProperty('images')
    expect(graveyard).not.toHaveProperty('images')
  })

  it('lists the hire page in both locales with hreflang alternates', async () => {
    const entries = await sitemap()
    const ko = entries.find((e) => e.url === `${SITE_URL}/hire`)
    const en = entries.find((e) => e.url === `${SITE_URL}/en/hire`)

    expect(ko, 'ko /hire missing from the sitemap').toBeDefined()
    expect(en, 'en /hire missing from the sitemap').toBeDefined()
    expect(ko?.alternates?.languages).toMatchObject({
      ko: `${SITE_URL}/hire`,
      en: `${SITE_URL}/en/hire`,
    })
  })

  it('lists the studio page in both locales at the same priority as /projects', async () => {
    const entries = await sitemap()
    const ko = entries.find((e) => e.url === `${SITE_URL}/studio`)
    const en = entries.find((e) => e.url === `${SITE_URL}/en/studio`)
    const projects = entries.find((e) => e.url === `${SITE_URL}/projects`)

    expect(ko, 'ko /studio missing from the sitemap').toBeDefined()
    expect(en, 'en /studio missing from the sitemap').toBeDefined()
    // Not the 0.5 floor: /studio is a substantial page, and dropping to the
    // floor is the silent failure mode when the priority ladder is edited.
    expect(ko?.priority).toBe(projects?.priority)
    expect(ko?.alternates?.languages).toMatchObject({
      ko: `${SITE_URL}/studio`,
      en: `${SITE_URL}/en/studio`,
    })
  })
})
