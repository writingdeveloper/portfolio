'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'

interface GlowOrbProps {
  position: [number, number, number]
  label: string
  color: string
  size?: number
}

const orbVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const orbFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHovered;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    // Fresnel effect
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

    // Holographic color shift
    float shift = sin(vUv.y * 10.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 holoColor1 = uColor;
    vec3 holoColor2 = uColor * vec3(0.5, 1.2, 1.5);
    vec3 holoColor = mix(holoColor1, holoColor2, shift);

    // Scanline effect
    float scanline = sin(vWorldPosition.y * 30.0 + uTime * 3.0) * 0.03;

    // Combine
    float glow = fresnel * (0.6 + uHovered * 0.6);
    vec3 finalColor = holoColor * (0.4 + glow) + scanline;
    float alpha = 0.7 + fresnel * 0.3 + uHovered * 0.1;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function GlowOrb({ position, label, color, size = 0.35 }: GlowOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uHovered: { value: 0 },
    }),
    [color]
  )

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uHovered.value = THREE.MathUtils.lerp(
      uniforms.uHovered.value,
      hovered ? 1 : 0,
      0.08
    )
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => {
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'default'
          }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <shaderMaterial
            vertexShader={orbVertexShader}
            fragmentShader={orbFragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>
        {/* Outer glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size + 0.08, 0.005, 8, 50]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
        <Text
          position={[0, -size - 0.25, 0]}
          fontSize={0.12}
          color="#e8d5a3"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}
