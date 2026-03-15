'use client'

import { useCallback } from 'react'

function simulateKey(key: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { key }))
}

export function MobileControls() {
  const handleTouchStart = useCallback((key: string) => {
    simulateKey(key, 'keydown')
  }, [])

  const handleTouchEnd = useCallback((key: string) => {
    simulateKey(key, 'keyup')
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-3 md:hidden">
      {/* D-Pad */}
      <div className="relative w-28 h-28">
        {[
          { key: 'ArrowUp', label: '\u25B2', pos: 'top-0 left-1/2 -translate-x-1/2' },
          { key: 'ArrowDown', label: '\u25BC', pos: 'bottom-0 left-1/2 -translate-x-1/2' },
          { key: 'ArrowLeft', label: '\u25C0', pos: 'left-0 top-1/2 -translate-y-1/2' },
          { key: 'ArrowRight', label: '\u25B6', pos: 'right-0 top-1/2 -translate-y-1/2' },
        ].map(({ key, label, pos }) => (
          <button
            key={key}
            className={`absolute ${pos} w-9 h-9 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white text-sm active:bg-white/25 select-none`}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart(key) }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(key) }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {label}
          </button>
        ))}
      </div>

      {/* A Button */}
      <button
        className="w-12 h-12 rounded-full bg-[#4fc3f7]/20 border-2 border-[#4fc3f7] text-[#4fc3f7] font-bold text-sm active:bg-[#4fc3f7]/40 select-none"
        onTouchStart={(e) => { e.preventDefault(); simulateKey(' ', 'keydown') }}
        onTouchEnd={(e) => { e.preventDefault(); simulateKey(' ', 'keyup') }}
        onContextMenu={(e) => e.preventDefault()}
      >
        A
      </button>
    </div>
  )
}
