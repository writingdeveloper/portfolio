'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const ta = useTranslations('accessibility')

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const newProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    progressRef.current = newProgress

    // Update DOM directly via ref to avoid re-renders on every scroll event
    if (barRef.current) {
      barRef.current.style.width = `${newProgress}%`
      barRef.current.setAttribute('aria-valuenow', String(Math.round(newProgress)))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-0.5 bg-[var(--accent-text)] z-[60] transition-[width] duration-150"
      style={{ width: '0%' }}
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ta('readingProgress')}
    />
  )
}
