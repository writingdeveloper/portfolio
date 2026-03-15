export type Direction = 'up' | 'down' | 'left' | 'right'
export type RoomId = 'lobby' | 'projects' | 'skills' | 'history' | 'library'

export interface Position {
  x: number
  y: number
}

export interface InteractableObject {
  id: string
  type: 'project' | 'skill' | 'timeline' | 'post' | 'npc' | 'door'
  position: Position
  size: { width: number; height: number }
  data: Record<string, unknown>
}

export interface RoomData {
  id: RoomId
  objects: InteractableObject[]
  spawnPoint: Position
  doors: {
    direction: Direction
    targetRoom: RoomId
    position: Position
  }[]
}

export interface GameState {
  currentRoom: RoomId
  player: {
    position: Position
    direction: Direction
    isMoving: boolean
  }
  interaction: {
    nearbyObject: InteractableObject | null
    activeDialogue: DialogueLine[] | null
    dialogueIndex: number
    showDetail: boolean
    detailObject: InteractableObject | null
  }
  ui: {
    isLoading: boolean
    isSoundOn: boolean
    isTransitioning: boolean
  }
}

export interface DialogueLine {
  speaker: string
  text: string
  hasMore?: boolean
}

export type GameAction =
  | { type: 'MOVE_PLAYER'; payload: Position }
  | { type: 'SET_DIRECTION'; payload: Direction }
  | { type: 'SET_MOVING'; payload: boolean }
  | { type: 'CHANGE_ROOM'; payload: { room: RoomId; spawnPoint: Position } }
  | { type: 'SET_NEARBY_OBJECT'; payload: InteractableObject | null }
  | { type: 'START_DIALOGUE'; payload: DialogueLine[] }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'CLOSE_DIALOGUE' }
  | { type: 'SHOW_DETAIL'; payload: InteractableObject }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
