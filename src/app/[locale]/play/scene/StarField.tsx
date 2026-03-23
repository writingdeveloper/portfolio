'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function StarField({ count = 2000 }: { count?: number }) {
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

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime() * 0.05
    pointsRef.current.rotation.y = t * 0.02
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={0.08}
        color="#c4b5fd"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
