# Explore RPG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 2D top-down RPG-style interactive portfolio exploration page at `/[locale]/play` using PixiJS.

**Architecture:** PixiJS canvas renders the game world (tilemap, character, objects) while React DOM overlays handle UI (dialogue box, detail panels, minimap). Game state is managed via React Context + useReducer. Data is loaded server-side from existing JSON/MDX files and passed to the client game component.

**Tech Stack:** @pixi/react, pixi-viewport, Tiled Map Editor (JSON), free pixel art tilesets, optional @huggingface/transformers for WebGPU AI

---

## Phase 1: Foundation

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install PixiJS and React integration**

```bash
npm install pixi.js @pixi/react pixi-viewport
```

**Step 2: Verify installation**

```bash
node -e "require('pixi.js'); console.log('pixi.js OK')"
node -e "require('@pixi/react'); console.log('@pixi/react OK')"
node -e "require('pixi-viewport'); console.log('pixi-viewport OK')"
```

Expected: All three print OK without errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pixi.js, @pixi/react, pixi-viewport dependencies"
```

---

### Task 2: Add i18n Translation Keys

**Files:**
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Add `play` namespace to `messages/ko.json`**

Add the following namespace alongside existing ones (`nav`, `home`, `blog`, etc.):

```json
"play": {
  "title": "탐험",
  "description": "게임처럼 포트폴리오를 탐험해보세요",
  "loading": "로딩 중...",
  "controls": "방향키로 이동, Space로 상호작용",
  "exit": "나가기",
  "soundOn": "소리 켜기",
  "soundOff": "소리 끄기",
  "explore": "내 세계를 탐험하기",
  "npc": {
    "welcome": "안녕! 여기는 내 작업 창고야. 돌아다니면서 구경해봐!",
    "lobby": "이 곳은 로비야. 동서남북으로 각각 다른 방이 있어.",
    "projects": "여기는 프로젝트 방이야. 작업대에 다가가서 살펴봐!",
    "skills": "이 곳은 스킬 방이야. 선반에 있는 도구들을 확인해봐.",
    "history": "이건 히스토리 방이야. 벽에 걸린 액자들을 살펴봐.",
    "library": "서재에 오신 걸 환영해! 책을 클릭하면 블로그 글을 읽을 수 있어."
  },
  "interact": "Space를 눌러 상호작용",
  "viewMore": "자세히 보기",
  "readOnBlog": "블로그에서 읽기",
  "roomLabels": {
    "lobby": "로비",
    "projects": "프로젝트",
    "skills": "스킬",
    "history": "히스토리",
    "library": "서재"
  }
}
```

**Step 2: Add `play` namespace to `messages/en.json`**

```json
"play": {
  "title": "Explore",
  "description": "Explore my portfolio like a game",
  "loading": "Loading...",
  "controls": "Arrow keys to move, Space to interact",
  "exit": "Exit",
  "soundOn": "Sound on",
  "soundOff": "Sound off",
  "explore": "Explore my world",
  "npc": {
    "welcome": "Hey! This is my workshop. Feel free to look around!",
    "lobby": "This is the lobby. There are different rooms in each direction.",
    "projects": "This is the project room. Check out the workstations!",
    "skills": "This is the skill room. Take a look at the tools on the shelves.",
    "history": "This is the history room. Check out the frames on the wall.",
    "library": "Welcome to the library! Click on books to read blog posts."
  },
  "interact": "Press Space to interact",
  "viewMore": "View more",
  "readOnBlog": "Read on blog",
  "roomLabels": {
    "lobby": "Lobby",
    "projects": "Projects",
    "skills": "Skills",
    "history": "History",
    "library": "Library"
  }
}
```

**Step 3: Add `play` to nav namespace in both message files**

In `messages/ko.json` nav section, add:
```json
"play": "탐험"
```

In `messages/en.json` nav section, add:
```json
"play": "Explore"
```

**Step 4: Commit**

```bash
git add messages/ko.json messages/en.json
git commit -m "content: add i18n translations for play/explore page"
```

---

### Task 3: Add Navigation Link to Header

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Add play link to navLinks array**

In `Header.tsx`, find the `navLinks` array and add the play entry:

```typescript
const navLinks = [
  { href: '/', key: 'home' },
  { href: '/blog', key: 'blog' },
  { href: '/projects', key: 'projects' },
  { href: '/about', key: 'about' },
  { href: '/play', key: 'play' },
] as const
```

**Step 2: Verify the header renders correctly**

```bash
npm run dev
```

Visit `http://localhost:3000` and confirm "탐험" appears in the navigation. Visit `http://localhost:3000/en` and confirm "Explore" appears.

**Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add play/explore link to navigation"
```

---

### Task 4: Add CTA Button to Home Page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Add "Explore my world" CTA to the hero section**

In the `HomeContent` component, find the hero section (the first section with greeting/name/role). Add a CTA button after the description text:

```tsx
import { Gamepad2 } from 'lucide-react'

// Inside hero section, after the description paragraph:
<Link
  href="/play"
  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--accent-text)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
>
  <Gamepad2 size={20} />
  {t('explore')}
</Link>
```

**Step 2: Add `explore` key to home namespace in message files**

In `messages/ko.json` `home` section:
```json
"explore": "내 세계를 탐험하기"
```

In `messages/en.json` `home` section:
```json
"explore": "Explore my world"
```

**Step 3: Verify CTA renders and links correctly**

```bash
npm run dev
```

Visit home page, confirm button appears and links to `/play`.

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add explore CTA button to home hero section"
```

---

### Task 5: Create Base Play Page

**Files:**
- Create: `src/app/[locale]/play/page.tsx`

**Step 1: Create the page with standard Next.js pattern**

```tsx
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/mdx'
import projectsData from '../../../../content/projects.json'
import aboutData from '../../../../content/about.json'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { PlayClient } from './PlayClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'play' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/play`

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: `${SITE_URL}/play`,
        en: `${SITE_URL}/en/play`,
      },
    },
  }
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const projects = projectsData.projects as Project[]
  const skills = aboutData.skills as Skill[]
  const timeline = aboutData.timeline as TimelineItem[]
  const posts = getAllPosts(locale).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
  }))

  return (
    <PlayClient
      projects={projects}
      skills={skills}
      timeline={timeline}
      posts={posts}
      locale={locale}
    />
  )
}
```

**Step 2: Create the PlayClient stub component**

Create `src/app/[locale]/play/PlayClient.tsx`:

```tsx
'use client'

import { useTranslations } from 'next-intl'
import type { Project, Skill, TimelineItem } from '@/types/content'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  const t = useTranslations('play')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-[var(--text-secondary)]">{t('loading')}</p>
      <p className="text-sm text-[var(--text-muted)]">
        {t('controls')}
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        Projects: {projects.length} | Skills: {skills.length} |
        Timeline: {timeline.length} | Posts: {posts.length}
      </p>
    </div>
  )
}
```

**Step 3: Verify page loads**

```bash
npm run dev
```

Visit `http://localhost:3000/play` — should show the stub with data counts.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/
git commit -m "feat: create base play page with data loading"
```

---

## Phase 2: Core Game Engine

### Task 6: Game State Management

**Files:**
- Create: `src/app/[locale]/play/game/state.ts`
- Create: `src/app/[locale]/play/game/types.ts`

**Step 1: Define game types**

Create `src/app/[locale]/play/game/types.ts`:

```typescript
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
```

**Step 2: Create game state reducer and context**

Create `src/app/[locale]/play/game/state.ts`:

```typescript
'use client'

