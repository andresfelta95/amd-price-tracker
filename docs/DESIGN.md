# Design system — "Silicon telemetry console"

Redesigned 2026-07-10 with the web-design skill. One idea the whole site
orbits: **a hardware datasheet brought to life** — engineering-grade mono
price readouts on a die-black surface, one signal-red trace. If a new element
wouldn't look at home on a component datasheet or an oscilloscope bezel, it
doesn't belong.

## Type

| Role | Face | Usage |
|------|------|-------|
| Display | **Chakra Petch** (500/600/700) | Headings, wordmark, buttons — uppercase, wide tracking |
| Body | **IBM Plex Sans** (400/500/600) | Prose, descriptions |
| Data | **IBM Plex Mono** (400/500/600) | ALL numbers/prices, nav links, kickers, labels, badges |

Loaded via `next/font` in `src/app/layout.tsx`, exposed as CSS vars
(`--font-display/-sans/-mono`) and Tailwind `font-display/sans/mono`.
`font-feature-settings: "tnum"` is global so prices align in columns.
**Rule: a price never appears in the sans face.**

## Color tokens

Defined in `src/app/globals.css`, mapped in `tailwind.config.ts`:

| Token | Tailwind | Value | Role |
|-------|----------|-------|------|
| `--bg` | `bg-base` | `#0b0b0e` | Page (die black) |
| `--surface` | `bg-panel` | `#131318` | Cards/panels |
| `--surface-2` | `bg-raised` | `#1a1a21` | Raised wells, inputs |
| `--line` / `--line-strong` | `border-line(-strong)` | `#26262e` / `#3a3a45` | Borders |
| `--text` / `--text-dim` / `--text-faint` | `text-ink(-dim/-faint)` | — | Text ramp |
| `--signal` | `bg/border-signal` | `#e8281f` | THE accent — fills, buttons, chart trace |
| `--signal-text` | `text-signal-text` | `#ff6b5e` | Red for text on dark (AA) |
| `--gain` | `text-gain` | `#4ade80` | Price drops, in-stock, "best" |
| `--loss` | `text-loss` | `#fbbf24` | Warnings/errors only |

Legacy `amd-red/amd-dark/amd-gray/amd-accent` classes alias into the new
palette — old class names won't break, but don't write new ones.
60/30/10: black surfaces / ink text / signal red. Green and amber are
semantic only, never decorative.

## Recurring patterns

- **Kicker**: every section/panel opens with a mono micro-label —
  `// 01 · DEALS`, `// TRACE`, `// SOURCES`, `// ARM ALERT` — in
  `text-signal-text`, `tracking-[0.2em]`, with the `//` in `text-ink-faint`.
- **Corner brackets** (`.corner-frame` in globals.css): two viewfinder ticks
  on cards that turn signal-red on hover/focus — the "probe lock" signature.
- **Stat strips**: `<dl>` grids with `gap-px` over `bg-line` so the border is
  the grid, mono values, uppercase faint labels.
- **Ticker tape** (home hero): every tracked product + lowest CAD price on a
  40s CSS marquee (`.ticker-track`), duplicated strip for a seamless loop,
  pauses on hover, wraps statically under `prefers-reduced-motion`.
- **Atmosphere** (`.console-bg` on `<body>`): 48px plotting grid + red glow
  bleeding from the top edge. Never use flat `#000`.
- **Motion**: hero staggers in via `.reveal .reveal-2/3/4`; hovers are
  150–250ms ease-out lifts (`hover:-translate-y-0.5/-1`) with a red shadow
  `hover:shadow-[0_8px_28px_-8px_var(--signal)]` on primary buttons. All
  motion is disabled under `prefers-reduced-motion`.
- **Stock language**: `● in stock` / `○ out of stock` in mono — dots, not
  pills. Discounts read `▼26%` in gain green.

## Craft floor

- `:focus-visible` = 2px `--signal-text` outline (global; never remove).
- Radius scale is deliberately tight: 4px default / 6px md — sharp corners
  are part of the instrument look. No `rounded-xl`+.
- Charts (Recharts) pull colors from the CSS vars (`var(--signal)`,
  `var(--line)`, `var(--text-dim)`) and mono font — never hex literals.
- Brand colors in `GpuVariantsPanel` (ASUS/MSI/Sapphire…) are the one
  sanctioned exception to the single-accent rule: they identify third
  parties, not us.

## Deploy

Code is baked into the image (no bind mount):

```bash
docker compose -f /home/server_pc/docker/compose/amd-price-tracker.yml build amd-price-tracker
docker compose -f /home/server_pc/docker/compose/amd-price-tracker.yml up -d --force-recreate amd-price-tracker
```
