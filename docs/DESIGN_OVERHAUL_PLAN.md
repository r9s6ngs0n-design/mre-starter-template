# Design Overhaul Plan — MR ESTATES

**Direction:** Editorial + cinematic + architectural  
**Motion:** Moderate (Framer Motion)  
**Scope:** Whole site  
**Cursor:** Native (unchanged)

---

## Current State (baseline)

| Area | Status |
|------|--------|
| Stack | Next.js 16 App Router · React 19 · Tailwind CSS v4 |
| Brand tokens | Defined in `app/globals.css` (forest / gold / cream / ink) |
| Fonts | Cormorant Garamond + Inter via Google Fonts in `app/layout.tsx` |
| Motion lib | `framer-motion` **installed** (`package.json`) but **not yet used** |
| Scroll reveal | CSS `fade-up` via `components/reveal.tsx` + IntersectionObserver |
| Layout shell | `components/site-nav.tsx` · `components/site-footer.tsx` |
| Grid container | `.container-wide` utility (max 1320px) |

### Page → file map

| Page | Route | Primary files |
|------|-------|---------------|
| Home | `/` | `app/page.tsx` · `components/home/*` |
| Projects | `/projects` | `app/projects/page.tsx` · `components/category/*` |
| Completed | `/completed` | `app/completed/page.tsx` · `components/category/*` |
| Commercial | `/commercial` | `app/commercial/page.tsx` · `components/category/*` |
| Property detail | `/property/[id]` | `app/property/[id]/page.tsx` · `components/property/*` |
| About | `/about` | `app/about/page.tsx` · `components/about/*` |
| Insights index | `/insights` | `app/insights/page.tsx` · `components/article-card.tsx` |
| Article | `/insights/[slug]` | `app/insights/[slug]/page.tsx` |
| Contact | `/contact` | `app/contact/page.tsx` · `components/enquiry-form.tsx` |

---

## 1. Design System Foundations

### 1.1 Typography scale

Introduce a strict type system in `app/globals.css` (CSS custom properties + utility classes). Replace ad-hoc `text-*` sizing across components with semantic tokens.

| Token | Font | Size (desktop) | Tracking | Line height | Notes |
|-------|------|----------------|----------|-------------|-------|
| `display` | Cormorant Garamond | clamp(3rem → 6rem) | −0.02em | 1.02 | Hero / page titles |
| `headline` | Cormorant Garamond | clamp(2rem → 3.5rem) | −0.01em | 1.08 | Section headings |
| `subhead` | Cormorant Garamond | clamp(1.25rem → 1.75rem) | 0 | 1.2 | Card titles, pull-quotes |
| `body` | Inter | 1rem (16px) | 0 | 1.6 | Max width 45–75ch via `.prose-width` |
| `eyebrow` | Inter | 0.6875rem | +0.18em | 1.4 | Uppercase, gold (update from current 0.22em) |
| `caption` | Inter | 0.75rem | +0.04em | 1.5 | Metadata, specs |
| `numeral` | Cormorant Garamond | clamp(4rem → 8rem) | −0.03em | 1 | Section index (01 / 02 / 03) |

**Accent patterns:** italic serif for emphasis (`font-serif italic`), oversized numerals as decorative anchors.

**Files to create / update:**
- `app/globals.css` — type tokens, `.text-display`, `.text-headline`, etc.
- `components/ui/typography.tsx` — optional thin wrappers (`Display`, `Headline`, `Eyebrow`, `SectionNumeral`, `Caption`)
- `components/section-eyebrow.tsx` — align tracking to +0.18em spec

### 1.2 Color & material

Keep existing palette; elevate gold as the signature accent.

| Treatment | Implementation |
|-----------|----------------|
| Hairline rules | 1px `bg-gold` dividers (already partial in nav / eyebrow) |
| Draw-on-hover underlines | Shared `components/ui/animated-link.tsx` (CSS or Framer `layoutId`) |
| Serif accents | Gold italic spans inside headlines |
| Film grain | `::after` pseudo on `body` or a fixed `components/grain-overlay.tsx` — low-opacity PNG/SVG noise, `pointer-events-none`, `mix-blend-overlay` |
| Hero scrim | Replace flat `bg-forest-deep/45` in `home-hero.tsx` with directional gradient: strong bottom-left → transparent top-right |

**Files to update:**
- `app/globals.css` — grain utility, scrim gradient tokens (`--scrim-hero`)
- `components/home/home-hero.tsx` — directional scrim
- `components/category/category-hero.tsx` — same scrim treatment

### 1.3 Editorial layout grid

Extend beyond uniform `container-wide` + equal grids.

