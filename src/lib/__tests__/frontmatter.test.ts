import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from '../frontmatter'

describe('parseFrontmatter', () => {
  it('splits frontmatter from the body', () => {
    const { data, content } = parseFrontmatter('---\ntitle: Sample\nauthor: Someone\n---\nFirst line.\n')
    expect(data).toEqual({ title: 'Sample', author: 'Someone' })
    expect(content).toBe('First line.\n')
  })

  it('returns the whole document when there is no frontmatter', () => {
    const doc = '# Just a heading\n\nSome prose.\n'
    const { data, content } = parseFrontmatter(doc)
    expect(data).toEqual({})
    expect(content).toBe(doc)
  })

  it('strips a UTF-8 BOM before looking for the opening fence', () => {
    const { data, content } = parseFrontmatter('﻿---\ntitle: Sample\n---\nBody.')
    expect(data).toEqual({ title: 'Sample' })
    expect(content).toBe('Body.')
  })

  it('leaves an unquoted date as a Date object', () => {
    // getAllPosts sorts on this value, so the shape is load-bearing.
    const { data } = parseFrontmatter('---\npublishedAt: 2026-06-10\n---\nBody.')
    expect(data.publishedAt).toBeInstanceOf(Date)
    expect((data.publishedAt as Date).toISOString()).toBe('2026-06-10T00:00:00.000Z')
  })

  it('leaves a quoted date as a string', () => {
    const { data } = parseFrontmatter("---\npublishedAt: '2026-06-10'\n---\nBody.")
    expect(data.publishedAt).toBe('2026-06-10')
  })

  it('parses nested arrays of objects', () => {
    const doc = [
      '---',
      'tags:',
      '  - alpha',
      '  - beta',
      'faqs:',
      '  - question: First question?',
      '    answer: First answer.',
      '  - question: Second question?',
      '    answer: Second answer.',
      '---',
      'Body.',
    ].join('\n')
    const { data } = parseFrontmatter(doc)
    expect(data.tags).toEqual(['alpha', 'beta'])
    expect(data.faqs).toEqual([
      { question: 'First question?', answer: 'First answer.' },
      { question: 'Second question?', answer: 'Second answer.' },
    ])
  })

  it('keeps a --- rule in the body out of the delimiter search', () => {
    const doc = ['---', 'title: Sample', '---', 'Above the rule.', '', '---', '', 'Below the rule.'].join('\n')
    const { data, content } = parseFrontmatter(doc)
    expect(data).toEqual({ title: 'Sample' })
    expect(content).toBe('Above the rule.\n\n---\n\nBelow the rule.')
  })

  it('handles CRLF documents', () => {
    // The checked-in posts use CRLF, so the fences carry a trailing \r.
    const { data, content } = parseFrontmatter('---\r\ntitle: Sample\r\n---\r\nBody line.\r\n')
    expect(data).toEqual({ title: 'Sample' })
    expect(content).toBe('Body line.\r\n')
  })

  it('preserves non-ASCII text in both metadata and body', () => {
    const { data, content } = parseFrontmatter('---\ntitle: 안녕하세요\n---\n본문 내용입니다.\n')
    expect(data.title).toBe('안녕하세요')
    expect(content).toBe('본문 내용입니다.\n')
  })

  it('yields an empty object for an empty or comment-only block', () => {
    expect(parseFrontmatter('---\n---\nBody.').data).toEqual({})
    expect(parseFrontmatter('---\n# just a comment\n---\nBody.').data).toEqual({})
    expect(parseFrontmatter('---\n---\nBody.').content).toBe('Body.')
  })

  it('treats an unterminated block as a document without frontmatter', () => {
    const doc = '---\ntitle: Sample\nno closing fence here\n'
    const { data, content } = parseFrontmatter(doc)
    expect(data).toEqual({})
    expect(content).toBe(doc)
  })

  it('handles an empty string', () => {
    expect(parseFrontmatter('')).toEqual({ data: {}, content: '' })
  })

  it('throws on malformed YAML so the caller can skip the file', () => {
    expect(() => parseFrontmatter('---\ntitle: "unterminated\n---\nBody.')).toThrow()
  })
})
