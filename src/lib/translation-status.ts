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

  const getMdxFiles = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
  }

  const koFiles = getMdxFiles(koDir)
  const enFiles = new Set(getMdxFiles(enDir))

  return {
    translated: koFiles.filter((f) => enFiles.has(f)).map((f) => f.replace('.mdx', '')),
    untranslated: koFiles.filter((f) => !enFiles.has(f)).map((f) => f.replace('.mdx', '')),
  }
}