| Pattern | Spec |
|---------|------|
| Base grid | 12-column CSS grid inside `.container-wide` (or new `.editorial-grid`) |
| Section numerals | Oversized `01` / `02` / `03` positioned in col 1, content offset cols 3–12 |
| Asymmetry | Alternate image/text column spans (e.g. 7+5, 5+7) per section |
| Broken grid | 1–2 images per page break container edge (`-mx-*`, `translate-x-*`, overlap adjacent section) |
| Whitespace | Increase vertical rhythm: `py-28 md:py-40` for major sections; tighter within sub-blocks |

**Files to create:**
- `components/layout/editorial-section.tsx` — props: `index`, `reverse`, `children`
- `components/layout/section-numeral.tsx` — decorative index display
- `components/layout/broken-grid-image.tsx` — off-edge image wrapper with clip-path reveal

---

## 2. Motion Language

Migrate from CSS-only `Reveal` to Framer Motion primitives. Keep `prefers-reduced-motion` respected everywhere.

### 2.1 Shared motion config

Create `lib/motion.ts`:

```ts
export const easeEditorial = [0.16, 1, 0.3, 1] as const
export const duration = { fast: 0.4, base: 0.7, slow: 1.1 }
export const reducedMotion = /* useReducedMotion() wrapper */
```

### 2.2 Animation components

| Component | File | Behaviour |
|-----------|------|-----------|
| `FadeUp` | `components/motion/fade-up.tsx` | Line or block rises with `easeEditorial`; viewport `once` |
| `TextReveal` | `components/motion/text-reveal.tsx` | Split headline into lines; staggered `y` + `opacity` |
| `ImageReveal` | `components/motion/image-reveal.tsx` | `clip-path: inset()` animate open |
| `HoverZoom` | `components/motion/hover-zoom.tsx` | Scale 1.04 inside `overflow-hidden` mask |
| `DrawUnderline` | `components/motion/draw-underline.tsx` | Gold line width 0 → 100% on hover |
| `MagneticButton` | `components/motion/magnetic-button.tsx` | Subtle cursor-follow + gold fill on hover |

### 2.3 Nav transition

Refine `components/site-nav.tsx`:
- Animate `backgroundColor` / `backdropFilter` with Framer `motion.header`
- Animate logo hairline width on scroll
- Mobile menu: slide + fade instead of opacity-only toggle

### 2.4 Reduced motion

- Wrap all motion in `useReducedMotion()` checks
- Fallback: instant opacity / no transform
- Disable intro curtain entirely when reduced motion is preferred

### 2.5 Migration path

1. Build motion primitives
2. Replace `components/reveal.tsx` usages incrementally (deprecate CSS `.reveal` after migration)
3. Remove unused `@keyframes fade-up` from `globals.css` once complete

---

## 3. Brand Intro Curtain *(new)*

Full-screen first-visit brand moment before hero content.

### Behaviour

| Rule | Detail |
|------|--------|
| Trigger | First page load per **session** only (`sessionStorage` key: `mr-intro-seen`) |
| Content | MR ESTATES wordmark (serif, tracking) + gold hairline |
| Exit | Curtain slides up / fades; hero revealed underneath |
| Skip | Click anywhere or press Escape after 400ms |
| Reduced motion | Skip curtain; mark session as seen immediately |
| Placement | `components/brand-intro-curtain.tsx` mounted in `app/layout.tsx` |

### Technical notes

- Client component; does not block SSR of page content (overlay only)
- `z-index` above nav during intro, then unmount
- Duration ~1.8s total; skippable at any point
- Do not run on internal navigations (Next.js client routing)

---

## 4. Page-by-Page Rollout

### 4.1 Home (`/`)

**Files:** `components/home/home-hero.tsx`, `brand-statement.tsx`, `system-overview.tsx`, `expertise-pillars.tsx`, `featured-collection.tsx`, `social-proof.tsx`, `insights-teaser.tsx`, `final-cta.tsx`

| Change | Detail |
|--------|--------|
| Hero | Directional scrim; `TextReveal` on headline; `MagneticButton` CTA |
| Sections | `EditorialSection` + section numerals 01–06 |
| Featured collection | Asymmetric 2-col editorial layout (1 large + 2 stacked); broken-grid hero image on one card |
| Social proof | Oversized pull-quote in serif italic |
| Motion | Replace all `<Reveal>` with Framer equivalents |

### 4.2 Category pages (`/projects`, `/completed`, `/commercial`)

**Files:** `components/category/category-hero.tsx`, `category-grid.tsx`, `components/project-card.tsx`

