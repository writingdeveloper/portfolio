import { ExternalLink, Github, Lock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { Project } from '@/types/content'

interface ProjectCardProps {
  project: Project
}

const statusColors: Record<string, string> = {
  active: 'bg-[var(--status-active-bg)] text-[var(--status-active-text)]',
  building: 'bg-[var(--status-building-bg)] text-[var(--status-building-text)]',
  launched: 'bg-[var(--status-launched-bg)] text-[var(--status-launched-text)]',
  archived: 'bg-[var(--status-archived-bg)] text-[var(--status-archived-text)]',
}

// lucide-react ships no Google Play brand mark, so define a small play triangle.
function PlayStoreIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v19a1 1 0 0 0 1.5.87l16.5-9.5a1 1 0 0 0 0-1.74L5.5 1.63A1 1 0 0 0 4 2.5Z" />
    </svg>
  )
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects')
  const locale = useLocale()

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

      <div className="flex gap-3">
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
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
            <PlayStoreIcon /> {t('googlePlay')}
          </a>
        )}
      </div>
    </div>
  )
}
