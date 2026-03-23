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

function OrbitalRings() {
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  const ring3Ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.3
      ring1Ref.current.rotation.x = Math.sin(t * 0.1) * 0.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.2
      ring2Ref.current.rotation.y = Math.cos(t * 0.15) * 0.3
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.15
      ring3Ref.current.rotation.x = Math.sin(t * 0.2) * 0.15
    }
  })

  return (
    <group position={[0, 0.3, 0]}>
      <group ref={ring1Ref} rotation={[0.5, 0, 0]}>
        <mesh>
          <torusGeometry args={[3, 0.005, 16, 100]} />
          <meshBasicMaterial color="#c4a35a" transparent opacity={0.15} />
        </mesh>
        {/* Small orbiting light on ring 1 */}
        <mesh position={[3, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#e8d5a3" />
        </mesh>
      </group>
      <group ref={ring2Ref} rotation={[1.2, 0.5, 0]}>
        <mesh>
          <torusGeometry args={[3.5, 0.003, 16, 100]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.1} />
        </mesh>
        <mesh position={[3.5, 0, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#c4b5fd" />
        </mesh>
      </group>
      <group ref={ring3Ref} rotation={[0.8, 1.0, 0.3]}>
        <mesh>
          <torusGeometry args={[4, 0.002, 16, 100]} />
          <meshBasicMaterial color="#7c6cf0" transparent opacity={0.06} />
        </mesh>
      </group>
    </group>
  )
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
      <OrbitalRings />

      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.8}
          color="#d4cce0"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>

        <Text
          position={[0, -0.2, 0]}
          fontSize={0.28}
          color="#7a7590"
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
          color="#5a556b"
          anchorX="center"
          anchorY="middle"
        >
          {scrollHint}
        </Text>
      </group>

      {/* Decorative gold line */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[2, 0.003]} />
        <meshBasicMaterial color="#8b7355" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}
