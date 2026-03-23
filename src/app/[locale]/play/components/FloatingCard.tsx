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
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      const target = hovered ? 0.3 : 0.05
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, 0.08)
    }
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.1} floatIntensity={floatIntensity}>
      <group
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
          >
            {subtitle}
          </Text>
        )}
      </group>
    </Float>
  )
}
