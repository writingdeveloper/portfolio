import fs from 'fs'
import path from 'path'

// Posts live one directory per slug: content/posts/<locale>/<slug>/index.mdx
const postsDir = path.join(process.cwd(), 'content', 'posts')
const koDir = path.join(postsDir, 'ko')
const enDir = path.join(postsDir, 'en')

function getPostSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(dir, slug, 'index.mdx')))
}

const koSlugs = getPostSlugs(koDir)
const enSlugs = new Set(getPostSlugs(enDir))

const untranslated = koSlugs.filter((slug) => !enSlugs.has(slug))
const translated = koSlugs.filter((slug) => enSlugs.has(slug))

console.log(`\nUntranslated posts (${untranslated.length}/${koSlugs.length}):`)
if (untranslated.length === 0) {
  console.log('  All posts have been translated!')
} else {
  untranslated.forEach((slug) => console.log(`  - ${slug}`))
}

console.log(`\nTranslated posts (${translated.length}/${koSlugs.length}):`)
if (translated.length === 0) {
  console.log('  No posts have been translated yet.')
} else {
  translated.forEach((slug) => console.log(`  - ${slug}`))
}

console.log()
