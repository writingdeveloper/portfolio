'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export function CopyButton({ code }: { code: string }) {
  const { copied, copy } = useCopyToClipboard()
  const t = useTranslations('accessibility')

  return (
    <button onClick={() => copy(code)} className="flex items-center gap-1 hover:text-white transition-colors">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? t('copied') : t('copy')}
    </button>
  )
}
