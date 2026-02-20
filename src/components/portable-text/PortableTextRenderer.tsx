import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref && !value?.asset?._id) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).quality(80).auto('format').url()}
            alt={value.alt || 'Image'}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    codeBlock: ({ value }) => <CodeBlock value={value} />,
    callout: ({ value }) => <Callout value={value} />,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
    ),
  },
  block: {
    h2: ({ children, value }) => (
      <h2 id={value._key} className="text-2xl font-bold mt-10 mb-4 scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={value._key} className="text-xl font-semibold mt-8 mb-3 scroll-mt-20">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-blue-500 pl-4 italic text-gray-400 my-6">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>,
  },
}

export function PortableTextRenderer({ value }: { value: any }) {
  return (
    <div className="prose-content">
      <PortableText value={value} components={components} />
    </div>
  )
}