import { createContext, useContext } from 'react'
import type { GameState, GameAction, RoomId } from './types'

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
        player: {
          ...state.player,
          position: action.payload.spawnPoint,
        },
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
        interaction: { ...state.interaction, nearbyObject: action.payload },
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
```

**Step 3: Commit**

```bash
git add src/app/[locale]/play/game/
git commit -m "feat: add game state types, reducer, and context"
```

---

### Task 7: PixiJS Canvas Setup

**Files:**
- Create: `src/app/[locale]/play/game/GameCanvas.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create the GameCanvas component**

Create `src/app/[locale]/play/game/GameCanvas.tsx`:

```tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Application, extend } from '@pixi/react'
import { Container, Sprite, Graphics, Text, Texture } from 'pixi.js'
import { useGame } from './state'

// Extend PixiJS components for React rendering
extend({ Container, Sprite, Graphics, Text })

const TILE_SIZE = 32
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

interface GameCanvasProps {
  width?: number
  height?: number
}

export function GameCanvas({ width = CANVAS_WIDTH, height = CANVAS_HEIGHT }: GameCanvasProps) {
  const { state, dispatch } = useGame()
  const containerRef = useRef<HTMLDivElement>(null)

  // Responsive canvas sizing
  const [canvasSize, setCanvasSize] = useState({ width, height })

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const aspectRatio = width / height
        const newWidth = Math.min(rect.width, width)
        const newHeight = newWidth / aspectRatio
        setCanvasSize({ width: newWidth, height: newHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height])

  return (
    <div ref={containerRef} className="w-full max-w-[800px]">
      <Application
        width={canvasSize.width}
        height={canvasSize.height}
        background={0x1a1a2e}
        antialias={false}
        resolution={1}
      >
        <pixiContainer>
          {/* Tilemap layer will go here */}
          {/* Character layer will go here */}
          {/* Effects layer will go here */}
        </pixiContainer>
      </Application>
    </div>
  )
}
```

Note: Add `import { useState } from 'react'` to the imports.

**Step 2: Integrate GameCanvas into PlayClient**

Update `src/app/[locale]/play/PlayClient.tsx`:

```tsx
'use client'

import { useReducer } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { X, Volume2, VolumeX } from 'lucide-react'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { GameContext, gameReducer, initialGameState } from './game/state'
import { GameCanvas } from './game/GameCanvas'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface PlayClientProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  const t = useTranslations('play')
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="flex flex-col items-center gap-0 -mt-8 -mx-4">
        {/* Top bar */}
        <div className="w-full max-w-[800px] flex items-center justify-between px-4 py-2 bg-[var(--bg-elevated)] rounded-t-lg border border-[var(--border-default)] border-b-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
              className="p-1.5 rounded hover:bg-[var(--bg-elevated-hover)] text-[var(--text-secondary)]"
              title={state.ui.isSoundOn ? t('soundOff') : t('soundOn')}
            >
              {state.ui.isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-[var(--bg-elevated-hover)] text-[var(--text-secondary)] text-sm"
          >
            <X size={16} />
            {t('exit')}
          </Link>
        </div>

        {/* Game canvas */}
        <div className="w-full max-w-[800px] border-x border-[var(--border-default)]">
          <GameCanvas />
        </div>

        {/* Controls hint */}
        <div className="w-full max-w-[800px] px-4 py-2 bg-[var(--bg-elevated)] rounded-b-lg border border-[var(--border-default)] border-t-0">
          <p className="text-xs text-center text-[var(--text-muted)]">
            {t('controls')}
          </p>
        </div>
      </div>
    </GameContext.Provider>
  )
}
```

**Step 3: Verify canvas renders**

```bash
npm run dev
```

Visit `/play` — should show a dark canvas with top bar and controls hint.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/
git commit -m "feat: add PixiJS canvas with game state provider"
```

---

### Task 8: Keyboard Input System

**Files:**
- Create: `src/app/[locale]/play/game/useKeyboard.ts`

**Step 1: Create keyboard hook**

```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface KeyState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interact: boolean
}

