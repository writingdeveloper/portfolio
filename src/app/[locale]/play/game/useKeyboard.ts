'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface KeyState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interact: boolean
}

// Singleton key state shared across all hook instances
// This ensures keyboard events and tick callbacks always reference the same object
const globalKeyState: KeyState = {
  up: false,
  down: false,
  left: false,
  right: false,
  interact: false,
}

let listenersAttached = false
let interactPressed = false

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      globalKeyState.up = true
      e.preventDefault()
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      globalKeyState.down = true
      e.preventDefault()
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      globalKeyState.left = true
      e.preventDefault()
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      globalKeyState.right = true
      e.preventDefault()
      break
    case ' ':
    case 'Enter':
      if (!interactPressed) {
        globalKeyState.interact = true
        interactPressed = true
      }
      e.preventDefault()
      break
  }
}

function handleKeyUp(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      globalKeyState.up = false
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      globalKeyState.down = false
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      globalKeyState.left = false
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      globalKeyState.right = false
      break
    case ' ':
    case 'Enter':
      globalKeyState.interact = false
      interactPressed = false
      break
  }
}

export function useKeyboard() {
  useEffect(() => {
    if (!listenersAttached) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
      listenersAttached = true
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      listenersAttached = false
    }
  }, [])

  const consumeInteract = useCallback(() => {
    if (globalKeyState.interact) {
      globalKeyState.interact = false
      return true
    }
    return false
  }, [])

  return { keys: globalKeyState, consumeInteract }
}
