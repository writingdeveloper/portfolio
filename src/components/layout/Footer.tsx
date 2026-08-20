import { useTranslations } from 'next-intl'
import { Github, Linkedin } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('footer')
  const ta = useTranslations('accessibility')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border-default)] mt-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="ledger-mono text-xs tracking-[0.1em] text-[var(--text-muted)]">
          <span className="text-[var(--accent-text)]" aria-hidden="true">▪</span> &copy; {year} WRITINGDEVELOPER · {t('copyright')}
        </p>
        <div className="flex items-center gap-4">
          {/* AdSense requires the privacy policy to be reachable from every
              page, so it lives in the global footer rather than one page. */}
          <Link
            href="/privacy"
            className="ledger-mono text-xs tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors"
          >
            {t('privacy')}
          </Link>
          <a href="https://github.com/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors" aria-label={ta('github')}>
            <Github size={18} aria-hidden="true" />
          </a>
          <a href="https://www.linkedin.com/in/sihyeonglee/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors" aria-label={ta('linkedin')}>
            <Linkedin size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
