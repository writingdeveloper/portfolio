/**
 * Convert a generated image into a committable hero: 1600x900 WebP under 200KB.
 *
 * Usage: npx tsx scripts/to-hero-webp.ts <source> <slug> [quality]
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const [source, slug, qualityArg] = process.argv.slice(2)
if (!source || !slug) {
  console.error('usage: npx tsx scripts/to-hero-webp.ts <source> <slug> [quality]')
  process.exit(1)
}

const quality = qualityArg ? Number(qualityArg) : 80

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'images', 'posts')
  fs.mkdirSync(outDir, { recursive: true })
  const out = path.join(outDir, `${slug}.webp`)

  await sharp(source).resize(1600, 900, { fit: 'cover' }).webp({ quality }).toFile(out)

  const kb = fs.statSync(out).size / 1024
  console.log(`${out}  ${kb.toFixed(0)}KB (quality ${quality})`)
  if (kb > 200) {
    console.log('over the 200KB ceiling — rerun with a lower quality')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
