'use client'

import { useRef, useEffect, useCallback, useState, createContext, useContext } from 'react'
import { Application, extend, useApplication, useTick } from '@pixi/react'
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding } from './tilemap'
import { ROOM_CONFIGS, checkDoorCollision, getDoorPositions } from './rooms'
import { generateRoomObjects, findNearbyObject } from './objects'
import type { RoomConfig } from './rooms'
import type { RoomId, InteractableObject, DialogueLine } from './types'

extend({ Container, Graphics, Text })

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SPEED = 3
const PLAYER_SIZE = 16
const MAP_WIDTH = 20
const MAP_HEIGHT = 15

export interface GameCanvasProps {
  projects: { name: string; slug: string; descriptionKo: string; descriptionEn: string; techStack: string[]; status: string; website: string; github: string; featured: boolean }[]
  skills: { name: string; category: 'frontend' | 'backend' | 'tools' }[]
  timeline: { date: string; titleKo: string; titleEn: string; descriptionKo: string; descriptionEn: string; type: string }[]
  posts: { slug: string; title: string; excerpt: string; category: string }[]
  locale: string
}

interface PortfolioContextValue {
  projects: GameCanvasProps['projects']
  skills: GameCanvasProps['skills']
  timeline: GameCanvasProps['timeline']
  posts: GameCanvasProps['posts']
  locale: string
}

const PortfolioDataContext = createContext<PortfolioContextValue | null>(null)

function usePortfolioData() {
  const ctx = useContext(PortfolioDataContext)
  if (!ctx) throw new Error('usePortfolioData must be within PortfolioDataContext')
  return ctx
}

const OBJECT_COLORS: Record<string, number> = {
  npc: 0xffb74d,
  project: 0x4fc3f7,
  skill: 0x81c784,
  timeline: 0xce93d8,
  post: 0xa1887f,
}

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

function drawObject(g: Graphics, obj: InteractableObject) {
  const color = OBJECT_COLORS[obj.type] ?? 0xffffff
  const x = obj.position.x
  const y = obj.position.y
  const hw = obj.size.width / 2
  const hh = obj.size.height / 2

  if (obj.type === 'npc') {
    // Draw NPC as a circle with a body
    g.circle(x, y - 4, 8)
    g.fill(color)
    g.roundRect(x - 8, y + 4, 16, 12, 3)
    g.fill(color)
  } else if (obj.type === 'project') {
    // Draw as a monitor/workstation
    g.roundRect(x - hw, y - hh, obj.size.width, obj.size.height - 6, 3)
    g.fill(color)
    g.rect(x - 3, y + hh - 6, 6, 4)
    g.fill(color)
    g.rect(x - 8, y + hh - 2, 16, 2)
    g.fill(color)
  } else if (obj.type === 'skill') {
    // Draw as a gem/diamond
    g.moveTo(x, y - hh)
    g.lineTo(x + hw, y)
    g.lineTo(x, y + hh)
    g.lineTo(x - hw, y)
    g.closePath()
    g.fill(color)
  } else if (obj.type === 'timeline') {
    // Draw as a framed picture
    g.rect(x - hw, y - hh, obj.size.width, obj.size.height)
    g.fill(0x8d6e63)
    g.rect(x - hw + 3, y - hh + 3, obj.size.width - 6, obj.size.height - 6)
    g.fill(color)
  } else if (obj.type === 'post') {
    // Draw as a book
    g.roundRect(x - hw, y - hh, obj.size.width, obj.size.height, 2)
    g.fill(color)
    g.rect(x - hw, y - hh, 4, obj.size.height)
    g.fill(0x6d4c41)
  }
}

