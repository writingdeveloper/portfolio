/* eslint-disable @next/next/no-img-element */
import type { ComponentPropsWithoutRef } from 'react'
import { highlightCode } from '@/lib/shiki'
import { CopyButton } from './CopyButton'

function generateSlug(children: React.ReactNode): string {
  const text = extractText(children)
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  }
  return ''
}

function createSlugCounter() {
  const counts = new Map<string, number>()
  return (base: string): string => {
    const count = counts.get(base) || 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

async function CodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const codeChild = props.children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
  const className = codeChild?.props?.className || ''
  const lang = className.replace(/language-/, '') || 'text'
  const code = extractText(codeChild?.props?.children).replace(/\n$/, '')

  const html = await highlightCode(code, lang)

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[var(--border-default)] relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--code-header-bg)] text-xs text-[var(--code-header-text)]">
        <span>{lang !== 'text' ? lang : ''}</span>
        <CopyButton code={code} />
      </div>
      <div
        className="[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-[var(--code-bg)] [&_pre]:text-sm [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function createMdxComponents() {
  const uniqueSlug = createSlugCounter()
  return {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h2 id={uniqueSlug(generateSlug(props.children))} className="text-2xl sm:text-3xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 id={uniqueSlug(generateSlug(props.children))} className="text-xl sm:text-2xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 id={uniqueSlug(generateSlug(props.children))} className="text-lg sm:text-xl font-semibold mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className="text-base sm:text-lg font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="my-4 leading-relaxed" {...props} />,
  a: (props: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = props.href?.startsWith('http')
    return (
      <a
        className="text-[var(--accent-text)] hover:text-[var(--accent-text-hover)] underline underline-offset-2"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    )
  },
  ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-6 my-4 space-y-1" {...props} />,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-[var(--accent-text)] pl-4 italic text-[var(--text-secondary)] my-6" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => {
    if (props.className) {
      return <code {...props} />
    }
    return <code className="bg-[var(--inline-code-bg)] px-1.5 py-0.5 rounded text-sm" {...props} />
  },
  pre: CodeBlock,
  img: (props: ComponentPropsWithoutRef<'img'>) => (
    <figure className="my-8">
      <img className="rounded-lg w-full h-auto" loading="lazy" {...props} alt={props.alt || 'image'} />
    </figure>
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-[var(--text-primary)]" {...props} />,
  hr: () => <hr className="my-8 border-[var(--border-default)]" />,
  }
}
