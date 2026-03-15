'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Application, extend, useApplication, useTick } from '@pixi/react'
import { Container, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding } from './tilemap'
import { ROOM_CONFIGS, checkDoorCollision, getDoorPositions } from './rooms'
import type { RoomConfig } from './rooms'
import type { RoomId } from './types'

extend({ Container, Graphics })

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SPEED = 3
const PLAYER_SIZE = 16
const MAP_WIDTH = 20
const MAP_HEIGHT = 15

function buildCollisionSet(room: RoomConfig): Set<number> {
  const doorPositions = getDoorPositions(room)
  const set = new Set<number>()

  for (let x = 0; x < room.width; x++) {
    for (let y = 0; y < room.height; y++) {
      const hasDoor = (dir: string, tile: number) =>
        doorPositions.some(
          (d) => d.direction === dir && d.tiles.includes(tile),
        )

      const isTopWall = y === 0 && !hasDoor('up', x)
      const isBottomWall = y === room.height - 1 && !hasDoor('down', x)
      const isLeftWall = x === 0 && !hasDoor('left', y)
      const isRightWall = x === room.width - 1 && !hasDoor('right', y)

      if (isTopWall || isBottomWall || isLeftWall || isRightWall) {
        set.add(y * room.width + x)
      }
    }
  }

  return set
}

function buildRoom(
  viewport: Viewport,
  room: RoomConfig,
  collisionSet: Set<number>,
): Graphics {
  // Draw floor tiles
  const floor = new Graphics()
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      const color =
        (x + y) % 2 === 0 ? room.floorColor1 : room.floorColor2
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      floor.fill(color)
    }
  }
  viewport.addChild(floor)

  // Draw wall tiles
  const walls = new Graphics()
  collisionSet.forEach((index) => {
    const wx = index % room.width
    const wy = Math.floor(index / room.width)
    walls.rect(wx * TILE_SIZE, wy * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  })
  walls.fill(room.wallColor)
  viewport.addChild(walls)

  // Draw door indicators
  const doors = new Graphics()
  const doorPositions = getDoorPositions(room)
  for (const dp of doorPositions) {
    if (dp.direction === 'up') {
      doors.rect(
        dp.tiles[0] * TILE_SIZE,
        0,
        dp.tiles.length * TILE_SIZE,
        TILE_SIZE,
      )
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'down') {
      doors.rect(
        dp.tiles[0] * TILE_SIZE,
        (room.height - 1) * TILE_SIZE,
        dp.tiles.length * TILE_SIZE,
        TILE_SIZE,
      )
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'left') {
      doors.rect(
        0,
        dp.tiles[0] * TILE_SIZE,
        TILE_SIZE,
        dp.tiles.length * TILE_SIZE,
      )
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'right') {
      doors.rect(
        (room.width - 1) * TILE_SIZE,
        dp.tiles[0] * TILE_SIZE,
        TILE_SIZE,
        dp.tiles.length * TILE_SIZE,
      )
      doors.fill(0x6a8a6a)
    }
  }
  viewport.addChild(doors)

  // Create player character
  const player = new Graphics()
  player.roundRect(-12, -12, 24, 24, 4)
  player.fill(0x4fc3f7)
  player.circle(0, 6, 3)
  player.fill(0xffffff)
  viewport.addChild(player)

  return player
}