export function useKeyboard() {
  const keys = useRef<KeyState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
  })
  const interactPressed = useRef(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.current.up = true
        e.preventDefault()
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.current.down = true
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.current.left = true
        e.preventDefault()
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.current.right = true
        e.preventDefault()
        break
      case ' ':
      case 'Enter':
        if (!interactPressed.current) {
          keys.current.interact = true
          interactPressed.current = true
        }
        e.preventDefault()
        break
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.current.up = false
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.current.down = false
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.current.left = false
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.current.right = false
        break
      case ' ':
      case 'Enter':
        keys.current.interact = false
        interactPressed.current = false
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const consumeInteract = useCallback(() => {
    if (keys.current.interact) {
      keys.current.interact = false
      return true
    }
    return false
  }, [])

  return { keys: keys.current, consumeInteract }
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/play/game/useKeyboard.ts
git commit -m "feat: add keyboard input hook for game controls"
```

---

### Task 9: Tilemap Renderer

**Files:**
- Create: `src/app/[locale]/play/game/tilemap.ts`
- Create: `src/app/[locale]/play/game/TilemapRenderer.tsx`
- Create: `public/game/maps/` (directory for JSON map files)
- Create: `public/game/tilesets/` (directory for tileset images)

**Step 1: Define tilemap types and loader**

Create `src/app/[locale]/play/game/tilemap.ts`:

```typescript
export const TILE_SIZE = 32

export interface TiledLayer {
  name: string
  type: 'tilelayer' | 'objectgroup'
  data?: number[]
  width: number
  height: number
  visible: boolean
  objects?: TiledObject[]
}

export interface TiledObject {
  id: number
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  properties?: { name: string; value: unknown }[]
}

export interface TiledMap {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  layers: TiledLayer[]
  tilesets: {
    firstgid: number
    source?: string
    name: string
    tilewidth: number
    tileheight: number
    imagewidth: number
    imageheight: number
    columns: number
    tilecount: number
    image: string
  }[]
}

export function getCollisionLayer(map: TiledMap): Set<number> {
  const collisionTiles = new Set<number>()
  const layer = map.layers.find((l) => l.name === 'collision')
  if (layer?.data) {
    layer.data.forEach((tile, index) => {
      if (tile !== 0) collisionTiles.add(index)
    })
  }
  return collisionTiles
}

export function getTileIndex(x: number, y: number, mapWidth: number): number {
  return Math.floor(y / TILE_SIZE) * mapWidth + Math.floor(x / TILE_SIZE)
}

export function isColliding(
  x: number,
  y: number,
  mapWidth: number,
  collisionSet: Set<number>,
  playerSize: number = 16
): boolean {
  // Check all four corners of the player hitbox
  const halfSize = playerSize / 2
  const corners = [
    { x: x - halfSize, y: y - halfSize },
    { x: x + halfSize, y: y - halfSize },
    { x: x - halfSize, y: y + halfSize },
    { x: x + halfSize, y: y + halfSize },
  ]

  return corners.some((corner) => {
    const index = getTileIndex(corner.x, corner.y, mapWidth)
    return collisionSet.has(index)
  })
}
```

**Step 2: Create placeholder map JSON**

Create `public/game/maps/lobby.json` — a simple 20x15 tile map:

```json
{
  "width": 20,
  "height": 15,
  "tilewidth": 32,
  "tileheight": 32,
  "layers": [
    {
      "name": "floor",
      "type": "tilelayer",
      "width": 20,
      "height": 15,
      "visible": true,
      "data": []
    },
    {
      "name": "walls",
      "type": "tilelayer",
      "width": 20,
      "height": 15,
      "visible": true,
      "data": []
    },
    {
      "name": "collision",
      "type": "tilelayer",
      "width": 20,
      "height": 15,
      "visible": false,
      "data": []
    },
    {
      "name": "objects",
      "type": "objectgroup",
      "width": 20,
      "height": 15,
      "visible": true,
      "objects": []
    }
  ],
  "tilesets": []
}
```

Note: The `data` arrays will be filled with actual tile IDs when the Tiled maps are designed. For initial development, we'll use programmatic placeholder rendering (colored rectangles).

**Step 3: Create TilemapRenderer component**

Create `src/app/[locale]/play/game/TilemapRenderer.tsx`:

```tsx
'use client'

import { useCallback } from 'react'
import type { TiledMap } from './tilemap'
import { TILE_SIZE } from './tilemap'

interface TilemapRendererProps {
  map: TiledMap
}

export function TilemapRenderer({ map }: TilemapRendererProps) {
  const drawFloor = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()
      // Draw floor tiles
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const color = (x + y) % 2 === 0 ? 0x2a2a4a : 0x252545
          g.setFillStyle({ color })
          g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          g.fill()
        }
      }
    },
    [map.width, map.height]
  )

  const drawWalls = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()
      const wallColor = 0x4a4a6a
      g.setFillStyle({ color: wallColor })

      // Top wall
      for (let x = 0; x < map.width; x++) {
        g.rect(x * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE)
      }
      // Bottom wall
      for (let x = 0; x < map.width; x++) {
        g.rect(x * TILE_SIZE, (map.height - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
      // Left wall
      for (let y = 0; y < map.height; y++) {
        g.rect(0, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
      // Right wall
      for (let y = 0; y < map.height; y++) {
        g.rect((map.width - 1) * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
      g.fill()

      // Door indicators (gaps in walls)
      const doorColor = 0x6a8a6a
      g.setFillStyle({ color: doorColor })
      // Top door (to skills room)
      g.rect(9 * TILE_SIZE, 0, 2 * TILE_SIZE, TILE_SIZE)
      // Bottom door (to library)
      g.rect(9 * TILE_SIZE, (map.height - 1) * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE)
      // Left door (to history)
      g.rect(0, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
      // Right door (to projects)
      g.rect((map.width - 1) * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
      g.fill()
    },
    [map.width, map.height]
  )

  return (
    <pixiContainer>
      <pixiGraphics draw={drawFloor} />
      <pixiGraphics draw={drawWalls} />
    </pixiContainer>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/[locale]/play/game/tilemap.ts src/app/[locale]/play/game/TilemapRenderer.tsx public/game/
git commit -m "feat: add tilemap types, collision detection, and placeholder renderer"
```

---

### Task 10: Character Component with Movement

**Files:**
- Create: `src/app/[locale]/play/game/Character.tsx`

**Step 1: Create the Character component**

```tsx
'use client'

import { useRef, useCallback } from 'react'
import { useTick } from '@pixi/react'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding } from './tilemap'
import type { TiledMap } from './tilemap'

const PLAYER_SPEED = 3
const PLAYER_SIZE = 24

interface CharacterProps {
  map: TiledMap
  collisionSet: Set<number>
}

export function Character({ map, collisionSet }: CharacterProps) {
  const { state, dispatch } = useGame()
  const { keys } = useKeyboard()
  const spriteRef = useRef<import('pixi.js').Graphics>(null)

  useTick(() => {
    // Don't move during dialogue or transitions
    if (state.interaction.activeDialogue || state.ui.isTransitioning) return

    let dx = 0
    let dy = 0

    if (keys.up) dy -= PLAYER_SPEED
    if (keys.down) dy += PLAYER_SPEED
    if (keys.left) dx -= PLAYER_SPEED
    if (keys.right) dx += PLAYER_SPEED

    // Diagonal normalization
    if (dx !== 0 && dy !== 0) {
      const factor = 1 / Math.sqrt(2)
      dx *= factor
      dy *= factor
    }

    if (dx === 0 && dy === 0) {
      if (state.player.isMoving) {
        dispatch({ type: 'SET_MOVING', payload: false })
      }
      return
    }

    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch({ type: 'SET_DIRECTION', payload: dx > 0 ? 'right' : 'left' })
    } else {
      dispatch({ type: 'SET_DIRECTION', payload: dy > 0 ? 'down' : 'up' })
    }

    const newX = state.player.position.x + dx
    const newY = state.player.position.y + dy

    // Collision check — try each axis independently for wall sliding
    let finalX = state.player.position.x
    let finalY = state.player.position.y

    if (!isColliding(newX, state.player.position.y, map.width, collisionSet, PLAYER_SIZE)) {
      finalX = newX
    }
    if (!isColliding(state.player.position.x, newY, map.width, collisionSet, PLAYER_SIZE)) {
      finalY = newY
    }
    // Try both if individual axes pass
    if (finalX === newX && finalY === newY) {
      if (isColliding(newX, newY, map.width, collisionSet, PLAYER_SIZE)) {
        // Keep individual axis results
      }
    }

    if (finalX !== state.player.position.x || finalY !== state.player.position.y) {
      dispatch({ type: 'MOVE_PLAYER', payload: { x: finalX, y: finalY } })
      if (!state.player.isMoving) {
        dispatch({ type: 'SET_MOVING', payload: true })
      }
    }
  })

  const drawCharacter = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      // Body
      g.setFillStyle({ color: 0x4fc3f7 })
      g.roundRect(-12, -12, 24, 24, 4)
      g.fill()

      // Direction indicator
      g.setFillStyle({ color: 0xffffff })
      const dir = state.player.direction
      switch (dir) {
        case 'up':
          g.circle(0, -6, 3)
          break
        case 'down':
          g.circle(0, 6, 3)
          break
        case 'left':
          g.circle(-6, 0, 3)
          break
        case 'right':
          g.circle(6, 0, 3)
          break
      }
      g.fill()
    },
    [state.player.direction]
  )

  return (
    <pixiGraphics
      ref={spriteRef}
      draw={drawCharacter}
      x={state.player.position.x}
      y={state.player.position.y}
    />
  )
}
```

Note: This uses a placeholder rectangle for the character. Will be replaced with sprite sheets when pixel art assets are ready.

**Step 2: Commit**

```bash
git add src/app/[locale]/play/game/Character.tsx
git commit -m "feat: add character component with movement and collision"
```

---

### Task 11: Camera System with pixi-viewport

**Files:**
- Create: `src/app/[locale]/play/game/Camera.tsx`
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Create Camera wrapper component**

Create `src/app/[locale]/play/game/Camera.tsx`:

```tsx
'use client'

import { useRef, useEffect } from 'react'
import { useApplication } from '@pixi/react'
import { Viewport } from 'pixi-viewport'
import { useGame } from './state'
import { TILE_SIZE } from './tilemap'

interface CameraProps {
  worldWidth: number
  worldHeight: number
  children: React.ReactNode
}

export function Camera({ worldWidth, worldHeight, children }: CameraProps) {
  const { app } = useApplication()
  const { state } = useGame()
  const viewportRef = useRef<Viewport | null>(null)
  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (!app?.renderer) return

    const viewport = new Viewport({
      screenWidth: app.renderer.width,
      screenHeight: app.renderer.height,
      worldWidth: worldWidth * TILE_SIZE,
      worldHeight: worldHeight * TILE_SIZE,
      events: app.renderer.events,
    })

    viewport.clamp({
      left: 0,
      top: 0,
      right: worldWidth * TILE_SIZE,
      bottom: worldHeight * TILE_SIZE,
    })

    app.stage.addChild(viewport)
    viewportRef.current = viewport

    return () => {
      app.stage.removeChild(viewport)
      viewport.destroy()
    }
  }, [app, worldWidth, worldHeight])

  // Update camera to follow player
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    targetRef.current = state.player.position
    viewport.moveCenter(state.player.position.x, state.player.position.y)
  }, [state.player.position])

  // Note: children rendering handled differently since viewport is imperative.
  // We'll add children to viewport in the GameCanvas integration.
  return null
}
```

Note: Because `pixi-viewport` is imperative and doesn't integrate directly with `@pixi/react`'s declarative model, we'll need a hybrid approach. The Camera component manages the viewport lifecycle while game content is added to the viewport imperatively. This will be refined in the GameCanvas integration step.

**Step 2: Update GameCanvas to integrate all components**

Update `src/app/[locale]/play/game/GameCanvas.tsx` to wire everything together:

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Application, useApplication, useTick } from '@pixi/react'
import { Container, Sprite, Graphics, Text } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { extend } from '@pixi/react'
import { useGame } from './state'
import { useKeyboard } from './useKeyboard'
import { TILE_SIZE, isColliding, getCollisionLayer } from './tilemap'
import type { TiledMap } from './tilemap'

extend({ Container, Sprite, Graphics, Text })

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SPEED = 3
const PLAYER_SIZE = 16

// Placeholder map dimensions
const MAP_WIDTH = 20
const MAP_HEIGHT = 15

function GameWorld() {
  const { app } = useApplication()
  const { state, dispatch } = useGame()
  const { keys, consumeInteract } = useKeyboard()
  const viewportRef = useRef<Viewport | null>(null)
  const worldRef = useRef<import('pixi.js').Container | null>(null)
  const playerGraphicsRef = useRef<import('pixi.js').Graphics | null>(null)

  // Create collision set for walls
  const collisionSet = useRef<Set<number>>(new Set())

  // Initialize viewport and world
  useEffect(() => {
    if (!app?.renderer) return

    // Build collision set (walls)
    const set = new Set<number>()
    for (let x = 0; x < MAP_WIDTH; x++) {
      for (let y = 0; y < MAP_HEIGHT; y++) {
        // Top wall (except door at 9-10)
        if (y === 0 && !(x >= 9 && x <= 10)) set.add(y * MAP_WIDTH + x)
        // Bottom wall (except door at 9-10)
        if (y === MAP_HEIGHT - 1 && !(x >= 9 && x <= 10)) set.add(y * MAP_WIDTH + x)
        // Left wall (except door at 7-8)
        if (x === 0 && !(y >= 7 && y <= 8)) set.add(y * MAP_WIDTH + x)
        // Right wall (except door at 7-8)
        if (x === MAP_WIDTH - 1 && !(y >= 7 && y <= 8)) set.add(y * MAP_WIDTH + x)
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

    // Create world container
    const world = new Container()
    viewport.addChild(world)
    worldRef.current = world

    // Draw floor
    const floor = new Graphics()
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const color = (x + y) % 2 === 0 ? 0x2a2a4a : 0x252545
        floor.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        floor.fill(color)
      }
    }
    world.addChild(floor)

    // Draw walls
    const walls = new Graphics()
    collisionSet.current.forEach((index) => {
      const x = index % MAP_WIDTH
      const y = Math.floor(index / MAP_WIDTH)
      walls.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    })
    walls.fill(0x4a4a6a)

    // Door indicators
    const doors = new Graphics()
    // Top door
    doors.rect(9 * TILE_SIZE, 0, 2 * TILE_SIZE, TILE_SIZE)
    // Bottom door
    doors.rect(9 * TILE_SIZE, (MAP_HEIGHT - 1) * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE)
    // Left door
    doors.rect(0, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
    // Right door
    doors.rect((MAP_WIDTH - 1) * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, 2 * TILE_SIZE)
    doors.fill(0x6a8a6a)

    world.addChild(walls)
    world.addChild(doors)

    // Create player graphics
    const player = new Graphics()
    player.roundRect(-12, -12, 24, 24, 4)
    player.fill(0x4fc3f7)
    player.circle(0, 6, 3)
    player.fill(0xffffff)
    world.addChild(player)
    playerGraphicsRef.current = player

    // Set initial player position
    const spawnX = 10 * TILE_SIZE
    const spawnY = 7 * TILE_SIZE
    dispatch({ type: 'MOVE_PLAYER', payload: { x: spawnX, y: spawnY } })
    dispatch({ type: 'SET_LOADING', payload: false })

    return () => {
      app.stage.removeChild(viewport)
      viewport.destroy({ children: true })
    }
  }, [app, dispatch])

  // Game loop
  useTick(() => {
    if (state.ui.isLoading || state.ui.isTransitioning) return
    if (state.interaction.activeDialogue) {
      if (consumeInteract()) {
        dispatch({ type: 'ADVANCE_DIALOGUE' })
      }
      return
    }

    let dx = 0
    let dy = 0

    if (keys.up) dy -= PLAYER_SPEED
    if (keys.down) dy += PLAYER_SPEED
    if (keys.left) dx -= PLAYER_SPEED
    if (keys.right) dx += PLAYER_SPEED

    if (dx !== 0 && dy !== 0) {
      const factor = 1 / Math.sqrt(2)
      dx *= factor
      dy *= factor
    }

    if (dx !== 0 || dy !== 0) {
      // Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch({ type: 'SET_DIRECTION', payload: dx > 0 ? 'right' : 'left' })
      } else {
        dispatch({ type: 'SET_DIRECTION', payload: dy > 0 ? 'down' : 'up' })
      }

      const newX = state.player.position.x + dx
      const newY = state.player.position.y + dy

      let finalX = state.player.position.x
      let finalY = state.player.position.y

      if (!isColliding(newX, state.player.position.y, MAP_WIDTH, collisionSet.current, PLAYER_SIZE)) {
        finalX = newX
      }
      if (!isColliding(state.player.position.x, newY, MAP_WIDTH, collisionSet.current, PLAYER_SIZE)) {
        finalY = newY
      }

      if (finalX !== state.player.position.x || finalY !== state.player.position.y) {
        dispatch({ type: 'MOVE_PLAYER', payload: { x: finalX, y: finalY } })
      }
    }

    // Update player graphics position
    if (playerGraphicsRef.current) {
      playerGraphicsRef.current.x = state.player.position.x
      playerGraphicsRef.current.y = state.player.position.y
    }

    // Update camera
    if (viewportRef.current) {
      viewportRef.current.moveCenter(state.player.position.x, state.player.position.y)
    }
  })

  return null
}

interface GameCanvasProps {
  width?: number
  height?: number
}

export function GameCanvas({ width = CANVAS_WIDTH, height = CANVAS_HEIGHT }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width, height })

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const aspectRatio = width / height
        const newWidth = Math.min(rect.width, width)
        const newHeight = newWidth / aspectRatio
        setCanvasSize({ width: newWidth, height: newHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height])

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
```

