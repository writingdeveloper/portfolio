# Hero image generation report

Generated for the nine blog posts targeted by the visual-assets work. Every image
passed through two gates:

- **Gate A** — `npm run verify:hero -- <file>`. Machine check on format, dimensions,
  file size and palette share. Authoritative: a FAIL is a rejection, full stop.
- **Gate B** — a written, per-item description of what is actually visible in the
  candidate thumbnail, across six checks: figures/hands/faces, rendered lettering,
  cliché motifs, cropping or structural error, watermarks, and whether the shape
  metaphor connects to the post.

Model: `krea2` via image-studio. Requested size `1600x896`, converted to
`1600x900` WebP by `scripts/to-hero-webp.ts` at quality 80. No candidate needed a
quality reduction; all landed between 16KB and 32KB against the 200KB ceiling.

**Result: 8 heroes shipped out of 9 posts.** `building-my-homelab` ships without a
hero — both of its permitted attempts failed Gate A outright.

## Prompt template

All prompts followed one shape:

```
abstract geometric composition, <shape metaphor>, wide empty near-black void,
dark near-black background #0a0a0b, acid-green #c6f24e is the only colour and
stays a clear minority of the frame, thin precise lines, fine film grain,
layered flat planes, editorial graphic design, non-representational, no text,
no letters, no numbers, no people, no hands, no faces, no robots, no circuit
boards, no brains, no lightbulbs, no lens flare, no hexagonal HUD
```

After the first two posts the accent instruction was tightened to
`a few thin acid-green hairlines plus two or three compact solid acid-green
blocks`. This was a calibration against the palette gate's accent band (0.5% floor,
15% ceiling), not a relaxation of it: pure hairline compositions fell under the
floor, and full-bleed green bands blew past the ceiling.

---

## 1. building-dont-touch — ACCEPTED

**Shape metaphor:** a boundary and the exact moment something crosses it. The post
is about not noticing your own hand reaching your scalp, so the picture is about
the crossing, not the hand.

**Attempt 1** (4 candidates)

| # | seed | Gate B | Gate A |
|---|------|--------|--------|
| 1 | 53040818 | pass | not selected |
| 2 | 1989843740 | **fail (item 6)** | not reached |
| 3 | 1249717326 | pass | not selected |
| 4 | 1115142642 | pass | **PASS** |

- **C1** — 1: no figures, hands or faces, only a sphere edge and an arc. 2: no
  lettering anywhere. 3: no circuit board, brain, bulb, robot or hexagonal HUD; the
  bright pinch at the arc apex is a directional gradient, not a lens flare (no
  starburst, no ghosts). 4: the sphere is cut by the frame compositionally, no
  broken geometry. 5: no watermark or signature. 6: the arc reads as a boundary and
  a thin circle marks the crossing point, which connects. Not selected — the green
  sphere dominates the lower right and reads softer than C4.
- **C2** — 1–5 identical and clean. 6: **fail.** There is a boundary arc but nothing
  crossing it, so the moment the post is about is simply absent.
- **C3** — 1: none. 2: none. 3: the marker is a small hexagonal dot, which is a dot,
  not a hexagonal HUD overlay. 4: clean. 5: none. 6: a dot sitting on the boundary
  line reads as the crossing. Not selected — the olive dome fills most of the frame,
  leaving too little near-black for the palette gate.
- **C4** — 1: no figures, hands or faces. 2: no lettering or numerals. 3: no cliché
  motifs. 4: clean geometry, nothing truncated in error. 5: no watermark. 6: a thin
  circle outline marks a watched zone, a green wedge enters from the right, and a
  small dot sits exactly where the wedge crosses the circle. That is the post's
  detection moment.

**Gate A:** `PASS  1600x900 19KB | bg 72.1% accent 7.58% stray 0.02%`

**Decision:** accept C4 (seed 1115142642).

---

## 2. building-my-homelab — NO HERO

**Shape metaphor:** two strata at different depths, each anchored, joined by a
single line — one machine at home, one in the cloud, tied together over one private
network.

**Attempt 1** (4 candidates, seeds 962558773, 952028495, 83282105, 208116963)

All four rendered as two thin horizontal hairlines with small square caps.

