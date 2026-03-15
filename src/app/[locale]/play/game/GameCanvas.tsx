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
const PLAYER_SPEED = 1.5
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
  g.ellipse(0, 14, 10, 4)
  g.fill({ color: 0x000000, alpha: 0.25 })

  // === BODY ===
  // Shirt (navy blue hoodie)
  g.roundRect(-8, -4, 16, 14, 2)
  g.fill(0x34495e)
  // Hoodie pocket
  g.rect(-4, 4, 8, 4)
  g.fill(0x2c3e50)
  // Arms
  if (direction === 'left') {
    g.rect(-10, -2, 4, 10); g.fill(0x34495e)
    g.rect(6, -2, 2, 10); g.fill(0x34495e)
  } else if (direction === 'right') {
    g.rect(-8, -2, 2, 10); g.fill(0x34495e)
    g.rect(6, -2, 4, 10); g.fill(0x34495e)
  } else {
    g.rect(-10, -2, 4, 10); g.fill(0x34495e)
    g.rect(6, -2, 4, 10); g.fill(0x34495e)
  }

  // Pants (dark jeans)
  g.rect(-7, 10, 6, 6); g.fill(0x2c3e50)
  g.rect(1, 10, 6, 6); g.fill(0x2c3e50)
  // Pant seam
  g.rect(-1, 10, 2, 6); g.fill(0x273c4f)

  // Shoes (sneakers)
  g.roundRect(-9, 15, 8, 4, 1); g.fill(0xe74c3c)
  g.roundRect(1, 15, 8, 4, 1); g.fill(0xe74c3c)
  // Shoe soles
  g.rect(-9, 18, 8, 1); g.fill(0xc0392b)
  g.rect(1, 18, 8, 1); g.fill(0xc0392b)
  // Shoe lace dots
  g.rect(-6, 16, 2, 1); g.fill(0xffffff)
  g.rect(4, 16, 2, 1); g.fill(0xffffff)

  // === HEAD ===
  // Neck
  g.rect(-2, -6, 4, 3); g.fill(0xf5cfa0)

  // Head shape
  g.roundRect(-7, -18, 14, 14, 3); g.fill(0xf5cfa0)

  // Hair
  g.roundRect(-8, -20, 16, 8, 3); g.fill(0x2c1810)
  // Side hair
  if (direction !== 'up') {
    g.rect(-8, -16, 2, 6); g.fill(0x2c1810)
    g.rect(6, -16, 2, 6); g.fill(0x2c1810)
  }

  // Face details based on direction
  if (direction === 'down') {
    // Eyes (with pupils)
    g.rect(-4, -12, 3, 3); g.fill(0xffffff)
    g.rect(1, -12, 3, 3); g.fill(0xffffff)
    g.rect(-3, -11, 2, 2); g.fill(0x1a1a1a)
    g.rect(2, -11, 2, 2); g.fill(0x1a1a1a)
    // Eyebrows
    g.rect(-4, -13, 3, 1); g.fill(0x2c1810)
    g.rect(1, -13, 3, 1); g.fill(0x2c1810)
    // Mouth
    g.rect(-2, -7, 4, 1); g.fill(0xd4956a)
  } else if (direction === 'up') {
    // Back of head - just hair
    g.roundRect(-7, -18, 14, 12, 3); g.fill(0x2c1810)
  } else if (direction === 'left') {
    // Side face
    g.rect(-5, -12, 3, 3); g.fill(0xffffff)
    g.rect(-4, -11, 2, 2); g.fill(0x1a1a1a)
    g.rect(-5, -13, 3, 1); g.fill(0x2c1810)
    g.rect(-3, -7, 3, 1); g.fill(0xd4956a)
    // Nose
    g.rect(-7, -10, 1, 2); g.fill(0xe8b88a)
  } else {
    // Side face (right)
    g.rect(2, -12, 3, 3); g.fill(0xffffff)
    g.rect(2, -11, 2, 2); g.fill(0x1a1a1a)
    g.rect(2, -13, 3, 1); g.fill(0x2c1810)
    g.rect(0, -7, 3, 1); g.fill(0xd4956a)
    g.rect(6, -10, 1, 2); g.fill(0xe8b88a)
  }
}

