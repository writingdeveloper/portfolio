# 3D Floating Card Universe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the PixiJS 2D game at `/play` with a React Three Fiber 3D showcase where visitors scroll through a mystical, luxurious space of floating content cards.

**Architecture:** Scroll-driven R3F scene with 5 section clusters (Intro, Projects, Skills, Timeline, Blog). `ScrollControls` from drei handles camera movement. Each section is a React component placed at Y offsets. HTML overlay for detail panels. "Deep Aurora" aesthetic: dark indigo background, purple/gold accents, slow elegant animations.

**Tech Stack:** React Three Fiber, @react-three/drei, @react-three/postprocessing, Three.js, Next.js 16, TypeScript

**Design doc:** `docs/plans/2026-03-23-three-js-showcase-design.md`

---

## Group A: Scaffold & Dependencies (Tasks 1-2)

### Task 1: Swap dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install R3F dependencies**

Run:
```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

**Step 2: Remove PixiJS dependencies**

Run:
```bash
npm uninstall pixi.js @pixi/react pixi-viewport
```

**Step 3: Verify install**

Run: `npm run build` — should fail only because game code imports pixi (expected, we delete it next task).

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap pixi.js for react-three-fiber"
```

---

### Task 2: Delete old game code & scaffold new structure

**Files:**
- Delete: `src/app/[locale]/play/game/` (entire directory)
- Delete: `src/app/[locale]/play/ui/DialogueBox.tsx`
- Delete: `src/app/[locale]/play/ui/DetailPanel.tsx`
- Delete: `src/app/[locale]/play/ui/Minimap.tsx`
- Delete: `src/app/[locale]/play/ui/MobileControls.tsx`
- Delete: `src/app/[locale]/play/ui/LoadingScreen.tsx`
- Modify: `src/app/[locale]/play/page.tsx`
- Create: `src/app/[locale]/play/PlayClient.tsx` (rewrite)
- Create: `src/app/[locale]/play/scene/Scene.tsx` (stub)
- Create: `src/app/[locale]/play/ui/LoadingScreen.tsx` (new)
- Modify: `src/app/[locale]/page.tsx` (update home hero link text/icon)
- Modify: `messages/ko.json` (update play namespace)
- Modify: `messages/en.json` (update play namespace)

**Step 1: Delete old game directory and UI files**

Run:
```bash
rm -rf src/app/[locale]/play/game
rm src/app/[locale]/play/ui/DialogueBox.tsx
rm src/app/[locale]/play/ui/DetailPanel.tsx
rm src/app/[locale]/play/ui/Minimap.tsx
rm src/app/[locale]/play/ui/MobileControls.tsx
rm src/app/[locale]/play/ui/LoadingScreen.tsx
```

**Step 2: Rewrite `page.tsx`**

Keep existing metadata + data fetching. Remove game-specific props, keep projects/skills/timeline/posts.

```typescript
// src/app/[locale]/play/page.tsx
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/mdx'
import projectsData from '../../../../content/projects.json'
import aboutData from '../../../../content/about.json'
import type { Project, Skill, TimelineItem } from '@/types/content'
import dynamic from 'next/dynamic'

const PlayClient = dynamic(() => import('./PlayClient').then((m) => m.PlayClient), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#050510]">
      <div className="text-[#a78bfa] text-lg tracking-[0.3em] uppercase animate-pulse">
        Loading
      </div>
    </div>
  ),
})

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
  const posts = getAllPosts(locale)
    .slice(0, 3)
    .map((p) => ({
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

**Step 3: Create stub `PlayClient.tsx`**

Minimal R3F canvas that renders a dark background — proves the setup works.

```tsx
// src/app/[locale]/play/PlayClient.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
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
  return (
    <div className="fixed inset-0 bg-[#050510]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#050510']} />
        <ScrollControls pages={5} damping={0.3}>
          {/* Sections will go here */}
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#7c6cf0" />
          </mesh>
        </ScrollControls>
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  )
}
```

**Step 4: Create stub `Scene.tsx`**

```tsx
// src/app/[locale]/play/scene/Scene.tsx
'use client'

