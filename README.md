# Sadia Afrin — Portfolio

A single-page professional portfolio for **Sadia Afrin**, EEE graduate of BRAC University,
built from her CV. Light theme with a photoresist-pink accent, animated throughout, and
themed on electronics and VLSI.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies —
open `index.html` in a browser and it works.

## Files

```
index.html          markup and content — every section is here
css/fonts.css       the six IBM Plex faces, embedded as base64 woff2
css/styles.css      design tokens, layout, and all CSS animation
js/main.js          reveals, canvas, charts, and the three logic-lab demos
Sadia_CV.pdf        linked by the "Curriculum vitae" / "Download CV" buttons
```

## Deploying to GitHub Pages

1. Create a repository (for a personal site, name it `<username>.github.io`).
2. Commit all of the above to the default branch, keeping the folder structure.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io/` within a minute or two.

Nothing here needs Jekyll, a bundler, or an action.

## Sections

| # | Section | What's in it |
|---|---|---|
| 1 | Hero | Name power-on, routing canvas, pointer probe light, four headline figures |
| 2 | Profile | Positioning prose, three research domains, animated die illustration |
| 3 | Research | Impact panel, two charts, filterable list of all six publications |
| 4 | Projects | Both design projects, each with an animated system diagram |
| 5 | Digital logic lab | Three interactive demos — inverter, gate bench, 4-bit counter |
| 6 | Toolchain | HDL, EDA, programming and core competencies |
| 7 | Teaching | Three roles plus the Control Systems course taught |
| 8 | Journey | 2018–2026 timeline, degree records, honours, IELTS bands |
| 9 | Contact | Every channel, plus referees |

## Design notes

**Colour.** The accent is `#BE3468`, the magenta of positive photoresist on a silicon
wafer — the pink is drawn from the subject rather than applied to it. The ground is
`#FBF7F9`, a near-white carrying a faint rose bias; text is `#20191D`, a near-black
biased towards plum rather than pure grey. `--m1` (metal-1 blue) and `--diff`
(diffusion green) come from GDS layer conventions and are used **only** to encode data,
never as accents.

**Type.** The IBM Plex superfamily — Plex Sans for headings and interface, Plex Serif
for research prose, Plex Mono for designators, DOIs and figures. All six faces are
inlined as base64 `woff2`, so the page renders identically offline and behind a strict
content-security policy. No font CDN, no silent fallback.

**Layout.** The page is arranged as a chip floorplan: a fixed left pad-ring rail whose
pins energise as each block enters the viewport, content blocks as hard macros marked
with lithography-style corner fiducials, all on a fine routing grid.

**Motion.** A power-on sequence resolves the name letter by letter; a canvas behind the
hero routes Manhattan and 45° traces with current running along them; a probe light
tracks the pointer; blocks and section dividers draw themselves in on scroll; figures
count up and bars fill; project diagrams carry travelling signal packets; and the logic
lab runs live. All of it is disabled under `prefers-reduced-motion: reduce`, which also
swaps the inverter waveform for a static trace and stops the counter.

**Themes.** Light is the design and is what everyone sees by default — the complete
palette is defined on bare `:root`, and no `prefers-color-scheme` query can flip it.
A separately designed dark variant applies only when the visitor asks for it via the
theme control. Both palettes clear WCAG AA for body text.

## Editing the content

Everything is plain HTML — there is no templating layer. Sections are marked with
comment banners (`<!-- ===== RESEARCH ===== -->` and so on).

- **Publications** live in `#pubs`. Each `<article class="pub">` carries `data-year` and
  `data-rank` (author position); the filter buttons read both, so a new entry needs no
  JavaScript change. The dots before "First author" are one `<i>` per author, with
  `class="me"` on hers.
- **Charts and IELTS bars** are driven by `data-pct` on the fill element — the value is
  a percentage of the track, so update it alongside the printed number beside it.
- **Colours and spacing** are custom properties in the `:root` block at the top of
  `css/styles.css`. Change `--resist` and the accent updates everywhere including the
  canvas — `js/main.js` reads its colours from the same tokens.
- **Fonts** are `css/fonts.css`. Leave it alone unless you are changing typeface.

## A note on the logic lab

The three demos are real, not decorative. The inverter shows one PMOS and one NMOS
conducting in strict alternation, with a live waveform of A and Y. The gate bench draws
the correct IEEE symbol for each of the six gates — including the inversion bubble on
NAND, NOR and XNOR — and recomputes the truth table as you switch. The counter is four
bits feeding a seven-segment decoder, wrapping at sixteen states.
