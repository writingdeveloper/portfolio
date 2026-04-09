'use client'

import { useState } from 'react'
import { Mail, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Newsletter() {
  const t = useTranslations('blog')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 mt-12">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={18} className="text-[var(--accent-text)]" />
        <h3 className="font-semibold">{t('newsletterTitle')}</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{t('newsletterDescription')}</p>
      {submitted ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
          <Info size={16} className="text-[var(--accent-text)] shrink-0" />
          <p className="text-sm text-[var(--accent-text)] font-medium">{t('newsletterComingSoon')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletterPlaceholder')}
            aria-label={t('newsletterPlaceholder')}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-text)] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-sm font-medium hover:bg-[var(--btn-primary-bg-hover)] transition-colors"
          >
            {t('newsletterSubscribe')}
          </button>
        </form>
      )}
    </div>
  )
}
