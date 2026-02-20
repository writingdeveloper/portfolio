'use client'

import { Linkedin, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('common')

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-8">
      <span className="text-sm text-gray-500 mr-1">{t('sharePost')}</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        <Twitter size={16} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        <Linkedin size={16} />
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  )
}
