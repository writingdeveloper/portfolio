import type { RoomId, Direction, Position } from './types'
import { TILE_SIZE } from './tilemap'

export interface DoorConfig {
  direction: Direction
  targetRoom: RoomId
  triggerArea: { x: number; y: number; width: number; height: number }
  spawnPosition: Position
}

export interface RoomConfig {
  id: RoomId
  width: number
  height: number
  spawnPoint: Position
  doors: DoorConfig[]
  wallColor: number
  floorColor1: number
  floorColor2: number
}

export const ROOM_CONFIGS: Record<RoomId, RoomConfig> = {
  lobby: {
    id: 'lobby',
    width: 20,
    height: 15,
    spawnPoint: { x: 10 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
    doors: [
      {
        direction: 'up',
        targetRoom: 'skills',
        triggerArea: {
          x: 9 * TILE_SIZE,
          y: -8,
          width: 2 * TILE_SIZE,
          height: TILE_SIZE,
        },
        spawnPosition: { x: 10 * TILE_SIZE + 16, y: 13 * TILE_SIZE + 16 },
      },
      {
        direction: 'down',
        targetRoom: 'library',
        triggerArea: {
          x: 9 * TILE_SIZE,
          y: 14 * TILE_SIZE + 8,
          width: 2 * TILE_SIZE,
          height: TILE_SIZE,
        },
        spawnPosition: { x: 10 * TILE_SIZE + 16, y: 2 * TILE_SIZE + 16 },
      },
      {
        direction: 'left',
        targetRoom: 'history',
        triggerArea: {
          x: -8,
          y: 7 * TILE_SIZE,
          width: TILE_SIZE,
          height: 2 * TILE_SIZE,
        },
        spawnPosition: { x: 18 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
      },
      {
        direction: 'right',
        targetRoom: 'projects',
        triggerArea: {
          x: 19 * TILE_SIZE + 8,
          y: 7 * TILE_SIZE,
          width: TILE_SIZE,
          height: 2 * TILE_SIZE,
        },
        spawnPosition: { x: 2 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
      },
    ],
    wallColor: 0x4a4a6a,
    floorColor1: 0x2a2a4a,
    floorColor2: 0x252545,
  },
  projects: {
    id: 'projects',
    width: 20,
    height: 15,
    spawnPoint: { x: 2 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
    doors: [
      {
        direction: 'left',
        targetRoom: 'lobby',
        triggerArea: {
          x: -8,
          y: 7 * TILE_SIZE,
          width: TILE_SIZE,
          height: 2 * TILE_SIZE,
        },
        spawnPosition: { x: 18 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
      },
    ],
    wallColor: 0x4a5a6a,
    floorColor1: 0x2a3a4a,
    floorColor2: 0x253545,
  },
  skills: {
    id: 'skills',
    width: 20,
    height: 15,
    spawnPoint: { x: 10 * TILE_SIZE + 16, y: 13 * TILE_SIZE + 16 },
    doors: [
      {
        direction: 'down',
        targetRoom: 'lobby',
        triggerArea: {
          x: 9 * TILE_SIZE,
          y: 14 * TILE_SIZE + 8,
          width: 2 * TILE_SIZE,
          height: TILE_SIZE,
        },
        spawnPosition: { x: 10 * TILE_SIZE + 16, y: 2 * TILE_SIZE + 16 },
      },
    ],
    wallColor: 0x5a4a6a,
    floorColor1: 0x3a2a4a,
    floorColor2: 0x352545,
  },
  history: {
    id: 'history',
    width: 20,
    height: 15,
    spawnPoint: { x: 18 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
    doors: [
      {
        direction: 'right',
        targetRoom: 'lobby',
        triggerArea: {
          x: 19 * TILE_SIZE + 8,
          y: 7 * TILE_SIZE,
          width: TILE_SIZE,
          height: 2 * TILE_SIZE,
        },
        spawnPosition: { x: 2 * TILE_SIZE + 16, y: 7 * TILE_SIZE + 16 },
      },
    ],
    wallColor: 0x6a5a4a,
    floorColor1: 0x4a3a2a,
    floorColor2: 0x453525,
  },
  library: {
    id: 'library',
    width: 20,
    height: 15,
    spawnPoint: { x: 10 * TILE_SIZE + 16, y: 2 * TILE_SIZE + 16 },
    doors: [
      {
        direction: 'up',
        targetRoom: 'lobby',
        triggerArea: {
          x: 9 * TILE_SIZE,
          y: -8,
          width: 2 * TILE_SIZE,
          height: TILE_SIZE,
        },
        spawnPosition: { x: 10 * TILE_SIZE + 16, y: 13 * TILE_SIZE + 16 },
      },
    ],
    wallColor: 0x4a6a5a,
    floorColor1: 0x2a4a3a,
    floorColor2: 0x254535,
  },
}

export function checkDoorCollision(
  playerX: number,
  playerY: number,
  room: RoomConfig,
): DoorConfig | null {
  for (const door of room.doors) {
    const a = door.triggerArea
    if (
      playerX >= a.x &&
      playerX <= a.x + a.width &&
      playerY >= a.y &&
      playerY <= a.y + a.height
    ) {
      return door
    }
  }
  return null
}

export function getDoorPositions(
  room: RoomConfig,
): { direction: Direction; tiles: number[] }[] {
  return room.doors.map((d) => {
    if (d.direction === 'up' || d.direction === 'down') {
      return { direction: d.direction, tiles: [9, 10] }
    }
    return { direction: d.direction, tiles: [7, 8] }
  })
}
