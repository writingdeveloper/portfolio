# 3D Interactive Showcase Design — Floating Card Universe

> Replace the PixiJS 2D game at `/play` with a React Three Fiber 3D showcase.
> Visitors scroll through a mystical, luxurious 3D space to explore projects, skills, timeline, and blog posts.

## Concept

"Deep Aurora" — dark indigo space with floating content cards organized into section clusters. Scroll-driven camera movement. Luxurious, mystical aesthetic. Gold and purple accents. Slow, elegant animations.

## Sections (scroll order)

1. **Intro** — Name + role as 3D text, aurora particles, light dust
2. **Projects** — 2-3 project cards floating with depth
3. **Skills** — Skill orbs grouped by category (Frontend/Backend/Tools)
4. **Timeline** — Timeline entries arranged along a path
5. **Blog** — Latest 3 post cards

## Interaction Model

| Input | Action |
|-------|--------|
| Scroll | Camera moves smoothly between sections |
| Mouse move | Subtle parallax on cards |
| Hover | Card brightens, border glow intensifies |
| Click | Camera zooms to card + HTML detail overlay |
| ESC / backdrop click | Zoom out to section view |
| Right-side dot nav | Jump to section |

## Visual Design

### Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Background | `#050510` ~ `#0a0a1a` | Deep indigo black |
| Primary accent | `#7c6cf0` → `#a78bfa` | Purple glow (mystical) |
| Secondary accent | `#c4a35a` → `#e8d5a3` | Gold (luxury) |
| Particles | `#4f46e5` + `#818cf8` | Purple-indigo aurora |
| Card surface | `rgba(255,255,255,0.03)` | Near-transparent glass |
| Card border | Purple → gold gradient | Subtle light border |

### Effects

- Aurora fog — slow-moving light curtains, not star particles
- Floating light dust — firefly-like, slow and subtle
- Fine light dust around cards
- Bloom: subtle, not aggressive
- No neon/cyberpunk — calm and deep tones

### Animation Principles

- All motion slow and elegant (2-4s duration)
- Cards float gently with small amplitude via `Float`
- Camera transitions: spring physics (low tension, high friction → heavy feel)
- Hover: no sudden scale — gentle brighten + glow border

### Typography

- 3D text: thin serif or light sans-serif (premium feel)
- Section labels: small, wide-tracked uppercase (`P R O J E C T S`)

## Technical Architecture

### Dependencies

```
Add:    @react-three/fiber, @react-three/drei, @react-three/postprocessing, three
Remove: pixi.js, @pixi/react, pixi-viewport
```

### File Structure

```
src/app/[locale]/play/
├── page.tsx                    # Metadata + dynamic import
├── PlayClient.tsx              # Canvas + ScrollControls wrapper
├── scene/
│   ├── Scene.tsx               # Main scene (section layout + effects)
│   ├── CameraRig.tsx           # Scroll-based camera movement
│   ├── AuroraParticles.tsx     # Aurora fog + floating light particles
│   └── PostEffects.tsx         # Bloom + Vignette
├── sections/
│   ├── IntroSection.tsx        # Name/role 3D text
│   ├── ProjectsSection.tsx     # Project card cluster
│   ├── SkillsSection.tsx       # Skill orbs
│   ├── TimelineSection.tsx     # Timeline path
│   └── BlogSection.tsx         # Blog post cards
├── components/
│   ├── FloatingCard.tsx        # Reusable 3D glass card
│   ├── GlowOrb.tsx            # Skill sphere
│   └── SectionLabel.tsx        # Section title (wide-tracked uppercase)
└── ui/
    ├── DetailOverlay.tsx       # Click detail panel (HTML)
    ├── SectionNav.tsx          # Right-side dot navigation
    └── LoadingScreen.tsx       # 3D loading screen
```

### Data Flow

```
content/projects.json ─┐
content/about.json ────┤→ page.tsx (server) reads → props to PlayClient
lib/mdx.ts (posts) ───┘
```

### Existing Game Code

Delete entirely: `game/` directory (state.ts, types.ts, rooms.ts, objects.ts, tilemap.ts, effects.ts, useKeyboard.ts, GameCanvas.tsx) and old `ui/` files (DialogueBox, DetailPanel, Minimap, MobileControls).

### Performance

- `dynamic(() => import('./PlayClient'), { ssr: false })`
- InstancedMesh for particles
- High `damping` on ScrollControls for heavy, smooth scroll
- Mobile: 50% fewer particles, disable Bloom post-processing

### Mobile

- Touch scroll works naturally with ScrollControls
- Hover effects → tap equivalent
- Flatter card layout (reduced depth)
- Detect via `navigator.maxTouchPoints`
