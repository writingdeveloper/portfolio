'use client'

import { createContext, useContext } from 'react'
import type { GameState, GameAction } from './types'

export const initialGameState: GameState = {
  currentRoom: 'lobby',
  player: {
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
  },
  interaction: {
    nearbyObject: null,
    activeDialogue: null,
    dialogueIndex: 0,
    showDetail: false,
    detailObject: null,
  },
  ui: {
    isLoading: true,
    isSoundOn: false,
    isTransitioning: false,
  },
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_PLAYER':
      return {
        ...state,
        player: { ...state.player, position: action.payload },
      }
    case 'SET_DIRECTION':
      return {
        ...state,
        player: { ...state.player, direction: action.payload },
      }
    case 'SET_MOVING':
      return {
        ...state,
        player: { ...state.player, isMoving: action.payload },
      }
    case 'CHANGE_ROOM':
      return {
        ...state,
        currentRoom: action.payload.room,
        player: { ...state.player, position: action.payload.spawnPoint },
        interaction: {
          ...state.interaction,
          nearbyObject: null,
          activeDialogue: null,
          dialogueIndex: 0,
        },
      }
    case 'SET_NEARBY_OBJECT':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          nearbyObject: action.payload,
        },
      }
    case 'START_DIALOGUE':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          activeDialogue: action.payload,
          dialogueIndex: 0,
        },
      }
    case 'ADVANCE_DIALOGUE': {
      const dialogue = state.interaction.activeDialogue
      if (!dialogue) return state
      const nextIndex = state.interaction.dialogueIndex + 1
      if (nextIndex >= dialogue.length) {
        return {
          ...state,
          interaction: {
            ...state.interaction,
            activeDialogue: null,
            dialogueIndex: 0,
          },
        }
      }
      return {
        ...state,
        interaction: { ...state.interaction, dialogueIndex: nextIndex },
      }
    }
    case 'CLOSE_DIALOGUE':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          activeDialogue: null,
          dialogueIndex: 0,
        },
      }
    case 'SHOW_DETAIL':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          showDetail: true,
          detailObject: action.payload,
        },
      }
    case 'CLOSE_DETAIL':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          showDetail: false,
          detailObject: null,
        },
      }
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload },
      }
    case 'TOGGLE_SOUND':
      return {
        ...state,
        ui: { ...state.ui, isSoundOn: !state.ui.isSoundOn },
      }
    case 'SET_TRANSITIONING':
      return {
        ...state,
        ui: { ...state.ui, isTransitioning: action.payload },
      }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