function drawNPC(g: Graphics, x: number, y: number) {
  // Shadow
  g.ellipse(x, y + 16, 10, 4)
  g.fill({ color: 0x000000, alpha: 0.25 })

  // Robe (flowing)
  g.moveTo(x - 10, y + 15)
  g.lineTo(x - 6, y - 2)
  g.lineTo(x + 6, y - 2)
  g.lineTo(x + 10, y + 15)
  g.closePath()
  g.fill(0x6c3483)
  // Robe trim
  g.rect(x - 10, y + 13, 20, 2); g.fill(0xf1c40f)
  // Belt
  g.rect(x - 6, y + 2, 12, 3); g.fill(0xf1c40f)
  // Belt buckle
  g.rect(x - 2, y + 2, 4, 3); g.fill(0xf39c12)

  // Hands (skin)
  g.circle(x - 8, y + 6, 3); g.fill(0xf5cfa0)
  g.circle(x + 8, y + 6, 3); g.fill(0xf5cfa0)

  // Head
  g.roundRect(x - 6, y - 16, 12, 14, 3); g.fill(0xf5cfa0)
  // Beard
  g.roundRect(x - 4, y - 6, 8, 6, 2); g.fill(0xbdc3c7)
  g.moveTo(x, y + 2)
  g.lineTo(x - 3, y - 2)
  g.lineTo(x + 3, y - 2)
  g.closePath()
  g.fill(0xbdc3c7)

  // Eyes
  g.rect(x - 4, y - 12, 2, 2); g.fill(0x1a1a1a)
  g.rect(x + 2, y - 12, 2, 2); g.fill(0x1a1a1a)
  // Eyebrows (bushy)
  g.rect(x - 5, y - 14, 4, 1); g.fill(0xbdc3c7)
  g.rect(x + 1, y - 14, 4, 1); g.fill(0xbdc3c7)

  // Wizard hat
  g.moveTo(x, y - 30)
  g.lineTo(x - 10, y - 16)
  g.lineTo(x + 10, y - 16)
  g.closePath()
  g.fill(0x6c3483)
  // Hat brim
  g.roundRect(x - 12, y - 18, 24, 4, 2); g.fill(0x6c3483)
  // Hat band
  g.rect(x - 8, y - 18, 16, 2); g.fill(0xf1c40f)
  // Hat star
  g.rect(x - 1, y - 26, 3, 3); g.fill(0xf1c40f)

  // Floating exclamation
  const bounce = Math.sin(Date.now() / 300) * 2
  g.roundRect(x - 2, y - 38 + bounce, 5, 8, 1); g.fill(0xf1c40f)
  g.roundRect(x - 1, y - 28 + bounce, 3, 3, 1); g.fill(0xf1c40f)
}

function drawProjectObject(g: Graphics, x: number, y: number) {
  // Desk
  g.roundRect(x - 18, y + 4, 36, 4, 1); g.fill(0xa0724a)
  // Desk surface highlight
  g.rect(x - 17, y + 4, 34, 1); g.fill(0xb8854d)
  // Desk legs
  g.rect(x - 16, y + 8, 3, 10); g.fill(0x8b6238)
  g.rect(x + 13, y + 8, 3, 10); g.fill(0x8b6238)

  // Monitor
  g.roundRect(x - 14, y - 18, 28, 22, 2); g.fill(0x2c3e50)
  // Screen bezel
  g.rect(x - 12, y - 16, 24, 18); g.fill(0x1a1a2e)
  // Screen content (IDE look)
  g.rect(x - 11, y - 15, 22, 16); g.fill(0x1e1e3e)
  // Sidebar
  g.rect(x - 11, y - 15, 5, 16); g.fill(0x252545)
  // Code lines
  g.rect(x - 4, y - 13, 10, 1); g.fill(0x81ecec)
  g.rect(x - 4, y - 11, 14, 1); g.fill(0xdfe6e9)
  g.rect(x - 2, y - 9, 8, 1); g.fill(0x55efc4)
  g.rect(x - 2, y - 7, 12, 1); g.fill(0x74b9ff)
  g.rect(x - 4, y - 5, 6, 1); g.fill(0xffeaa7)
  g.rect(x - 2, y - 3, 10, 1); g.fill(0xdfe6e9)
  // Monitor stand
  g.rect(x - 3, y + 2, 6, 3); g.fill(0x636e72)
  g.roundRect(x - 6, y + 4, 12, 2, 1); g.fill(0x636e72)

  // Keyboard
  g.roundRect(x - 10, y + 6, 20, 4, 1); g.fill(0x636e72)
  // Key rows
  g.rect(x - 9, y + 7, 18, 1); g.fill(0x7f8c8d)

  // Coffee mug
  g.roundRect(x + 14, y + 2, 4, 5, 1); g.fill(0xecf0f1)
  g.rect(x + 17, y + 3, 2, 3); g.fill(0xecf0f1)
  // Steam
  g.rect(x + 15, y - 1, 1, 2); g.fill({ color: 0xffffff, alpha: 0.3 })
}

