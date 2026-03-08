import fs from 'fs'
import path from 'path'

export interface TranslationStatus {
  translated: string[]
  untranslated: string[]
}

export function getTranslationStatus(): TranslationStatus {
  const postsDir = path.join(process.cwd(), 'content', 'posts')
  const koDir = path.join(postsDir, 'ko')
  const enDir = path.join(postsDir, 'en')

  const getSlugs = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const slugs: string[] = []
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        slugs.push(entry.name.replace(/\.mdx$/, ''))
      } else if (entry.isDirectory()) {
        const indexPath = path.join(dir, entry.name, 'index.mdx')
        if (fs.existsSync(indexPath)) {
          slugs.push(entry.name)
        }
      }
    }
    return slugs
  }

  const koSlugs = getSlugs(koDir)
  const enSlugs = new Set(getSlugs(enDir))

  return {
    translated: koSlugs.filter((s) => enSlugs.has(s)),
    untranslated: koSlugs.filter((s) => !enSlugs.has(s)),
  }
}