export function Scene() {
  return (
    <group>
      {/* Sections will be added here */}
    </group>
  )
}
```

**Step 5: Update i18n messages**

In `messages/ko.json`, replace the `play` namespace:

```json
"play": {
  "title": "탐험",
  "description": "3D 공간에서 포트폴리오를 탐험해보세요",
  "loading": "로딩 중...",
  "exit": "나가기",
  "sections": {
    "intro": "소개",
    "projects": "프로젝트",
    "skills": "스킬",
    "timeline": "타임라인",
    "blog": "블로그"
  },
  "scrollHint": "스크롤하여 탐험하기",
  "clickToView": "클릭하여 자세히 보기",
  "close": "닫기"
}
```

In `messages/en.json`, replace the `play` namespace:

```json
"play": {
  "title": "Explore",
  "description": "Explore the portfolio in 3D space",
  "loading": "Loading...",
  "exit": "Exit",
  "sections": {
    "intro": "Intro",
    "projects": "Projects",
    "skills": "Skills",
    "timeline": "Timeline",
    "blog": "Blog"
  },
  "scrollHint": "Scroll to explore",
  "clickToView": "Click to view details",
  "close": "Close"
}
```

**Step 6: Update home hero link**

In `src/app/[locale]/page.tsx`, change the Gamepad2 icon to something more fitting:

```tsx
// Change import
import { ArrowRight, Sparkles } from 'lucide-react'

// Change the link (lines 73-79):
<Link
  href="/play"
  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--accent-text)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
>
  <Sparkles size={20} />
  {t('explore')}
</Link>
```

**Step 7: Verify build**

Run: `npm run build`
Expected: Builds successfully. `/play` renders dark background with a purple cube.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold R3F 3D showcase, remove old PixiJS game"
```

---

## Group B: Core Scene Infrastructure (Tasks 3-5)

### Task 3: Aurora particles & background atmosphere

**Files:**
- Create: `src/app/[locale]/play/scene/AuroraParticles.tsx`
- Create: `src/app/[locale]/play/scene/PostEffects.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `AuroraParticles.tsx`**

Two layers: (1) slow-drifting fog planes for aurora, (2) instanced tiny spheres for light dust.

```tsx
// src/app/[locale]/play/scene/AuroraParticles.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DUST_COUNT = 200

export function AuroraParticles() {
  return (
    <group>
      <AuroraFog />
      <LightDust />
    </group>
  )
}

function AuroraFog() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#4f46e5') },
      uColor2: { value: new THREE.Color('#7c6cf0') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * 0.15
    }
  })

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;

    // Simplex-like noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float n = snoise(vUv * 3.0 + uTime * 0.5);
      n = n * 0.5 + 0.5;
      float n2 = snoise(vUv * 1.5 - uTime * 0.3);
      n2 = n2 * 0.5 + 0.5;
      vec3 color = mix(uColor1, uColor2, n);
      float alpha = smoothstep(0.2, 0.8, n * n2) * 0.12;
      gl_FragColor = vec4(color, alpha);
    }
  `

  return (
    <>
      {[-30, 0, 30, 60].map((y, i) => (
        <mesh key={i} position={[0, y, -15]} rotation={[0, 0, i * 0.3]}>
          <planeGeometry args={[60, 20]} />
          <shaderMaterial
            ref={i === 0 ? materialRef : undefined}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

function LightDust() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: DUST_COUNT }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * -80 + 10,
      z: (Math.random() - 0.5) * 20 - 5,
      speed: 0.02 + Math.random() * 0.03,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.04,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 2,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 1.5,
        p.z + Math.sin(t * p.speed * 0.5) * 1
      )
      dummy.scale.setScalar(p.scale * (0.8 + Math.sin(t + p.offset) * 0.2))
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} />
    </instancedMesh>
  )
}
```

**Step 2: Create `PostEffects.tsx`**

```tsx
// src/app/[locale]/play/scene/PostEffects.tsx
'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  )
}
```

**Step 3: Update `PlayClient.tsx`**

Replace the placeholder cube with particles + post effects:

```tsx
// src/app/[locale]/play/PlayClient.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { PostEffects } from './scene/PostEffects'

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
  return (
    <div className="fixed inset-0 bg-[#050510]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
        <ScrollControls pages={5} damping={0.3}>
          <AuroraParticles />
        </ScrollControls>
        <PostEffects />
      </Canvas>
    </div>
  )
}
```

**Step 4: Verify**

Run: `npm run dev` → visit `/play`.
Expected: Dark indigo background with slow-moving purple aurora fog, floating light dust particles, bloom glow, vignette.

**Step 5: Commit**

```bash
git add src/app/[locale]/play/scene/
git add src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add aurora particles and post-processing effects"
```

---

### Task 4: Camera rig & scroll-based section movement

