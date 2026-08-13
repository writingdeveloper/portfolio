/**
 * The record the studio wrote while producing the /studio page's assets.
 *
 * Every value in this file was copied by hand out of a real generation
 * response — the seeds, the gate metrics, the asset ids, the review verdicts
 * and the notes attached to them. The page's whole argument is that these are
 * the machine's own numbers rather than decoration, so the rule here is
 * absolute: **if a value cannot be traced back to a response, it does not
 * belong in this file.** No rounding for looks, no plausible filler, and no
 * hop added before its artifact actually exists.
 *
 * Values that are database enums or model names (`approved`, `krea2`) stay
 * verbatim rather than being translated. They are what is stored, and the
 * point of showing them is that they are what is stored.
 *
 * The artifacts themselves are hand-picked files committed under `public/`.
 * The portfolio never reads the studio library at runtime or build time — no
 * feed, no path import, no thumbnail proxy — because that library is private.
 * See docs/superpowers/specs/2026-08-12-studio-page-design.md.
 */

/**
 * Which row label to look up under the `studio.record` message namespace.
 *
 * Kept in lockstep with the keys that actually exist there. Adding a variant
 * here without adding the label in both messages files makes the page throw at
 * render, so the union is deliberately narrow rather than aspirational.
 */
export type StudioRecordKey = 'model' | 'assetId' | 'seed' | 'gate' | 'verdict' | 'resolution'

export interface StudioRecordRow {
  key: StudioRecordKey
  /** Language-neutral — a model name, an id, a number, an enum. Never prose. */
  value: string
}

export interface StudioHop {
  /** Which hop's heading, body and alt text to read from `studio.hops`. */
  key: 'image'
  src: string
  width: number
  height: number
  record: StudioRecordRow[]
}

export interface StudioReject {
  src: string
  width: number
  height: number
  seed: string
  /** Which note to read from `studio.rejects`. The note is real; it is
   *  translated rather than shown verbatim because the page is bilingual. */
  noteKey: 'r1' | 'r2'
}

/**
 * Every image on this page is 640×640 for the same reason.
 *
 * These are not exports of the full-resolution assets — they are the review
 * thumbnails, the exact frames the agent was handed and ruled on. That is the
 * page's claim, so shipping a prettier render instead would quietly break it.
 * The originals are 1024×1024 and stay on the machine that made them.
 */
const REVIEW_THUMB = { width: 640, height: 640 } as const

export const WALK_HOPS: StudioHop[] = [
  {
    key: 'image',
    src: '/images/studio/stamp-source.webp',
    ...REVIEW_THUMB,
    record: [
      { key: 'model', value: 'krea2' },
      { key: 'assetId', value: '2d2e9dc0' },
      { key: 'seed', value: '601255332' },
      { key: 'resolution', value: '1024 × 1024' },
      { key: 'gate', value: 'passed · stddev 69.525' },
      { key: 'verdict', value: 'approved' },
    ],
  },
]

export const WALK_REJECTS: StudioReject[] = [
  {
    src: '/images/studio/stamp-rejected-1.webp',
    ...REVIEW_THUMB,
    seed: '786101337',
    noteKey: 'r1',
  },
  {
    src: '/images/studio/stamp-rejected-2.webp',
    ...REVIEW_THUMB,
    seed: '1974325485',
    noteKey: 'r2',
  },
]
