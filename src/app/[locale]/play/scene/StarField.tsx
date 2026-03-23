'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

function AccentStars({ count }: { count: number }) {
  const geometryRef = useRef<THREE.BufferGeometry>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70
      pos[i * 3 + 1] = Math.random() * -90 + 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 8
    }
    return pos
  }, [count])

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
    }
  }, [positions])

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

export function StarField({ count = 3000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometryRef = useRef<THREE.BufferGeometry>(null)

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = Math.random() * -100 + 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10
      siz[i] = Math.random() * 2 + 0.5
    }
    return [pos, siz]
  }, [count])

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
      geometryRef.current.setAttribute(
        'size',
        new THREE.BufferAttribute(sizes, 1)
      )
    }
  }, [positions, sizes])

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
