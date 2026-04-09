'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { MathUtils } from 'three'

export const SECTION_SPACING = 15
const SECTION_COUNT = 5
const TOTAL_DISTANCE = (SECTION_COUNT - 1) * SECTION_SPACING

interface CameraRigProps {
  onSectionChange?: (index: number) => void
  scrollRef?: React.MutableRefObject<ReturnType<typeof useScroll> | null>
}

export function CameraRig({ onSectionChange, scrollRef }: CameraRigProps) {
  const scroll = useScroll()
  const lastSection = useRef(0)

  useEffect(() => {
    if (scrollRef) scrollRef.current = scroll
  }, [scroll, scrollRef])

  useFrame((state) => {
    const offset = scroll.offset
    const targetY = -offset * TOTAL_DISTANCE

    // Smooth camera Y movement
    state.camera.position.y = MathUtils.lerp(
      state.camera.position.y,
      targetY,
      0.05
    )

    // Subtle mouse parallax
    const mouseX = state.pointer.x * 0.3
    const mouseY = state.pointer.y * 0.2
    state.camera.position.x = MathUtils.lerp(
      state.camera.position.x,
      mouseX,
      0.05
    )
    state.camera.lookAt(mouseX * 0.5, state.camera.position.y + mouseY, 0)

    // Track active section
    const sectionIndex = Math.min(
      Math.round(offset * (SECTION_COUNT - 1)),
      SECTION_COUNT - 1
    )
    if (sectionIndex !== lastSection.current) {
      lastSection.current = sectionIndex
      onSectionChange?.(sectionIndex)
    }
  })

  return null
}
