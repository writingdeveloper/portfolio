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
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.8}
          color="#e8d5a3"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>

        <Text
          position={[0, -0.2, 0]}
          fontSize={0.28}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          {role}
        </Text>
      </Float>

      {/* Scroll hint - pulsing opacity */}
      <group>
        <Text
          ref={hintRef}
          position={[0, -3, 0]}
          fontSize={0.14}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
        >
          {scrollHint}
        </Text>
      </group>

      {/* Decorative gold line */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[2, 0.003]} />
        <meshBasicMaterial color="#c4a35a" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
