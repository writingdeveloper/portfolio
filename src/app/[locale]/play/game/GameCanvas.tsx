'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Application, extend, useApplication, useTick } from '@pixi/react'
import { Container, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding } from './tilemap'

extend({ Container, Graphics })

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SPEED = 3
const PLAYER_SIZE = 16
const MAP_WIDTH = 20
const MAP_HEIGHT = 15

function GameWorld() {
  const { app, isInitialised } = useApplication()
  const { state, dispatch } = useGame()
  const { keys, consumeInteract } = useKeyboard()
  const viewportRef = useRef<Viewport | null>(null)
  const playerGraphicsRef = useRef<Graphics | null>(null)
  const collisionSet = useRef<Set<number>>(new Set())
  const initialized = useRef(false)

  // Use refs for values accessed in the tick callback to avoid
  // re-registering the ticker on every state change
  const playerPosRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (!isInitialised || !app?.renderer || initialized.current) return
    initialized.current = true

    // Build collision set: border tiles except door openings
    const set = new Set<number>()
    for (let x = 0; x < MAP_WIDTH; x++) {
      for (let y = 0; y < MAP_HEIGHT; y++) {
        const isTopWall = y === 0 && !(x >= 9 && x <= 10)
        const isBottomWall = y === MAP_HEIGHT - 1 && !(x >= 9 && x <= 10)
        const isLeftWall = x === 0 && !(y >= 7 && y <= 8)
        const isRightWall = x === MAP_WIDTH - 1 && !(y >= 7 && y <= 8)
        if (isTopWall || isBottomWall || isLeftWall || isRightWall) {
          set.add(y * MAP_WIDTH + x)
        }
      }
    }
    collisionSet.current = set

    // Create viewport
    const viewport = new Viewport({
      screenWidth: app.renderer.width,
      screenHeight: app.renderer.height,
      worldWidth: MAP_WIDTH * TILE_SIZE,
      worldHeight: MAP_HEIGHT * TILE_SIZE,
      events: app.renderer.events,
    })
    viewport.clamp({
      left: 0,
      top: 0,
      right: MAP_WIDTH * TILE_SIZE,
      bottom: MAP_HEIGHT * TILE_SIZE,
      underflow: 'center',
    })
    app.stage.addChild(viewport)
    viewportRef.current = viewport

    // Draw floor tiles (checkered pattern)
    const floor = new Graphics()
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const color = (x + y) % 2 === 0 ? 0x2a2a4a : 0x252545
        floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        floor.fill(color)
      }
    }
    viewport.addChild(floor)

    // Draw wall tiles
    const walls = new Graphics()
    collisionSet.current.forEach((index) => {
      const wx = index % MAP_WIDTH
      const wy = Math.floor(index / MAP_WIDTH)
      walls.rect(wx * TILE_SIZE, wy * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    })
    walls.fill(0x4a4a6a)
    viewport.addChild(walls)

    // Draw door indicators
    const doors = new Graphics()
    // Top door
    doors.rect(9 * TILE_SIZE, 0, 2 * TILE_SIZE, TILE_SIZE)
    doors.fill(0x6a8a6a)
    // Bottom door
    doors.rect(9 * TILE_SIZE, (MAP_HEIGHT - 1) * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE)
    doors.fill(0x6a8a6a)
    // Left door
    doors.rect(0, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
    doors.fill(0x6a8a6a)
    // Right door
    doors.rect((MAP_WIDTH - 1) * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
    doors.fill(0x6a8a6a)
    viewport.addChild(doors)

    // Create player character
    const player = new Graphics()
    // Body
    player.roundRect(-12, -12, 24, 24, 4)
    player.fill(0x4fc3f7)
    // Direction indicator (dot facing down by default)
    player.circle(0, 6, 3)
    player.fill(0xffffff)
    viewport.addChild(player)
    playerGraphicsRef.current = player

    // Set initial position (center of tile 10,7)
    const spawnX = 10 * TILE_SIZE + TILE_SIZE / 2
    const spawnY = 7 * TILE_SIZE + TILE_SIZE / 2
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
  }, [app, isInitialised, dispatch])

  const tickCallback = useCallback(() => {
    const currentState = stateRef.current
    if (currentState.ui.isLoading || currentState.ui.isTransitioning) return

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
      // Set facing direction based on dominant axis
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch({ type: 'SET_DIRECTION', payload: dx > 0 ? 'right' : 'left' })
      } else {
        dispatch({ type: 'SET_DIRECTION', payload: dy > 0 ? 'down' : 'up' })
      }

      const pos = playerPosRef.current
      const newX = pos.x + dx
      const newY = pos.y + dy
      let finalX = pos.x
      let finalY = pos.y

      // Wall sliding: try each axis independently
      if (!isColliding(newX, pos.y, MAP_WIDTH, collisionSet.current, PLAYER_SIZE)) {
        finalX = newX
      }
      if (!isColliding(finalX, newY, MAP_WIDTH, collisionSet.current, PLAYER_SIZE)) {
        finalY = newY
      }

      if (finalX !== pos.x || finalY !== pos.y) {
        playerPosRef.current = { x: finalX, y: finalY }
        dispatch({ type: 'MOVE_PLAYER', payload: { x: finalX, y: finalY } })
      }
    }

    // Update visual positions imperatively (no re-render needed)
    if (playerGraphicsRef.current) {
      playerGraphicsRef.current.x = playerPosRef.current.x
      playerGraphicsRef.current.y = playerPosRef.current.y
    }
    if (viewportRef.current) {
      viewportRef.current.moveCenter(playerPosRef.current.x, playerPosRef.current.y)
    }
  }, [keys, consumeInteract, dispatch])

  useTick(tickCallback)

  return null
}

export function GameCanvas() {
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
