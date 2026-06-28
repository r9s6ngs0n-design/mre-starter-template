# token-map.md — v0/shadcn defaults → MR ESTATES tokens

> **Setup reality:** there is **no `tailwind.config.js`**. This project uses **Tailwind v4
> CSS-first config**. Tokens are CSS variables defined in `app/globals.css` (`:root` +
> `@theme inline`). The file `styles/globals.css` is an **orphaned stock shadcn neutral theme
> (the v0 default)** and is *not imported anywhere* — only `app/globals.css` is loaded
> (`app/layout.tsx`). So "v0 default token" below = the value in `styles/globals.css`; "this
> project" = the override in `app/globals.css`.
>
> **Two usable layers in this project:**
> 1. **Semantic tokens** (shadcn-compatible): `bg-background`, `text-foreground`, `bg-primary`,
>    `bg-muted`, `border`, … — these still exist and are remapped to brand colours.
> 2. **Raw brand utilities** (what the editorial code actually uses most): `bg-forest-deep`,
>    `text-cream`, `text-ink`, `text-gold`, `border-border`, … registered via `@theme inline`.
>
> The user's conceptual names (canvas / panel / band / primary / accent / ink / muted) map to the
> real tokens in the **"Conceptual name"** column.

---

## ⭐ RULE 0 — Token names are the contract; colours are per-client examples

Everything below is stated in **token names** (`primary`, `accent`, `band`, `canvas`, `panel`,
`ink`, `muted`, `gold-text`/`accent-text`). These names are **permanent and reusable across every
client**. Concrete colours (forest-deep, gold, cream, …) are **only this client's current
values** and appear strictly as parenthetical examples. The relationships are the rule; the
colours are not.

## ⭐ RULE 1 — CTA / attention colour is INVERTED vs shadcn (read first)

The generic shadcn assumption **"`primary` = the CTA colour"** does **not** hold in this system:

- **`accent` is the attention / "do this" colour** — the CTA pop, the jewel.
- **`primary` is the brand BASE colour**, not the CTA pop.
- **`primary` and `band` resolve to the SAME value.** Therefore **a CTA placed on a `band`
  background MUST use `accent`, never `primary`** — a `primary` CTA on a `band` surface is
  invisible (same colour as the background).
- When `accent` is used as **text on a light background**, use the **`accent-text`
  (`gold-text`) token** to meet contrast. Reserve **solid `accent` fills** for CTA / jewel
  elements (icons, borders, fills) — not for running text.

```
shadcn habit          →  THIS system
─────────────────────────────────────────────
primary = CTA pop     →  accent = CTA pop;  primary = brand base (== band)
CTA on dark hero      →  use accent fill (primary would vanish into band)
accent as text        →  use accent-text token (raw accent fails contrast on canvas)
```

> Example for the current client (MR Estates): `primary` / `band` = forest-deep, `accent` = gold,
> `accent-text` = gold-text, `canvas` = cream. **These values change per client; the
> relationships above do not.**

## ⭐ RULE 2 — Token-system seam (v0 v3 → this project's v4 `@theme`)

- This project is **Tailwind v4, CSS-first**: tokens live in an **`@theme` block in
  `app/globals.css`**. There is **no `tailwind.config`**.
- v0 typically emits **Tailwind v3-style** output: a `tailwind.config(.js/.ts)` plus tokens
  referenced as `hsl(var(--x))`.
- **Mapping class NAMES is not enough.** v0's token *definitions* must be translated **into this
  project's `@theme` block**. The merge step **rewrites the token system**, not just renames
  classes:
  - move/translate v0 `tailwind.config` `theme.extend.colors` → `@theme { --color-*: … }`
  - drop the `hsl(var(--x))` indirection; this project defines colours directly on the vars
  - reconcile any v0 token to a token NAME in this file before assigning a colour value.

## ⭐ RULE 3 — Dark mode is dead code here

- There is **no `.dark` block**, so **`dark:` utilities are no-ops** in this project — they are
  dead code.
- The merge step should **strip `dark:` variants**. "Dark" sections are produced with an
  **explicit `band` background** (`bg-band` → the dark brand value, e.g. `bg-forest-deep
  text-cream`), not via a `dark:` class.

---

## Brand palette (raw values, `app/globals.css :root`)