function buildRoom(
  viewport: Viewport,
  room: RoomConfig,
  collisionSet: Set<number>,
  objects: InteractableObject[],
): { player: Graphics; objectGraphics: Graphics; promptText: Text } {
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
      doors.rect(dp.tiles[0] * TILE_SIZE, 0, dp.tiles.length * TILE_SIZE, TILE_SIZE)
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'down') {
      doors.rect(dp.tiles[0] * TILE_SIZE, (room.height - 1) * TILE_SIZE, dp.tiles.length * TILE_SIZE, TILE_SIZE)
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'left') {
      doors.rect(0, dp.tiles[0] * TILE_SIZE, TILE_SIZE, dp.tiles.length * TILE_SIZE)
      doors.fill(0x6a8a6a)
    } else if (dp.direction === 'right') {
      doors.rect((room.width - 1) * TILE_SIZE, dp.tiles[0] * TILE_SIZE, TILE_SIZE, dp.tiles.length * TILE_SIZE)
      doors.fill(0x6a8a6a)
    }
  }
  viewport.addChild(doors)

  // Draw interactable objects
  const objectGraphics = new Graphics()
  for (const obj of objects) {
    drawObject(objectGraphics, obj)
  }
  viewport.addChild(objectGraphics)

  // Create bouncing [Space] prompt text (hidden by default)
  const promptStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 10,
    fill: 0xffffff,
    align: 'center',
  })
  const promptText = new Text({ text: '[Space]', style: promptStyle })
  promptText.anchor.set(0.5, 1)
  promptText.visible = false
  viewport.addChild(promptText)

  // Create player character (always on top)
  const player = new Graphics()
  player.roundRect(-12, -12, 24, 24, 4)
  player.fill(0x4fc3f7)
  player.circle(0, 6, 3)
  player.fill(0xffffff)
  viewport.addChild(player)

  return { player, objectGraphics, promptText }
}

function getDialogueForObject(obj: InteractableObject): DialogueLine[] {
  switch (obj.type) {
    case 'npc':
      return [
        {
          speaker: (obj.data.name as string) ?? 'Guide',
          text: (obj.data.greeting as string) ?? 'Hello there!',
        },
        {
          speaker: (obj.data.name as string) ?? 'Guide',
          text: 'Each room has something different. Projects to the right, skills above, timeline to the left, and the library below.',
        },
      ]
    case 'project':
      return [
        {
          speaker: 'Workstation',
          text: `This is "${obj.data.name as string}" - a ${obj.data.status as string} project.`,
        },
      ]
    case 'skill':
      return [
        {
          speaker: 'Skill Crystal',
          text: `${obj.data.name as string} - a ${obj.data.category as string} skill.`,
        },
      ]
    case 'timeline':
      return [
        {
          speaker: 'Memory Frame',
          text: `${obj.data.date as string}: ${obj.data.title as string}`,
        },
      ]
    case 'post':
      return [
        {
          speaker: 'Book',
          text: `"${obj.data.title as string}" - ${(obj.data.excerpt as string)?.slice(0, 80) ?? ''}...`,
        },
      ]
    default:
      return [{ speaker: '???', text: 'Nothing here.' }]
  }
}