| Change | Detail |
|--------|--------|
| Hero | Softer scrim; eyebrow + display type |
| Property cards | Larger imagery (`aspect-[3/4]` → taller); hover-reveal specs overlay on image |
| Pricing | "From $X" as gold overline above title |
| Metadata | Cleaner caption typography; specs hidden until hover |
| Grid | Staggered card heights; optional 2-col featured first row |

### 4.3 Property detail (`/property/[id]`)

**Files:** `components/property/property-showcase.tsx`, `property-details.tsx`

| Change | Detail |
|--------|--------|
| Gallery | Full-bleed carousel; `ImageReveal` on slide change |
| Layout | Two-column: content left, **sticky enquiry rail** right (desktop) |
| Specs | Larger type scale; gold hairline between rows |
| Storytelling | Image-led blocks alternating with copy; pull-quote for descriptor |
| Form | Embed compact `EnquiryForm` in sticky rail |

### 4.4 About (`/about`)

**Files:** `app/about/page.tsx`, `components/about/team-section.tsx`

| Change | Detail |
|--------|--------|
| Team grid | Editorial portrait grid — varied aspect ratios, gold name accents |
| Pull-quotes | Oversized serif italic between sections |
| Process | Numbered steps (01–04) with `SectionNumeral` + short headline each |
| Hero | Reuse updated `CategoryHero` with directional scrim |

### 4.5 Insights (`/insights`, `/insights/[slug]`)

**Files:** `app/insights/page.tsx`, `app/insights/[slug]/page.tsx`, `components/article-card.tsx`

| Change | Detail |
|--------|--------|
| Index layout | Magazine style: 1 featured article (large image + overlay title) + compact list below |
| Article cards | Horizontal layout variant for list rows |
| Article page | Refined reading measure (65ch); drop cap or gold first-letter; inline image breaks |
| Typography | Apply body / subhead tokens; section dividers as gold hairlines |

### 4.6 Contact & enquiry (`/contact`, embedded forms)

**Files:** `app/contact/page.tsx`, `components/enquiry-form.tsx`

| Change | Detail |
|--------|--------|
| Fields | Taller inputs, more vertical rhythm between groups |
| Focus | Gold border + subtle gold glow (`ring-gold/30`) |
| Labels | Eyebrow-style labels |
| Layout | Two-column on desktop: contact details left, form right |
| Submit | `MagneticButton` with gold fill transition |

---

## 5. Execution Order

### Phase 1 — Foundations (do first)

1. Extend `app/globals.css` with type tokens, grain, scrim variables, editorial grid utilities
2. Create `lib/motion.ts` + motion primitive components
3. Create layout primitives (`EditorialSection`, `SectionNumeral`, `BrokenGridImage`)
4. Create `AnimatedLink`, `MagneticButton`, update `SectionEyebrow`
5. Build `BrandIntroCurtain` + wire into `app/layout.tsx`
6. Upgrade `SiteNav` with Framer scroll transition

### Phase 2 — Page rollout

| Order | Page | Verify |
|-------|------|--------|
| 1 | Home | Hero, sections, featured layout, intro curtain |
| 2 | Category (Projects → Completed → Commercial) | Cards, grid, hero |
| 3 | Property detail | Gallery, sticky rail, specs |
| 4 | About | Team, quotes, process |
| 5 | Insights index + article | Feature layout, reading experience |
| 6 | Contact + EnquiryForm | Fields, focus states, layout |

### Phase 3 — QA pass

- Desktop (1440px, 1280px) + mobile (390px, 768px)
- `prefers-reduced-motion: reduce` — no jarring motion, curtain skipped
- Contrast: gold on cream, white on forest, muted text on background
- Keyboard: focus rings on all interactive elements
- Lighthouse accessibility score check

---

## 6. File Creation Summary

```
lib/
  motion.ts                          # easing, durations, reduced-motion helper

components/
  brand-intro-curtain.tsx            # first-load curtain
  grain-overlay.tsx                  # film grain (optional standalone)
  layout/
    editorial-section.tsx
    section-numeral.tsx
    broken-grid-image.tsx
  motion/
    fade-up.tsx
    text-reveal.tsx
    image-reveal.tsx
    hover-zoom.tsx
    draw-underline.tsx
    magnetic-button.tsx
  ui/
    typography.tsx                   # optional semantic type components
    animated-link.tsx
```

---

## 7. Out of Scope

- Custom cursor (stays native)
- Dark mode theme overhaul (`styles/globals.css` is unused boilerplate — ignore)
- Backend / form submission wiring
- New photography or copy (use existing assets unless art-directed placeholders noted)
- CMS integration

---

## Master Checklist

### Phase 1 — Design system & primitives