| CSS var | Hex | Tailwind utility | Conceptual name | Intended use |
|---|---|---|---|---|
| `--forest-deep` | `#0b2e22` | `*-forest-deep` | **band** / **primary** | dominant brand colour; dark section bands, primary buttons |
| `--forest` | `#0f3d2e` | `*-forest` | band (hover) | lifted/hover variant of forest-deep |
| `--green-mid` | `#006039` | `*-green-mid` | — | links/hover on light bg only |
| `--gold` | `#a37e2c` | `*-gold` | **accent** | decorative jewel accent — fills/borders/icons (⚠️ not body text) |
| `--gold-text` | `#7a5e1c` | `*-gold-text` | accent (text) | accessible gold for text on light (WCAG AA 5:1 on cream) |
| `--cream` | `#f4f2ec` | `*-cream` | **canvas** | primary page canvas |
| `--white` | `#ffffff` | `bg-white` (built-in) | **panel** | lifted surfaces / cards |
| `--ink` | `#0a1f18` | `*-ink` | **ink** | headings & body text |
| `--muted` | `#e9e6dc` | `*-muted` | **muted** (surface) | muted surface |
| `--muted-foreground` | `#5a6a60` | `*-muted-foreground` | muted (text) | secondary text |
| `--border` | `#ddd8cb` | `*-border` | — | hairline borders |
| `--radius` | `0.25rem` | `rounded-*` | — | sharp editorial radius (v0 default was `0.625rem`) |

## Core lookup: v0/shadcn default token → this project

| v0 / shadcn token (utility) | v0 default value | THIS project value | Use in THIS project | Conceptual name |
|---|---|---|---|---|
| `bg-background` | `oklch(1 0 0)` white | `--cream #f4f2ec` | ✅ same util, brand cream | **canvas** |
| `text-foreground` | near-black | `--ink #0a1f18` | ✅ | **ink** |
| `bg-card` | white | `--white #ffffff` | ✅ (also `bg-white`) | **panel** |
| `text-card-foreground` | near-black | `--ink` | ✅ | ink |
| `bg-popover` | white | `--white` | ✅ | panel |
| `text-popover-foreground` | near-black | `--ink` | ✅ | ink |
| `bg-primary` | dark neutral | `--forest-deep #0b2e22` | ✅ primary buttons / bands | **primary / band** |
| `text-primary-foreground` | near-white | `--cream` | ✅ | canvas-on-primary |
| `bg-secondary` | light neutral | `--white` | ⚠️ identical to `card` — ambiguous | panel |
| `text-secondary-foreground` | dark | `--ink` | ✅ | ink |
| `bg-muted` | light neutral | `--muted #e9e6dc` | ✅ muted surfaces | **muted** |
| `text-muted-foreground` | mid grey | `#5a6a60` (greenish) | ✅ secondary text | muted (text) |
| `bg-accent` | light neutral | `--gold #a37e2c` | ⚠️ **inverted meaning**: v0 accent is a *subtle hover surface*; here accent is a *gold jewel*. Safe for fills/borders; **not** for hover-row backgrounds | **accent** |
| `text-accent-foreground` | dark | `--forest-deep` | ✅ (text on gold fill) | primary-on-accent |
| `bg-destructive` | red | `oklch(0.577 0.245 27.325)` red | ✅ | — |
| `text-destructive-foreground` | light | `#ffffff` | ✅ | — |
| `border` / `border-border` | light neutral | `--border #ddd8cb` | ✅ heavily used | — |
| `bg-input` / `border-input` | light neutral | `#ddd8cb` (= border) | ✅ | — |
| `ring` / `ring-ring` | mid neutral | `--gold` | ✅ focus rings are gold | accent |
| `rounded-*` (`--radius`) | `0.625rem` | `0.25rem` | sharper; `radius-sm/md/lg/xl` derived | — |
| `font-sans` | Geist | **Inter** (`--font-inter`) | ✅ `font-sans` | — |
| `font-serif` | (none) | **Cormorant Garamond** (`--font-cormorant`) | ✅ `font-serif` (display/headings) | — |
| `font-mono` | Geist Mono | `ui-monospace` | rarely used | — |

## ⚠️ v0 tokens with NO clean equivalent in this project

