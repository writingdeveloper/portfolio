# Font subsetting — closing the LCP bottleneck

2026-08-04. This resolves the follow-up left open in
[`performance-check.md`](./performance-check.md): a 2.0 MB `PretendardVariable.woff2`
that every page preloaded, measured there as the cause of a 2.5–2.6 s LCP.

Method is unchanged from that document, so the numbers are comparable:
`npx lighthouse <url> --only-categories=performance --preset=desktop --quiet`
against `npm run build && npm start` on localhost:3000.

## Result

| Page | Perf | LCP | CLS |
| --- | --- | --- | --- |
| `/` | 87 → **97** | 2.5 s → **1.2 s** | 0 → 0 |
| `/blog` | 87 → **98** | 2.5 s → **1.0 s** | 0 → 0.004 |
| `/projects` | 86 → **96** | 2.6 s → **1.2 s** | 0 → 0.042 |
| `/blog/rentrights-honest-estimator` | 87 → **97** | 2.5 s → **1.1 s** | 0 → 0 |

`performance-check.md` predicted "roughly 1.4 s and the mid-90s" from
subsetting alone. The extra came from a second change described below.

## What changed

### 1. Pretendard as unicode-range subsets

The obvious subset — scan the site's content, keep only those glyphs — was
rejected. Hangul has 11,172 possible syllables, so any future post could
introduce one the subset lacks and render tofu, and nothing in the build would
catch it.

Instead the site now ships Pretendard's upstream **dynamic subset**: the same
coverage split across 92 unicode-range faces, fetched by `scripts/fetch-pretendard-subset.ts`
into `public/fonts/pretendard/` with `src/app/pretendard.css` generated
alongside. Coverage is complete, so tofu is impossible; the browser simply
downloads only the ranges a page paints.

Individual subsets are 34 KB median, 43 KB largest. A Korean page pulls
~19 of them; an English page pulls 7.

Self-hosted rather than CDN-served on purpose: the site runs a strict
nonce-based CSP, and a third-party origin would add a DNS + TLS handshake to
the critical path, which is the opposite of the goal.

This also drops `next/font/local`. That was what preloaded the 2 MB file; the
subsets are discovered from CSS instead, so none of them are preloaded and none
of them block. `--font-pretendard` moved to `:root` in `globals.css` to replace
the class `next/font` used to generate.

### 2. Noto Sans KR removed

Measuring per family exposed a second Korean webfont still loading:

| Family | Downloaded | Preloaded |
| --- | --- | --- |
| Pretendard Variable | 19 files / 484 KB | 0 |
| **Noto Sans KR** | **6 files / 236 KB** | **3 files / 76 KB** |
| Inter | 1 / 47 KB | 47 KB |
| Bricolage Grotesque | 1 / 40 KB | 40 KB |
| Space Mono | 2 / 19 KB | 19 KB |

Noto Sans KR was added as *the* Korean face (FOLIO-22), before the Builder's
Ledger redesign put Pretendard ahead of it in `--font-sans`. Once Pretendard
covers Korean, Noto is a second Korean webfont racing the first — and 76 KB of
it was preloaded, competing with the LCP image.

Removing it takes preloaded font bytes from 182 KB to 106 KB. Korean still has
a floor without it: `--font-sans` already names Apple SD Gothic Neo and Malgun
Gothic, so the moment before a Pretendard subset lands is rendered by the
system Korean face rather than by a downloaded one.

## Tofu check

`/projects` uses **535 distinct Hangul syllables**, and `document.fonts.check()`
reports Pretendard Variable covering **all 535**. A rendered screenshot of the
Korean page confirms it visually. This is the expected outcome of keeping full
coverage rather than subsetting to observed glyphs.

## The CLS movement is real, understood, and inside the gate

`/projects` went from 0 to 0.042 and `/blog` from 0 to 0.004. Both pass the
≤0.1 gate, but the honest account is that exact-zero CLS was bought by
preloading the font, and that is what was given up.

It is worth being precise about the cause, because the obvious guess is wrong:

- Measured in a real browser with a `layout-shift` PerformanceObserver,
  `/projects` CLS is **0.0007**.
- With Pretendard blocked entirely, it is **0.0008** — i.e. unchanged. The
  Pretendard swap is not what moves it.
- The Lighthouse figure is identical before and after Noto Sans KR was removed
  (0.0418 / 0.0415 / 0.0415 across three runs, then 0.042), so that change did
  not cause it either.

What Lighthouse reports is the throttled case: under its simulated 10 Mbps
link, the tech-stack chip row and the link row inside each project card reflow
as the remaining faces arrive. That is inherent to swapping any webfont and
would need metric-matched `size-adjust` fallbacks to remove — which cannot be
done with one set of numbers, since Malgun Gothic and Apple SD Gothic Neo have
different metrics. Trading 0.042 of throttled CLS for 1.4 s of LCP is the right
side of that bargain, and both metrics sit in the green band.

## Maintenance

`npm run fetch:fonts` re-downloads the subsets and regenerates the CSS. It is
only needed when bumping `PRETENDARD_VERSION` in the script. The generated CSS
carries a do-not-edit header.