- **C1** — 1: no figures. 2: no lettering. 3: no cliché motifs. 4: clean. 5: no
  watermark. 6: two anchored spans on separate strata read as the two-machine split.
  Gate B pass.
- **C2** — 1–5 clean. 6: the upper stratum is unlit grey, so only half the pairing is
  legible. Gate B pass, weak.
- **C3** — 1–5 clean. 6: same read as C1. Gate B pass.
- **C4** — 1–5 clean. 6: both spans bleed off the right edge with a single anchor
  each, so the paired-strata idea breaks. Gate B weak.

**Gate A, attempt 1:**

```
FAIL  accent 0.16% is below the 0.50% floor   (C1)
FAIL  accent 0.08% is below the 0.50% floor   (C2)
FAIL  accent 0.18% is below the 0.50% floor   (C3)
FAIL  accent 0.05% is below the 0.50% floor   (C4)
```

**Attempt 2 (the one permitted retry).** Prompt corrected for the failure cause: the
lower stratum was specified as one solid filled band rather than a hairline.

Seeds 1894254197, 2031507337, 614191140, 1420345073. All four: 1: no figures. 2: no
lettering. 3: no cliché motifs. 4: clean flat geometry. 5: no watermark. 6: two
strata joined by a vertical connector, which connects. Gate B pass on all four.

**Gate A, attempt 2:**

```
FAIL  bg 60.3% accent 39.12% exceeds the 15.00% ceiling
FAIL  bg 63.3% accent 35.98% exceeds the 15.00% ceiling
FAIL  bg 74.7% accent 24.49% exceeds the 15.00% ceiling
FAIL  bg 61.0% accent 38.40% exceeds the 15.00% ceiling
```

**Decision:** no hero. The correction overshot from under the accent floor to over
the accent ceiling, and the retry allowance is spent. `coverImage` stays empty in
both `content/posts/ko/building-my-homelab/index.mdx` and the `en` counterpart, and
`coverImageAlt` is left unset with it. A weak image would have been worse than none.

---

## 3. building-sobriety-app — ACCEPTED

**Shape metaphor:** a run of daily marks with one place where the run breaks and the
stake moves.

Seeds 1070658433, 1524777930, 872893764, 1324505028.

- **C1** — 1: no figures. 2: no lettering or numerals despite the ruler-like form.
  3: no cliché motifs. 4: clean. 5: no watermark. 6: a dense tick run, a gap, then a
  solid block, which reads as a broken streak. Gate B pass. Gate A **FAIL**, accent
  0.27% below the 0.50% floor.
- **C2** — 1–5 clean as above. 6: same read with wider tick spacing. Gate B pass.
  Gate A **FAIL**, accent 0.33% below the floor.
- **C3** — 1: no figures, hands or faces. 2: no lettering or numerals. 3: no circuit
  board, brain, bulb, robot, HUD or flare. 4: clean, nothing truncated in error.
  5: no watermark. 6: evenly spaced ticks hang from a horizontal edge and one tick
  position is filled by a solid block instead — the daily check-in and the day the
  stake moves. Gate B pass. Gate A **PASS**.
- **C4** — 1–5 clean. 6: two tick runs split by a clear gap, a strong broken-streak
  read. Gate B pass. Gate A **FAIL**, accent 0.43% below the floor.

**Gate A:** `PASS  1600x900 16KB | bg 98.9% accent 0.62% stray 0.13%`

**Decision:** accept C3 (seed 872893764). Three of four candidates were rejected by
the machine gate on accent share alone.

---

## 4. healframe-safety-pipeline — ACCEPTED

**Shape metaphor:** a channel narrowing through successive thresholds with the last
one closed — the fail-closed direction of the crisis-detection pipeline.

Seeds 4667242, 1336344184, 1976298666, 1496667574.

- **C1** — 1: no figures, hands or faces. 2: no lettering. 3: no cliché motifs.
  4: symmetric perspective, coherent, no distortion. 5: no watermark. 6: planes
  converge to a dark closed centre with two solid blocks flanking the throat, which
  is the narrowing-and-closing structure. Gate B pass.
