# Starter Template — Per-Client Customization Guide

This repo is a **neutral starter template** for MR Estates client sites. Backend, routing, admin CRM, and component structure are production-ready; branding, copy, and media are placeholders.

Work through the sections below in order for each new client engagement.

---

## 1. Environment & Supabase

1. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — your project URL (`https://<ref>.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only service role key
   - `NEXT_PUBLIC_SITE_URL` — production domain (no trailing slash)
   - `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL` — for lead notification edge function

2. Link and provision Supabase:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   supabase db reset   # local dev with seed
   pnpm db:types       # regenerate lib/database.types.ts
   pnpm fn:deploy      # deploy edge functions
   ```

3. Update `supabase/seed.sql` and `006_seed_admin.sql` with client admin email and sample content.

4. Set edge function secrets in Supabase Dashboard → Edge Functions → Secrets.

See `PLACEHOLDERS.md` for backend copy that lives in seed/migrations/functions.

---

## 2. Brand identity

### Site name & SEO (`lib/seo.ts`)

```ts
export const SITE_NAME = 'Client Agency Name'
export const DEFAULT_TITLE = 'Client Agency — Tagline'
export const DEFAULT_DESCRIPTION = 'One-sentence value proposition.'
```

This propagates to `<title>`, Open Graph, admin/dashboard shells, and JSON-LD where `SITE_NAME` is imported.

### Theme tokens (`app/globals.css`)

Replace greyscale starter values under `:root`. Token **names** are fixed (e.g. `--forest-deep`, `--gold`) — only change **values**:

```css
--forest-deep: #0b2e22; /* TODO(client): set brand value */
--gold: #a37e2c;
--cream: #f4f2ec;
/* … */
```

Also update `--scrim-hero` gradient to match the primary brand colour.

### PWA manifest (`public/manifest.json`)

Set `name`, `short_name`, `description`, `background_color`, and `theme_color`.

---

## 3. Logo & images

Replace every file in `public/images/` **keeping the same filenames** so nothing breaks.

Priority order:

1. **Logos** — `logo-mark-dark.png`, `logo-mark-light.png`, `@2x` variants, `logo.svg`, `logo.png`
2. **Favicon** — `favicon-96.png` (also referenced in `app/layout.tsx`)
3. **Hero** — `hero-video.mp4` (or swap to still in `home-hero.tsx`)
4. **Pillar/category** — `pillar-completed.png`, `pillar-projects.png`, `pillar-commercial.png`, `about-hero.png`
5. **Fallbacks** — `project-*.png`, `property-*.png`, `team-*.png`, `insight-*.png`

Run `pnpm build` after replacing assets to verify OG image generation.

---

## 4. Site copy

Search for `{{PLACEHOLDER}}` and `TODO(client)`:

```bash
rg '\{\{PLACEHOLDER\}\}|TODO\(client\)' app/ components/ lib/
```

Use `PLACEHOLDERS.md` as the full index.

### Recommended order

1. **Home page sections** — `components/home/*` (hero, brand statement, pillars, CTA)
2. **Footer & contact** — `components/site-footer.tsx`, `app/(site)/contact/page.tsx`
3. **About page** — `app/(site)/about/page.tsx`
4. **Category pages** — hero descriptions + `categorySeo` objects on buy/rent/projects/commercial
5. **Insights intro** — `app/(site)/insights/page.tsx`
6. **LLM files** — `public/llms.txt`, `app/llms-full.txt/route.ts`
7. **OG images** — `app/opengraph-image.tsx` (tagline, domain)

Remove `{{PLACEHOLDER}}` literals as you replace them — they are meant to be visible during development so nothing is missed.

---

## 5. Locale & timezone

In `lib/datetime.ts`:

```ts
export const SITE_TIMEZONE = 'Australia/Melbourne'  // IANA name
export const SITE_LOCALE = 'en-AU'                  // BCP 47
```

Update admin timezone hint strings in `components/admin/listings-admin.tsx` after changing timezone.

---

## 6. Structured data (`lib/schemaUtils.ts`)

Set real contact details in `buildOrganization()`:

- `telephone`, `email`
- `address` (street, locality, region, postcode)
- `areaServed`
- `openingHoursSpecification`

---

## 7. Category SEO (optional, recommended)

On each category page (`buy`, `rent`, `projects`, `commercial`), replace:

```ts
const categorySeo: CategorySeoCopy | null = null
```

with a populated object to render long-form SEO content + FAQ schema. See `components/category/category-seo-content.tsx` for the shape.

---

## 8. Verify before deploy

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

Manual checks:

- [ ] Home hero video/image loads
- [ ] Logo appears in nav, footer, admin, PWA
- [ ] Contact phone/email/address correct
- [ ] Enquiry form submits (Supabase + edge function)
- [ ] Admin login works with seeded user
- [ ] `/llms.txt` and `/llms-full.txt` reflect client copy
- [ ] Social/OG preview shows client brand (share a URL in Slack/iMessage)

---

## 9. What not to change

Unless requirements change, leave these as-is:

- Route structure under `app/(site)/`, `app/admin/`, `app/dashboard/`
- Supabase schema & RLS migrations
- Search, listings, analytics, and admin CRM logic
- Component props and page composers
- `lib/queries*.ts`, `lib/listing-utils.ts`, `lib/searchFilters.ts`

---

## Related docs

- [`PLACEHOLDERS.md`](./PLACEHOLDERS.md) — exhaustive placeholder index
- [`.env.example`](./.env.example) — required environment variables
