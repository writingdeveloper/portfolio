/**
 * X position for the Nth of `total` category clusters in the /play 3D
 * skills scene, evenly spaced and centered on x=0.
 */
export function categoryX(index: number, total: number, spacing = 5): number {
  return (index - (total - 1) / 2) * spacing
}
