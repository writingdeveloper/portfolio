'use client'

import { useTranslations } from 'next-intl'
import { useGame } from '../game/state'

export function LoadingScreen() {
  const { state } = useGame()
  const t = useTranslations('play')

  if (!state.ui.isLoading) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a] z-20 rounded">
      <div className="text-2xl text-white font-mono mb-8 tracking-widest">
        {t('title')}
      </div>
      <div className="w-48 h-3 border border-[#4fc3f7] rounded-sm overflow-hidden">
        <div
          className="h-full bg-[#4fc3f7]"
          style={{ animation: 'loadbar 1.5s ease-in-out infinite' }}
        />
      </div>
      <p className="text-sm text-[#4fc3f7]/70 mt-4 font-mono">{t('loading')}</p>
      <style>{`
        @keyframes loadbar {
          0% { width: 0% }
          50% { width: 75% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}
