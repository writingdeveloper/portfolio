'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DUST_COUNT = 200

export function AuroraParticles({ dustCount = DUST_COUNT }: { dustCount?: number }) {
  return (
    <group>
      <AuroraFog />
      <LightDust count={dustCount} />
    </group>
  )
}

function AuroraFog() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#4f46e5') },
      uColor2: { value: new THREE.Color('#7c6cf0') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * 0.15
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
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float n = snoise(vUv * 3.0 + uTime * 0.5);
      n = n * 0.5 + 0.5;
      float n2 = snoise(vUv * 1.5 - uTime * 0.3);
      n2 = n2 * 0.5 + 0.5;
      vec3 color = mix(uColor1, uColor2, n);
      float alpha = smoothstep(0.2, 0.8, n * n2) * 0.06;
      gl_FragColor = vec4(color, alpha);
    }
  `

  return (
    <>
      {[-30, 0, 30, 60].map((y, i) => (
        <mesh key={i} position={[0, y, -15]} rotation={[0, 0, i * 0.3]}>
          <planeGeometry args={[60, 20]} />
          <shaderMaterial
            ref={i === 0 ? materialRef : undefined}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

function generateParticles(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 40,
    y: Math.random() * -80 + 10,
    z: (Math.random() - 0.5) * 20 - 5,
    speed: 0.02 + Math.random() * 0.03,
    offset: Math.random() * Math.PI * 2,
    scale: 0.01 + Math.random() * 0.025,
  }))
}

function LightDust({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particlesRef = useRef(generateParticles(count))
  const particles = particlesRef.current

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 2,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 1.5,
        p.z + Math.sin(t * p.speed * 0.5) * 1
      )
      dummy.scale.setScalar(p.scale * (0.8 + Math.sin(t + p.offset) * 0.2))
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#9b8ec4" transparent opacity={0.3} />
    </instancedMesh>
  )
}