**Files:**
- Create: `src/app/[locale]/play/scene/CameraRig.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `CameraRig.tsx`**

Camera moves downward along Y axis as user scrolls. Each section is spaced 15 units apart on Y.

```tsx
// src/app/[locale]/play/scene/CameraRig.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const SECTION_COUNT = 5
const SECTION_SPACING = 15
const TOTAL_DISTANCE = (SECTION_COUNT - 1) * SECTION_SPACING

export function CameraRig() {
  const scroll = useScroll()
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const offset = scroll.offset
    // Move camera Y position based on scroll
    const targetY = -offset * TOTAL_DISTANCE
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY,
      0.05
    )

    // Subtle mouse parallax
    const mouseX = (state.pointer.x * 0.3)
    const mouseY = (state.pointer.y * 0.2)
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mouseX,
      0.05
    )
    state.camera.lookAt(mouseX * 0.5, state.camera.position.y + mouseY, 0)
  })

  return null
}

export { SECTION_SPACING }
```

**Step 2: Update `PlayClient.tsx`**

Add CameraRig inside ScrollControls:

```tsx
// Add import
import { CameraRig } from './scene/CameraRig'

// Inside ScrollControls, add:
<CameraRig />
```

**Step 3: Verify**

Run: `npm run dev` → scroll on `/play`.
Expected: Camera smoothly moves down, mouse movement creates subtle parallax.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/scene/CameraRig.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add scroll-driven camera rig with mouse parallax"
```

---

### Task 5: Reusable FloatingCard & SectionLabel components

**Files:**
- Create: `src/app/[locale]/play/components/FloatingCard.tsx`
- Create: `src/app/[locale]/play/components/SectionLabel.tsx`

**Step 1: Create `FloatingCard.tsx`**

Glass card with glow border. Hovers = brighten. Click = callback.

```tsx
// src/app/[locale]/play/components/FloatingCard.tsx
'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingCardProps {
  position: [number, number, number]
  title: string
  subtitle?: string
  width?: number
  height?: number
  onClick?: () => void
  accentColor?: string
  floatSpeed?: number
  floatIntensity?: number
}

export function FloatingCard({
  position,
  title,
  subtitle,
  width = 3.5,
  height = 2.2,
  onClick,
  accentColor = '#7c6cf0',
  floatSpeed = 2,
  floatIntensity = 0.3,
}: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const targetEmissive = useRef(0)

  useFrame(() => {
    targetEmissive.current = hovered ? 0.3 : 0.05
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        targetEmissive.current,
        0.08
      )
    }
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.1} floatIntensity={floatIntensity}>
      <group
        ref={groupRef}
        position={position}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        onClick={onClick}
      >
        {/* Glass card body */}
        <RoundedBox args={[width, height, 0.05]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.1}
            transmission={0.3}
          />
        </RoundedBox>

        {/* Glow border */}
        <mesh ref={glowRef} position={[0, 0, -0.01]}>
          <planeGeometry args={[width + 0.08, height + 0.08]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.05}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, subtitle ? 0.2 : 0, 0.04]}
          fontSize={0.22}
          maxWidth={width - 0.6}
          textAlign="center"
          color="#e8d5a3"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.woff"
        >
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            position={[0, -0.25, 0.04]}
            fontSize={0.14}
            maxWidth={width - 0.6}
            textAlign="center"
            color="#a78bfa"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-regular.woff"
          >
            {subtitle}
          </Text>
        )}
      </group>
    </Float>
  )
}
```

**Step 2: Create `SectionLabel.tsx`**

Wide-tracked uppercase text label.

```tsx
// src/app/[locale]/play/components/SectionLabel.tsx
'use client'

import { Text } from '@react-three/drei'

interface SectionLabelProps {
  position: [number, number, number]
  label: string
}

export function SectionLabel({ position, label }: SectionLabelProps) {
  // Add spacing between characters for luxury feel
  const spaced = label.toUpperCase().split('').join(' ')

  return (
    <Text
      position={position}
      fontSize={0.18}
      color="#c4a35a"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.15}
      font="/fonts/inter-light.woff"
    >
      {spaced}
    </Text>
  )
}
```

**Step 3: Download font files**

Run:
```bash
mkdir -p public/fonts
curl -o public/fonts/inter-light.woff "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff"
curl -o public/fonts/inter-regular.woff "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff"
curl -o public/fonts/inter-medium.woff "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff"
```

Note: If Google Font direct URLs don't work, download Inter woff files manually from Google Fonts or use `@fontsource/inter` and copy woff files to `public/fonts/`. The drei `<Text>` component needs direct `.woff` or `.ttf` file paths.

**Step 4: Verify**