| v0 / shadcn token | Status here | What to do |
|---|---|---|
| `bg-accent` as a **hover/active surface** (shadcn pattern: `hover:bg-accent`) | ✗ Means *gold* here, not a subtle surface. Using `hover:bg-accent` will paint gold. | For hover surfaces use `hover:bg-muted` (light) or `hover:bg-forest`/`hover:bg-white/10` (dark). |
| `text-accent` (gold as text) | ⚠️ Fails contrast on cream | Use `text-gold-text` for gold **text**; reserve `text-gold` for icons/decoration on dark bg. |
| `bg-secondary` | ⚠️ Aliases `card`/white — no distinct secondary surface | Treat secondary == panel/white, or use `bg-muted` if you need a step down. |
| `--chart-1` … `--chart-5` | ✗ **Not defined** in `app/globals.css` | Admin analytics (Recharts) has no themed chart palette. Define brand chart vars or pass explicit colours (e.g. forest/gold/green-mid) to `<Chart>`. |
| `--sidebar`, `--sidebar-foreground`, `--sidebar-primary*`, `--sidebar-accent*`, `--sidebar-border`, `--sidebar-ring` | ✗ **Not defined** | `components/ui/sidebar.tsx` expects these. The admin shell does **not** use them — it uses the `AdminThemeProvider` token strings (zinc/amber night + warm-paper day) instead. Don't rely on shadcn sidebar tokens. |
| `.dark` mode tokens | ✗ **No `.dark` block** in `app/globals.css` | `@custom-variant dark` is declared but no `.dark` values exist, so `dark:` utilities are effectively no-ops on the public site. "Dark" sections are achieved by explicit `bg-forest-deep text-cream`. Admin day/night is JS-driven via `AdminThemeProvider`, **not** the `.dark` class. |
| `--popover` distinct from `--card` | ⚠️ Both = white | No visual distinction; fine, just be aware. |

## Project-only tokens/utilities (no v0 default equivalent — additive)

These exist in this project and have no shadcn-default counterpart; v0 designs should adopt them:

| Token / utility | Definition | Purpose |
|---|---|---|
| `*-forest-deep`, `*-forest`, `*-green-mid` | brand greens | bands, links, hovers |
| `*-gold`, `*-gold-text` | brand gold (decorative vs text-safe) | accents, eyebrows, focus rings |
| `*-cream`, `*-ink` | brand canvas/ink | direct semantic colour access |
| `.eyebrow` | uppercase 0.18em tracking, `--text-eyebrow`, colour `--gold-text` | section eyebrows (see `SectionEyebrow`) |
| `.text-display / .text-headline / .text-subhead / .text-body / .text-caption / .text-numeral` | clamp() type scale | editorial typographic scale |
| `.container-wide` | `max-width:1320px; padding-inline:1.5rem` | page gutter container |
| `.editorial-grid` | 12-col grid, 1.5rem gap | editorial layouts |
| `.hero-scrim` / `--scrim-hero` | directional dark gradient | image hero overlays |
| `.grain-overlay` | SVG fractal-noise texture | global grain (`GrainOverlay`) |
| `.fade-up` / `.fade-up-visible` | opacity+translate transition | scroll reveals |
| `.section-rich-text` | typographic styles for Tiptap HTML | CMS / rich-text output |
| `.content-auto` | `content-visibility:auto` | long-page perf |
| `.animate-scroll-hint` | keyframed scroll cue | hero scroll indicator |

## Quick "recolour cheat sheet" for porting a v0 screen

```
v0 design          →  use in MR ESTATES
─────────────────────────────────────────────
page background    →  bg-background           (cream canvas)
card/panel         →  bg-card  /  bg-white     (panel)
dark hero/band     →  bg-forest-deep text-cream
primary button     →  bg-forest-deep text-cream hover:bg-forest
outline button     →  border border-forest-deep text-forest-deep hover:bg-forest-deep hover:text-cream
gold pill / CTA    →  border border-gold/70 text-cream hover:bg-gold hover:text-forest-deep
heading            →  font-serif font-light text-ink   (+ .text-headline / .text-display)
eyebrow/label      →  .eyebrow  (or <SectionEyebrow>)
muted text         →  text-muted-foreground
hairline divider   →  border-border
focus ring         →  ring-gold / focus-visible:ring-gold
```
