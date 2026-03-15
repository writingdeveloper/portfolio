'use client'

import { useEffect, useCallback } from 'react'
import { X, ExternalLink, Github } from 'lucide-react'
import { useGame } from '../game/state'

export function DetailPanel() {
  const { state, dispatch } = useGame()
  const { showDetail, detailObject } = state.interaction

  const handleClose = useCallback(() => {
    dispatch({ type: 'CLOSE_DETAIL' })
  }, [dispatch])

  // Escape key to close
  useEffect(() => {
    if (!showDetail) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showDetail, handleClose])

  if (!showDetail || !detailObject) return null

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className="relative w-full max-w-[500px] rounded-lg border-2 p-6"
        style={{
          backgroundColor: 'rgba(20, 20, 40, 0.98)',
          borderColor: '#4a6aaa',
          fontFamily: 'monospace',
          maxHeight: '80%',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: '#8888aa' }}
        >
          <X size={18} />
        </button>

        {/* Content based on type */}
        {detailObject.type === 'project' && (
          <ProjectDetail data={detailObject.data} />
        )}
        {detailObject.type === 'post' && (
          <PostDetail data={detailObject.data} />
        )}
        {detailObject.type === 'timeline' && (
          <TimelineDetail data={detailObject.data} />
        )}
        {detailObject.type === 'skill' && (
          <SkillDetail data={detailObject.data} />
        )}
        {detailObject.type === 'npc' && (
          <NpcDetail data={detailObject.data} />
        )}
      </div>
    </div>
  )
}

function ProjectDetail({ data }: { data: Record<string, unknown> }) {
  const name = data.name as string
  const description = data.description as string
  const techStack = (data.techStack as string[]) ?? []
  const status = data.status as string
  const website = data.website as string
  const github = data.github as string

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor:
              status === 'active'
                ? 'rgba(76, 175, 80, 0.2)'
                : status === 'building'
                  ? 'rgba(255, 152, 0, 0.2)'
                  : 'rgba(96, 125, 139, 0.2)',
            color:
              status === 'active'
                ? '#81c784'
                : status === 'building'
                  ? '#ffb74d'
                  : '#90a4ae',
          }}
        >
          {status}
        </span>
      </div>

      <h3 className="text-lg font-bold mb-3" style={{ color: '#6ab0ff' }}>
        {name}
      </h3>

      <p className="text-sm leading-relaxed mb-4" style={{ color: '#c0c0d0' }}>
        {description}
      </p>

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(74, 106, 170, 0.3)',
                color: '#8ab4f8',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: '#6ab0ff', border: '1px solid #4a6aaa' }}
          >
            <ExternalLink size={12} />
            Website
          </a>
        )}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: '#6ab0ff', border: '1px solid #4a6aaa' }}
          >
            <Github size={12} />
            GitHub
          </a>
        )}
      </div>
    </>
  )
}

function PostDetail({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string
  const excerpt = data.excerpt as string
  const slug = data.slug as string
  const category = data.category as string

  return (
    <>
      {category && (
        <span
          className="text-xs px-2 py-0.5 rounded mb-2 inline-block"
          style={{
            backgroundColor: 'rgba(161, 136, 127, 0.2)',
            color: '#bcaaa4',
          }}
        >
          {category}
        </span>
      )}

      <h3 className="text-lg font-bold mb-3" style={{ color: '#6ab0ff' }}>
        {title}
      </h3>

      <p className="text-sm leading-relaxed mb-4" style={{ color: '#c0c0d0' }}>
        {excerpt}
      </p>

      <a
        href={`/blog/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors hover:bg-white/10"
        style={{ color: '#6ab0ff', border: '1px solid #4a6aaa' }}
      >
        <ExternalLink size={12} />
        Read on blog
      </a>
    </>
  )
}

function TimelineDetail({ data }: { data: Record<string, unknown> }) {
  const date = data.date as string
  const title = data.title as string
  const description = data.description as string
  const type = data.type as string

  const typeColors: Record<string, { bg: string; text: string }> = {
    work: { bg: 'rgba(76, 175, 80, 0.2)', text: '#81c784' },
    education: { bg: 'rgba(79, 195, 247, 0.2)', text: '#4fc3f7' },
    project: { bg: 'rgba(206, 147, 216, 0.2)', text: '#ce93d8' },
  }
  const colors = typeColors[type] ?? typeColors.work

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs" style={{ color: '#8888aa' }}>
          {date}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {type}
        </span>
      </div>

      <h3 className="text-lg font-bold mb-3" style={{ color: '#6ab0ff' }}>
        {title}
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: '#c0c0d0' }}>
        {description}
      </p>
    </>
  )
}

function SkillDetail({ data }: { data: Record<string, unknown> }) {
  const name = data.name as string
  const category = data.category as string

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    tools: 'Tools',
  }

  const categoryColors: Record<string, { bg: string; text: string }> = {
    frontend: { bg: 'rgba(79, 195, 247, 0.2)', text: '#4fc3f7' },
    backend: { bg: 'rgba(129, 199, 132, 0.2)', text: '#81c784' },
    tools: { bg: 'rgba(255, 183, 77, 0.2)', text: '#ffb74d' },
  }
  const colors = categoryColors[category] ?? categoryColors.frontend

  return (
    <>
      <span
        className="text-xs px-2 py-0.5 rounded mb-2 inline-block"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {categoryLabels[category] ?? category}
      </span>

      <h3 className="text-lg font-bold" style={{ color: '#6ab0ff' }}>
        {name}
      </h3>
    </>
  )
}

function NpcDetail({ data }: { data: Record<string, unknown> }) {
  const name = data.name as string
  const greeting = data.greeting as string

  return (
    <>
      <h3 className="text-lg font-bold mb-3" style={{ color: '#ffb74d' }}>
        {name}
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: '#c0c0d0' }}>
        {greeting}
      </p>
    </>
  )
}