Import FloatingCard into PlayClient temporarily, render one card. Should see a glass card with gold text floating gently.

**Step 5: Commit**

```bash
git add src/app/[locale]/play/components/ public/fonts/
git commit -m "feat: add FloatingCard and SectionLabel 3D components"
```

---

## Group C: Content Sections (Tasks 6-10)

### Task 6: IntroSection — name + role + scroll hint

**Files:**
- Create: `src/app/[locale]/play/sections/IntroSection.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `IntroSection.tsx`**

```tsx
// src/app/[locale]/play/sections/IntroSection.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

interface IntroSectionProps {
  name: string
  role: string
  scrollHint: string
}

export function IntroSection({ name, role, scrollHint }: IntroSectionProps) {
  const hintRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (hintRef.current) {
      hintRef.current.position.y = -3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15
      const mat = hintRef.current.material as THREE.MeshBasicMaterial
      if (mat.opacity !== undefined) {
        mat.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.3
      }
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        {/* Name */}
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.8}
          color="#e8d5a3"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.woff"
        >
          {name}
        </Text>

        {/* Role */}
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.28}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          font="/fonts/inter-light.woff"
        >
          {role}
        </Text>
      </Float>

      {/* Scroll hint */}
      <Text
        ref={hintRef}
        position={[0, -3, 0]}
        fontSize={0.14}
        color="#a78bfa"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-light.woff"
      >
        {scrollHint}
      </Text>

      {/* Decorative line */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[2, 0.003]} />
        <meshBasicMaterial color="#c4a35a" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
```

**Step 2: Wire into PlayClient**

Add IntroSection inside ScrollControls. Use locale-based text for name/role (hardcoded for now, i18n in later task).

**Step 3: Verify**

Run: `npm run dev` → name and role visible, scroll hint pulses gently.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/sections/IntroSection.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add 3D intro section with name, role, scroll hint"
```

---

### Task 7: ProjectsSection — floating project cards

**Files:**
- Create: `src/app/[locale]/play/sections/ProjectsSection.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `ProjectsSection.tsx`**

```tsx
// src/app/[locale]/play/sections/ProjectsSection.tsx
'use client'

import { useState } from 'react'
import type { Project } from '@/types/content'
import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

interface ProjectsSectionProps {
  projects: Project[]
  locale: string
  onSelect: (project: Project) => void
}

export function ProjectsSection({ projects, locale, onSelect }: ProjectsSectionProps) {
  const sectionY = -SECTION_SPACING * 1

  // Arrange cards in a slight arc with depth variation
  const positions: [number, number, number][] = projects.map((_, i) => {
    const count = projects.length
    const spread = Math.min(count - 1, 3) * 2
    const x = (i - (count - 1) / 2) * (spread / Math.max(count - 1, 1))
    const z = -Math.abs(i - (count - 1) / 2) * 1.5
    return [x * 1.8, sectionY + (i % 2 === 0 ? 0.3 : -0.3), z]
  })

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label="Projects" />
      {projects.map((project, i) => (
        <FloatingCard
          key={project.slug}
          position={positions[i]}
          title={project.name}
          subtitle={locale === 'ko' ? project.descriptionKo.slice(0, 40) + '...' : project.descriptionEn.slice(0, 40) + '...'}
          onClick={() => onSelect(project)}
          accentColor={i === 0 ? '#c4a35a' : '#7c6cf0'}
          floatSpeed={1.5 + i * 0.3}
        />
      ))}
    </group>
  )
}
```

**Step 2: Add state + wiring in PlayClient**

Add `selectedProject` state, pass `onSelect`, render `ProjectsSection`.

**Step 3: Verify**

Run: `npm run dev` → scroll down to see project cards floating.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/sections/ProjectsSection.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add projects section with floating cards"
```

---

### Task 8: SkillsSection — glowing orbs by category

**Files:**
- Create: `src/app/[locale]/play/components/GlowOrb.tsx`
- Create: `src/app/[locale]/play/sections/SkillsSection.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `GlowOrb.tsx`**

```tsx
// src/app/[locale]/play/components/GlowOrb.tsx
'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'

interface GlowOrbProps {
  position: [number, number, number]
  label: string
  color: string
  size?: number
}

export function GlowOrb({ position, label, color, size = 0.35 }: GlowOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        hovered ? 1.2 : 0.4,
        0.08
      )
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        <Text
          position={[0, -size - 0.2, 0]}
          fontSize={0.12}
          color="#e8d5a3"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-regular.woff"
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}
```

**Step 2: Create `SkillsSection.tsx`**

```tsx
// src/app/[locale]/play/sections/SkillsSection.tsx
'use client'

