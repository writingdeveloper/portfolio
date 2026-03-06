'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), timeout)
      return true
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        timerRef.current = setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    }
  }, [timeout])

  return { copied, copy }
}