- **C2** — 1–5 clean. 6: **fail.** Four ascending bars inside outlined boxes read as
  a bar chart of increasing values, not a channel with a shut final threshold.
- **C3** — 1–5 clean. 6: **fail.** The panels widen toward the right and the last one
  is fully open, inverting the metaphor; it also reads as a literal room.
- **C4** — 1–5 clean. 6: **fail.** Reads as a literal doorway in perspective, which
  breaks the non-representational direction.

**Gate A:** `PASS  1600x900 22KB | bg 96.9% accent 2.25% stray 0.06%`

**Decision:** accept C1 (seed 4667242). Three of four rejected at Gate B.

---

## 5. introducing-keystatic-cms — ACCEPTED

**Shape metaphor:** a grid where one pair fails to line up — the ko/en file pair the
CMS has no concept of.

Seeds 1307182115, 1898331101, 1880774020, 32055003.

- **C1** — 1: no figures. 2: no lettering. 3: no cliché motifs. 4: clean. 5: no
  watermark. 6: a descending stair of filled cells reads as movement through the
  grid rather than a pairing that fails to align. Gate B pass, Gate A also **PASS**
  (bg 88.4% accent 8.88% stray 0.05%), but not selected — the metaphor is a weaker
  match than C3.
- **C2** — 1–5 clean. 6: **fail.** A staircase of filled bars reads as a chart of
  increasing values, not grid alignment.
- **C3** — 1: no figures, hands or faces. 2: no lettering or numerals. 3: no cliché
  motifs. 4: clean orthogonal geometry. 5: no watermark. 6: two filled cells sit on
  opposite sides of a row line instead of lining up, with a third cell orphaned at
  the right — exactly the pairing problem the post describes. Gate B pass.
- **C4** — 1–5 clean. 6: **fail.** Three filled cells sit perfectly on one row, so
  nothing is misaligned and the post's problem is invisible.

**Gate A:** `PASS  1600x900 25KB | bg 90.0% accent 8.42% stray 0.10%`

**Decision:** accept C3 (seed 1880774020).

---

## 6. recent-builds-2026 — ACCEPTED

**Shape metaphor:** scattered pieces, a few of them gathered into one cluster — many
separate side projects, later consolidated.

Seeds 1329475757, 420387471, 1841187431, 984511201.

- **C1** — 1: no figures. 2: no lettering. 3: no cliché motifs. 5: no watermark.
  4: **fail.** Dark torn shards and half-formed squares are scattered around the
  cluster and read as rendering debris, not deliberate shapes.
- **C2** — 1–5 clean. 6: scattered squares linked into a cluster, which connects.
  Gate B pass. Gate A **FAIL**, accent 0.42% below the 0.50% floor.
- **C3** — 1: no figures, hands or faces. 2: no lettering. 3: no cliché motifs.
  4: clean, no debris. 5: no watermark. 6: loose outlined squares across the frame
  with a few joined by thin lines into one cluster. Gate B pass. Gate A **PASS**.
- **C4** — 1–5 clean. 6: only two filled squares and few links, so the gathering
  read is faint. Not selected; its accent share sits with the sparse candidates.

**Gate A:** `PASS  1600x900 20KB | bg 98.6% accent 0.53% stray 0.07%`

**Decision:** accept C3 (seed 1841187431). Margin over the accent floor is thin
(0.53% against 0.50%) but it is a pass, not a rounding.

---

## 7. rentrights-honest-estimator — ACCEPTED

**Shape metaphor:** overlapping bands with soft, uncertain edges and one crisp line
through them — an estimate that says out loud that it is an estimate.

Seeds 1441310804, 247712457, 1921961740, 3278775.

- **C1** — 1: no figures, hands or faces. 2: no lettering. 3: no cliché motifs; the
  soft bloom around the blocks is diffuse haze, with no starburst or ghosting, so it
  is not a lens flare. 4: bands run off the frame compositionally, no structural
  error. 5: no watermark. 6: grey bands taper and overlap while one crisp green line
  runs straight across them. Gate B pass. Gate A **PASS**.
- **C2** — 1–5 clean. 6: connects, but one large translucent slab covers most of the
  frame and flattens the overlap. Not selected.
