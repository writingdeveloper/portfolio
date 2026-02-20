/* eslint-disable @next/next/no-img-element */
import type { ComponentPropsWithoutRef } from 'react'

function generateSlug(children: React.ReactNode): string {
  const text = typeof children === 'string' ? children : ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h2 id={generateSlug(props.children)} className="text-2xl sm:text-3xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 id={generateSlug(props.children)} className="text-xl sm:text-2xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 id={generateSlug(props.children)} className="text-lg sm:text-xl font-semibold mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className="text-base sm:text-lg font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="my-4 leading-relaxed" {...props} />,
  a: (props: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = props.href?.startsWith('http')
    return (
      <a
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    )
  },
  ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-6 my-4 space-y-1" {...props} />,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-6" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => {
    if (props.className) {
      return <code {...props} />
    }
    return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props} />
  },
  pre: (props: ComponentPropsWithoutRef<'pre'>) => (
    <pre className="my-6 rounded-lg overflow-hidden border border-gray-800 p-4 overflow-x-auto bg-gray-900 text-sm" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<'img'>) => (
    <figure className="my-8">
      <img className="rounded-lg w-full h-auto" loading="lazy" alt="" {...props} />
    </figure>
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-gray-100" {...props} />,
  hr: () => <hr className="my-8 border-gray-800" />,
}
