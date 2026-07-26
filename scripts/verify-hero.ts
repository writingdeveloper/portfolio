/**
 * Gate A for generated hero images: format, dimensions, file size, palette.
 *
 * Usage: npx tsx scripts/verify-hero.ts public/images/posts/*.webp
 * Exit code 0 when every file passes, 1 otherwise.
 */
import fs from 'fs'
import sharp from 'sharp'
import { summarizePixels, evaluatePalette } from '../src/lib/hero-palette'

const MIN_WIDTH = 1600
const TARGET_RATIO = 16 / 9
const RATIO_TOLERANCE = 0.02
const MAX_BYTES = 200 * 1024

interface FileVerdict {
  file: string
  ok: boolean
  failures: string[]
  detail: string
}

async function verifyFile(file: string): Promise<FileVerdict> {
  const failures: string[] = []

  const bytes = fs.statSync(file).size
  if (bytes > MAX_BYTES) {
    failures.push(`file size ${(bytes / 1024).toFixed(0)}KB exceeds the 200KB ceiling`)
  }

  const image = sharp(file)
  const meta = await image.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0

  if (meta.format !== 'webp') {
    failures.push(`format is ${meta.format}, expected webp`)
  }
  if (width < MIN_WIDTH) {
    failures.push(`width ${width}px is below the ${MIN_WIDTH}px floor`)
  }
  const ratio = height > 0 ? width / height : 0
  if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
    failures.push(`aspect ratio ${ratio.toFixed(3)} is not 16:9 (${TARGET_RATIO.toFixed(3)})`)
  }

  // Sample the image at full resolution: downscaling blends neighbouring
  // pixels and would dilute a thin accent line into the background.
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  const stats = summarizePixels(data, info.channels)
  const palette = evaluatePalette(stats)
  failures.push(...palette.failures)

  const detail =
    `${width}x${height} ${(bytes / 1024).toFixed(0)}KB | ` +
    `bg ${(palette.ratios.background * 100).toFixed(1)}% ` +
    `accent ${(palette.ratios.accent * 100).toFixed(2)}% ` +
    `stray ${(palette.ratios.stray * 100).toFixed(2)}%`

  return { file, ok: failures.length === 0, failures, detail }
}

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error('usage: npx tsx scripts/verify-hero.ts <file.webp...>')
    process.exit(1)
  }

  let failed = 0
  for (const file of files) {
    const verdict = await verifyFile(file)
    if (verdict.ok) {
      console.log(`PASS  ${file}  ${verdict.detail}`)
    } else {
      failed += 1
      console.log(`FAIL  ${file}  ${verdict.detail}`)
      for (const reason of verdict.failures) console.log(`        - ${reason}`)
    }
  }

  console.log(`\n${files.length - failed}/${files.length} passed`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