- [x] Add typography tokens to `app/globals.css` (display, headline, subhead, body, eyebrow, caption, numeral)
- [x] Add `.prose-width` utility (45–75ch) and editorial 12-col grid utilities
- [x] Add film-grain overlay (CSS or `grain-overlay.tsx`)
- [x] Add hero scrim CSS variables (`--scrim-hero`) — directional gradient
- [x] Create `lib/motion.ts` (easing, durations, reduced-motion helper)
- [x] Create `components/motion/fade-up.tsx`
- [x] Create `components/motion/text-reveal.tsx`
- [x] Create `components/motion/image-reveal.tsx`
- [x] Create `components/motion/hover-zoom.tsx`
- [x] Create `components/motion/draw-underline.tsx`
- [x] Create `components/motion/magnetic-button.tsx`
- [x] Create `components/layout/editorial-section.tsx`
- [x] Create `components/layout/section-numeral.tsx`
- [x] Create `components/layout/broken-grid-image.tsx`
- [x] Create `components/ui/animated-link.tsx`
- [x] Update `components/section-eyebrow.tsx` (tracking +0.18em)
- [x] Create `components/brand-intro-curtain.tsx`
- [x] Wire intro curtain into `app/layout.tsx` (sessionStorage + skip + reduced motion)
- [x] Upgrade `components/site-nav.tsx` with Framer scroll / menu transitions

### Phase 2 — Home

- [x] Update `home-hero.tsx` — directional scrim, TextReveal, MagneticButton
- [x] Update `brand-statement.tsx` — editorial section + numeral
- [x] Update `system-overview.tsx` — asymmetry + motion
- [x] Update `expertise-pillars.tsx` — editorial layout
- [x] Update `featured-collection.tsx` — asymmetric editorial grid + broken-grid moment
- [x] Update `social-proof.tsx` — oversized pull-quote
- [x] Update `insights-teaser.tsx` — magazine teaser layout
- [x] Update `final-cta.tsx` — MagneticButton + gold accents
- [x] Replace all `<Reveal>` on home with Framer motion components
- [ ] Browser verify Home (desktop + mobile)

### Phase 3 — Category pages

- [x] Update `category-hero.tsx` — directional scrim + type tokens
- [x] Redesign `project-card.tsx` — larger imagery, hover-reveal specs, "From $X" overline
- [x] Update `category-grid.tsx` — staggered / featured-first layout
- [x] Apply changes across `/projects`, `/completed`, `/commercial`
- [ ] Browser verify all three category pages

### Phase 4 — Property detail

- [x] Update `property-showcase.tsx` — full-bleed gallery, ImageReveal on transitions
- [x] Update `property-details.tsx` — larger specs, gold hairlines, image-led blocks
- [x] Add sticky enquiry rail layout (desktop) in `app/property/[id]/page.tsx`
- [ ] Browser verify property detail (desktop + mobile)

### Phase 5 — About

- [x] Update `team-section.tsx` — editorial portrait grid
- [x] Add oversized pull-quotes to `app/about/page.tsx`
- [x] Add numbered process section (01–04)
- [ ] Browser verify About

### Phase 6 — Insights

- [x] Redesign `app/insights/page.tsx` — feature + list magazine layout
- [x] Update `article-card.tsx` — horizontal list variant
- [x] Refine `app/insights/[slug]/page.tsx` — reading experience, typographic polish
- [ ] Browser verify Insights index + sample article

### Phase 7 — Contact & forms

- [x] Update `app/contact/page.tsx` — two-column layout
- [x] Update `enquiry-form.tsx` — field rhythm, gold focus states, MagneticButton
- [x] Verify embedded enquiry forms on category / property pages
- [ ] Browser verify Contact

### Phase 8 — QA & cleanup

- [ ] Test `prefers-reduced-motion: reduce` across all pages
- [ ] Contrast / colour accessibility pass (gold, muted text, scrim legibility)
- [ ] Keyboard navigation + focus visibility audit
- [x] Remove deprecated `components/reveal.tsx` and CSS `.reveal` / `@keyframes fade-up`
- [ ] Final cross-browser smoke test (Chrome, Safari, Firefox)
- [x] Run `pnpm build` — confirm no SSR / hydration errors from motion components

---

## Notes for implementers

- **Framer Motion is already installed** — no `pnpm add` needed; start building primitives directly.
- Prefer **client components only where motion is required**; keep page files as Server Components and import motion wrappers.
- Reuse existing shadcn `Button` / `Input` where possible; extend with motion and gold focus styles rather than replacing.
- When in doubt, match the calm, premium tone already present — motion should feel **considered**, not flashy.
