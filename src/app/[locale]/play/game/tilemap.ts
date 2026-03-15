export const TILE_SIZE = 32

export function isColliding(
  x: number,
  y: number,
  mapWidth: number,
  collisionSet: Set<number>,
  playerSize: number = 16,
): boolean {
  const halfSize = playerSize / 2
  const corners = [
    { x: x - halfSize, y: y - halfSize },
    { x: x + halfSize, y: y - halfSize },
    { x: x - halfSize, y: y + halfSize },
    { x: x + halfSize, y: y + halfSize },
  ]
  return corners.some((corner) => {
    const tileX = Math.floor(corner.x / TILE_SIZE)
    const tileY = Math.floor(corner.y / TILE_SIZE)
    if (tileX < 0 || tileY < 0 || tileX >= mapWidth) return true
    return collisionSet.has(tileY * mapWidth + tileX)
  })
}