function drawSkillObject(g: Graphics, x: number, y: number, color: number) {
  // Pedestal base
  g.roundRect(x - 10, y + 10, 20, 4, 1); g.fill(0x636e72)
  g.rect(x - 8, y + 6, 16, 5); g.fill(0x7f8c8d)
  g.rect(x - 6, y + 4, 12, 3); g.fill(0x95a5a6)

  // Glow effect
  g.circle(x, y - 4, 14); g.fill({ color, alpha: 0.08 })
  g.circle(x, y - 4, 10); g.fill({ color, alpha: 0.1 })

  // Crystal body
  g.moveTo(x, y - 16)
  g.lineTo(x + 4, y - 10)
  g.lineTo(x + 8, y - 2)
  g.lineTo(x + 5, y + 4)
  g.lineTo(x - 5, y + 4)
  g.lineTo(x - 8, y - 2)
  g.lineTo(x - 4, y - 10)
  g.closePath()
  g.fill(color)

  // Crystal lighter facet (left)
  g.moveTo(x, y - 16)
  g.lineTo(x - 4, y - 10)
  g.lineTo(x - 2, y - 2)
  g.lineTo(x, y - 4)
  g.closePath()
  g.fill({ color: 0xffffff, alpha: 0.25 })

  // Crystal dark facet (right)
  g.moveTo(x + 4, y - 10)
  g.lineTo(x + 8, y - 2)
  g.lineTo(x + 5, y + 4)
  g.lineTo(x + 2, y - 2)
  g.closePath()
  g.fill({ color: 0x000000, alpha: 0.15 })

  // Sparkle
  g.rect(x - 2, y - 14, 2, 2); g.fill({ color: 0xffffff, alpha: 0.6 })
}

function drawTimelineObject(g: Graphics, x: number, y: number) {
  // Shadow behind frame
  g.roundRect(x - 15, y - 13, 30, 30, 2); g.fill({ color: 0x000000, alpha: 0.2 })

  // Outer ornate frame
  g.roundRect(x - 16, y - 16, 32, 32, 3); g.fill(0xb8860b)
  // Frame inner border
  g.roundRect(x - 14, y - 14, 28, 28, 2); g.fill(0xdaa520)
  // Frame detail corners
  g.rect(x - 16, y - 16, 4, 4); g.fill(0xcd9b1d)
  g.rect(x + 12, y - 16, 4, 4); g.fill(0xcd9b1d)
  g.rect(x - 16, y + 12, 4, 4); g.fill(0xcd9b1d)
  g.rect(x + 12, y + 12, 4, 4); g.fill(0xcd9b1d)

  // Inner mat
  g.rect(x - 12, y - 12, 24, 24); g.fill(0xf5f0e1)

  // Photo/painting content
  g.rect(x - 10, y - 10, 20, 20); g.fill(0xe8e0d0)
  // Sky
  g.rect(x - 10, y - 10, 20, 8); g.fill(0x87ceeb)
  // Mountains
  g.moveTo(x - 10, y - 2)
  g.lineTo(x - 4, y - 8)
  g.lineTo(x + 2, y - 2)
  g.lineTo(x + 8, y - 6)
  g.lineTo(x + 10, y - 2)
  g.lineTo(x + 10, y + 10)
  g.lineTo(x - 10, y + 10)
  g.closePath()
  g.fill(0x2ecc71)
  // Sun
  g.circle(x + 6, y - 6, 3); g.fill(0xf39c12)

  // Hanging wire
  g.rect(x - 1, y - 20, 2, 5); g.fill(0x636e72)
  g.circle(x, y - 20, 2); g.fill(0x7f8c8d)
}

function drawBookObject(g: Graphics, x: number, y: number, index: number) {
  const colors = [0xc0392b, 0x2980b9, 0x27ae60, 0xd35400, 0x8e44ad, 0x16a085]
  const darkColors = [0x922b21, 0x1f6dad, 0x1e8449, 0xa04000, 0x6c3483, 0x117a65]
  const color = colors[index % colors.length]
  const darkColor = darkColors[index % darkColors.length]

  // Bookshelf plank
  g.roundRect(x - 12, y + 14, 24, 4, 1); g.fill(0xa0724a)
  g.rect(x - 11, y + 14, 22, 1); g.fill(0xb8854d)

  // Book standing up
  g.roundRect(x - 7, y - 12, 14, 26, 2); g.fill(color)
  // Spine
  g.rect(x - 7, y - 10, 3, 22); g.fill(darkColor)
  // Pages
  g.rect(x + 5, y - 10, 3, 22); g.fill(0xfdf6e3)
  g.rect(x + 5, y - 10, 1, 22); g.fill(0xf0e8d0)

  // Title lines on cover
  g.rect(x - 3, y - 8, 6, 1); g.fill({ color: 0xffffff, alpha: 0.4 })
  g.rect(x - 2, y - 5, 4, 1); g.fill({ color: 0xffffff, alpha: 0.3 })

  // Decorative band
  g.rect(x - 6, y + 4, 10, 2); g.fill({ color: 0xffffff, alpha: 0.2 })
}