**Step 3: Verify character moves on screen**

```bash
npm run dev
```

Visit `/play`, use arrow keys to move the blue square around. It should collide with walls and not pass through them. Doors (green areas) should be passable.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/game/
git commit -m "feat: integrate camera, movement, and collision in game canvas"
```

---

## Phase 3: Interaction & UI

### Task 12: Room Transition System

**Files:**
- Create: `src/app/[locale]/play/game/rooms.ts`
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Define room configurations**

Create `src/app/[locale]/play/game/rooms.ts`:

```typescript
import type { RoomId, Direction, Position } from './types'
import { TILE_SIZE } from './tilemap'

interface DoorConfig {
  direction: Direction
  targetRoom: RoomId
  triggerArea: { x: number; y: number; width: number; height: number }
  spawnPosition: Position
}

interface RoomConfig {
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
    spawnPoint: { x: 10 * TILE_SIZE, y: 7 * TILE_SIZE },
    doors: [
      {
        direction: 'up',
        targetRoom: 'skills',
        triggerArea: { x: 9 * TILE_SIZE, y: -4, width: 2 * TILE_SIZE, height: TILE_SIZE },
        spawnPosition: { x: 10 * TILE_SIZE, y: 13 * TILE_SIZE },
      },
      {
        direction: 'down',
        targetRoom: 'library',
        triggerArea: { x: 9 * TILE_SIZE, y: 14 * TILE_SIZE + 4, width: 2 * TILE_SIZE, height: TILE_SIZE },
        spawnPosition: { x: 10 * TILE_SIZE, y: 2 * TILE_SIZE },
      },
      {
        direction: 'left',
        targetRoom: 'history',
        triggerArea: { x: -4, y: 7 * TILE_SIZE, width: TILE_SIZE, height: 2 * TILE_SIZE },
        spawnPosition: { x: 18 * TILE_SIZE, y: 7 * TILE_SIZE },
      },
      {
        direction: 'right',
        targetRoom: 'projects',
        triggerArea: { x: 19 * TILE_SIZE + 4, y: 7 * TILE_SIZE, width: TILE_SIZE, height: 2 * TILE_SIZE },
        spawnPosition: { x: 2 * TILE_SIZE, y: 7 * TILE_SIZE },
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
    spawnPoint: { x: 2 * TILE_SIZE, y: 7 * TILE_SIZE },
    doors: [
      {
        direction: 'left',
        targetRoom: 'lobby',
        triggerArea: { x: -4, y: 7 * TILE_SIZE, width: TILE_SIZE, height: 2 * TILE_SIZE },
        spawnPosition: { x: 18 * TILE_SIZE, y: 7 * TILE_SIZE },
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
    spawnPoint: { x: 10 * TILE_SIZE, y: 13 * TILE_SIZE },
    doors: [
      {
        direction: 'down',
        targetRoom: 'lobby',
        triggerArea: { x: 9 * TILE_SIZE, y: 14 * TILE_SIZE + 4, width: 2 * TILE_SIZE, height: TILE_SIZE },
        spawnPosition: { x: 10 * TILE_SIZE, y: 2 * TILE_SIZE },
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
    spawnPoint: { x: 18 * TILE_SIZE, y: 7 * TILE_SIZE },
    doors: [
      {
        direction: 'right',
        targetRoom: 'lobby',
        triggerArea: { x: 19 * TILE_SIZE + 4, y: 7 * TILE_SIZE, width: TILE_SIZE, height: 2 * TILE_SIZE },
        spawnPosition: { x: 2 * TILE_SIZE, y: 7 * TILE_SIZE },
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
    spawnPoint: { x: 10 * TILE_SIZE, y: 2 * TILE_SIZE },
    doors: [
      {
        direction: 'up',
        targetRoom: 'lobby',
        triggerArea: { x: 9 * TILE_SIZE, y: -4, width: 2 * TILE_SIZE, height: TILE_SIZE },
        spawnPosition: { x: 10 * TILE_SIZE, y: 13 * TILE_SIZE },
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
  room: RoomConfig
): DoorConfig | null {
  for (const door of room.doors) {
    const area = door.triggerArea
    if (
      playerX >= area.x &&
      playerX <= area.x + area.width &&
      playerY >= area.y &&
      playerY <= area.y + area.height
    ) {
      return door
    }
  }
  return null
}
```

**Step 2: Integrate room transitions into GameCanvas**

In the game loop inside `GameCanvas.tsx`, after movement code, add door collision checking:

```typescript
// After position update, check door collisions
const currentRoomConfig = ROOM_CONFIGS[state.currentRoom]
const door = checkDoorCollision(finalX, finalY, currentRoomConfig)
if (door) {
  dispatch({ type: 'SET_TRANSITIONING', payload: true })
  setTimeout(() => {
    dispatch({
      type: 'CHANGE_ROOM',
      payload: { room: door.targetRoom, spawnPoint: door.spawnPosition },
    })
    dispatch({ type: 'SET_TRANSITIONING', payload: false })
  }, 300) // fade transition duration
}
```

The world rendering (floor, walls, doors) also needs to be re-drawn when the room changes, using `ROOM_CONFIGS[state.currentRoom]` for colors and door placement.

**Step 3: Commit**

```bash
git add src/app/[locale]/play/game/rooms.ts src/app/[locale]/play/game/GameCanvas.tsx
git commit -m "feat: add room transition system with door triggers"
```

---

### Task 13: Interactable Objects System

**Files:**
- Create: `src/app/[locale]/play/game/objects.ts`

**Step 1: Create object placement logic**

Create `src/app/[locale]/play/game/objects.ts`:

```typescript
import type { InteractableObject, RoomId, Position } from './types'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { TILE_SIZE } from './tilemap'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

export function generateRoomObjects(
  roomId: RoomId,
  data: {
    projects: Project[]
    skills: Skill[]
    timeline: TimelineItem[]
    posts: PostSummary[]
    locale: string
  }
): InteractableObject[] {
  switch (roomId) {
    case 'lobby':
      return generateLobbyObjects()
    case 'projects':
      return generateProjectObjects(data.projects, data.locale)
    case 'skills':
      return generateSkillObjects(data.skills)
    case 'history':
      return generateHistoryObjects(data.timeline, data.locale)
    case 'library':
      return generateLibraryObjects(data.posts)
    default:
      return []
  }
}

function generateLobbyObjects(): InteractableObject[] {
  return [
    {
      id: 'npc-guide',
      type: 'npc',
      position: { x: 10 * TILE_SIZE, y: 5 * TILE_SIZE },
      size: { width: TILE_SIZE, height: TILE_SIZE },
      data: { dialogueKey: 'welcome' },
    },
  ]
}

function generateProjectObjects(projects: Project[], locale: string): InteractableObject[] {
  return projects.map((project, i) => ({
    id: `project-${project.slug}`,
    type: 'project' as const,
    position: {
      x: (3 + i * 4) * TILE_SIZE,
      y: 4 * TILE_SIZE,
    },
    size: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE },
    data: {
      name: project.name,
      description: locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      techStack: project.techStack,
      website: project.website,
      github: project.github,
      status: project.status,
    },
  }))
}

function generateSkillObjects(skills: Skill[]): InteractableObject[] {
  const categories = ['frontend', 'backend', 'tools'] as const
  const objects: InteractableObject[] = []

  categories.forEach((category, catIndex) => {
    const categorySkills = skills.filter((s) => s.category === category)
    categorySkills.forEach((skill, i) => {
      objects.push({
        id: `skill-${skill.name}`,
        type: 'skill',
        position: {
          x: (2 + i * 2) * TILE_SIZE,
          y: (3 + catIndex * 4) * TILE_SIZE,
        },
        size: { width: TILE_SIZE, height: TILE_SIZE },
        data: { name: skill.name, category: skill.category },
      })
    })
  })

  return objects
}

function generateHistoryObjects(timeline: TimelineItem[], locale: string): InteractableObject[] {
  return timeline.map((item, i) => ({
    id: `timeline-${i}`,
    type: 'timeline' as const,
    position: {
      x: (3 + i * 4) * TILE_SIZE,
      y: 3 * TILE_SIZE,
    },
    size: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE },
    data: {
      date: item.date,
      title: locale === 'ko' ? item.titleKo : item.titleEn,
      description: locale === 'ko' ? item.descriptionKo : item.descriptionEn,
      type: item.type,
    },
  }))
}

function generateLibraryObjects(posts: PostSummary[]): InteractableObject[] {
  return posts.map((post, i) => ({
    id: `post-${post.slug}`,
    type: 'post' as const,
    position: {
      x: (2 + (i % 6) * 3) * TILE_SIZE,
      y: (3 + Math.floor(i / 6) * 4) * TILE_SIZE,
    },
    size: { width: TILE_SIZE, height: 2 * TILE_SIZE },
    data: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
    },
  }))
}

export function findNearbyObject(
  playerPos: Position,
  objects: InteractableObject[],
  interactRadius: number = TILE_SIZE * 1.5
): InteractableObject | null {
  let closest: InteractableObject | null = null
  let closestDist = Infinity

  for (const obj of objects) {
    const centerX = obj.position.x + obj.size.width / 2
    const centerY = obj.position.y + obj.size.height / 2
    const dist = Math.hypot(playerPos.x - centerX, playerPos.y - centerY)

    if (dist < interactRadius && dist < closestDist) {
      closest = obj
      closestDist = dist
    }
  }

  return closest
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/play/game/objects.ts
git commit -m "feat: add interactable objects generation and proximity detection"
```

---

### Task 14: Dialogue Box UI

**Files:**
- Create: `src/app/[locale]/play/ui/DialogueBox.tsx`

**Step 1: Create the dialogue box component**

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '../game/state'

export function DialogueBox() {
  const { state, dispatch } = useGame()
  const { activeDialogue, dialogueIndex } = state.interaction

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const currentLine = activeDialogue?.[dialogueIndex]

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) {
      setDisplayedText('')
      return
    }

    setIsTyping(true)
    setDisplayedText('')
    let charIndex = 0
    const fullText = currentLine.text

    const interval = setInterval(() => {
      charIndex++
      setDisplayedText(fullText.slice(0, charIndex))
      if (charIndex >= fullText.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [currentLine])

  const handleClick = useCallback(() => {
    if (isTyping) {
      // Skip to full text
      setIsTyping(false)
      if (currentLine) {
        setDisplayedText(currentLine.text)
      }
    } else {
      dispatch({ type: 'ADVANCE_DIALOGUE' })
    }
  }, [isTyping, currentLine, dispatch])

  if (!activeDialogue || !currentLine) return null

  const isLast = dialogueIndex >= activeDialogue.length - 1

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4 cursor-pointer"
      onClick={handleClick}
    >
      <div className="max-w-[800px] mx-auto bg-[#1a1a2e]/95 border-2 border-[#4fc3f7] rounded-lg p-4 backdrop-blur-sm">
        <p className="text-xs text-[#4fc3f7] mb-1 font-bold tracking-wider uppercase">
          {currentLine.speaker}
        </p>
        <p className="text-white text-sm leading-relaxed min-h-[2.5rem] font-mono">
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
        <div className="flex justify-end mt-2">
          <span className="text-xs text-[#4fc3f7]/60">
            {isTyping ? 'Click to skip' : isLast ? 'Click to close' : 'Click to continue ▶'}
          </span>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/play/ui/DialogueBox.tsx
git commit -m "feat: add RPG dialogue box with typewriter effect"
```

---

### Task 15: Detail Panel UI

**Files:**
- Create: `src/app/[locale]/play/ui/DetailPanel.tsx`

**Step 1: Create the detail panel component**

```tsx
'use client'

import { X, ExternalLink, Github } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useGame } from '../game/state'

export function DetailPanel() {
  const { state, dispatch } = useGame()
  const t = useTranslations('play')
  const locale = useLocale()

  if (!state.interaction.showDetail || !state.interaction.detailObject) return null

  const obj = state.interaction.detailObject
  const data = obj.data as Record<string, unknown>

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <div className="bg-[#1a1a2e] border-2 border-[#4fc3f7] rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {(data.name || data.title) as string}
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_DETAIL' })}
            className="p-1 rounded hover:bg-white/10 text-[#4fc3f7]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content based on object type */}
        {obj.type === 'project' && (
          <>
            <p className="text-sm text-gray-300 mb-3">{data.description as string}</p>
            {data.techStack && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(data.techStack as string[]).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs bg-[#4fc3f7]/20 text-[#4fc3f7] rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {data.website && (
                <a
                  href={data.website as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#4fc3f7] hover:underline"
                >
                  <ExternalLink size={14} /> Website
                </a>
              )}
              {data.github && (
                <a
                  href={data.github as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#4fc3f7] hover:underline"
                >
                  <Github size={14} /> GitHub
                </a>
              )}
            </div>
          </>
        )}

        {obj.type === 'post' && (
          <>
            <p className="text-sm text-gray-300 mb-3">{data.excerpt as string}</p>
            <Link
              href={`/blog/${data.slug as string}`}
              className="inline-flex items-center gap-1 text-sm text-[#4fc3f7] hover:underline"
            >
              <ExternalLink size={14} /> {t('readOnBlog')}
            </Link>
          </>
        )}

        {obj.type === 'timeline' && (
          <>
            <p className="text-xs text-[#4fc3f7] mb-2">{data.date as string}</p>
            <p className="text-sm text-gray-300">{data.description as string}</p>
          </>
        )}

        {obj.type === 'skill' && (
          <p className="text-sm text-gray-300">
            Category: {data.category as string}
          </p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/play/ui/DetailPanel.tsx
git commit -m "feat: add detail panel for project/post/timeline/skill info"
```

---

### Task 16: Wire Everything Together

**Files:**
- Modify: `src/app/[locale]/play/PlayClient.tsx`
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Add UI overlays to PlayClient**

Update `PlayClient.tsx` to include DialogueBox and DetailPanel:

```tsx
import { DialogueBox } from './ui/DialogueBox'
import { DetailPanel } from './ui/DetailPanel'

// Inside the JSX, after the game canvas div:
<div className="relative w-full max-w-[800px] border-x border-[var(--border-default)]">
  <GameCanvas
    projects={projects}
    skills={skills}
    timeline={timeline}
    posts={posts}
    locale={locale}
  />
  <DialogueBox />
  <DetailPanel />
</div>
```

**Step 2: Pass data props through GameCanvas to object generation**

Update `GameCanvas` props to accept portfolio data, and use `generateRoomObjects()` from `objects.ts` to place interactable objects in each room. Use `findNearbyObject()` in the game loop to detect proximity and dispatch `SET_NEARBY_OBJECT`. When `consumeInteract()` returns true and a nearby object exists, dispatch `START_DIALOGUE` or `SHOW_DETAIL` depending on object type.

**Step 3: Add interact prompt indicator**

In GameCanvas, when `state.interaction.nearbyObject` is not null, render a bouncing `[Space]` indicator above the object using PixiJS Text.

**Step 4: Verify full interaction flow**

```bash
npm run dev
```

1. Visit `/play`
2. Move to NPC → see Space prompt
3. Press Space → dialogue appears with typewriter
4. Move to project → press Space → detail panel opens
5. Move between rooms via doors

**Step 5: Commit**

```bash
git add src/app/[locale]/play/
git commit -m "feat: wire up interaction system with dialogue and detail panels"
```

---

## Phase 4: Visual Polish

### Task 17: Object Rendering with Pixel Art Style

**Files:**
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Add colored object rendering**

In the world drawing code, after floor/walls, draw objects based on their type:

- **NPC**: Green circle with "!" indicator
- **Project workstations**: Brown rectangle with blue monitor screen
- **Skill items**: Small colored squares on shelf rectangles
- **Timeline frames**: Gold-bordered rectangles on wall
- **Books**: Thin colored rectangles stacked vertically

Use PixiJS Graphics with distinct colors per type. Each object should have:
- Base shape with type-specific color
- Glow effect when `nearbyObject` matches (alpha oscillation)
- Bounce animation for interact prompt

**Step 2: Add room-specific decorations**

Draw room labels above doors and category labels on walls using PixiJS Text with pixel-style font settings.

**Step 3: Commit**

```bash
git add src/app/[locale]/play/game/GameCanvas.tsx
git commit -m "feat: add styled object rendering per room type"
```

---

### Task 18: Visual Effects

**Files:**
- Create: `src/app/[locale]/play/game/effects.ts`

**Step 1: Add dust particle system**

Create a particle emitter using PixiJS Graphics that spawns small semi-transparent circles drifting slowly across the room:

```typescript
export function createDustParticles(container: Container, width: number, height: number) {
  const particles: { graphic: Graphics; vx: number; vy: number }[] = []

  for (let i = 0; i < 20; i++) {
    const g = new Graphics()
    g.circle(0, 0, Math.random() * 2 + 1)
    g.fill({ color: 0xffffff, alpha: 0.15 })
    g.x = Math.random() * width
    g.y = Math.random() * height
    container.addChild(g)
    particles.push({
      graphic: g,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
    })
  }

  return {
    update() {
      particles.forEach((p) => {
        p.graphic.x += p.vx
        p.graphic.y += p.vy
        if (p.graphic.x < 0 || p.graphic.x > width) p.vx *= -1
        if (p.graphic.y < 0 || p.graphic.y > height) p.vy *= -1
      })
    },
    destroy() {
      particles.forEach((p) => p.graphic.destroy())
    },
  }
}
```

**Step 2: Add vignette/lighting overlay**

Create a radial gradient overlay centered on the player position:

```typescript
export function createLightingOverlay(container: Container, width: number, height: number) {
  const overlay = new Graphics()
  // Dark vignette around edges, lighter near center
  container.addChild(overlay)

  return {
    update(playerX: number, playerY: number) {
      overlay.clear()
      // Semi-transparent dark overlay with circular cutout at player
      overlay.rect(0, 0, width, height)
      overlay.fill({ color: 0x000000, alpha: 0.3 })
      overlay.circle(playerX, playerY, 120)
      overlay.cut()
    },
    destroy() {
      overlay.destroy()
    },
  }
}
```

**Step 3: Add room transition fade effect**

When `state.ui.isTransitioning` is true, render a full-screen black rectangle with alpha animation (0→1→0 over 300ms).

**Step 4: Commit**

```bash
git add src/app/[locale]/play/game/effects.ts src/app/[locale]/play/game/GameCanvas.tsx
git commit -m "feat: add dust particles, lighting overlay, and room transitions"
```

---

### Task 19: Mobile Controls

**Files:**
- Create: `src/app/[locale]/play/ui/MobileControls.tsx`

**Step 1: Create virtual D-pad and action button**

```tsx
'use client'

import { useCallback, useRef, useEffect } from 'react'

interface MobileControlsProps {
  onDirectionChange: (direction: { up: boolean; down: boolean; left: boolean; right: boolean }) => void
  onInteract: () => void
}

export function MobileControls({ onDirectionChange, onInteract }: MobileControlsProps) {
  // Render 4 arrow buttons in a cross pattern + A button
  // Use touch events (onTouchStart/onTouchEnd) to update direction state
  // Show only on mobile (hidden md:hidden → use media query or CSS class)

  return (
    <div className="flex items-center justify-between px-8 py-4 md:hidden">
      {/* D-Pad */}
      <div className="relative w-32 h-32">
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white active:bg-white/20"
          onTouchStart={() => onDirectionChange({ up: true, down: false, left: false, right: false })}
          onTouchEnd={() => onDirectionChange({ up: false, down: false, left: false, right: false })}
        >
          ▲
        </button>
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white active:bg-white/20"
          onTouchStart={() => onDirectionChange({ up: false, down: true, left: false, right: false })}
          onTouchEnd={() => onDirectionChange({ up: false, down: false, left: false, right: false })}
        >
          ▼
        </button>
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white active:bg-white/20"
          onTouchStart={() => onDirectionChange({ up: false, down: false, left: true, right: false })}
          onTouchEnd={() => onDirectionChange({ up: false, down: false, left: false, right: false })}
        >
          ◀
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white active:bg-white/20"
          onTouchStart={() => onDirectionChange({ up: false, down: false, left: false, right: true })}
          onTouchEnd={() => onDirectionChange({ up: false, down: false, left: false, right: false })}
        >
          ▶
        </button>
      </div>

      {/* A Button */}
      <button
        className="w-14 h-14 rounded-full bg-[#4fc3f7]/30 border-2 border-[#4fc3f7] text-[#4fc3f7] font-bold text-lg active:bg-[#4fc3f7]/50"
        onTouchStart={onInteract}
      >
        A
      </button>
    </div>
  )
}
```

**Step 2: Integrate mobile controls with keyboard hook**

Expose a method on `useKeyboard` to set key state externally, or create a separate mobile input ref that the game loop also reads.

**Step 3: Commit**

```bash
git add src/app/[locale]/play/ui/MobileControls.tsx
git commit -m "feat: add mobile D-pad and action button controls"
```

---

### Task 20: Dark/Light Mode Integration

**Files:**
- Modify: `src/app/[locale]/play/game/rooms.ts`
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Add dark/light color variants to room configs**

Add `darkColors` and `lightColors` variants to each room config. Read the current theme from the document's class or CSS variable.

**Step 2: Apply theme-aware colors**

In the world rendering code, check `document.documentElement.classList.contains('dark')` (or equivalent) and select the appropriate color set.

- Dark: Deeper colors, stronger vignette
- Light: Brighter floor, softer walls, reduced vignette

**Step 3: Commit**

```bash
git add src/app/[locale]/play/game/
git commit -m "feat: integrate dark/light theme with game visuals"
```

---

### Task 21: Loading Screen

**Files:**
- Create: `src/app/[locale]/play/ui/LoadingScreen.tsx`

**Step 1: Create pixel-art style loading screen**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useGame } from '../game/state'

export function LoadingScreen() {
  const { state } = useGame()
  const t = useTranslations('play')

  if (!state.ui.isLoading) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a] z-20">
      <div className="text-2xl text-white font-mono mb-8 tracking-widest">
        {t('title')}
      </div>
      {/* Pixel art loading bar */}
      <div className="w-48 h-4 border-2 border-[#4fc3f7] rounded overflow-hidden">
        <div className="h-full bg-[#4fc3f7] animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      <p className="text-sm text-[#4fc3f7] mt-4 font-mono">{t('loading')}</p>
      <style>{`
        @keyframes loading {
          0% { width: 0% }
          50% { width: 80% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Add to PlayClient, showing until game assets are ready**

**Step 3: Commit**

```bash
git add src/app/[locale]/play/ui/LoadingScreen.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add pixel-art loading screen"
```

---

### Task 22: Minimap

**Files:**
- Create: `src/app/[locale]/play/ui/Minimap.tsx`

**Step 1: Create a minimap showing all 5 rooms**

```tsx
'use client'

import { useGame } from '../game/state'
import type { RoomId } from '../game/types'

const ROOM_POSITIONS: Record<RoomId, { x: number; y: number }> = {
  skills: { x: 1, y: 0 },
  history: { x: 0, y: 1 },
  lobby: { x: 1, y: 1 },
  projects: { x: 2, y: 1 },
  library: { x: 1, y: 2 },
}

export function Minimap() {
  const { state } = useGame()
  const cellSize = 20
  const gap = 2
  const padding = 8

  return (
    <div
      className="absolute top-2 right-2 bg-black/60 rounded-lg backdrop-blur-sm"
      style={{ padding }}
    >
      <svg
        width={3 * (cellSize + gap) - gap}
        height={3 * (cellSize + gap) - gap}
      >
        {Object.entries(ROOM_POSITIONS).map(([id, pos]) => (
          <rect
            key={id}
            x={pos.x * (cellSize + gap)}
            y={pos.y * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={3}
            fill={state.currentRoom === id ? '#4fc3f7' : '#333'}
            stroke={state.currentRoom === id ? '#4fc3f7' : '#555'}
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  )
}
```

**Step 2: Add to PlayClient inside the game canvas container**

**Step 3: Commit**

```bash
git add src/app/[locale]/play/ui/Minimap.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add minimap showing room layout and current position"
```

---

## Phase 5: AI Integration (Optional, v2)

### Task 23: WebGPU AI NPC

**Files:**
- Create: `src/app/[locale]/play/ai/worker.ts`
- Create: `src/app/[locale]/play/ai/useAI.ts`
- Create: `src/app/[locale]/play/ui/AIChat.tsx`

**Step 1: Install transformers.js**

```bash
npm install @huggingface/transformers
```

**Step 2: Create Web Worker for inference**

Create `src/app/[locale]/play/ai/worker.ts`:

```typescript
import { pipeline, TextStreamer } from '@huggingface/transformers'

let generator: Awaited<ReturnType<typeof pipeline>> | null = null

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data

  if (type === 'init') {
    self.postMessage({ type: 'status', status: 'loading' })
    generator = await pipeline('text-generation', 'onnx-community/Qwen3-0.6B-ONNX', {
      device: 'webgpu',
      dtype: 'q4f16',
      progress_callback: (progress: { progress: number }) => {
        self.postMessage({ type: 'progress', progress: progress.progress })
      },
    })
    self.postMessage({ type: 'status', status: 'ready' })
  }

  if (type === 'generate' && generator) {
    const streamer = new TextStreamer((generator as any).tokenizer, {
      skip_prompt: true,
      callback_function: (text: string) => {
        self.postMessage({ type: 'token', text })
      },
    })

    await (generator as any)(payload.messages, {
      max_new_tokens: 256,
      temperature: 0.7,
      streamer,
    })

    self.postMessage({ type: 'done' })
  }
})
```

**Step 3: Create useAI hook**

Create `src/app/[locale]/play/ai/useAI.ts`:

```typescript
'use client'

import { useState, useRef, useCallback } from 'react'

export function useAI() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'generating'>('idle')
  const [progress, setProgress] = useState(0)
  const [response, setResponse] = useState('')
  const workerRef = useRef<Worker | null>(null)

  const init = useCallback(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'status':
          setStatus(e.data.status)
          break
        case 'progress':
          setProgress(e.data.progress)
          break
        case 'token':
          setResponse((prev) => prev + e.data.text)
          break
        case 'done':
          setStatus('ready')
          break
      }
    })

    worker.postMessage({ type: 'init' })
    setStatus('loading')
  }, [])

  const generate = useCallback((userMessage: string, systemPrompt: string) => {
    if (!workerRef.current || status !== 'ready') return
    setResponse('')
    setStatus('generating')
    workerRef.current.postMessage({
      type: 'generate',
      payload: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      },
    })
  }, [status])

  return { status, progress, response, init, generate }
}
```

**Step 4: Create AI Chat overlay**

Create `src/app/[locale]/play/ui/AIChat.tsx` — a special dialogue interface that appears when the player interacts with the AI NPC. It includes a text input and displays streaming responses.

**Step 5: Commit**

```bash
git add src/app/[locale]/play/ai/ src/app/[locale]/play/ui/AIChat.tsx package.json package-lock.json
git commit -m "feat: add WebGPU AI NPC with Qwen3-0.6B inference"
```

---

## Phase 6: Final Integration & Polish

### Task 24: Replace Placeholder Graphics with Pixel Art Assets

**Files:**
- Add: `public/game/tilesets/*.png`
- Add: `public/game/sprites/*.png`
- Modify: `src/app/[locale]/play/game/GameCanvas.tsx`

**Step 1: Download free pixel art tileset**

Download a suitable indoor/dungeon tileset (e.g., from kenney.nl or itch.io free assets). Place in `public/game/tilesets/`.

**Step 2: Create sprite sheets for character**

Either download or create a 32x32 character sprite sheet with 4-direction walk animations (3-4 frames each) + idle frame. Place in `public/game/sprites/character.png`.

**Step 3: Replace Graphics drawing with Sprite/Texture rendering**

Use `Assets.load()` to load tilesets, then use `Sprite` components with proper `texture` references. Replace `Graphics.rect()` calls with actual tile sprites from the tileset.

**Step 4: Design maps in Tiled Map Editor**

Create proper `.tmx` maps in Tiled, export as JSON to `public/game/maps/`. Each room needs:
- Floor layer
- Walls layer
- Decoration layer
- Collision layer
- Objects layer (spawn points, doors, interactable positions)

**Step 5: Commit**

```bash
git add public/game/ src/app/[locale]/play/game/GameCanvas.tsx
git commit -m "feat: replace placeholder graphics with pixel art assets"
```

---

### Task 25: Build Verification & Performance

**Step 1: Run production build**

```bash
npm run build
```

Fix any TypeScript errors or build issues.

**Step 2: Check bundle size impact**

```bash
npx @next/bundle-analyzer
```

Verify PixiJS is only loaded on the `/play` route (dynamic import if needed).

**Step 3: Test on mobile devices**

Open on a phone or use Chrome DevTools mobile emulation. Verify:
- Canvas scales correctly
- Mobile controls work
- No performance issues

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "fix: build and performance optimizations for play page"
```

---

## File Structure Summary

```
src/app/[locale]/play/
├── page.tsx                    # Server component with data loading
├── PlayClient.tsx              # Client root with GameContext provider
├── game/
│   ├── types.ts                # All game type definitions
│   ├── state.ts                # GameContext, reducer, useGame hook
│   ├── GameCanvas.tsx           # Main PixiJS canvas + game loop
│   ├── useKeyboard.ts          # Keyboard input hook
│   ├── tilemap.ts              # Tilemap types, collision detection
│   ├── TilemapRenderer.tsx     # Tilemap rendering (replaced by assets later)
│   ├── Character.tsx           # Character component (optional, merged into GameCanvas)
│   ├── Camera.tsx              # Camera/viewport management
│   ├── rooms.ts                # Room configurations and door triggers
│   ├── objects.ts              # Interactable object generation
│   └── effects.ts              # Particles, lighting, transitions
├── ui/
│   ├── DialogueBox.tsx         # RPG dialogue with typewriter effect
│   ├── DetailPanel.tsx         # Project/post/skill detail overlay
│   ├── MobileControls.tsx      # Virtual D-pad and action button
│   ├── LoadingScreen.tsx       # Pixel-art loading screen
│   ├── Minimap.tsx             # Room overview minimap
│   └── AIChat.tsx              # AI NPC chat interface (v2)
└── ai/
    ├── worker.ts               # Web Worker for WebGPU inference
    └── useAI.ts                # AI state management hook

public/game/
├── maps/                       # Tiled JSON map files
│   ├── lobby.json
│   ├── projects.json
│   ├── skills.json
│   ├── history.json
│   └── library.json
├── tilesets/                   # Pixel art tileset images
└── sprites/                   # Character sprite sheets
```
