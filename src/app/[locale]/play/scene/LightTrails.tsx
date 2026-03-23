'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTION_SPACING } from './CameraRig'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;

  void main() {
    float x = abs(vUv.x - 0.5) * 2.0;
    float line = smoothstep(0.1, 0.0, x);

    // Flowing light effect
    float flow = sin(vUv.y * 20.0 - uTime * 2.0) * 0.5 + 0.5;
    float flow2 = sin(vUv.y * 10.0 + uTime * 1.5) * 0.5 + 0.5;
    float brightness = flow * flow2;

    // Fade at edges
    float fadeY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(0.0, 0.05, 1.0 - vUv.y);

    vec3 color = mix(uColor1, uColor2, vUv.y + sin(uTime * 0.5) * 0.2);
    float alpha = line * brightness * fadeY * 0.08;

    gl_FragColor = vec4(color, alpha);
  }
`

export function LightTrails() {
  const trailRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#8b7355') },
      uColor2: { value: new THREE.Color('#5b5291') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (trailRef.current) {
      const mat = trailRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value += delta
    }
  })

  const totalHeight = SECTION_SPACING * 5

  return (
    <group>
      {/* Central trail */}
      <mesh ref={trailRef} position={[0, -totalHeight / 2 + 5, -3]}>
        <planeGeometry args={[0.15, totalHeight]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Side trails */}
      <mesh position={[-6, -totalHeight / 2 + 5, -5]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[0.08, totalHeight * 0.8]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[6, -totalHeight / 2 + 5, -4]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[0.06, totalHeight * 0.7]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
