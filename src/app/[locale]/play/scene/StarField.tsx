'use client'

import { useRef, useEffect } from 'react'
import { BufferAttribute } from 'three'
import type { BufferGeometry, Points } from 'three'

function generateAccentPositions(count: number) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70
    pos[i * 3 + 1] = Math.random() * -90 + 15
    pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 8
  }
  return pos
}

function AccentStars({ count }: { count: number }) {
  const geometryRef = useRef<BufferGeometry>(null)
  const positionsRef = useRef(generateAccentPositions(count))

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'position',
        new BufferAttribute(positionsRef.current, 3)
      )
    }
  }, [])

  return (
    <points>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={0.12}
        color="#b8b0cc"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function generateStarData(count: number) {
  const pos = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 80
    pos[i * 3 + 1] = Math.random() * -100 + 20
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10
    siz[i] = Math.random() * 2 + 0.5
  }
  return [pos, siz] as const
}

export function StarField({ count = 3000 }: { count?: number }) {
  const pointsRef = useRef<Points>(null)
  const geometryRef = useRef<BufferGeometry>(null)
  const dataRef = useRef(generateStarData(count))

  useEffect(() => {
    if (geometryRef.current) {
      const [positions, sizes] = dataRef.current
      geometryRef.current.setAttribute(
        'position',
        new BufferAttribute(positions, 3)
      )
      geometryRef.current.setAttribute(
        'size',
        new BufferAttribute(sizes, 1)
      )
    }
  }, [])

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial
          size={0.04}
          color="#8b8bab"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <AccentStars count={Math.floor(count * 0.05)} />
    </>
  )
}
