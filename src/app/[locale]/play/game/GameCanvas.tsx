'use client'

import { useRef, useEffect, useCallback, useState, createContext, useContext } from 'react'
import { Application, extend, useApplication } from '@pixi/react'
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding } from './tilemap'
import { ROOM_CONFIGS, checkDoorCollision, getDoorPositions } from './rooms'
import { generateRoomObjects, findNearbyObject } from './objects'
import { createDustParticles } from './effects'
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

const SKILL_COLORS: Record<string, number> = {
  frontend: 0x3498db,
  backend: 0x27ae60,
  tools: 0xe67e22,
}

function drawPlayer(g: Graphics, direction: string) {
  g.clear()

  // Shadow
  g.ellipse(0, 12, 8, 3)
  g.fill({ color: 0x000000, alpha: 0.3 })

  // Body/shirt
  g.rect(-7, -2, 14, 12)
  g.fill(0x4a90d9)

  // Pants
  g.rect(-7, 10, 6, 5)
  g.fill(0x2c3e50)
  g.rect(1, 10, 6, 5)
  g.fill(0x2c3e50)

  // Head (skin)
  g.roundRect(-6, -14, 12, 13, 2)
  g.fill(0xfce4b5)

  // Hair
  g.roundRect(-7, -16, 14, 7, 2)
  g.fill(0x3d2314)

  // Eyes based on direction
  if (direction === 'down') {
    g.rect(-3, -8, 2, 2)
    g.fill(0x222222)
    g.rect(1, -8, 2, 2)
    g.fill(0x222222)
  } else if (direction === 'up') {
    // back of head, no eyes
    g.roundRect(-6, -14, 12, 10, 2)
    g.fill(0x3d2314)
  } else if (direction === 'left') {
    g.rect(-4, -8, 2, 2)
    g.fill(0x222222)
  } else {
    g.rect(2, -8, 2, 2)
    g.fill(0x222222)
  }

  // Shoes
  g.rect(-8, 15, 7, 3)
  g.fill(0x8b4513)
  g.rect(1, 15, 7, 3)
  g.fill(0x8b4513)
}

function drawNPC(g: Graphics, x: number, y: number) {
  // Shadow
  g.ellipse(x, y + 12, 8, 3)
  g.fill({ color: 0x000000, alpha: 0.3 })

  // Body - green robe
  g.rect(x - 8, y - 2, 16, 14)
  g.fill(0x27ae60)

  // Head
  g.roundRect(x - 6, y - 14, 12, 13, 2)
  g.fill(0xfce4b5)

  // Hat
  g.roundRect(x - 8, y - 18, 16, 6, 2)
  g.fill(0x8e44ad)
  g.rect(x - 2, y - 22, 4, 4)
  g.fill(0x8e44ad)

  // Eyes
  g.rect(x - 3, y - 8, 2, 2)
  g.fill(0x222222)
  g.rect(x + 1, y - 8, 2, 2)
  g.fill(0x222222)

  // Smile
  g.rect(x - 2, y - 5, 4, 1)
  g.fill(0xc0392b)

  // Exclamation mark above head
  g.rect(x - 1, y - 28, 3, 6)
  g.fill(0xf1c40f)
  g.rect(x - 1, y - 20, 3, 2)
  g.fill(0xf1c40f)
}

function drawProjectObject(g: Graphics, x: number, y: number) {
  // Desk
  g.rect(x - 16, y + 4, 32, 6)
  g.fill(0x8b6914)
  g.rect(x - 14, y + 10, 4, 8)
  g.fill(0x6d4c0e)
  g.rect(x + 10, y + 10, 4, 8)
  g.fill(0x6d4c0e)

  // Monitor body
  g.roundRect(x - 12, y - 14, 24, 18, 2)
  g.fill(0x2c3e50)
  // Screen (glowing)
  g.rect(x - 10, y - 12, 20, 14)
  g.fill(0x0984e3)
  // Screen lines (code)
  g.rect(x - 8, y - 10, 12, 1)
  g.fill(0x74b9ff)
  g.rect(x - 8, y - 7, 16, 1)
  g.fill(0x74b9ff)
  g.rect(x - 8, y - 4, 8, 1)
  g.fill(0x55efc4)
  g.rect(x - 8, y - 1, 14, 1)
  g.fill(0x74b9ff)
  // Monitor stand
  g.rect(x - 2, y + 2, 4, 3)
  g.fill(0x2c3e50)
}

