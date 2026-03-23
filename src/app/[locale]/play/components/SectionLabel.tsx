'use client'

import { Text } from '@react-three/drei'

interface SectionLabelProps {
  position: [number, number, number]
  label: string
}

export function SectionLabel({ position, label }: SectionLabelProps) {
  return (
    <Text
      position={position}
      fontSize={0.13}
      color="#7a7590"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.4}
    >
      {label.toUpperCase()}
    </Text>
  )
}
