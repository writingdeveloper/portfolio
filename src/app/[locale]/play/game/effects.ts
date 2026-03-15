import { Container, Graphics } from 'pixi.js'

interface Particle {
  graphic: Graphics
  vx: number
  vy: number
}

export function createDustParticles(container: Container, width: number, height: number) {
  const particles: Particle[] = []
  const particleContainer = new Container()
  container.addChild(particleContainer)

  for (let i = 0; i < 15; i++) {
    const g = new Graphics()
    g.circle(0, 0, Math.random() * 1.5 + 0.5)
    g.fill({ color: 0xffffff, alpha: 0.12 + Math.random() * 0.08 })
    g.x = Math.random() * width
    g.y = Math.random() * height
    particleContainer.addChild(g)
    particles.push({
      graphic: g,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
    })
  }

  return {
    update() {
      for (const p of particles) {
        p.graphic.x += p.vx
        p.graphic.y += p.vy
        if (p.graphic.x < 0 || p.graphic.x > width) p.vx *= -1
        if (p.graphic.y < 0 || p.graphic.y > height) p.vy *= -1
      }
    },
    destroy() {
      particleContainer.destroy({ children: true })
    },
  }
}
