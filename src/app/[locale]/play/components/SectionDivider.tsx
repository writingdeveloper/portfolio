'use client'

import { Text } from '@react-three/drei'

interface SectionDividerProps {
  position: [number, number, number]
  number: string
  width?: number
}

export function SectionDivider({ position, number, width = 8 }: SectionDividerProps) {
  return (
    <group position={position}>
      {/* Thin horizontal line */}
      <mesh>
        <planeGeometry args={[width, 0.002]} />
        <meshBasicMaterial color="#3a3650" transparent opacity={0.4} />
      </mesh>
      {/* Section number — small, to the left */}
      <Text
        position={[-width / 2 - 0.5, 0, 0]}
        fontSize={0.08}
        color="#4a4560"
        anchorX="right"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {number}
      </Text>
      {/* Small diamond at center of line */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.06, 0.06]} />
        <meshBasicMaterial color="#5a5575" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
