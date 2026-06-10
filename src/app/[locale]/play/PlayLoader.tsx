'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode } from 'react'
import type { Project, Skill, TimelineItem, PostSummary } from '@/types/content'

interface PlayLoaderProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

// Load the heavy WebGL client only in the browser. While the chunk loads we
// render nothing (`loading: null`) instead of an opaque overlay, so the
// always-visible PlaySemanticFallback shows through — the user reads real
// content immediately rather than staring at a "Loading" black screen that
// may never resolve. (The WebGL capability check + the decision to render the
// Canvas live inside PlayClient, which is client-only.)
const PlayClient = dynamic(() => import('./PlayClient').then((m) => m.PlayClient), {
  ssr: false,
  loading: () => null,
})

// If the 3D layer throws — a ChunkLoadError on a flaky/stale deploy, a WebGL
// context failure, or a runtime error inside a scene — swallow it and render
// nothing, leaving the semantic fallback as the experience. Without this an
// unhandled error would blank the whole route; here it degrades silently.
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function PlayLoader(props: PlayLoaderProps) {
  return (
    <SceneErrorBoundary>
      <PlayClient {...props} />
    </SceneErrorBoundary>
  )
}
