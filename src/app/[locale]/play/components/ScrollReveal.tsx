'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ScrollRevealProps {
  children: React.ReactNode
  position: [number, number, number]
  threshold?: number
}

export function ScrollReveal({ children, position, threshold = 12 }: ScrollRevealProps) {
  const groupRef = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return

    const cameraY = state.camera.position.y
    const targetY = position[1]
    const distance = Math.abs(cameraY - targetY)

    // Start revealing when camera is within threshold
    const targetProgress = distance < threshold ? 1 : 0
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, 0.04)

    // Apply scale and opacity
    const scale = 0.5 + progress.current * 0.5
    groupRef.current.scale.setScalar(scale)

    // Slight upward drift as it reveals
    groupRef.current.position.y = (1 - progress.current) * 2
  })

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  )
}
