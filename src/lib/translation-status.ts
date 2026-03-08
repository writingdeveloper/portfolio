import { getAllSlugs } from './mdx'

export interface TranslationStatus {
  translated: string[]
  untranslated: string[]
}

export function getTranslationStatus(): TranslationStatus {
  const koSlugs = getAllSlugs('ko')
  const enSlugs = new Set(getAllSlugs('en'))

  return {
    translated: koSlugs.filter((s) => enSlugs.has(s)),
    untranslated: koSlugs.filter((s) => !enSlugs.has(s)),
  }
}
