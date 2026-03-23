'use client'

import { useRef, useState, useMemo } from 'react'
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

const borderVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const borderFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uHovered;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float border = smoothstep(0.0, 0.02, uv.x) * smoothstep(0.0, 0.02, uv.y)
                 * smoothstep(0.0, 0.02, 1.0 - uv.x) * smoothstep(0.0, 0.02, 1.0 - uv.y);
    float edge = 1.0 - border;
    float pulse = 0.15 + sin(uTime * 1.0) * 0.05 + uHovered * 0.25;
    float alpha = edge * pulse;
    vec3 col = uColor * (1.0 + uHovered * 0.5);
    gl_FragColor = vec4(col, alpha);
  }
`

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
  const borderRef = useRef<THREE.ShaderMaterial>(null)
  const innerGlowRef = useRef<THREE.ShaderMaterial>(null)
  const [hovered, setHovered] = useState(false)

  const borderUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(accentColor) },
      uTime: { value: 0 },
      uHovered: { value: 0 },
    }),
    [accentColor]
  )

  useFrame(({ clock }) => {
    if (borderRef.current) {
      borderRef.current.uniforms.uTime.value = clock.getElapsedTime()
      borderRef.current.uniforms.uHovered.value = THREE.MathUtils.lerp(
        borderRef.current.uniforms.uHovered.value,
        hovered ? 1 : 0,
        0.08
      )
    }
    if (innerGlowRef.current) {
      innerGlowRef.current.uniforms.uHovered.value = THREE.MathUtils.lerp(
        innerGlowRef.current.uniforms.uHovered.value,
        hovered ? 1 : 0,
        0.06
      )
    }
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.03} floatIntensity={floatIntensity * 0.5}>
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
            color="#12121e"
            transparent
            opacity={0.5}
            roughness={0.3}
            metalness={0.05}
            clearcoat={0.3}
            clearcoatRoughness={0.5}
          />
        </RoundedBox>

        {/* Animated glow border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[width + 0.1, height + 0.1]} />
          <shaderMaterial
            ref={borderRef}
            vertexShader={borderVertexShader}
            fragmentShader={borderFragmentShader}
            uniforms={borderUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, subtitle ? 0.2 : 0, 0.04]}
          fontSize={0.22}
          maxWidth={width - 0.6}
          textAlign="center"
          color="#c8c0d8"
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
            color="#8b82a8"
            anchorX="center"
            anchorY="middle"
          >
            {subtitle}
          </Text>
        )}

        {/* Corner decorations — thin L-shaped lines at each corner */}
        {([[-1, 1], [1, 1], [1, -1], [-1, -1]] as [number, number][]).map(([cx, cy], i) => (
          <group key={i} position={[cx * (width / 2 - 0.05), cy * (height / 2 - 0.05), 0.03]}>
            <mesh position={[cx * 0.12, 0, 0]}>
              <planeGeometry args={[0.25, 0.003]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.3} />
            </mesh>
            <mesh position={[0, cy * 0.12, 0]}>
              <planeGeometry args={[0.003, 0.25]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.3} />
            </mesh>
          </group>
        ))}

        {/* Inner gradient overlay — subtle top-to-bottom light */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[width - 0.2, height - 0.2]} />
          <shaderMaterial
            ref={innerGlowRef}
            transparent
            depthWrite={false}
            uniforms={{
              uHovered: { value: 0 },
              uColor: { value: new THREE.Color(accentColor) },
            }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uHovered;
              uniform vec3 uColor;
              varying vec2 vUv;
              void main() {
                float gradient = smoothstep(1.0, 0.0, vUv.y) * 0.06;
                float radial = (1.0 - length(vUv - 0.5) * 1.5) * uHovered * 0.1;
                float alpha = gradient + max(radial, 0.0);
                gl_FragColor = vec4(uColor, alpha);
              }
            `}
          />
        </mesh>
      </group>
    </Float>
  )
}
