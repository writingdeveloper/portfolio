import { ExternalLink, Github } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { Project } from '../../../content/projects'

interface ProjectCardProps {
  project: Project
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  building: 'bg-amber-500/20 text-amber-400',
  launched: 'bg-blue-500/20 text-blue-400',
  archived: 'bg-gray-500/20 text-gray-400',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects')
  const locale = useLocale()

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {project.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || statusColors.archived}`}>
                {t(`status.${project.status}`)}
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-gray-400 mt-1">
              {typeof project.description === 'string' ? project.description : project.description[locale] || project.description['ko']}
            </p>
          )}
        </div>
      </div>

      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {project.links.website && (
          <a href={project.links.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ExternalLink size={14} /> {t('viewProject')}
          </a>
        )}
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Github size={14} /> {t('viewCode')}
          </a>
        )}
      </div>
    </div>
  )
}