function drawWallTile(g: Graphics, wx: number, wy: number, color: number) {
  const px = wx * TILE_SIZE
  const py = wy * TILE_SIZE

  // Base wall color
  g.rect(px, py, TILE_SIZE, TILE_SIZE)
  g.fill(color)

  // Mortar (lighter lines between bricks)
  const mortar = (color & 0xfefefe) + 0x151515
  // Horizontal mortar lines
  for (let row = 0; row < 4; row++) {
    g.rect(px, py + row * 8, TILE_SIZE, 1)
    g.fill(mortar)
  }
  // Vertical mortar lines (staggered)
  const offset = wy % 2 === 0 ? 0 : 16
  for (let row = 0; row < 4; row++) {
    const vOffset = row % 2 === 0 ? offset : offset + 8
    g.rect(px + vOffset, py + row * 8, 1, 8)
    g.fill(mortar)
    if (vOffset + 16 < TILE_SIZE) {
      g.rect(px + vOffset + 16, py + row * 8, 1, 8)
      g.fill(mortar)
    }
  }

  // Subtle top highlight
  g.rect(px, py, TILE_SIZE, 1)
  g.fill({ color: 0xffffff, alpha: 0.05 })
}

function drawDoor(g: Graphics, x: number, y: number, width: number, height: number) {
  // Stone frame outer
  g.roundRect(x - 2, y - 2, width + 4, height + 2, 3)
  g.fill(0x95a5a6)

  // Stone frame inner
  g.rect(x, y, width, height)
  g.fill(0x7f8c8d)

  // Dark opening
  g.roundRect(x + 4, y + 2, width - 8, height - 2, 3)
  g.fill(0x0a0a1a)

  // Arch top stones
  g.roundRect(x + 2, y - 1, width - 4, 6, 4)
  g.fill(0xa0a5a8)

  // Keystone
  g.roundRect(x + width / 2 - 3, y - 2, 6, 5, 1)
  g.fill(0xb0b5b8)

  // Torch on left side
  g.rect(x + 1, y + height / 2 - 6, 2, 8); g.fill(0x8b6914)
  g.circle(x + 2, y + height / 2 - 7, 3); g.fill(0xf39c12)
  g.circle(x + 2, y + height / 2 - 8, 2); g.fill(0xe74c3c)
  g.circle(x + 2, y + height / 2 - 9, 1); g.fill({ color: 0xf1c40f, alpha: 0.6 })
}

/* ── Decorative furniture helpers (static, non-interactable) ── */

function drawPottedPlant(g: Graphics, x: number, y: number) {
  // Pot
  g.moveTo(x - 6, y); g.lineTo(x - 8, y + 10); g.lineTo(x + 8, y + 10); g.lineTo(x + 6, y); g.closePath()
  g.fill(0xb5651d)
  g.rect(x - 7, y - 1, 14, 3); g.fill(0xc0762e)
  // Soil
  g.ellipse(x, y + 1, 5, 2); g.fill(0x3d1f00)
  // Plant leaves
  g.circle(x, y - 6, 7); g.fill(0x2ecc71)
  g.circle(x - 5, y - 3, 5); g.fill(0x27ae60)
  g.circle(x + 5, y - 3, 5); g.fill(0x27ae60)
  g.circle(x, y - 10, 4); g.fill(0x2ecc71)
  // Highlight
  g.circle(x + 2, y - 8, 2); g.fill({ color: 0xffffff, alpha: 0.15 })
}

function drawWallTorch(g: Graphics, x: number, y: number) {
  // Bracket
  g.rect(x - 1, y, 6, 3); g.fill(0x636e72)
  // Torch handle
  g.rect(x + 1, y - 10, 3, 12); g.fill(0x8b6914)
  // Flame
  g.circle(x + 2, y - 12, 4); g.fill(0xf39c12)
  g.circle(x + 2, y - 14, 3); g.fill(0xe74c3c)
  g.circle(x + 2, y - 16, 2); g.fill(0xf1c40f)
  // Glow
  g.circle(x + 2, y - 12, 10); g.fill({ color: 0xf39c12, alpha: 0.06 })
}

