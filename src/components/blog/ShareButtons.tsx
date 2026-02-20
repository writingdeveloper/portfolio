'use client'

import { Linkedin, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('common')
  const ta = useTranslations('accessibility')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
    }
  }

  return (
    <div className="flex items-center gap-2 mt-8">
      <span className="text-sm text-gray-500 mr-1">{t('sharePost')}</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label={ta('shareOnTwitter')}
      >
        <Twitter size={16} aria-hidden="true" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label={ta('shareOnLinkedin')}
      >
        <Linkedin size={16} aria-hidden="true" />
      </a>
      <button
        onClick={copyLink}
        className="p-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label={ta('copyLink')}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <LinkIcon size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