function drawSkillObject(g: Graphics, x: number, y: number, color: number) {
  // Pedestal
  g.rect(x - 6, y + 4, 12, 4)
  g.fill(0x636e72)
  g.rect(x - 8, y + 8, 16, 3)
  g.fill(0x636e72)

  // Crystal glow
  g.circle(x, y - 2, 10)
  g.fill({ color, alpha: 0.15 })

  // Crystal shape
  g.moveTo(x, y - 10)
  g.lineTo(x + 6, y - 2)
  g.lineTo(x + 4, y + 4)
  g.lineTo(x - 4, y + 4)
  g.lineTo(x - 6, y - 2)
  g.closePath()
  g.fill(color)

  // Crystal highlight
  g.moveTo(x - 2, y - 8)
  g.lineTo(x + 2, y - 4)
  g.lineTo(x, y - 2)
  g.lineTo(x - 4, y - 4)
  g.closePath()
  g.fill({ color: 0xffffff, alpha: 0.4 })
}

function drawTimelineObject(g: Graphics, x: number, y: number) {
  // Ornate outer frame
  g.roundRect(x - 14, y - 14, 28, 28, 3)
  g.fill(0xc0812e)
  // Inner frame border
  g.rect(x - 12, y - 12, 24, 24)
  g.fill(0xd4a049)
  // Canvas/picture
  g.rect(x - 10, y - 10, 20, 20)
  g.fill(0xf5e6ca)
  // Simple landscape drawing
  g.rect(x - 10, y + 2, 20, 8)
  g.fill(0x27ae60) // grass
  g.circle(x + 4, y - 4, 4)
  g.fill(0xf39c12) // sun
  // Nail
  g.circle(x, y - 16, 2)
  g.fill(0x7f8c8d)
}

function drawBookObject(g: Graphics, x: number, y: number, index: number) {
  const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c]
  const color = colors[index % colors.length]

  // Bookshelf
  g.rect(x - 10, y + 12, 20, 3)
  g.fill(0x8b6914)

  // Book spine (standing up)
  g.roundRect(x - 5, y - 10, 10, 22, 1)
  g.fill(color)
  // Book spine detail lines
  g.rect(x - 4, y - 6, 8, 1)
  g.fill({ color: 0xffffff, alpha: 0.3 })
  g.rect(x - 3, y + 2, 6, 1)
  g.fill({ color: 0xffffff, alpha: 0.3 })
  // Book pages
  g.rect(x + 4, y - 8, 2, 18)
  g.fill(0xfaf3e0)
}

function drawWallTile(g: Graphics, wx: number, wy: number, color: number) {
  const px = wx * TILE_SIZE
  const py = wy * TILE_SIZE
  g.rect(px, py, TILE_SIZE, TILE_SIZE)
  g.fill(color)
  // Brick lines
  const darker = (color & 0xfefefe) >> 1
  g.rect(px, py + 8, TILE_SIZE, 1)
  g.fill(darker)
  g.rect(px, py + 16, TILE_SIZE, 1)
  g.fill(darker)
  g.rect(px, py + 24, TILE_SIZE, 1)
  g.fill(darker)
  const offset = wy % 2 === 0 ? 0 : 16
  g.rect(px + offset, py, 1, 8)
  g.fill(darker)
  g.rect(px + offset + 16, py + 8, 1, 8)
  g.fill(darker)
  g.rect(px + offset, py + 16, 1, 8)
  g.fill(darker)
  g.rect(px + offset + 16, py + 24, 1, 8)
  g.fill(darker)
}

