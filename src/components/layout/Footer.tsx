import { useTranslations } from 'next-intl'
import { Github, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800/50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {year} WritingDeveloper. {t('copyright')}
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Github size={18} />
          </a>
          <a href="https://linkedin.com/in/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Linkedin size={18} />
          </a>
          <a href="https://twitter.com/writingdev" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
