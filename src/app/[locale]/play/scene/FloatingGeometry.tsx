'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface FloatingShapeProps {
  position: [number, number, number]
  size?: number
  speed?: number
  color?: string
}

function FloatingShape({ position, size = 0.4, speed = 0.2, color = '#2a2745' }: FloatingShapeProps) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed
    ref.current.rotation.x = t
    ref.current.rotation.y = t * 0.7
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
  })

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[size]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
    </mesh>
  )
}

export function FloatingGeometry() {
  return (
    <group>
      <FloatingShape position={[-8, -7, -6]} size={0.5} speed={0.15} />
      <FloatingShape position={[9, -12, -8]} size={0.35} speed={0.2} />
      <FloatingShape position={[-6, -22, -5]} size={0.45} speed={0.12} />
      <FloatingShape position={[7, -28, -7]} size={0.3} speed={0.18} />
      <FloatingShape position={[-9, -38, -6]} size={0.55} speed={0.1} />
      <FloatingShape position={[5, -42, -8]} size={0.25} speed={0.22} />
      <FloatingShape position={[-7, -52, -5]} size={0.4} speed={0.14} />
      <FloatingShape position={[8, -58, -7]} size={0.35} speed={0.16} />
    </group>
  )
}
