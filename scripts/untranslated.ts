import fs from 'fs'
import path from 'path'

const postsDir = path.join(process.cwd(), 'content', 'posts')
const koDir = path.join(postsDir, 'ko')
const enDir = path.join(postsDir, 'en')

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
}

const koFiles = getMdxFiles(koDir)
const enFiles = new Set(getMdxFiles(enDir))

const untranslated = koFiles.filter((f) => !enFiles.has(f))
const translated = koFiles.filter((f) => enFiles.has(f))

console.log(`\nUntranslated posts (${untranslated.length}/${koFiles.length}):`)
if (untranslated.length === 0) {
  console.log('  All posts have been translated!')
} else {
  untranslated.forEach((f) => console.log(`  - ${f.replace('.mdx', '')}`))
}

console.log(`\nTranslated posts (${translated.length}/${koFiles.length}):`)
if (translated.length === 0) {
  console.log('  No posts have been translated yet.')
} else {
  translated.forEach((f) => console.log(`  - ${f.replace('.mdx', '')}`))
}

console.log()
