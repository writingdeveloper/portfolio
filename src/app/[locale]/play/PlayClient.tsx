'use client'

import { useReducer } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { X, Volume2, VolumeX } from 'lucide-react'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { GameContext, gameReducer, initialGameState } from './game/state'
import { GameCanvas } from './game/GameCanvas'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({
  projects,
  skills,
  timeline,
  posts,
  locale,
}: PlayClientProps) {
  const t = useTranslations('play')
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="flex flex-col items-center gap-0 -mt-8 -mx-4">
        {/* Top bar */}
        <div className="w-full max-w-[800px] flex items-center justify-between px-4 py-2 bg-[var(--bg-elevated)] rounded-t-lg border border-[var(--border-default)] border-b-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
              className="p-1.5 rounded hover:bg-[var(--bg-elevated-hover)] text-[var(--text-secondary)]"
              title={state.ui.isSoundOn ? t('soundOff') : t('soundOn')}
            >
              {state.ui.isSoundOn ? (
                <Volume2 size={16} />
              ) : (
                <VolumeX size={16} />
              )}
            </button>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-[var(--bg-elevated-hover)] text-[var(--text-secondary)] text-sm"
          >
            <X size={16} />
            {t('exit')}
          </Link>
        </div>

        {/* Game canvas */}
        <div className="w-full max-w-[800px] border-x border-[var(--border-default)]">
          <GameCanvas
            projects={projects}
            skills={skills}
            timeline={timeline}
            posts={posts}
            locale={locale}
          />
        </div>

        {/* Controls hint */}
        <div className="w-full max-w-[800px] px-4 py-2 bg-[var(--bg-elevated)] rounded-b-lg border border-[var(--border-default)] border-t-0">
          <p className="text-xs text-center text-[var(--text-muted)]">
            {t('controls')}
          </p>
        </div>
      </div>
    </GameContext.Provider>
  )
}
