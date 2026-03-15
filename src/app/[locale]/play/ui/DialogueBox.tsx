'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '../game/state'

export function DialogueBox() {
  const { state, dispatch } = useGame()
  const { activeDialogue, dialogueIndex } = state.interaction

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const currentLine = activeDialogue?.[dialogueIndex] ?? null
  const fullText = currentLine?.text ?? ''

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setDisplayedText('')
    setIsTyping(true)
    let charIndex = 0

    const interval = setInterval(() => {
      charIndex++
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, charIndex))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [currentLine, fullText])

  const handleClick = useCallback(() => {
    if (isTyping) {
      // Skip typewriter, show full text
      setDisplayedText(fullText)
      setIsTyping(false)
    } else {
      // Advance to next dialogue line
      dispatch({ type: 'ADVANCE_DIALOGUE' })
    }
  }, [isTyping, fullText, dispatch])

  // Keyboard handler for Space/Enter to advance
  useEffect(() => {
    if (!activeDialogue) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleClick()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeDialogue, handleClick])

  if (!activeDialogue || !currentLine) return null

  const isLastLine = dialogueIndex >= activeDialogue.length - 1

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 p-4"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div
        className="mx-auto max-w-[760px] rounded-lg border-2 p-4"
        style={{
          backgroundColor: 'rgba(16, 16, 32, 0.95)',
          borderColor: '#4a6aaa',
          fontFamily: 'monospace',
        }}
      >
        {/* Speaker name */}
        <div
          className="mb-2 text-sm font-bold"
          style={{ color: '#6ab0ff' }}
        >
          {currentLine.speaker}
        </div>

        {/* Dialogue text */}
        <div
          className="min-h-[48px] text-sm leading-relaxed"
          style={{ color: '#d0d0e0' }}
        >
          {displayedText}
          {isTyping && (
            <span
              className="inline-block animate-pulse ml-0.5"
              style={{ color: '#6ab0ff' }}
            >
              |
            </span>
          )}
        </div>

        {/* Continue indicator */}
        {!isTyping && (
          <div className="mt-2 text-right">
            <span
              className="text-xs animate-pulse"
              style={{ color: '#8888aa' }}
            >
              {isLastLine ? 'Click to close' : 'Click to continue ...'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
