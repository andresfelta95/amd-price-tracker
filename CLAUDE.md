# AMD Price Tracker

Next.js 14 (App Router) + TypeScript app that tracks Canadian prices on AMD Ryzen CPUs and Radeon GPUs across retailers, with price history, GPU variants, and price alerts. Styling is Tailwind CSS; charts use `recharts`; data lives in Postgres (`pg`).

## Project structure

- `src/app/` — App Router pages (`page.tsx`, `cpus/`, `gpus/`, `alerts/`, `product/[id]/`) and `globals.css`.
- `src/components/` — Shared UI (`Navbar`, `ProductCard`, `PriceChart`, `RetailerTable`, `AlertForm`, etc.).
- `src/lib/` — `db` (Postgres pool) and `types`.
- `db/` — schema / seed SQL.

## Commands

- `npm run dev` — local dev server.
- `npm run build` / `npm run start` — production build & serve.
- `npm run lint` — ESLint (`eslint-config-next`). Run before committing UI changes.

Data pages use `export const dynamic = 'force-dynamic'` and query Postgres directly in server components.

---

# UI & Visual Design Guidelines

These are mandatory for any page or component work. The goal is a polished, modern, consistent product — not just "functional." When you add or change UI, make it look intentional and designed.

## Design language

The product is a **dark, tech-forward dashboard** themed around AMD. Aim for the feel of a premium hardware/finance dashboard (think Linear, Vercel, Stripe dashboards): high contrast, calm surfaces, restrained accent color, generous spacing.

## Design tokens — use these, don't invent new colors

Defined in `tailwind.config.ts` and `globals.css`. Always prefer tokens over arbitrary hex values.

| Token | Value | Use for |
|---|---|---|
| `amd-dark` | `#1a1a2e` | Page background, footer |
| `amd-gray` | `#16213e` | Card/panel surfaces |
| `amd-red` | `#ED1C24` | Primary brand accent, primary buttons, key stats |
| `amd-accent` | `#e94560` | Secondary accent, highlights |
| `gray-700/800` | — | Borders, dividers, image wells |
| `gray-400/500` | — | Secondary / muted text |

Semantic colors: green (`green-400` on `green-500/20`) = in-stock / price drop; red = out-of-stock / price increase; CPU = orange badge, GPU = blue badge. Keep these consistent everywhere.

## Core rules

1. **Spacing & rhythm.** Use a consistent scale (Tailwind `4 / 6 / 8 / 12` for gaps and padding). Cards: `p-5` to `p-6`. Section vertical padding: `py-8` to `py-16`. Page content max width: `max-w-7xl mx-auto px-4`. Never cram elements together — whitespace is a feature.

2. **Typography hierarchy.** One clear hierarchy per page: page title `text-3xl`/`text-4xl font-bold`, section heading `text-2xl font-bold`, card title `text-lg font-semibold`, body `text-sm`/`text-base`, muted meta `text-xs text-gray-400/500`. Body copy on dark backgrounds should be `text-gray-300`/`text-gray-400`, never pure gray-on-gray that's hard to read. Keep the `Inter` font from the layout.

3. **Surfaces & depth.** Cards/panels: `bg-amd-gray border border-gray-700 rounded-xl`. Use `rounded-xl` (cards) / `rounded-lg` (buttons, inputs) consistently — don't mix random radii. Add subtle depth with `shadow-lg` and colored glows on hover (`hover:shadow-amd-red/10`), not heavy drop shadows.

4. **Interactive states are required.** Every clickable element needs a visible hover state and `transition-colors`/`transition-all duration-200`. Buttons, links, and cards must feel responsive. Primary button: `bg-amd-red hover:bg-red-700`. Secondary: `bg-gray-700 hover:bg-gray-600`. Card hover: lift border to `hover:border-amd-red` plus a soft glow. Add `focus-visible` rings on inputs and buttons for accessibility.

5. **Responsive by default.** Design mobile-first and add `sm:` / `lg:` breakpoints. Card grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (or `4`) with `gap-5`/`gap-6`. Never ship a layout that breaks below `640px`.

6. **Accent restraint.** `amd-red` is a spice, not a sauce — use it for one primary action, key stats, and active states. Most of the page is dark surfaces + neutral text. A page that's mostly red looks cheap.

7. **Empty, loading, and error states.** Don't leave blanks. Provide friendly empty states (icon + short message + a CTA), skeleton placeholders (`animate-pulse` on `bg-gray-800` blocks) while data loads, and clear inline error messaging. "Not Available" / "Out of Stock" should be styled as muted, not broken.

8. **Data display.** Prices: bold and prominent (`text-2xl font-bold`), with MSRP shown as `line-through text-gray-500` and discounts as a green badge. Tables (`RetailerTable`): zebra or hover row highlight, aligned numeric columns, sticky headers when long. Charts (`PriceChart` / recharts): match the dark theme — set grid/axis/tooltip colors to grays, use `amd-red`/`amd-accent` for series lines, format axes as CAD currency.

9. **Imagery & icons.** Product images sit in a neutral well (`bg-gray-800 rounded-lg`, `object-contain`). Provide an emoji/icon fallback when an image is missing (CPU 🔲 / GPU 🎮). Keep icon sizes consistent.

10. **Polish pass.** Before considering UI work done: check alignment, consistent spacing, hover/focus states, mobile layout, color contrast (text must be readable on its background), and that nothing uses default-looking unstyled HTML. Run `npm run lint`.

## Reusable patterns (match existing components)

- **Card:** `bg-amd-gray border border-gray-700 rounded-xl p-5 hover:border-amd-red transition-all duration-200 hover:shadow-lg hover:shadow-amd-red/10`
- **Badge:** `text-xs font-semibold px-2 py-0.5 rounded` + semantic color pair (e.g. `bg-green-500/20 text-green-400`).
- **Primary button:** `bg-amd-red hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors`
- **Section wrapper:** `max-w-7xl mx-auto px-4 py-12` with a `flex items-center justify-between mb-6` header row (heading + "View All →" link).
- **Hero:** `bg-gradient-to-br from-amd-dark via-amd-gray to-amd-dark`.

When building something new, first look at `ProductCard.tsx`, `src/app/page.tsx`, and `Navbar.tsx` for the established look, and reuse these patterns rather than inventing a new style.

## Anti-patterns — do not do these

- Unstyled or default-browser-looking elements (raw `<button>`, `<table>`, `<input>` with no Tailwind classes).
- Pure black/white on the dark theme, or low-contrast gray-on-gray text.
- Inconsistent radii, random one-off hex colors, or ad-hoc spacing values.
- Walls of text or cramped grids with no whitespace.
- Missing hover/focus states or layouts that break on mobile.
- Accent color overuse.
