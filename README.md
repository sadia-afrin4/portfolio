# Sadia Afrin — Portfolio

A single-page professional portfolio for **Sadia Afrin**, EEE graduate of BRAC University,
built from her CV. Light theme with a photoresist-pink accent, animated throughout, and
themed on electronics and VLSI.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies —
open `index.html` in a browser and it works.

## Files

```
index.html          the portfolio — every section except the lab
lab.html            the Digital Logic Lab, reached from the chip card in About
css/fonts.css       the six IBM Plex faces, embedded as base64 woff2
css/styles.css      design tokens, layout, and all CSS animation — shared by both pages
js/main.js          reveals, canvas, charts, and the three logic-lab demos — shared by both pages
Sadia_CV.pdf        linked by the "Curriculum vitae" / "Download CV" buttons
.nojekyll           tells GitHub Pages to serve the files verbatim
```

Both pages load the same stylesheet and the same script. Each JavaScript module checks
for its own markup first and exits quietly when it isn't there, so the lab demos simply
don't run on the portfolio page and the publication filter doesn't run on the lab page.
The section navigation reads its targets from the nav links themselves, which is why one
script drives two different navigations without a per-page list.

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
| 5 | Interests | The three research domains as cards |
| 6 | Experience | The three roles on a timeline |
| 7 | Courses | Control Systems, taught as a Student Tutor |
| 8 | Education | 2018–2026 track plus degree cards with GPA dials |
| 9 | Skills | HDL, EDA, programming, tools, core competencies |
| 10 | Achievements | VC's List, Dean's List, IELTS bands |
| 11 | Contact | Every channel, plus referees |

`lab.html` holds the Digital Logic Lab — three interactive demos (CMOS inverter, gate
bench, 4-bit counter). It is reached from the animated chip card in the Profile section
and from the "Logic lab" pin in the navigation, and links back from its breadcrumb.

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

The seven demos are real, not decorative, and each sits one level above the last.

1. **MOSFET characteristics** — square-law n-channel model, Vth = 1 V. Both Vgs and Vds
   are adjustable; the operating point tracks across the curve family and the region
   readout switches between cut-off, triode and saturation at the correct boundary.
2. **CMOS inverter** — one PMOS and one NMOS conducting in strict alternation, with a
   live waveform of A and Y.
3. **Logic gate bench** — the correct IEEE symbol for each of six gates, including the
   inversion bubble on NAND, NOR and XNOR, with the truth table recomputed on switch.
4. **Karnaugh map** — a real minimiser: prime implicants by Quine–McCluskey, then an
   essential-first cover with a greedy remainder. Verified exhaustively against all
   65 536 possible four-variable functions.
5. **4-bit ripple-carry adder** — full-adder chain with the carry into each stage shown;
   verified against all 256 input pairs.
6. **D flip-flop** — edge-triggered, so Q only follows D on a clock rising edge. Three
   channel waveform: CLK, D, Q.
7. **4-bit counter and seven-segment decoder** — sixteen states, then it wraps.