- **C3** — 1–5 clean. 6: a single flat slab shows no overlap or convergence. Gate A
  also **PASS** (bg 67.5% accent 8.13% stray 0.09%) but not selected on metaphor.
- **C4** — 1–5 clean. 6: crossing blades cover nearly the whole frame and the crisp
  estimate line is lost among them. Not selected.

**Gate A:** `PASS  1600x900 22KB | bg 62.3% accent 7.59% stray 0.12%`

**Decision:** accept C1 (seed 1441310804).

---

## 8. studying-english-with-chatgpt — ACCEPTED

**Shape metaphor:** two parallel tracks with transfers shuttling between them —
writing in one language, rewriting in the other, checking back.

Seeds 809014259, 1602774248, 1613669868, 1976301122.

- **C1** — 1: no figures. 2: no lettering. 3: no cliché motifs. 4: clean. 5: no
  watermark. 6: two hatched tracks with green segments between them, though the
  segments read as static rather than moving. Gate A also **PASS** but with stray
  colour at 1.49%, an order of magnitude above the accepted candidate. Not selected.
- **C2** — 1–5 clean. 6: **fail.** Rendered as two shelves in perspective with blocks
  resting on them, a literal object that loses the back-and-forth.
- **C3** — 1: no figures, hands or faces. 2: no lettering or numerals. 3: no cliché
  motifs. 4: clean. 5: no watermark. 6: two hatched horizontal tracks joined by
  stepped forms that cross from one to the other and back. Gate B pass.
- **C4** — 1–5 clean. 6: full-width bright rails bracket both tracks and pull
  attention off the transfers. Not selected.

**Gate A:** `PASS  1600x900 32KB | bg 94.8% accent 3.24% stray 0.11%`

**Decision:** accept C3 (seed 1613669868).

---

## 9. thoughts-about-giving-back — ACCEPTED

**Shape metaphor:** a relay that only moves forward — what you received is passed to
the next person, not repaid to the giver.

Seeds 1799658618, 1698753745, 498561729, 1515648741.

- **C1** — 1: no figures. 2: no lettering. 3: no cliché motifs. 4: clean. 5: no
  watermark. 6: **weak.** The arcs converge into one notched mass, so the handing
  forward is not legible. Rejected.
- **C2** — 1: no figures, hands or faces. 2: no lettering or numerals. 3: no cliché
  motifs. 4: clean. 5: no watermark. 6: five blocks step along a family of arcs, each
  starting where the previous ends, none turning back. Gate B pass.
- **C3** — 1–5 clean. 6: **weak.** Three blocks sit in a static row inside nested
  rings with no handoff. Rejected.
- **C4** — 1–5 clean. 6: **weak.** A sawtooth ribbon repeats with no clear direction
  of travel. Rejected.

**Gate A:** `PASS  1600x900 31KB | bg 95.1% accent 3.44% stray 0.06%`

**Decision:** accept C2 (seed 1698753745).

---

## Tally

| Post | Attempts | Candidates | Gate B rejects | Gate A rejects | Shipped |
|---|---|---|---|---|---|
| building-dont-touch | 1 | 4 | 1 | 0 | yes |
| building-my-homelab | 2 | 8 | 0 | 8 | **no** |
| building-sobriety-app | 1 | 4 | 0 | 3 | yes |
| healframe-safety-pipeline | 1 | 4 | 3 | 0 | yes |
| introducing-keystatic-cms | 1 | 4 | 2 | 0 | yes |
| recent-builds-2026 | 1 | 4 | 1 | 1 | yes |
| rentrights-honest-estimator | 1 | 4 | 0 | 0 | yes |
| studying-english-with-chatgpt | 1 | 4 | 1 | 0 | yes |
| thoughts-about-giving-back | 1 | 4 | 3 | 0 | yes |

40 candidates generated, 8 accepted. Every candidate carries a recorded verdict in
the image-studio gallery via `verify_asset`.

## Alt text

Every post with a `coverImage` also has a non-empty `coverImageAlt` in both `ko` and
`en`, written in that locale's language and describing only what is visible in the
image. `building-my-homelab` has neither, which is correct: an empty `alt` on a real
image would tell screen readers the image is decorative.
