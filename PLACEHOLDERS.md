# Placeholder Index

Every `{{PLACEHOLDER}}` token and `TODO(client)` marker in this starter template. Search the repo for either pattern to find them all.

---

## Global config

| Location | What to set |
|----------|-------------|
| `lib/seo.ts` | `SITE_NAME`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` |
| `lib/datetime.ts` | `SITE_TIMEZONE`, `SITE_LOCALE` |
| `lib/schemaUtils.ts` | Organisation telephone, email, address, area served (JSON-LD) |
| `app/globals.css` | All `--forest-*`, `--gold*`, `--cream`, `--ink`, `--muted`, `--border`, `--scrim-hero` values |
| `.env.example` → `.env.local` | Supabase URL/keys, site URL, Resend, admin email |
| `public/manifest.json` | PWA name, short name, description, theme colours |
| `public/llms.txt` | LLM-facing site summary, services, contact, brand colours |

---

## Images & media

Replace grey placeholders in `public/images/` (keep filenames):

| File(s) | Purpose |
|---------|---------|
| `logo*.png`, `logo.svg` | Wordmark and logo marks (light/dark variants) |
| `logo-mark-*.png` | Nav/footer/app icon marks |
| `favicon-96.png` | Browser favicon |
| `hero-video.mp4` | Home hero background video |
| `hero-tower.png`, `about-hero.png` | Hero stills |
| `pillar-*.png` | Expertise pillar cards |
| `project-*.png`, `property-*.png` | Listing/gallery fallbacks |
| `team-*.png` | Team member avatars (fallback) |
| `insight-*.png` | Blog/insights fallbacks |

---

## Site copy — home (`components/home/`)

| File | Placeholders |
|------|--------------|
| `home-hero.tsx` | Hero headline (`text=` prop) |
| `brand-statement.tsx` | Point-of-view headline, body, problem heading, 3 pain-point cards |
| `featured-collection.tsx` | Section headline |
| `expertise-pillars.tsx` | 4 pillar captions |
| `insights-teaser.tsx` | Section headline |
| `system-overview.tsx` | Section headline, intro, 4 process steps (title + text each) |
| `final-cta.tsx` | Headline, body, phone link + label |

---

## Site copy — layout

| File | Placeholders |
|------|--------------|
| `components/site-footer.tsx` | Tagline, newsletter blurb, office address, phone, email |
| `components/about/team-section.tsx` | Team section intro paragraph |

---

## Site copy — pages (`app/(site)/`)

| Page | Placeholders |
|------|--------------|
| `about/page.tsx` | Meta description, hero title/subtitle/description, approach heading + 2 paragraphs, blockquote, process heading + intro, 4 process steps |
| `contact/page.tsx` | Meta description, intro paragraph, phone, email, address |
| `login/page.tsx` | Meta description |
| `insights/page.tsx` | Meta description, intro paragraph |
| `buy/page.tsx` | Meta description, hero description; `categorySeo` object (see below) |
| `rent/page.tsx` | Meta description, hero description; `categorySeo` object |
| `projects/page.tsx` | Meta description, hero description; `categorySeo` object |
| `commercial/page.tsx` | Meta description, hero description; `categorySeo` object |

### Category SEO copy (per category page)

Each of `buy`, `rent`, `projects`, `commercial` has:

```ts
/* TODO(client): provide category SEO copy */
const categorySeo: CategorySeoCopy | null = null
```

Set to a `CategorySeoCopy` object to enable `CategorySeoContent` + FAQ JSON-LD. See `components/category/category-seo-content.tsx`.

---

## Open Graph images (`app/`)

| File | Placeholders |
|------|--------------|
| `opengraph-image.tsx` | `alt`, tagline, subtitle, domain |
| `property/[id]/opengraph-image.tsx` | `alt`, fallback title/suburb |
| `insights/[slug]/opengraph-image.tsx` | `alt`, fallback title |

---

## LLM index

| File | Placeholders |
|------|--------------|
| `app/llms-full.txt/route.ts` | Summary blurb, email, phone, office |
| `public/llms.txt` | Full static LLM summary (mirror of above) |

---

## Admin & dashboard UI

| File | Placeholders |
|------|--------------|
| `components/admin/listings-admin.tsx` | Suburb placeholder, timezone labels, portal visibility note |
| `components/admin/blog-admin.tsx` | Article title example placeholder |
| `components/admin/team-admin.tsx` | Email placeholder (now `email@example.com`) |
| `components/dashboard/settings-dashboard.tsx` | Account deletion contact email |

Brand name in admin/dashboard shells reads from `SITE_NAME` in `lib/seo.ts`.

---

## Backend (unchanged structure — client values in seed/edge functions)

These were **not** stripped (backend stays as-is). Customize per client when provisioning:

| Location | Client-specific content |
|----------|-------------------------|
| `supabase/seed.sql` | Team members, testimonials, sample listings |
| `supabase/functions/handle-new-lead/` | Email from address, subject lines |
| `supabase/functions/_shared/email-templates.ts` | Email body copy |
| `supabase/migrations/006_seed_admin.sql` | Admin seed email |

---

## Quick search

```bash
# All placeholder tokens
rg '\{\{PLACEHOLDER\}\}' app/ components/ lib/ public/

# All TODO markers
rg 'TODO\(client\)' app/ components/ lib/
```
