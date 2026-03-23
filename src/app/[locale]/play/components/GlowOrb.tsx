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

export function GlowOrb({ position, label, color, size = 0.3 }: GlowOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        hovered ? 0.4 : 0.1,
        0.06
      )
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        hovered ? 0.15 : 0.05,
        0.06
      )
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
      <group position={position}>
        {/* Outer glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 1.6, 24, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05}
            depthWrite={false}
          />
        </mesh>
        {/* Main sphere — frosted glass */}
        <mesh
          ref={meshRef}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            transparent
            opacity={0.7}
            roughness={0.6}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {/* Label */}
        <Text
          position={[0, -size - 0.22, 0]}
          fontSize={0.1}
          color="#b8b0cc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}
