'use client'

import { useGame } from '../game/state'
import type { RoomId } from '../game/types'

const ROOMS: { id: RoomId; x: number; y: number }[] = [
  { id: 'skills', x: 1, y: 0 },
  { id: 'history', x: 0, y: 1 },
  { id: 'lobby', x: 1, y: 1 },
  { id: 'projects', x: 2, y: 1 },
  { id: 'library', x: 1, y: 2 },
]

export function Minimap() {
  const { state } = useGame()
  const cell = 18
  const gap = 2
  const padding = 6

  return (
    <div
      className="absolute top-2 right-2 bg-black/50 rounded-md backdrop-blur-sm"
      style={{ padding }}
    >
      <svg width={3 * (cell + gap) - gap} height={3 * (cell + gap) - gap}>
        {ROOMS.map(({ id, x, y }) => (
          <rect
            key={id}
            x={x * (cell + gap)}
            y={y * (cell + gap)}
            width={cell}
            height={cell}
            rx={2}
            fill={state.currentRoom === id ? '#4fc3f7' : '#333'}
            stroke={state.currentRoom === id ? '#4fc3f7' : '#555'}
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  )
}
