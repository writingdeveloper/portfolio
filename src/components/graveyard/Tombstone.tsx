'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, ExternalLink, Github, Lock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { Tombstone as TombstoneData } from '@/types/content'
import { tombstoneCopy } from '@/lib/graveyard'
import { successorOf } from '@/lib/lineage'

interface TombstoneProps {
  tomb: TombstoneData
}

export function Tombstone({ tomb }: TombstoneProps) {
  const t = useTranslations('graveyard')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const { epitaph, retro, lifespan } = tombstoneCopy(tomb, locale)
  const successor = successorOf(tomb)
  const panelId = `tomb-${tomb.slug}`

  return (
    <div className="rounded-xl rounded-t-[2.5rem] border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--border-hover)] transition-all">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-center px-4 sm:px-6 pt-8 pb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-hover)]"
      >
        <p className="text-xs tracking-[0.3em] text-[var(--text-muted)] mb-3">
          {t('restInPeace')}
        </p>
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-semibold text-lg">{tomb.name}</h3>
          {tomb.private && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]">
              <Lock size={11} /> {t('private')}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">{lifespan}</p>
        {epitaph && (
          <p className="text-sm text-[var(--text-secondary)] italic mt-3">
            &ldquo;{epitaph}&rdquo;
          </p>
        )}
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`mx-auto mt-4 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-[var(--border-subtle)] px-4 sm:px-6 py-5 text-left">
          <div className="mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]">
              {t('causeLabel')}: {t(`cause.${tomb.causeOfDeath}`)}
            </span>
          </div>

          {retro && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line mb-4">
              {retro}
            </p>
          )}

          {successor && (
            <p className="mb-4">
              {successor.url ? (
                <a href={successor.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--text-emphasis)] hover:opacity-80 transition-opacity">
                  {t('continuedAs', { name: successor.name })} <ArrowRight size={14} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-emphasis)]">
                  {t('continuedAs', { name: successor.name })} <ArrowRight size={14} />
                </span>
              )}
            </p>
          )}

          {tomb.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tomb.techStack.map((tech) => (
                <span key={tech} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {(tomb.website || (tomb.github && !tomb.private)) && (
            <div className="flex gap-3">
              {tomb.website && (
                <a href={tomb.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
                  <ExternalLink size={14} /> {t('viewTraces')}
                </a>
              )}
              {tomb.github && !tomb.private && (
                <a href={tomb.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
                  <Github size={14} /> {t('viewCode')}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
