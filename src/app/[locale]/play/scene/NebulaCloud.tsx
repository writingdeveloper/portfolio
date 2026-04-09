'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, AdditiveBlending } from 'three'
import type { Mesh, ShaderMaterial } from 'three'

interface NebulaProps {
  position: [number, number, number]
  color: string
  scale?: number
  speed?: number
}

function NebulaPatch({ position, color, scale = 10, speed = 0.1 }: NebulaProps) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const timeRef = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(color) },
      uOpacity: { value: 0.025 },
    }),
    [color]
  )

  useFrame((_, delta) => {
    if (meshRef.current) {
      timeRef.current += delta * speed
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = timeRef.current
      }
      meshRef.current.rotation.z += delta * 0.01
    }
  })

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      float n = fbm(vUv * 3.0 + uTime * 0.3);
      float n2 = fbm(vUv * 2.0 - uTime * 0.2 + 10.0);
      float shape = smoothstep(0.5, 0.0, dist);
      float alpha = shape * n * n2 * uOpacity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[scale, scale]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}

export function NebulaCloud() {
  return (
    <group>
      <NebulaPatch position={[-12, -10, -25]} color="#2d2b55" scale={35} speed={0.04} />
      <NebulaPatch position={[10, -35, -28]} color="#1e1b4b" scale={30} speed={0.05} />
      <NebulaPatch position={[-8, -55, -25]} color="#312e81" scale={32} speed={0.03} />
      <NebulaPatch position={[14, -20, -22]} color="#252347" scale={25} speed={0.06} />
      <NebulaPatch position={[-15, -45, -26]} color="#1a1840" scale={28} speed={0.04} />
    </group>
  )
}