import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'
import { GlowOrb } from '../components/GlowOrb'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#a78bfa',
  backend: '#c4a35a',
  tools: '#818cf8',
}

interface SkillsSectionProps {
  skills: Skill[]
  locale: string
}

export function SkillsSection({ skills, locale }: SkillsSectionProps) {
  const sectionY = -SECTION_SPACING * 2

  const grouped = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }

  const categoryLabel = (cat: string) =>
    skillCategories[cat as keyof typeof skillCategories]?.[locale as 'ko' | 'en'] ?? cat

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label="Skills" />
      {Object.entries(grouped).map(([category, items], catIdx) => {
        const catX = (catIdx - 1) * 5
        return (
          <group key={category}>
            {/* Category sublabel */}
            <SectionLabel
              position={[catX, sectionY + 2.5, 0]}
              label={categoryLabel(category)}
            />
            {items.map((skill, i) => {
              const row = Math.floor(i / 3)
              const col = i % 3
              const x = catX + (col - 1) * 1.4
              const y = sectionY - row * 1.4 + 1
              const z = -Math.random() * 2
              return (
                <GlowOrb
                  key={skill.name}
                  position={[x, y, z]}
                  label={skill.name}
                  color={CATEGORY_COLORS[category] ?? '#7c6cf0'}
                />
              )
            })}
          </group>
        )
      })}
    </group>
  )
}
```

**Step 3: Wire into PlayClient**

**Step 4: Verify**

Run: `npm run dev` → scroll to skills section. Glowing orbs grouped by category with labels.

**Step 5: Commit**

```bash
git add src/app/[locale]/play/components/GlowOrb.tsx src/app/[locale]/play/sections/SkillsSection.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add skills section with glowing orbs by category"
```

---

### Task 9: TimelineSection — entries along a path

**Files:**
- Create: `src/app/[locale]/play/sections/TimelineSection.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `TimelineSection.tsx`**

```tsx
// src/app/[locale]/play/sections/TimelineSection.tsx
'use client'

import type { TimelineItem } from '@/types/content'
import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

const TYPE_COLORS: Record<string, string> = {
  work: '#c4a35a',
  education: '#818cf8',
  project: '#a78bfa',
}

interface TimelineSectionProps {
  timeline: TimelineItem[]
  locale: string
  onSelect: (item: TimelineItem) => void
}

export function TimelineSection({ timeline, locale, onSelect }: TimelineSectionProps) {
  const sectionY = -SECTION_SPACING * 3

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label="Timeline" />

      {/* Vertical line */}
      <mesh position={[0, sectionY, -1]}>
        <planeGeometry args={[0.01, timeline.length * 2.5 + 2]} />
        <meshBasicMaterial color="#c4a35a" transparent opacity={0.3} />
      </mesh>

      {timeline.map((item, i) => {
        const isLeft = i % 2 === 0
        const x = isLeft ? -3 : 3
        const y = sectionY + 2 - i * 2.5
        const title = locale === 'ko' ? item.titleKo : item.titleEn
        return (
          <FloatingCard
            key={`${item.date}-${i}`}
            position={[x, y, -i * 0.5]}
            title={title}
            subtitle={item.date}
            width={3}
            height={1.8}
            onClick={() => onSelect(item)}
            accentColor={TYPE_COLORS[item.type] ?? '#7c6cf0'}
            floatSpeed={1.2}
            floatIntensity={0.15}
          />
        )
      })}
    </group>
  )
}
```

**Step 2: Wire into PlayClient, add `selectedTimeline` state.**

**Step 3: Verify + Commit**

```bash
git add src/app/[locale]/play/sections/TimelineSection.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add timeline section with alternating cards"
```

---

### Task 10: BlogSection — latest post cards

**Files:**
- Create: `src/app/[locale]/play/sections/BlogSection.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `BlogSection.tsx`**

```tsx
// src/app/[locale]/play/sections/BlogSection.tsx
'use client'

import { FloatingCard } from '../components/FloatingCard'
import { SectionLabel } from '../components/SectionLabel'
import { SECTION_SPACING } from '../scene/CameraRig'

