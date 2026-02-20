'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  value: {
    code: string
    language?: string
    filename?: string
  }
}

export function CodeBlock({ value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard.writeText(value.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-800">
      {(value.filename || value.language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-400">
          <span>{value.filename || value.language}</span>
          <button onClick={copyCode} className="flex items-center gap-1 hover:text-white transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-gray-900 text-sm">
        <code>{value.code}</code>
      </pre>
    </div>
  )
}