function drawChair(g: Graphics, x: number, y: number) {
  // Seat
  g.roundRect(x - 8, y, 16, 10, 2); g.fill(0x2c3e50)
  // Back
  g.roundRect(x - 8, y - 10, 16, 12, 2); g.fill(0x34495e)
  // Wheels
  g.circle(x - 6, y + 12, 2); g.fill(0x636e72)
  g.circle(x + 6, y + 12, 2); g.fill(0x636e72)
  // Leg
  g.rect(x - 1, y + 10, 2, 3); g.fill(0x636e72)
}

function drawTrashBin(g: Graphics, x: number, y: number) {
  g.moveTo(x - 6, y); g.lineTo(x - 5, y + 12); g.lineTo(x + 5, y + 12); g.lineTo(x + 6, y); g.closePath()
  g.fill(0x636e72)
  g.rect(x - 7, y - 1, 14, 3); g.fill(0x7f8c8d)
}

function drawCandelabra(g: Graphics, x: number, y: number) {
  // Base
  g.roundRect(x - 8, y + 8, 16, 4, 1); g.fill(0xb8860b)
  // Stem
  g.rect(x - 1, y - 4, 3, 14); g.fill(0xdaa520)
  // Arms
  g.rect(x - 10, y - 4, 20, 2); g.fill(0xdaa520)
  // Candles
  for (const cx of [x - 8, x, x + 8]) {
    g.rect(cx - 1, y - 10, 3, 7); g.fill(0xfdf6e3)
    g.circle(cx, y - 12, 3); g.fill(0xf39c12)
    g.circle(cx, y - 13, 2); g.fill(0xe74c3c)
    g.circle(cx, y - 12, 8); g.fill({ color: 0xf39c12, alpha: 0.04 })
  }
}

function drawBookshelf(g: Graphics, x: number, y: number, width: number) {
  // Shelf frame
  g.rect(x, y, width, 3 * TILE_SIZE); g.fill(0x6d4c0e)
  // Shelves
  for (let s = 0; s < 3; s++) {
    const sy = y + 4 + s * TILE_SIZE
    g.rect(x + 3, sy, width - 6, TILE_SIZE - 6); g.fill(0x8b6914)
    // Books on shelf
    const bookColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad, 0x16a085, 0xd35400]
    for (let b = 0; b < 5; b++) {
      const bw = 4 + Math.floor(b * 1.5) % 3
      const bx = x + 6 + b * (bw + 3)
      if (bx + bw > x + width - 6) break
      g.rect(bx, sy + 2, bw, TILE_SIZE - 10); g.fill(bookColors[b % bookColors.length])
    }
  }
}

function drawRopePost(g: Graphics, x: number, y: number) {
  g.rect(x - 2, y - 6, 4, 14); g.fill(0xdaa520)
  g.circle(x, y - 7, 3); g.fill(0xf1c40f)
  g.roundRect(x - 4, y + 8, 8, 3, 1); g.fill(0xb8860b)
}

function drawPedestal(g: Graphics, x: number, y: number) {
  g.roundRect(x - 10, y + 6, 20, 4, 1); g.fill(0x7f8c8d)
  g.rect(x - 8, y - 4, 16, 11); g.fill(0x95a5a6)
  g.roundRect(x - 10, y - 6, 20, 4, 1); g.fill(0xbdc3c7)
}

function drawArmchair(g: Graphics, x: number, y: number) {
  // Seat
  g.roundRect(x - 12, y, 24, 14, 3); g.fill(0x6c3483)
  // Back
  g.roundRect(x - 14, y - 12, 28, 16, 4); g.fill(0x7d3c98)
  // Arms
  g.roundRect(x - 16, y - 4, 6, 16, 2); g.fill(0x7d3c98)
  g.roundRect(x + 10, y - 4, 6, 16, 2); g.fill(0x7d3c98)
  // Cushion
  g.roundRect(x - 8, y + 2, 16, 8, 2); g.fill(0x8e44ad)
  // Legs
  g.rect(x - 12, y + 14, 3, 4); g.fill(0x5b370a)
  g.rect(x + 9, y + 14, 3, 4); g.fill(0x5b370a)
}

function drawFloorLamp(g: Graphics, x: number, y: number) {
  // Base
  g.roundRect(x - 6, y + 16, 12, 3, 1); g.fill(0x636e72)
  // Pole
  g.rect(x - 1, y - 8, 3, 25); g.fill(0x7f8c8d)
  // Shade
  g.moveTo(x - 10, y - 4); g.lineTo(x - 6, y - 14); g.lineTo(x + 6, y - 14); g.lineTo(x + 10, y - 4); g.closePath()
  g.fill(0xf5e6ca)
  // Bulb glow
  g.circle(x, y - 8, 12); g.fill({ color: 0xfff3cd, alpha: 0.06 })
  g.circle(x, y - 10, 3); g.fill({ color: 0xf1c40f, alpha: 0.5 })
}