function GameWorld() {
  const { app, isInitialised } = useApplication()
  const { state, dispatch } = useGame()
  const { keys, consumeInteract } = useKeyboard()
  const viewportRef = useRef<Viewport | null>(null)
  const playerGraphicsRef = useRef<Graphics | null>(null)
  const collisionSet = useRef<Set<number>>(new Set())
  const initialized = useRef(false)
  const currentRoomRef = useRef<RoomId>('lobby')
  const isTransitioningRef = useRef(false)

  const playerPosRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef(state)
  stateRef.current = state

  const rebuildRoom = useCallback(
    (roomId: RoomId, spawnPos: { x: number; y: number }) => {
      if (!app?.renderer || !viewportRef.current) return

      const viewport = viewportRef.current
      // Remove all children to clear the room
      viewport.removeChildren()

      const room = ROOM_CONFIGS[roomId]
      const newCollisionSet = buildCollisionSet(room)
      collisionSet.current = newCollisionSet
      currentRoomRef.current = roomId

      const player = buildRoom(viewport, room, newCollisionSet)
      playerGraphicsRef.current = player

      player.x = spawnPos.x
      player.y = spawnPos.y
      playerPosRef.current = { x: spawnPos.x, y: spawnPos.y }

      viewport.moveCenter(spawnPos.x, spawnPos.y)
    },
    [app],
  )

  useEffect(() => {
    if (!isInitialised || !app?.renderer || initialized.current) return
    initialized.current = true

    const room = ROOM_CONFIGS['lobby']

    // Create viewport
    const viewport = new Viewport({
      screenWidth: app.renderer.width,
      screenHeight: app.renderer.height,
      worldWidth: room.width * TILE_SIZE,
      worldHeight: room.height * TILE_SIZE,
      events: app.renderer.events,
    })
    viewport.clamp({
      left: 0,
      top: 0,
      right: room.width * TILE_SIZE,
      bottom: room.height * TILE_SIZE,
      underflow: 'center',
    })
    app.stage.addChild(viewport)
    viewportRef.current = viewport

    const initialCollision = buildCollisionSet(room)
    collisionSet.current = initialCollision

    const player = buildRoom(viewport, room, initialCollision)
    playerGraphicsRef.current = player

    const spawnX = room.spawnPoint.x
    const spawnY = room.spawnPoint.y
    player.x = spawnX
    player.y = spawnY
    playerPosRef.current = { x: spawnX, y: spawnY }
    dispatch({ type: 'MOVE_PLAYER', payload: { x: spawnX, y: spawnY } })
    dispatch({ type: 'SET_LOADING', payload: false })

    viewport.moveCenter(spawnX, spawnY)

    return () => {
      app.stage.removeChild(viewport)
      viewport.destroy({ children: true })
      initialized.current = false
    }
  }, [app, isInitialised, dispatch, rebuildRoom])

  const tickCallback = useCallback(() => {
    const currentState = stateRef.current
    if (
      currentState.ui.isLoading ||
      currentState.ui.isTransitioning ||
      isTransitioningRef.current
    )
      return

    // Handle dialogue advancement
    if (currentState.interaction.activeDialogue) {
      if (consumeInteract()) {
        dispatch({ type: 'ADVANCE_DIALOGUE' })
      }
      return
    }

    // Calculate movement from keyboard input
    let dx = 0
    let dy = 0
    if (keys.up) dy -= PLAYER_SPEED
    if (keys.down) dy += PLAYER_SPEED
    if (keys.left) dx -= PLAYER_SPEED
    if (keys.right) dx += PLAYER_SPEED

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const f = 1 / Math.sqrt(2)
      dx *= f
      dy *= f
    }

    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch({
          type: 'SET_DIRECTION',
          payload: dx > 0 ? 'right' : 'left',
        })
      } else {
        dispatch({
          type: 'SET_DIRECTION',
          payload: dy > 0 ? 'down' : 'up',
        })
      }

      const pos = playerPosRef.current
      const newX = pos.x + dx
      const newY = pos.y + dy
      let finalX = pos.x
      let finalY = pos.y

      if (
        !isColliding(
          newX,
          pos.y,
          MAP_WIDTH,
          collisionSet.current,
          PLAYER_SIZE,
        )
      ) {
        finalX = newX
      }
      if (
        !isColliding(
          finalX,
          newY,
          MAP_WIDTH,
          collisionSet.current,
          PLAYER_SIZE,
        )
      ) {
        finalY = newY
      }

      if (finalX !== pos.x || finalY !== pos.y) {
        playerPosRef.current = { x: finalX, y: finalY }
        dispatch({
          type: 'MOVE_PLAYER',
          payload: { x: finalX, y: finalY },
        })
      }
    }

    // Check door collision after movement
    const room = ROOM_CONFIGS[currentRoomRef.current]
    const door = checkDoorCollision(
      playerPosRef.current.x,
      playerPosRef.current.y,
      room,
    )

    if (door && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      dispatch({ type: 'SET_TRANSITIONING', payload: true })

      setTimeout(() => {
        dispatch({
          type: 'CHANGE_ROOM',
          payload: {
            room: door.targetRoom,
            spawnPoint: door.spawnPosition,
          },
        })
        rebuildRoom(door.targetRoom, door.spawnPosition)

        setTimeout(() => {
          dispatch({ type: 'SET_TRANSITIONING', payload: false })
          isTransitioningRef.current = false
        }, 100)
      }, 300)
    }

    // Update visual positions imperatively
    if (playerGraphicsRef.current) {
      playerGraphicsRef.current.x = playerPosRef.current.x
      playerGraphicsRef.current.y = playerPosRef.current.y
    }
    if (viewportRef.current) {
      viewportRef.current.moveCenter(
        playerPosRef.current.x,
        playerPosRef.current.y,
      )
    }
  }, [keys, consumeInteract, dispatch, rebuildRoom])

  useTick(tickCallback)

  return null
}

export interface GameCanvasProps {
  projects?: { name: string; slug: string; descriptionKo: string; descriptionEn: string; techStack: string[]; status: string; website: string; github: string; featured: boolean }[]
  skills?: { name: string; category: 'frontend' | 'backend' | 'tools' }[]
  timeline?: { date: string; titleKo: string; titleEn: string; descriptionKo: string; descriptionEn: string; type: string }[]
  posts?: { slug: string; title: string; excerpt: string; category: string }[]
  locale?: string
}

export function GameCanvas(_props: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  })

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT
        const newWidth = Math.min(rect.width, CANVAS_WIDTH)
        const newHeight = newWidth / aspectRatio
        setCanvasSize({ width: newWidth, height: newHeight })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      <Application
        width={canvasSize.width}
        height={canvasSize.height}
        background={0x1a1a2e}
        antialias={false}
        resolution={1}
      >
        <GameWorld />
      </Application>
    </div>
  )
}
