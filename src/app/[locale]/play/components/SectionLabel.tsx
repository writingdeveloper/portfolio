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
      fontSize={0.18}
      color="#c4a35a"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.3}
    >
      {label.toUpperCase()}
    </Text>
  )
}
