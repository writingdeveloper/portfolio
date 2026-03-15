'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface KeyState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interact: boolean
}

export function useKeyboard() {
  const keys = useRef<KeyState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
  })
  const interactPressed = useRef(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.current.up = true
        e.preventDefault()
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.current.down = true
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.current.left = true
        e.preventDefault()
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.current.right = true
        e.preventDefault()
        break
      case ' ':
      case 'Enter':
        if (!interactPressed.current) {
          keys.current.interact = true
          interactPressed.current = true
        }
        e.preventDefault()
        break
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.current.up = false
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.current.down = false
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.current.left = false
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.current.right = false
        break
      case ' ':
      case 'Enter':
        keys.current.interact = false
        interactPressed.current = false
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const consumeInteract = useCallback(() => {
    if (keys.current.interact) {
      keys.current.interact = false
      return true
    }
    return false
  }, [])

  return { keys: keys.current, consumeInteract }
}