/* ── Per-room decoration drawing ── */

function drawLobbyDecorations(g: Graphics, T: number, _room: RoomConfig) {
  // Interactable: NPC at tile (10, 5)
  // Center carpet shifted down to avoid NPC (tiles 7-12, 7-12)
  g.roundRect(7 * T, 7 * T, 6 * T, 5 * T, 4)
  g.fill(0x8b1a1a)
  g.roundRect(7 * T + 4, 7 * T + 4, 6 * T - 8, 5 * T - 8, 3)
  g.fill(0xa52a2a)
  g.roundRect(7 * T + 12, 7 * T + 12, 6 * T - 24, 5 * T - 24, 2)
  g.fill(0x8b1a1a)
  const cx = 10 * T, cy = 9.5 * T
  g.moveTo(cx, cy - 20); g.lineTo(cx + 30, cy); g.lineTo(cx, cy + 20); g.lineTo(cx - 30, cy); g.closePath()
  g.fill(0xdaa520)

  // Potted plants in corners away from NPC and doors
  drawPottedPlant(g, 1.5 * T, 1.5 * T)
  drawPottedPlant(g, 18.5 * T, 1.5 * T)
  drawPottedPlant(g, 1.5 * T, 12.5 * T)
  drawPottedPlant(g, 18.5 * T, 12.5 * T)

  // Wall torches (on left wall, away from left door at y=7-8)
  drawWallTorch(g, 1 * T - 4, 3 * T)
  drawWallTorch(g, 1 * T - 4, 11 * T)
  // On right wall, away from right door at y=7-8
  drawWallTorch(g, 19 * T + 4, 3 * T)
  drawWallTorch(g, 19 * T + 4, 11 * T)

  // Notice board on upper wall (away from top door at x=9-10)
  g.roundRect(4 * T, 0.5 * T - 8, 3 * T, T - 4, 2); g.fill(0x8b6914)
  g.rect(4 * T + 4, 0.5 * T - 4, 3 * T - 8, T - 12); g.fill(0xa0724a)
  g.rect(4.2 * T, 0.5 * T - 2, 12, 10); g.fill(0xffeaa7)
  g.rect(5 * T, 0.5 * T, 10, 8); g.fill(0x74b9ff)
  g.rect(5.8 * T, 0.5 * T - 4, 14, 10); g.fill(0xff7675)

  // Welcome mat at bottom door
  g.roundRect(9 * T + 4, 13.5 * T, 2 * T - 8, T * 0.6, 2)
  g.fill(0x6d4c0e)
  g.rect(9 * T + 8, 13.5 * T + 3, 2 * T - 16, T * 0.6 - 6)
  g.fill(0x8b6914)
}

function drawProjectsDecorations(g: Graphics, T: number, _room: RoomConfig) {
  // Interactable: projects at tiles (3,4), (7,4), (11,4), (15,4)

  // Whiteboard on top wall (tiles 8-11, between projects, on wall row)
  g.roundRect(8 * T, T * 0.5, 3.5 * T, 2.5 * T, 3); g.fill(0xecf0f1)
  g.rect(8 * T + 6, T * 0.5 + 6, 3.5 * T - 12, 2.5 * T - 12); g.fill(0xffffff)
  g.rect(8.5 * T, T + 4, T, 2); g.fill(0xe74c3c)
  g.rect(8.5 * T, T + 12, 1.5 * T, 2); g.fill(0x3498db)
  g.rect(9 * T, T + 20, T, 2); g.fill(0x2ecc71)
  g.rect(8.5 * T, T * 0.5 + 2.5 * T - 4, 2.5 * T, 4); g.fill(0xbdc3c7)

  // Chairs below each workstation (tile y=6, offset from project y=4)
  drawChair(g, 3 * T + 16, 7 * T)
  drawChair(g, 7 * T + 16, 7 * T)
  drawChair(g, 11 * T + 16, 7 * T)
  drawChair(g, 15 * T + 16, 7 * T)

  // Potted plants in bottom corners (away from objects and doors)
  drawPottedPlant(g, 1.5 * T, 12.5 * T)
  drawPottedPlant(g, 18.5 * T, 12.5 * T)

  // Trash bin in bottom-right area
  drawTrashBin(g, 17 * T, 12 * T)

  // Cable on floor (left side, below projects)
  g.rect(2 * T, 8 * T, 1, 4 * T); g.fill({ color: 0x222222, alpha: 0.3 })
  g.rect(2 * T, 12 * T, 6 * T, 1); g.fill({ color: 0x222222, alpha: 0.3 })
}