function GameWorld() {
  const { app, isInitialised } = useApplication()
  const { state, dispatch } = useGame()
  const portfolioData = usePortfolioData()
  const { keys, consumeInteract } = useKeyboard()
  const viewportRef = useRef<Viewport | null>(null)
  const playerGraphicsRef = useRef<Graphics | null>(null)
  const promptTextRef = useRef<Text | null>(null)
  const collisionSet = useRef<Set<number>>(new Set())
  const initialized = useRef(false)
  const currentRoomRef = useRef<RoomId>('lobby')
  const isTransitioningRef = useRef(false)
  const roomObjectsRef = useRef<InteractableObject[]>([])
  const tickCount = useRef(0)
  const pendingDetailRef = useRef<InteractableObject | null>(null)

  const playerPosRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef(state)
  stateRef.current = state

  const rebuildRoom = useCallback(
    (roomId: RoomId, spawnPos: { x: number; y: number }) => {
      if (!app?.renderer || !viewportRef.current) return

      const viewport = viewportRef.current
      viewport.removeChildren()

      const room = ROOM_CONFIGS[roomId]
      const newCollisionSet = buildCollisionSet(room)
      collisionSet.current = newCollisionSet
      currentRoomRef.current = roomId

      const objects = generateRoomObjects(roomId, portfolioData)
      roomObjectsRef.current = objects

      const { player, promptText } = buildRoom(viewport, room, newCollisionSet, objects)
      playerGraphicsRef.current = player
      promptTextRef.current = promptText

      player.x = spawnPos.x
      player.y = spawnPos.y
      playerPosRef.current = { x: spawnPos.x, y: spawnPos.y }

      viewport.moveCenter(spawnPos.x, spawnPos.y)
    },
    [app, portfolioData],
  )

  useEffect(() => {
    if (!isInitialised || !app?.renderer || initialized.current) return
    initialized.current = true

    const room = ROOM_CONFIGS['lobby']

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

    const objects = generateRoomObjects('lobby', portfolioData)
    roomObjectsRef.current = objects

    const { player, promptText } = buildRoom(viewport, room, initialCollision, objects)
    playerGraphicsRef.current = player
    promptTextRef.current = promptText

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
  }, [app, isInitialised, dispatch, rebuildRoom, portfolioData])

  const tickCallback = useCallback(() => {
    const currentState = stateRef.current
    if (
      currentState.ui.isLoading ||
      currentState.ui.isTransitioning ||
      isTransitioningRef.current
    )
      return

    tickCount.current++

    // If detail panel is open, block everything
    if (currentState.interaction.showDetail) {
      consumeInteract()
      return
    }

    // Handle dialogue advancement
    if (currentState.interaction.activeDialogue) {
      // Dialogue is handled by DialogueBox component via keyboard events
      // Check if dialogue just ended (was active, now null) to show detail
      return
    }

    // Dialogue just ended -- if we have a pending detail, show it
    if (pendingDetailRef.current) {
      const obj = pendingDetailRef.current
      pendingDetailRef.current = null
      if (obj.type !== 'npc') {
        dispatch({ type: 'SHOW_DETAIL', payload: obj })
      }
      return
    }

    // Handle Space interaction with nearby object
    if (consumeInteract()) {
      const nearbyObj = currentState.interaction.nearbyObject
      if (nearbyObj) {
        const lines = getDialogueForObject(nearbyObj)
        // For non-NPC objects, queue showing detail after dialogue
        if (nearbyObj.type !== 'npc') {
          pendingDetailRef.current = nearbyObj
        }
        dispatch({ type: 'START_DIALOGUE', payload: lines })
        return
      }
    }

    // Calculate movement
    let dx = 0
    let dy = 0
    if (keys.up) dy -= PLAYER_SPEED
    if (keys.down) dy += PLAYER_SPEED
    if (keys.left) dx -= PLAYER_SPEED
    if (keys.right) dx += PLAYER_SPEED

    if (dx !== 0 && dy !== 0) {
      const f = 1 / Math.sqrt(2)
      dx *= f
      dy *= f
    }

    if (dx !== 0 || dy !== 0) {
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

    // Check door collision
    const room = ROOM_CONFIGS[currentRoomRef.current]
    const door = checkDoorCollision(playerPosRef.current.x, playerPosRef.current.y, room)

    if (door && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      dispatch({ type: 'SET_TRANSITIONING', payload: true })

      setTimeout(() => {
        dispatch({
          type: 'CHANGE_ROOM',
          payload: { room: door.targetRoom, spawnPoint: door.spawnPosition },
        })
        rebuildRoom(door.targetRoom, door.spawnPosition)

        setTimeout(() => {
          dispatch({ type: 'SET_TRANSITIONING', payload: false })
          isTransitioningRef.current = false
        }, 100)
      }, 300)
    }

    // Proximity detection for interactable objects
    const nearbyObj = findNearbyObject(playerPosRef.current, roomObjectsRef.current)
    const prevNearby = currentState.interaction.nearbyObject
    if (nearbyObj?.id !== prevNearby?.id) {
      dispatch({ type: 'SET_NEARBY_OBJECT', payload: nearbyObj })
    }

    // Update [Space] prompt visibility and position
    if (promptTextRef.current) {
      const dialogueActive = currentState.interaction.activeDialogue !== null
      const detailOpen = currentState.interaction.showDetail
      if (nearbyObj && !dialogueActive && !detailOpen) {
        promptTextRef.current.visible = true
        promptTextRef.current.x = nearbyObj.position.x
        const bounce = Math.sin(tickCount.current * 0.08) * 3
        promptTextRef.current.y = nearbyObj.position.y - nearbyObj.size.height / 2 - 8 + bounce
      } else {
        promptTextRef.current.visible = false
      }
    }

    // Update visual positions imperatively
    if (playerGraphicsRef.current) {
      playerGraphicsRef.current.x = playerPosRef.current.x
      playerGraphicsRef.current.y = playerPosRef.current.y
    }
    if (viewportRef.current) {
      viewportRef.current.moveCenter(playerPosRef.current.x, playerPosRef.current.y)
    }
  }, [keys, consumeInteract, dispatch, rebuildRoom])

  useTick(tickCallback)

  return null
}

export function GameCanvas({ projects, skills, timeline, posts, locale }: GameCanvasProps) {
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

  const portfolioData = { projects, skills, timeline, posts, locale }

  return (
    <PortfolioDataContext.Provider value={portfolioData}>
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
    </PortfolioDataContext.Provider>
  )
}
