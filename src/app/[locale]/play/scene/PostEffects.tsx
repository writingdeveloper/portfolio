'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.95}
        mipmapBlur
      />
      <Vignette offset={0.4} darkness={0.5} />
    </EffectComposer>
  )
}