function drawSkillsDecorations(g: Graphics, T: number, _room: RoomConfig) {
  // Interactable: skill crystals at tiles:
  //   frontend (y=3): x = 3, 6, 9, 12, 15
  //   backend  (y=7): x = 3, 6, 9, 12, 15
  //   tools    (y=11): x = 3, 6, 9, 12, 15

  // Subtle floor rune pattern (very faint, behind everything)
  const cx = 10 * T, cy = 7.5 * T
  g.circle(cx, cy, 4 * T); g.fill({ color: 0x9b59b6, alpha: 0.03 })
  g.circle(cx, cy, 3.5 * T); g.stroke({ color: 0x9b59b6, alpha: 0.08, width: 1 })

  // Candelabras in corners (tiles ~1.5, safe from skill positions)
  drawCandelabra(g, 1.5 * T, 1.5 * T)
  drawCandelabra(g, 18.5 * T, 1.5 * T)
  drawCandelabra(g, 1.5 * T, 13 * T)
  drawCandelabra(g, 18.5 * T, 13 * T)

  // Wall torches on left and right walls
  drawWallTorch(g, 1 * T - 4, 5 * T)
  drawWallTorch(g, 1 * T - 4, 9 * T)
  drawWallTorch(g, 19 * T + 4, 5 * T)
  drawWallTorch(g, 19 * T + 4, 9 * T)

  // Glowing orbs in gaps between skill columns (safe x positions: 1.5, 4.5, 7.5, 10.5, 13.5, 18)
  g.circle(1.5 * T, 5 * T, 6); g.fill({ color: 0xe8daef, alpha: 0.3 })
  g.circle(1.5 * T, 5 * T, 3); g.fill({ color: 0xffffff, alpha: 0.5 })
  g.circle(18.5 * T, 9 * T, 6); g.fill({ color: 0xd5f5e3, alpha: 0.3 })
  g.circle(18.5 * T, 9 * T, 3); g.fill({ color: 0xffffff, alpha: 0.5 })
}

function drawHistoryDecorations(g: Graphics, T: number, _room: RoomConfig) {
  // Interactable: timeline frames at tiles (3,3), (7,3), (11,3), (15,3)

  // Red carpet runner (horizontal, lower half, tiles y=8-10)
  g.roundRect(2 * T, 8 * T, 16 * T, 2 * T, 3); g.fill(0x922b21)
  g.roundRect(2 * T + 4, 8 * T + 4, 16 * T - 8, 2 * T - 8, 2); g.fill(0xa93226)
  for (let i = 0; i < 16; i++) {
    g.rect(2 * T + 4 + i * T, 8 * T, 2, 4); g.fill(0xdaa520)
    g.rect(2 * T + 4 + i * T, 9.8 * T, 2, 4); g.fill(0xdaa520)
  }

  // Velvet rope posts below frames (y=5, between frame objects at y=3)
  drawRopePost(g, 5 * T, 5.5 * T)
  drawRopePost(g, 9 * T, 5.5 * T)
  drawRopePost(g, 13 * T, 5.5 * T)
  // Rope between posts
  g.rect(5 * T, 5.5 * T - 2, 4 * T, 2); g.fill(0xdaa520)
  g.rect(9 * T, 5.5 * T - 2, 4 * T, 2); g.fill(0xdaa520)

  // Display pedestals in lower area (away from frames)
  drawPedestal(g, 2 * T, 11 * T)
  drawPedestal(g, 17 * T, 11 * T)

  // Spotlights below each frame
  g.circle(3 * T + 16, 5 * T, T); g.fill({ color: 0xfff3cd, alpha: 0.06 })
  g.circle(7 * T + 16, 5 * T, T); g.fill({ color: 0xfff3cd, alpha: 0.06 })
  g.circle(11 * T + 16, 5 * T, T); g.fill({ color: 0xfff3cd, alpha: 0.06 })
  g.circle(15 * T + 16, 5 * T, T); g.fill({ color: 0xfff3cd, alpha: 0.06 })

  // Wall torches
  drawWallTorch(g, 1 * T - 4, 4 * T)
  drawWallTorch(g, 1 * T - 4, 11 * T)
  drawWallTorch(g, 19 * T + 4, 4 * T)
  drawWallTorch(g, 19 * T + 4, 11 * T)
}