interface PostSummary {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface BlogSectionProps {
  posts: PostSummary[]
  onSelect: (post: PostSummary) => void
}

export function BlogSection({ posts, onSelect }: BlogSectionProps) {
  const sectionY = -SECTION_SPACING * 4

  return (
    <group>
      <SectionLabel position={[0, sectionY + 4, 0]} label="Blog" />
      {posts.map((post, i) => {
        const x = (i - (posts.length - 1) / 2) * 4
        const z = -Math.abs(i - (posts.length - 1) / 2) * 1.5
        return (
          <FloatingCard
            key={post.slug}
            position={[x, sectionY, z]}
            title={post.title}
            subtitle={post.excerpt.slice(0, 50) + '...'}
            onClick={() => onSelect(post)}
            accentColor="#a78bfa"
            floatSpeed={1.3 + i * 0.2}
          />
        )
      })}
    </group>
  )
}
```

**Step 2: Wire into PlayClient, add post selection state.**

**Step 3: Verify + Commit**

```bash
git add src/app/[locale]/play/sections/BlogSection.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add blog section with floating post cards"
```

---

## Group D: UI Overlay & Navigation (Tasks 11-13)

### Task 11: DetailOverlay — HTML panel for clicked items

**Files:**
- Create: `src/app/[locale]/play/ui/DetailOverlay.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `DetailOverlay.tsx`**

HTML overlay (not 3D) that appears when a card is clicked. Shows full details based on item type.

```tsx
// src/app/[locale]/play/ui/DetailOverlay.tsx
'use client'

import { useEffect } from 'react'
import { X, ExternalLink, Github } from 'lucide-react'
import type { Project, TimelineItem } from '@/types/content'

type DetailItem =
  | { type: 'project'; data: Project }
  | { type: 'timeline'; data: TimelineItem }
  | { type: 'post'; data: { slug: string; title: string; excerpt: string; category: string } }

interface DetailOverlayProps {
  item: DetailItem | null
  locale: string
  onClose: () => void
}

export function DetailOverlay({ item, locale, onClose }: DetailOverlayProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative max-w-lg w-full mx-4 p-8 rounded-2xl border border-[#7c6cf0]/30 bg-[#0a0a1a]/90 backdrop-blur-md shadow-2xl shadow-purple-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a78bfa] hover:text-[#e8d5a3] transition-colors"
        >
          <X size={20} />
        </button>

        {item.type === 'project' && <ProjectDetail project={item.data} locale={locale} />}
        {item.type === 'timeline' && <TimelineDetail item={item.data} locale={locale} />}
        {item.type === 'post' && <PostDetail post={item.data} locale={locale} />}
      </div>
    </div>
  )
}

function ProjectDetail({ project, locale }: { project: Project; locale: string }) {
  const desc = locale === 'ko' ? project.descriptionKo : project.descriptionEn
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-[#e8d5a3]">{project.name}</h2>
      <p className="text-[#a78bfa]/80 text-sm">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-xs rounded-full border border-[#7c6cf0]/30 text-[#a78bfa]"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
          >
            <ExternalLink size={14} /> Website
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
          >
            <Github size={14} /> GitHub
          </a>
        )}
      </div>
    </div>
  )
}

function TimelineDetail({ item, locale }: { item: TimelineItem; locale: string }) {
  const title = locale === 'ko' ? item.titleKo : item.titleEn
  const desc = locale === 'ko' ? item.descriptionKo : item.descriptionEn
  return (
    <div className="space-y-3">
      <span className="text-xs text-[#c4a35a] tracking-widest uppercase">{item.date}</span>
      <h2 className="text-xl font-semibold text-[#e8d5a3]">{title}</h2>
      <p className="text-[#a78bfa]/80 text-sm">{desc}</p>
    </div>
  )
}

function PostDetail({ post, locale }: { post: { slug: string; title: string; excerpt: string }; locale: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-[#e8d5a3]">{post.title}</h2>
      <p className="text-[#a78bfa]/80 text-sm">{post.excerpt}</p>
      <a
        href={`/${locale}/blog/${post.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[#c4a35a] hover:text-[#e8d5a3] transition-colors"
      >
        <ExternalLink size={14} /> Read more
      </a>
    </div>
  )
}
```

**Step 2: Wire into PlayClient**

Add unified selection state: `selectedItem: DetailItem | null`. Pass `onClose={() => setSelectedItem(null)}`.

**Step 3: Verify + Commit**

```bash
git add src/app/[locale]/play/ui/DetailOverlay.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add detail overlay panel for card interactions"
```

---

### Task 12: SectionNav — right-side dot navigation

**Files:**
- Create: `src/app/[locale]/play/ui/SectionNav.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Create `SectionNav.tsx`**

```tsx
// src/app/[locale]/play/ui/SectionNav.tsx
'use client'

const SECTIONS = ['intro', 'projects', 'skills', 'timeline', 'blog'] as const

interface SectionNavProps {
  labels: Record<string, string>
  activeIndex: number
  onNavigate: (index: number) => void
}

export function SectionNav({ labels, activeIndex, onNavigate }: SectionNavProps) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-4">
      {SECTIONS.map((section, i) => (
        <button
          key={section}
          onClick={() => onNavigate(i)}
          className="group flex items-center gap-3"
        >
          <span
            className={`text-xs tracking-widest uppercase transition-all duration-500 ${
              i === activeIndex
                ? 'text-[#e8d5a3] opacity-100'
                : 'text-[#a78bfa] opacity-0 group-hover:opacity-60'
            }`}
          >
            {labels[section] ?? section}
          </span>
          <span
            className={`block rounded-full transition-all duration-500 ${
              i === activeIndex
                ? 'w-3 h-3 bg-[#c4a35a] shadow-[0_0_8px_#c4a35a]'
                : 'w-2 h-2 bg-[#7c6cf0]/50 group-hover:bg-[#a78bfa]'
            }`}
          />
        </button>
      ))}
    </nav>
  )
}
```

**Step 2: Track active section in PlayClient**

Use scroll offset to determine active section index. Pass to SectionNav. Wire `onNavigate` to programmatically scroll.

Note: `useScroll()` from drei is only available inside `<Canvas>`. To communicate active section to HTML overlay, use a shared ref or state lifted in PlayClient. The CameraRig can call a callback passed via props when section changes.

**Step 3: Verify + Commit**

```bash
git add src/app/[locale]/play/ui/SectionNav.tsx src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add right-side dot navigation with section labels"
```

---

### Task 13: Exit button + header hide

**Files:**
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Add exit button**

Add a fixed exit button (top-left) that links back to home. In PlayClient, above the Canvas:

```tsx
<Link
  href="/"
  className="fixed top-6 left-6 z-40 flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors tracking-widest uppercase"
>
  <ArrowLeft size={16} />
  Exit
</Link>
```

**Step 2: Hide main header/footer on /play**

Check if the layout already conditionally hides header on `/play`. If not, add a check in `src/app/[locale]/layout.tsx` — if pathname is `/play`, hide `<Header>` and `<Footer>`.

Alternative: add `overflow-hidden` and the fixed fullscreen canvas already covers everything. The exit button provides navigation back.

**Step 3: Verify + Commit**

```bash
git add src/app/[locale]/play/PlayClient.tsx
git commit -m "feat: add exit button and fullscreen play layout"
```

---

## Group E: Polish & Mobile (Tasks 14-16)

### Task 14: Full PlayClient assembly

**Files:**
- Modify: `src/app/[locale]/play/PlayClient.tsx`

**Step 1: Assemble all components**

Final PlayClient wiring all sections, detail overlay, section nav, exit button, and shared state together. This is the integration task.

```tsx
// src/app/[locale]/play/PlayClient.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { AuroraParticles } from './scene/AuroraParticles'
import { CameraRig } from './scene/CameraRig'
import { PostEffects } from './scene/PostEffects'
import { IntroSection } from './sections/IntroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { TimelineSection } from './sections/TimelineSection'
import { BlogSection } from './sections/BlogSection'
import { DetailOverlay } from './ui/DetailOverlay'
import { SectionNav } from './ui/SectionNav'

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

type DetailItem =
  | { type: 'project'; data: Project }
  | { type: 'timeline'; data: TimelineItem }
  | { type: 'post'; data: PostSummary }

export function PlayClient({ projects, skills, timeline, posts, locale }: PlayClientProps) {
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const scrollRef = useRef<any>(null)

  const sectionLabels: Record<string, string> = locale === 'ko'
    ? { intro: '소개', projects: '프로젝트', skills: '스킬', timeline: '타임라인', blog: '블로그' }
    : { intro: 'Intro', projects: 'Projects', skills: 'Skills', timeline: 'Timeline', blog: 'Blog' }

  const introText = locale === 'ko'
    ? { name: '이시형', role: '개발자 & 창업가', scrollHint: '↓ 스크롤하여 탐험하기' }
    : { name: 'Sihyung Lee', role: 'Developer & Entrepreneur', scrollHint: '↓ Scroll to explore' }

  const handleNavigate = useCallback((index: number) => {
    // Programmatic scroll — scrollRef set by CameraRig
    if (scrollRef.current) {
      scrollRef.current.el.scrollTop = (index / 4) * scrollRef.current.el.scrollHeight
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#050510]">
      {/* Exit button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-40 flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors tracking-widest uppercase"
      >
        <ArrowLeft size={16} />
        {locale === 'ko' ? '나가기' : 'Exit'}
      </Link>

      {/* Section nav */}
      <SectionNav
        labels={sectionLabels}
        activeIndex={activeSection}
        onNavigate={handleNavigate}
      />

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
        <ScrollControls pages={5} damping={0.3}>
          <CameraRig onSectionChange={setActiveSection} scrollRef={scrollRef} />
          <AuroraParticles />
          <IntroSection {...introText} />
          <ProjectsSection
            projects={projects}
            locale={locale}
            onSelect={(p) => setSelectedItem({ type: 'project', data: p })}
          />
          <SkillsSection skills={skills} locale={locale} />
          <TimelineSection
            timeline={timeline}
            locale={locale}
            onSelect={(t) => setSelectedItem({ type: 'timeline', data: t })}
          />
          <BlogSection
            posts={posts}
            onSelect={(p) => setSelectedItem({ type: 'post', data: p })}
          />
        </ScrollControls>
        <PostEffects />
      </Canvas>

      {/* Detail overlay */}
      <DetailOverlay
        item={selectedItem}
        locale={locale}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  )
}
```

**Step 2: Update CameraRig to accept `onSectionChange` and `scrollRef` props**

```tsx
// Updated CameraRig signature:
interface CameraRigProps {
  onSectionChange?: (index: number) => void
  scrollRef?: React.MutableRefObject<any>
}

export function CameraRig({ onSectionChange, scrollRef }: CameraRigProps) {
  const scroll = useScroll()

  useEffect(() => {
    if (scrollRef) scrollRef.current = scroll
  }, [scroll, scrollRef])

  useFrame((state) => {
    const offset = scroll.offset
    const sectionIndex = Math.round(offset * 4)
    onSectionChange?.(sectionIndex)
    // ... rest of camera logic
  })
}
```

**Step 3: Verify end-to-end**

Run: `npm run dev` → all 5 sections visible, scroll moves camera, cards clickable, detail overlay works, section nav highlights active, exit button works.

**Step 4: Commit**

```bash
git add src/app/[locale]/play/
git commit -m "feat: assemble full 3D showcase with all sections and UI"
```

---

### Task 15: Mobile optimization

**Files:**
- Modify: `src/app/[locale]/play/PlayClient.tsx`
- Modify: `src/app/[locale]/play/scene/AuroraParticles.tsx`
- Modify: `src/app/[locale]/play/scene/PostEffects.tsx`
- Modify: `src/app/[locale]/play/ui/SectionNav.tsx`

**Step 1: Add mobile detection hook**

In PlayClient, detect mobile:
```tsx
const isMobile = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
```

**Step 2: Reduce particles on mobile**

In AuroraParticles, accept a `count` prop. Pass `DUST_COUNT = isMobile ? 100 : 200` from PlayClient.

**Step 3: Disable PostEffects on mobile**

```tsx
{!isMobile && <PostEffects />}
```

**Step 4: Hide section nav labels on mobile**

In SectionNav, hide text labels on small screens:
```tsx
<span className="hidden sm:block ...">
```

**Step 5: Verify on mobile viewport**

Run: `npm run dev` → open DevTools → toggle device toolbar → verify touch scroll works, reduced particles, no bloom.

**Step 6: Commit**

```bash
git add src/app/[locale]/play/
git commit -m "feat: optimize 3D showcase for mobile devices"
```

---

### Task 16: Final cleanup & build verification

**Files:**
- Modify: `src/app/[locale]/page.tsx` (ensure Sparkles icon import)
- Verify: no remaining pixi imports anywhere
- Verify: `npm run build` passes
- Verify: `npm run lint` passes

**Step 1: Search for remaining pixi references**

Run: `grep -r "pixi" src/ --include="*.ts" --include="*.tsx"`
Expected: No results.

**Step 2: Build**

Run: `npm run build`
Expected: Successful build with no errors.

**Step 3: Lint**

Run: `npm run lint`
Expected: No errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup, remove all pixi references, verify build"
```

---

## Summary

| Group | Tasks | Description |
|-------|-------|-------------|
| A | 1-2 | Dependencies swap + scaffold |
| B | 3-5 | Aurora particles, camera rig, reusable components |
| C | 6-10 | 5 content sections (intro, projects, skills, timeline, blog) |
| D | 11-13 | Detail overlay, section nav, exit button |
| E | 14-16 | Full assembly, mobile optimization, cleanup |

**Total: 16 tasks, ~8-10 commits**
