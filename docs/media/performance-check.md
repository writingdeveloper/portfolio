# Performance check — visual assets

Measured after wiring 17 project screenshots and 8 blog hero images into the site.

- Tool: `npx lighthouse <url> --only-categories=performance --preset=desktop --quiet --chrome-flags="--headless"`
- Build: `npm run build && npm start` (production mode, localhost:3000)
- Date: 2026-07-26
- Gate: CLS ≤ 0.1 and LCP ≤ 2.5 s

## Results (shipping build)

| Page | Perf | LCP | CLS | FCP | Speed Index | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 87 | 2.5 s | 0 | 0.4 s | 0.6 s | 0 ms |
| `/blog` | 87 | 2.5 s | 0 | 0.4 s | 0.6 s | 0 ms |
| `/projects` | 86 | 2.6 s | 0 | 0.6 s | 0.8 s | 0 ms |
| `/blog/rentrights-honest-estimator` | 87 | 2.5 s | 0 | 0.4 s | 0.7 s | 0 ms |

**CLS is 0 on every page.** Both card components reserve the image box before
load (`aspect-[16/10]` on `ProjectCard`, `aspect-video` on `PostCard`), so
images never push layout.

Note on the LCP column: Lighthouse's desktop preset reports a *simulated*
(Lantern) LCP for a throttled 10 Mbps / 40 ms link. The **observed** LCP in the
same traces is 245–330 ms. The numbers above are the conservative simulated
figures, which is what the gate is judged against.

## Regression found and fixed: images were lazy-loaded above the fold

The first run showed `/blog` at **3.0 s** and `/projects` at **2.9 s** LCP. In
both traces the LCP element was the first card image, carrying
`loading="lazy"` — the browser deferred the one image it needed soonest.

The `/projects` LCP phase breakdown made the cost explicit:

| Phase | Before | After |
| --- | --- | --- |
| TTFB | 123 ms | 123 ms |
| Load Delay | **1673 ms** | **246 ms** |
| Load Time | 63 ms | 47 ms |

Fix: added an opt-in `priority` prop to `ProjectCard` and `PostCard`, set only
for the cards in the first grid row — `index < 2` on the 2-up projects grid,
`index < 3` on the 3-up blog grid. Applying it to the whole grid would put every
image in the preload queue and undo the gain, so it is deliberately scoped to
the first row. `ProjectCard`'s `sizes` was also tightened from a flat `50vw` to
`(max-width: 640px) 100vw, (max-width: 1480px) 47vw, 660px`, which matches the
real column width inside the 1400 px container.

Result: `/blog` 3.0 s → 2.5 s, `/projects` 2.9 s → 2.6 s.

## Remaining 2.6 s on /projects is not caused by the images

`/projects` sits 0.1 s over the gate. Four measurements isolate the cause.

1. **Same build with the screenshot data removed** (`content/projects.json`
   reverted, so `/projects` renders zero images): LCP **2.5–2.6 s**, CLS 0. The
   page was already at the threshold before a single screenshot existed.
2. **The image-free homepage** shows the same shape: LCP 2.5 s with a *text*
   element as the LCP node and ~2.3 s of Render Delay.
3. **Blocking ads and analytics** (`*googlesyndication*`, `*doubleclick*`,
   `*adtrafficquality*`, `*googletagmanager*`): LCP stays **2.7 s**. Not ads.
4. **Blocking the Pretendard font** (`*PretendardVariable*`): LCP drops to
   **1.4 s** and the performance score rises to **94**.

The cause is `public/fonts/PretendardVariable.woff2` — a **2.0 MB** self-hosted
variable font that Lantern charges against the render path (~1.6 s of simulated
transfer at 10 Mbps on its own). It predates this work (added in the Builder's
Ledger redesign) and affects every page, including image-free ones.

After the `priority` fix, the LCP image on `/projects` transfers 13 KB and
loads in 47 ms. There is no image-side lever left; the page cannot reach 2.5 s
while that font is on the critical path.

### Recommended follow-up (out of scope here) — since done

> **Resolved 2026-08-04.** See [`font-subsetting.md`](./font-subsetting.md).
> The font now ships as unicode-range subsets and Noto Sans KR (a redundant
> second Korean face) was dropped: every page below is now 96–98 with LCP
> 1.0–1.2 s. The prediction in this section held.


Subset `PretendardVariable.woff2`. A Latin + Hangul subset typically lands
around 300–500 KB, which the experiment above suggests would take `/projects`
to roughly 1.4 s and lift every page's score to the mid-90s. This was not done
as part of the visual-assets work: Hangul is combinatorial (11,172 possible
syllables), so an over-aggressive subset ships tofu in Korean posts, and the
font is a site-wide typography decision rather than an image concern.

## Verdict

- **CLS: pass.** 0 on all four pages, well under the 0.1 gate.
- **LCP: pass on 3 of 4 pages** (2.5 s). `/projects` is 0.1 s over at 2.6 s.
- **The images did not cost the site its performance.** Measured against the
  identical build with screenshots removed, they add ~0.1 s of simulated LCP and
  no layout shift. The one genuine image defect — lazy-loading the above-the-fold
  LCP image — was found and fixed, recovering 1.4 s of load delay. The residual
  gap on `/projects` traces to a pre-existing 2 MB font, with the measurements
  above to prove it.
