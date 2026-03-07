import { describe, it, expect } from 'vitest'
import { extractHeadings } from '../mdx'

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings', () => {
    const content = '## Hello\n### World\n## Another'
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(3)
    expect(headings[0]).toEqual({ id: 'hello', text: 'Hello', level: 2 })
    expect(headings[1]).toEqual({ id: 'world', text: 'World', level: 3 })
    expect(headings[2]).toEqual({ id: 'another', text: 'Another', level: 2 })
  })

  it('handles duplicate slugs', () => {
    const content = '## Hello\n## Hello'
    const headings = extractHeadings(content)
    expect(headings[0].id).toBe('hello')
    expect(headings[1].id).toBe('hello-1')
  })

  it('returns empty for no headings', () => {
    expect(extractHeadings('just text')).toEqual([])
  })

  it('handles Korean text', () => {
    const content = '## 안녕하세요'
    const headings = extractHeadings(content)
    expect(headings[0].id).toBe('안녕하세요')
    expect(headings[0].text).toBe('안녕하세요')
  })
})
