import { useTranslations } from 'next-intl'
import { Github, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const ta = useTranslations('accessibility')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border-subtle)] mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          &copy; {year} WritingDeveloper. {t('copyright')}
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors" aria-label={ta('github')}>
            <Github size={18} aria-hidden="true" />
          </a>
          <a href="https://linkedin.com/in/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors" aria-label={ta('linkedin')}>
            <Linkedin size={18} aria-hidden="true" />
          </a>
          <a href="https://twitter.com/writingdev" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors" aria-label={ta('twitter')}>
            <Twitter size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