function drawDoor(
  g: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  // Stone frame
  g.rect(x, y, width, height)
  g.fill(0x7f8c8d)
  // Dark opening
  g.rect(x + 3, y + 3, width - 6, height - 3)
  g.fill(0x1a1a2e)
  // Arch top
  g.roundRect(x + 2, y, width - 4, 8, 3)
  g.fill(0x95a5a6)
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

function drawObject(g: Graphics, obj: InteractableObject, index: number) {
  const x = obj.position.x
  const y = obj.position.y

  if (obj.type === 'npc') {
    drawNPC(g, x, y)
  } else if (obj.type === 'project') {
    drawProjectObject(g, x, y)
  } else if (obj.type === 'skill') {
    const category = (obj.data.category as string) ?? 'frontend'
    const color = SKILL_COLORS[category] ?? 0x81c784
    drawSkillObject(g, x, y, color)
  } else if (obj.type === 'timeline') {
    drawTimelineObject(g, x, y)
  } else if (obj.type === 'post') {
    drawBookObject(g, x, y, index)
  }
}

function buildRoom(
  viewport: Viewport,
  room: RoomConfig,
  collisionSet: Set<number>,
  objects: InteractableObject[],
): { player: Graphics; objectGraphics: Graphics; promptText: Text; dustParticles: ReturnType<typeof createDustParticles> } {
  // Draw floor tiles with subtle borders
  const floor = new Graphics()
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      const tileColor =
        (x + y) % 2 === 0 ? room.floorColor1 : room.floorColor2
      const borderColor = (tileColor & 0xfefefe) >> 1
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      floor.fill(tileColor)
      // Subtle inner border
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 1)
      floor.fill(borderColor)
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, 1, TILE_SIZE)
      floor.fill(borderColor)
    }
  }
  viewport.addChild(floor)

  // Draw wall tiles with brick pattern
  const walls = new Graphics()
  collisionSet.forEach((index) => {
    const wx = index % room.width
    const wy = Math.floor(index / room.width)
    drawWallTile(walls, wx, wy, room.wallColor)
  })
  viewport.addChild(walls)

  // Draw door indicators as archway entrances
  const doors = new Graphics()
  const doorPositions = getDoorPositions(room)
  for (const dp of doorPositions) {
    if (dp.direction === 'up') {
      drawDoor(doors, dp.tiles[0] * TILE_SIZE, 0, dp.tiles.length * TILE_SIZE, TILE_SIZE)
    } else if (dp.direction === 'down') {
      drawDoor(doors, dp.tiles[0] * TILE_SIZE, (room.height - 1) * TILE_SIZE, dp.tiles.length * TILE_SIZE, TILE_SIZE)
    } else if (dp.direction === 'left') {
      drawDoor(doors, 0, dp.tiles[0] * TILE_SIZE, TILE_SIZE, dp.tiles.length * TILE_SIZE)
    } else if (dp.direction === 'right') {
      drawDoor(doors, (room.width - 1) * TILE_SIZE, dp.tiles[0] * TILE_SIZE, TILE_SIZE, dp.tiles.length * TILE_SIZE)
    }
  }
  viewport.addChild(doors)

  // Draw interactable objects
  const objectGraphics = new Graphics()
  for (let i = 0; i < objects.length; i++) {
    drawObject(objectGraphics, objects[i], i)
  }
  viewport.addChild(objectGraphics)

  // Create dust particle effects
  const dustParticles = createDustParticles(viewport, room.width * TILE_SIZE, room.height * TILE_SIZE)

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
  drawPlayer(player, 'down')
  ;(player as unknown as Record<string, string>).__lastDir = 'down'
  viewport.addChild(player)

  return { player, objectGraphics, promptText, dustParticles }
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

  // --- Refs for all mutable state ---
  const viewportRef = useRef<Viewport | null>(null)
  const playerGraphicsRef = useRef<Graphics | null>(null)
  const promptTextRef = useRef<Text | null>(null)
  const collisionSetRef = useRef<Set<number>>(new Set())
  const guardRef = useRef(false)
  const currentRoomRef = useRef<RoomId>('lobby')
  const isTransitioningRef = useRef(false)
  const roomObjectsRef = useRef<InteractableObject[]>([])
  const tickCount = useRef(0)
  const pendingDetailRef = useRef<InteractableObject | null>(null)
  const dustParticlesRef = useRef<ReturnType<typeof createDustParticles> | null>(null)
  const playerPosRef = useRef({ x: 0, y: 0 })

  // Keep reactive values in refs so tick logic can read them without deps
  const stateRef = useRef(state)
  stateRef.current = state
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  const portfolioDataRef = useRef(portfolioData)
  portfolioDataRef.current = portfolioData
  const appRef = useRef(app)
  appRef.current = app

  // rebuildRoom reads everything from refs -- no reactive deps
  const rebuildRoom = useCallback(
    (roomId: RoomId, spawnPos: { x: number; y: number }) => {
      const currentApp = appRef.current
      if (!currentApp?.renderer || !viewportRef.current) return

      // Destroy old dust particles before clearing the viewport
      if (dustParticlesRef.current) {
        dustParticlesRef.current.destroy()
        dustParticlesRef.current = null
      }

      const viewport = viewportRef.current
      viewport.removeChildren()

      const room = ROOM_CONFIGS[roomId]
      const newCollisionSet = buildCollisionSet(room)
      collisionSetRef.current = newCollisionSet
      currentRoomRef.current = roomId

      const objects = generateRoomObjects(roomId, portfolioDataRef.current)
      roomObjectsRef.current = objects

      const { player, promptText, dustParticles } = buildRoom(viewport, room, newCollisionSet, objects)
      playerGraphicsRef.current = player
      promptTextRef.current = promptText
      dustParticlesRef.current = dustParticles

      player.x = spawnPos.x
      player.y = spawnPos.y
      playerPosRef.current = { x: spawnPos.x, y: spawnPos.y }

      viewport.moveCenter(spawnPos.x, spawnPos.y)
    },
    [], // EMPTY DEPS - reads from refs
  )

  const rebuildRoomRef = useRef(rebuildRoom)
  rebuildRoomRef.current = rebuildRoom

  // Tick logic reads ONLY from refs/singletons -- no reactive deps
  const tickLogic = useCallback(() => {
    const currentState = stateRef.current
    if (
      currentState.ui.isLoading ||
      currentState.ui.isTransitioning ||
      isTransitioningRef.current
    )
      return

    tickCount.current++

    // Update dust particles
    if (dustParticlesRef.current) {
      dustParticlesRef.current.update()
    }

    // If detail panel is open, block everything
    if (currentState.interaction.showDetail) {
      consumeInteract()
      return
    }

    // Handle dialogue advancement
    if (currentState.interaction.activeDialogue) {
      return
    }

    // Dialogue just ended -- if we have a pending detail, show it
    if (pendingDetailRef.current) {
      const obj = pendingDetailRef.current
      pendingDetailRef.current = null
      if (obj.type !== 'npc') {
        dispatchRef.current({ type: 'SHOW_DETAIL', payload: obj })
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
        dispatchRef.current({ type: 'START_DIALOGUE', payload: lines })
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
        dispatchRef.current({ type: 'SET_DIRECTION', payload: dx > 0 ? 'right' : 'left' })
      } else {
        dispatchRef.current({ type: 'SET_DIRECTION', payload: dy > 0 ? 'down' : 'up' })
      }

      const pos = playerPosRef.current
      const newX = pos.x + dx
      const newY = pos.y + dy
      let finalX = pos.x
      let finalY = pos.y

      if (!isColliding(newX, pos.y, MAP_WIDTH, collisionSetRef.current, PLAYER_SIZE)) {
        finalX = newX
      }
      if (!isColliding(finalX, newY, MAP_WIDTH, collisionSetRef.current, PLAYER_SIZE)) {
        finalY = newY
      }

      if (finalX !== pos.x || finalY !== pos.y) {
        playerPosRef.current = { x: finalX, y: finalY }
        dispatchRef.current({ type: 'MOVE_PLAYER', payload: { x: finalX, y: finalY } })
      }
    }

    // Check door collision
    const room = ROOM_CONFIGS[currentRoomRef.current]
    const door = checkDoorCollision(playerPosRef.current.x, playerPosRef.current.y, room)

    if (door && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      dispatchRef.current({ type: 'SET_TRANSITIONING', payload: true })

      setTimeout(() => {
        dispatchRef.current({
          type: 'CHANGE_ROOM',
          payload: { room: door.targetRoom, spawnPoint: door.spawnPosition },
        })
        rebuildRoomRef.current(door.targetRoom, door.spawnPosition)

        setTimeout(() => {
          dispatchRef.current({ type: 'SET_TRANSITIONING', payload: false })
          isTransitioningRef.current = false
        }, 100)
      }, 300)
    }

    // Proximity detection for interactable objects
    const nearbyObj = findNearbyObject(playerPosRef.current, roomObjectsRef.current)
    const prevNearby = currentState.interaction.nearbyObject
    if (nearbyObj?.id !== prevNearby?.id) {
      dispatchRef.current({ type: 'SET_NEARBY_OBJECT', payload: nearbyObj })
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

      // Redraw player when direction changes
      const currentDir = stateRef.current.player.direction
      const playerAny = playerGraphicsRef.current as unknown as Record<string, string>
      if (playerAny.__lastDir !== currentDir) {
        playerAny.__lastDir = currentDir
        drawPlayer(playerGraphicsRef.current, currentDir)
      }
    }
    if (viewportRef.current) {
      viewportRef.current.moveCenter(playerPosRef.current.x, playerPosRef.current.y)
    }
  }, []) // EMPTY DEPS - reads everything from refs/singletons

  // Keep tickRef always pointing to latest tickLogic
  const tickRef = useRef(tickLogic)
  tickRef.current = tickLogic

  // Single init effect with minimal deps
  useEffect(() => {
    if (!isInitialised || !app?.renderer || guardRef.current) return
    guardRef.current = true

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
    collisionSetRef.current = initialCollision

    const objects = generateRoomObjects('lobby', portfolioDataRef.current)
    roomObjectsRef.current = objects

    const { player, promptText, dustParticles } = buildRoom(viewport, room, initialCollision, objects)
    playerGraphicsRef.current = player
    promptTextRef.current = promptText
    dustParticlesRef.current = dustParticles

    const spawnX = room.spawnPoint.x
    const spawnY = room.spawnPoint.y
    player.x = spawnX
    player.y = spawnY
    playerPosRef.current = { x: spawnX, y: spawnY }
    dispatchRef.current({ type: 'MOVE_PLAYER', payload: { x: spawnX, y: spawnY } })
    dispatchRef.current({ type: 'SET_LOADING', payload: false })

    viewport.moveCenter(spawnX, spawnY)

    // Register tick callback directly on the ticker
    const onTick = () => tickRef.current()
    app.ticker.add(onTick)

    return () => {
      app.ticker.remove(onTick)
      app.stage.removeChild(viewport)
      viewport.destroy({ children: true })
      guardRef.current = false
    }
  }, [isInitialised]) // MINIMAL DEPS - app accessed via ref inside guard

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
