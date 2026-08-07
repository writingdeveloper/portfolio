import { load } from 'js-yaml'

export interface ParsedFrontmatter {
  /** Parsed YAML frontmatter. Always an object, never null. */
  data: Record<string, unknown>
  /** The document with the frontmatter block removed. */
  content: string
}

// The opening fence only counts at the very start of the file, alone on its
// line. `----` and `--- yaml` deliberately do not match: this repo's content is
// plain YAML frontmatter, and refusing the language-tag form keeps us from
// having to dispatch to other parsers.
const OPENING_FENCE = /^---[ \t]*\r?\n/
// `m` so a fence is only recognised at the start of a line — the closing fence
// of a block, not a `--- ` sitting inside a sentence.
const CLOSING_FENCE = /^---[ \t]*(?:\r?\n|$)/m

const BOM = 0xfeff

/**
 * Split a YAML-frontmatter document into its metadata and its body.
 *
 * Replaces `gray-matter`, which is pinned to js-yaml 3.x and so drags in
 * GHSA-5p4m-2wfm-xmqj (quadratic `!!omap` resolution) with no upgrade path —
 * the fix was never backported to 3.x and gray-matter binds the `safeLoad`
 * API that js-yaml 4 removed.
 *
 * Unquoted YAML dates resolve to `Date` objects, matching js-yaml's default
 * schema. Callers depend on that shape, so do not narrow the schema here.
 */
export function parseFrontmatter(source: string): ParsedFrontmatter {
  // A BOM would push the opening fence off byte 0 and make every post look
  // like it had no frontmatter at all.
  const text = source.charCodeAt(0) === BOM ? source.slice(1) : source

  const opening = OPENING_FENCE.exec(text)
  if (!opening) return { data: {}, content: text }

  const afterOpening = text.slice(opening[0].length)
  const closing = CLOSING_FENCE.exec(afterOpening)
  // An unterminated block is a malformed document, not a giant frontmatter.
  // Returning the text whole keeps the body readable instead of eating it.
  if (!closing) return { data: {}, content: text }

  // Only the first fence closes the block, so any later `---` — a horizontal
  // rule in the prose, say — stays in the body untouched.
  const block = afterOpening.slice(0, closing.index)
  const content = afterOpening.slice(closing.index + closing[0].length)

  const parsed = load(block)
  // An empty or comment-only block yields undefined and a bare scalar yields a
  // non-object; callers index straight into `data`, so neither may escape.
  const data =
    typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}

  return { data, content }
}
