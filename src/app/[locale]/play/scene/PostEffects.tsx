'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  )
}
