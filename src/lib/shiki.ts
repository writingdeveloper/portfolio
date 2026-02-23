import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'javascript', 'python', 'rust', 'html', 'css', 'bash', 'json', 'sql', 'go', 'tsx', 'jsx', 'markdown', 'yaml', 'toml', 'diff'],
    })
  }
  return highlighterPromise
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter()
  const loadedLangs = highlighter.getLoadedLanguages()
  const language = loadedLangs.includes(lang as any) ? lang : 'text'
  return highlighter.codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })
}
