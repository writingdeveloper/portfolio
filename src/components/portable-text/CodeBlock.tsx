'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
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
  const ta = useTranslations('accessibility')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value.code)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
    }
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-400">
        <span>{value.filename || value.language || ''}</span>
        <button onClick={copyCode} className="flex items-center gap-1 hover:text-white transition-colors" aria-label={ta('copy')}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? ta('copied') : ta('copy')}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-gray-900 text-sm">
        <code>{value.code}</code>
      </pre>
    </div>
  )
}
