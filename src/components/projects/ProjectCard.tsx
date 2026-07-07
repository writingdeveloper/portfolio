import { ArrowLeft, ExternalLink, Github, Lock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { Project } from '@/types/content'
import { predecessorOf } from '@/lib/lineage'

interface ProjectCardProps {
  project: Project
}

const statusColors: Record<string, string> = {
  active: 'bg-[var(--status-active-bg)] text-[var(--status-active-text)]',
  building: 'bg-[var(--status-building-bg)] text-[var(--status-building-text)]',
  launched: 'bg-[var(--status-launched-bg)] text-[var(--status-launched-text)]',
  archived: 'bg-[var(--status-archived-bg)] text-[var(--status-archived-text)]',
}

// lucide-react ships no Google Play brand mark. Render the Play triangle in the
// brand's diagonal gradient (cyan → teal → yellow → red) so it reads as the real
// Google Play logo rather than a generic media-play glyph.
function GooglePlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="gp-grad" x1="4" y1="2.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00C3FF" />
          <stop offset="0.35" stopColor="#00E0A8" />
          <stop offset="0.7" stopColor="#FFCE00" />
          <stop offset="1" stopColor="#FF3D5A" />
        </linearGradient>
      </defs>
      <path
        fill="url(#gp-grad)"
        d="M4 2.5v19a1 1 0 0 0 1.5.87l16.5-9.5a1 1 0 0 0 0-1.74L5.5 1.63A1 1 0 0 0 4 2.5Z"
      />
    </svg>
  )
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects')
  const locale = useLocale()
  const predecessor = predecessorOf(project)
  const graveyardHref = locale === 'ko' ? '/graveyard' : `/${locale}/graveyard`

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:p-6 hover:border-[var(--border-hover)] transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {project.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || statusColors.archived}`}>
                {t(`status.${project.status}`)}
              </span>
            )}
            {project.private && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                <Lock size={11} /> {t('private')}
              </span>
            )}
          </div>
          {project.descriptionKo && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {locale === 'en' ? (project.descriptionEn || project.descriptionKo) : project.descriptionKo}
            </p>
          )}
        </div>
      </div>

      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              {tech}
            </span>
          ))}
        </div>
      )}

      {predecessor && (
        <a href={graveyardHref}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors mb-3">
          <ArrowLeft size={12} /> {t('continuedFrom', { name: predecessor.name })}
        </a>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {project.website && (
          <a href={project.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
            <ExternalLink size={14} /> {t('viewProject')}
          </a>
        )}
        {project.github && !project.private && (
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
            <Github size={14} /> {t('viewCode')}
          </a>
        )}
        {project.playStore && (
          <a href={project.playStore} target="_blank" rel="noopener noreferrer"
            aria-label={t('viewOnPlayStore')}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-1.5 text-white border border-white/15 hover:bg-neutral-800 transition-colors">
            <GooglePlayIcon size={16} />
            <span className="flex flex-col leading-none text-left">
              <span className="text-[9px] uppercase tracking-wide opacity-80">{t('getItOn')}</span>
              <span className="text-sm font-semibold">Google Play</span>
            </span>
          </a>
        )}
      </div>
    </div>
  )
}
