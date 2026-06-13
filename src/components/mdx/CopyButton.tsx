'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export function CopyButton({ code }: { code: string }) {
  const { copied, copy } = useCopyToClipboard()
  const t = useTranslations('accessibility')

  return (
    <button
      onClick={() => copy(code)}
      className="flex items-center gap-1 hover:text-white transition-colors"
      aria-label={copied ? t('copied') : t('copy')}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {copied ? t('copied') : t('copy')}
    </button>
  )
}