function drawLibraryDecorations(g: Graphics, T: number, _room: RoomConfig) {
  // Interactable: post books in grid
  //   Row 0 (y=3): x = 2, 5, 8, 11, 14, 17
  //   Row 1 (y=7): x = 2, 5, 8, 11, 14, 17

  // Reading desk in lower-center (y=10-11, x=6-9, avoids book rows)
  g.roundRect(6 * T, 10 * T, 4 * T, 2 * T, 2); g.fill(0xa0724a)
  g.rect(6 * T + 6, 10 * T + 6, 4 * T - 12, 2 * T - 12); g.fill(0xb8854d)
  // Open book on desk
  g.rect(7 * T, 10.3 * T, T, 0.7 * T); g.fill(0xfdf6e3)
  g.rect(7 * T + T + 2, 10.3 * T, T, 0.7 * T); g.fill(0xfdf6e3)
  g.rect(7 * T + T, 10.3 * T, 2, 0.7 * T); g.fill(0x8b6914)
  g.rect(7 * T + 4, 10.5 * T, T - 8, 1); g.fill(0xbdc3c7)
  g.rect(7 * T + 4, 10.5 * T + 4, T - 12, 1); g.fill(0xbdc3c7)

  // Armchair in lower-right area (y=10, x=13, between book columns)
  drawArmchair(g, 13 * T, 10.5 * T)

  // Floor lamp next to armchair
  drawFloorLamp(g, 15 * T, 10 * T)

  // Small rug under reading area
  g.roundRect(6 * T, 12 * T, 3 * T, 1.2 * T, 3); g.fill(0x1a5276)
  g.roundRect(6 * T + 4, 12 * T + 4, 3 * T - 8, 1.2 * T - 8, 2); g.fill(0x1f618d)

  // Wall torches
  drawWallTorch(g, 1 * T - 4, 4 * T)
  drawWallTorch(g, 1 * T - 4, 10 * T)
  drawWallTorch(g, 19 * T + 4, 4 * T)
  drawWallTorch(g, 19 * T + 4, 10 * T)

  // Potted plants in bottom corners (away from doors and books)
  drawPottedPlant(g, 1.5 * T, 12.5 * T)
  drawPottedPlant(g, 18.5 * T, 12.5 * T)
}

function drawRoomDecorations(container: Container, roomId: RoomId, room: RoomConfig) {
  const g = new Graphics()
  const T = TILE_SIZE

  switch (roomId) {
    case 'lobby':
      drawLobbyDecorations(g, T, room)
      break
    case 'projects':
      drawProjectsDecorations(g, T, room)
      break
    case 'skills':
      drawSkillsDecorations(g, T, room)
      break
    case 'history':
      drawHistoryDecorations(g, T, room)
      break
    case 'library':
      drawLibraryDecorations(g, T, room)
      break
  }

  container.addChild(g)
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

  // Interactable indicator: subtle glow ring at base
  g.circle(x, y + 8, 14)
  g.fill({ color: 0x4fc3f7, alpha: 0.08 })
  g.circle(x, y + 8, 10)
  g.stroke({ color: 0x4fc3f7, alpha: 0.25, width: 1 })

  // Small diamond marker above object (skip for NPC which has its own exclamation mark)
  if (obj.type !== 'npc') {
    g.moveTo(x, y - 24)
    g.lineTo(x + 4, y - 20)
    g.lineTo(x, y - 16)
    g.lineTo(x - 4, y - 20)
    g.closePath()
    g.fill({ color: 0x4fc3f7, alpha: 0.5 })
  }

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
  roomId: RoomId,
): { player: Graphics; objectGraphics: Graphics; promptText: Text; dustParticles: ReturnType<typeof createDustParticles> } {
  // Draw floor tiles with subtle grain/texture
  const floor = new Graphics()
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      const tileColor = (x + y) % 2 === 0 ? room.floorColor1 : room.floorColor2

      // Main tile
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      floor.fill(tileColor)

      // Top and left edges (lighter = raised effect)
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 1)
      floor.fill({ color: 0xffffff, alpha: 0.06 })
      floor.rect(x * TILE_SIZE, y * TILE_SIZE, 1, TILE_SIZE)
      floor.fill({ color: 0xffffff, alpha: 0.06 })

      // Bottom and right edges (darker = depth effect)
      floor.rect(x * TILE_SIZE, (y + 1) * TILE_SIZE - 1, TILE_SIZE, 1)
      floor.fill({ color: 0x000000, alpha: 0.08 })
      floor.rect((x + 1) * TILE_SIZE - 1, y * TILE_SIZE, 1, TILE_SIZE)
      floor.fill({ color: 0x000000, alpha: 0.08 })
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

  // Draw room decorations (furniture, props)
  drawRoomDecorations(viewport, roomId, room)

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

      const { player, promptText, dustParticles } = buildRoom(viewport, room, newCollisionSet, objects, roomId)
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

    const { player, promptText, dustParticles } = buildRoom(viewport, room, initialCollision, objects, 'lobby')
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
