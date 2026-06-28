# MR ESTATES — Architecture Analysis

> Read-only analysis. No source files were modified. This document is the only file created.
> Scope: a v0-bootstrapped Next.js + Supabase real-estate platform for a Melbourne agency
> ("MR ESTATES"). It combines a public marketing/listings site, a member dashboard, and a
> staff admin/CRM — all in one App Router project backed by a single Supabase project.

---

## 1. Tech Stack & Versions

Versions taken from `package.json` (pinned) and `pnpm-lock.yaml`.

| Concern | Technology | Version | Notes |
|---|---|---|---|
| Framework | **Next.js** (App Router, RSC) | `16.0.10` | `app/` dir, Server Components by default, `viewTransition` experimental flag on. |
| Runtime libs | **React / React DOM** | `19.2.0` | React 19 (Actions, `useTransition`, async RSC). |
| Language | **TypeScript** | `^5` | `strict: true`, but `next.config.mjs` sets `typescript.ignoreBuildErrors: true`. |
| Build tool / bundler | **Turbopack** | via Next 16 | `turbopack.root` pinned in `next.config.mjs`. `dev` = `next dev`. |
| Package manager | **pnpm** | `9.15.9` | Pinned via `packageManager` field; lockfile v9 (commit history shows Vercel pinning). |
| Styling | **Tailwind CSS v4** | `^4.1.9` | CSS-first config via `@import 'tailwindcss'` + `@theme inline` in `app/globals.css`. No `tailwind.config` file. PostCSS plugin `@tailwindcss/postcss`. |
| Styling helpers | `tailwind-merge` `^3.3.1`, `clsx` `^2.1.1`, `class-variance-authority` `^0.7.1`, `tailwindcss-animate` / `tw-animate-css` | — | `cn()` in `lib/utils.ts`. CVA used by shadcn primitives. |
| Component library | **shadcn/ui** ("new-york" style) on **Radix UI** | Radix pinned per-package | `components.json`; ~50 primitives in `components/ui/`. Icons via **lucide-react** `^0.454.0`. |
| Routing | **Next App Router** | — | Route groups `(site)`, plus `admin/`, `dashboard/`, `api/`. `middleware.ts` for auth gating. |
| Data / API layer | **Supabase** (`@supabase/supabase-js` `^2.108`, `@supabase/ssr` `^0.12`) | — | Postgres + Auth + Storage + Edge Functions. Typed via generated `lib/database.types.ts`. |
| Auth | **Supabase Auth** (email/password) | — | Cookie-based SSR sessions via `@supabase/ssr`; middleware + client `AuthProvider`. |
| State | **React Context** + local component state | — | `AuthProvider`, `NavigationProvider`, `AdminThemeProvider`. No Redux/Zustand/React Query. |
| Forms | **react-hook-form** `^7.60` + **zod** `3.25.76` + `@hookform/resolvers` | — | Available + wired in shadcn `form.tsx`; most bespoke forms use raw `useState`. |
| Animation | **Framer Motion** `12.23.24` | — | Page transitions (`template.tsx`), nav, motion primitives in `components/motion/`. |
| Rich text | **Tiptap 3** (`@tiptap/react` + extensions) | `^3.27` | Admin editor (`components/admin/rich-text-editor.tsx`); rendered via `RichTextContent`. |
| Charts | **Recharts** `2.15.4` | — | Admin analytics. |
| Toast / misc UI | `sonner`, `vaul`, `cmdk`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `recharts`, `react-resizable-panels` | — | shadcn dependencies. |
| Analytics | **Vercel Analytics** `1.3.1` + custom Supabase tables | — | `page_views`, `cta_clicks`, `search_queries`. |
| Email / SMS | **Resend** + **Twilio** (in Edge Functions) | via Deno `esm.sh` | `supabase/functions/handle-new-lead`. |
| Fonts | `next/font/google` — **Inter** (sans) + **Cormorant Garamond** (serif) | — | CSS vars `--font-inter`, `--font-cormorant`. |
| Deploy | **Vercel** | — | Auto-deploy on merge to `main`; v0 project linked (`README.md`). |

**Config files:** `next.config.mjs` (Turbopack root, `ignoreBuildErrors`, Supabase image remotePatterns, legacy redirects), `tsconfig.json` (`@/*` path alias → repo root, `moduleResolution: bundler`), `postcss.config.mjs`, `components.json`, `middleware.ts`, `supabase/config.toml`, `scripts/generate-sitemap.js` (runs pre-`next build`).

**Stray/empty artefacts** (cosmetic, not load-bearing): empty files `next` and `my-v0-project@0.1.0` at repo root, plus committed `tsconfig.tsbuildinfo` and `.next/`.

---

## 2. FOUNDATION LAYER (reusable across clients)

This is the machinery you can lift to another agency site with little change. It is genuinely
client-agnostic *except* where flagged in §4.

### 2.1 Routing & App Shell

```
app/
  layout.tsx            ← root: fonts, <Providers>, global chrome, metadata
  providers.tsx         ← client provider tree (Auth + page tracking)
  globals.css           ← Tailwind v4 theme + design tokens
  (site)/               ← PUBLIC marketing + listings (route group, shared nav/footer)
    layout.tsx          ← SiteNav + SiteFooter + NavigationProvider
    template.tsx        ← per-navigation fade transition
    page.tsx, about, buy, rent, projects, commercial, contact, insights/[slug], property/[id], login
  admin/                ← STAFF CRM (client-rendered shell, own layout)
    layout.tsx → AdminShell
    leads, listings, blog, team, testimonials, documents, page-content, analytics, users, settings
  dashboard/            ← MEMBER area (favourites, bookings, inspections, settings)
  api/admin/users/[id]/ ← Route Handler (service-role user deletion)
```

**How it works.** Three distinct "apps" share one Next project, separated by route segments:

- **`(site)` route group** — a parenthesised group so the URL stays clean (`/buy`, not
  `/site/buy`). Its `layout.tsx` is an **async Server Component** that fetches footer documents
  server-side and wraps children in `SiteNav` + `SiteFooter` + `NavigationProvider`. This is the
  reusable public shell.
- **`template.tsx`** — Next re-mounts a `template` on every navigation (unlike `layout`). It's
  used here purely for a Framer-Motion opacity fade, with a module-level `firstMountDone` flag so
  the very first load (handled by the intro curtain) doesn't double-animate. Clean, reusable.
- **`admin/layout.tsx`** and **`dashboard/layout.tsx`** are thin client wrappers that delegate to
  `AdminShell` / `DashboardShell`. The admin layout special-cases `/admin/login` to render bare.

**Why built this way.** Route groups let one codebase serve marketing, member, and staff
experiences with independent layouts and independent auth posture, while sharing the design
system and the Supabase data layer. This is the core reusable pattern.

**Redirects** (`next.config.mjs`) map legacy category URLs (`/completed→/buy`, `/rentals→/rent`)
— evidence the category taxonomy was renamed over time (see §5).

### 2.2 Auth

Auth is enforced in **two layers**, which is the standard Supabase-SSR pattern:

1. **Edge middleware** (`middleware.ts` → `lib/supabase/middleware.ts`) — runs on
   `/admin/:path*`, `/dashboard/:path*`, `/login`. It refreshes the Supabase session cookie via
   `@supabase/ssr` `createServerClient`, calls `auth.getUser()`, and performs **server-side
   redirects**: unauthenticated → login pages; authenticated-on-login-page → respective home.
   This is the real security gate (runs before any page renders).
2. **Client `AuthProvider`** (`contexts/auth-context.tsx`) — a Context that holds `user`,
   `profile`, `role`, `loading` and exposes `signIn/signUp/signOut/refreshProfile`. It subscribes
   to `onAuthStateChange` and loads the `users` row to get the app role.

**Supabase client factories** (`lib/supabase/`):
- `client.ts` — `createBrowserClient` (anon key) for the browser.
- `server.ts` — `createServerClient` bound to Next `cookies()`; returns `null` if env missing
  (so RSC data fns degrade to empty arrays rather than crashing).
- `middleware.ts` — request/response cookie-bridged client for the edge.
- `admin.ts` — **service-role** client, server-only, used by the API route for privileged ops.

**Role model.** `users.role` enum. Note the DB enum started as `('admin','agent')` (migration
001) and a `'user'` role for site members was added later (migration 009). `RequireAuth`
(admin) redirects `role==='user'` to `/dashboard`; `DashboardShell` redirects staff to `/admin`.

**Why built this way.** Middleware gives a hard redirect gate without flashing protected UI;
the client context gives components reactive access to identity for conditional rendering. The
service-role key is quarantined to a single server route handler.

### 2.3 Data / API Layer

There is **no REST/GraphQL API of its own** (only one Route Handler). Data access is direct
Supabase queries, split deliberately by execution context:

- **`lib/queries-server.ts`** — server-side reads (`await createClient()` from `server.ts`),
  used by Server Components (pages, layouts). Returns `[]`/`null` on error and logs — pages never
  throw. Functions: `getPublishedListings`, `getListingBySlug`, `getFeaturedListings`,
  `getPublishedBlogPosts`, `getBlogPostBySlug`, `getPublishedTestimonials`, `getPublishedTeam`,
  `getPublishedPageSections`, `getDocumentsForPlacement`, `getDocumentsForProperty`,
  `getDocumentPlacementOrders`.
- **`lib/queries.ts`** — the **client-side mirror** of the same reads (`createClient()` from
  `client.ts`), used inside `'use client'` components. These **throw** on error.
- **`lib/leads.ts`** — write path for enquiries. `mapFormToLead()` is the **business core**: it
  maps a UI `LeadFormPayload` to a CRM `leads` row (category/subtype/enquiry_type/status) by
  preset or form type. `submitLead()` / `subscribeNewsletter()` do the inserts.
- **`lib/storage.ts`** — typed Supabase Storage upload/delete with bucket union type.
- **`lib/analytics.ts`** / `hooks/use-page-tracking.ts` — analytics inserts.
- **`lib/documents.ts`**, **`lib/page-sections.ts`** — pure domain helpers (placement maps,
  section content parsing, ordering, background-class resolution) shared by site + admin.
- **`lib/schemaUtils.ts`** — JSON-LD builders (Organization, WebSite, RealEstateListing,
  Breadcrumb, BlogPosting, FAQ, ReviewAggregate). Pure functions.
- **`lib/slugUtils.ts`** — slugging + category↔path maps + listing-path builder + enum lists.
- **`lib/adapters.ts`** — converts DB rows (`Tables<'listings'>` etc.) into the **legacy
  presentational shapes** (`Property`, `Article`, `Testimonial`) that the UI components expect.
- **`lib/data.ts`** — **hard-coded sample content** (`properties`, `team`, `articles`,
  `testimonials`) + the `enquiryTypes` config used by the live enquiry form. Defines the legacy
  `Property`/`Article`/`Testimonial` interfaces the rest of the UI is typed against.

**Server Functions / Edge Functions** (`supabase/functions/`, Deno):
- `handle-new-lead` — triggered on new lead: sends Resend emails (admin + confirmation), creates
  a 24h follow-up `lead_tasks` row, logs a `lead_activities` note, optionally SMSes the assigned
  agent via Twilio.
- `track-cta-click` — records `cta_clicks`.

**Database** (`supabase/migrations/`, 18 migrations). Domain tables: `users`, `team_members`,
`listings` (+ `listing_inspection_times`), `blog_posts`, `testimonials`, `documents`
(+ `document_placement_settings`), `page_sections`, plus a full CRM (`leads`, `lead_statuses`
with per-category pipelines, `lead_tasks`, `lead_activities`, `newsletter_subscribers`),
member tables (`user_favourites`, `user_bookings`, `user_inspections`), and analytics
(`page_views`, `cta_clicks`, `search_queries`). RLS policies in migration 002+; auth triggers in
003/017. Conventions: uuid PKs, `created_at/updated_at` (trigger), soft-delete via
`is_published`/`is_active`/`archived_at`, `display_order` for manual ordering.

**Why built this way.** Pushing reads to RSC (`queries-server`) keeps the marketing site fast,
SEO-friendly, and free of client JS for content. The client mirror exists for interactive
widgets. Centralising lead mapping in `lib/leads` is the right instinct — though it's bypassed in
places (see §4). The `adapters` + `data.ts` indirection is a **migration scaffold**: the UI was
first built against hard-coded `data.ts`, then back-filled from Supabase via adapters without
rewriting the components.

### 2.4 Providers & State

| Provider | File | Scope | Holds |
|---|---|---|---|
| `AuthProvider` | `contexts/auth-context.tsx` | whole app (root) | `user`, `profile`, `role`, auth actions |
| `NavigationProvider` | `contexts/navigation-context.tsx` | `(site)` only | pending-navigation flag for nav styling |
| `AdminThemeProvider` | `contexts/admin-theme-context.tsx` | admin only | day/night token set persisted to `localStorage` |
| `theme-provider.tsx` | `components/theme-provider.tsx` | (next-themes wrapper, available) | light/dark class |

Provider tree (`app/providers.tsx`) is intentionally minimal: `AuthProvider` + a `PageTracker`
side-effect component. No global data-cache provider — RSC + per-component fetch is the model.

`AdminThemeProvider` is a notable pattern: instead of CSS variables, it ships **two big objects of
Tailwind class strings** (`nightTokens`/`dayTokens`) and components read `t.tableRow` etc. This
keeps admin theming centralized but couples every admin component to the token shape.

### 2.5 Config

- **Design tokens** live in `app/globals.css` `:root` (brand palette `--forest-deep`, `--gold`,
  `--cream`, `--ink`…, a typographic scale, hero scrim gradient) exposed to Tailwind via
  `@theme inline`. This is the single source of truth for brand colour/typography.
- **Domain config as data**: `lib/page-sections.ts` (`EDITABLE_PAGES`, `PAGE_STATIC_ANCHORS`,
  `PAGE_POSITION_OPTIONS`), `lib/documents.ts` (`DOCUMENT_CATEGORIES`, `DOCUMENT_PLACEMENTS`,
  placement→page maps, default orders), `lib/slugUtils.ts` (category/type/intent enums). These
  drive both the CMS admin UI and public rendering — good reuse.
- **Env**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `_PUBLISHABLE_KEY`),
  `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SITE_URL`; Edge Function secrets
  (`RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL`, `TWILIO_*`). `.env.example` documents them.

### 2.6 Layout Shell (reusable chrome)

- `SiteNav` (`components/site-nav.tsx`) — fixed header, transparent-over-hero logic, scroll
  state, mobile drawer (Framer Motion), auth-aware links (login / dashboard / admin).
- `SiteFooter` (`components/site-footer.tsx`) — receives `documents` prop from the server layout.
- `AdminShell` / `DashboardShell` — sidebar + topbar chrome for staff and members.
- Global decorative chrome mounted at root: `BrandIntroCurtain`, `GrainOverlay`.
- **CMS composition engine** — `components/page-sections/page-layout-composer.tsx` merges
  static page blocks with DB-driven `page_sections` by `display_order`, and
  `page-section-renderer.tsx` renders an editable section (layout/background/copy/CTA). This is a
  genuinely reusable mini-CMS: any page passes an array of `{order, key, children}` blocks and
  admin-authored sections slot in between them.

---

## 3. PRESENTATION LAYER (per-client / bespoke)

These are the parts you'd expect to rebrand/replace per client. They are **content + visual**,
but several are entangled with data logic (flagged in §4).

### 3.1 Design system / branding (per-client, token-driven)
- `app/globals.css` brand tokens (forest/gold/cream palette, Cormorant + Inter type pairing) —
  this *is* the MR ESTATES brand. Swap tokens to re-skin.
- `components/ui/*` — the shadcn primitive set (button, card, dialog, table, form, etc.). Mostly
  generic and reusable; styling inherits the tokens.
- `components/site-logo.tsx`, `public/images/*` (logo marks, team/project/insight imagery),
  `manifest.json`, metadata in `app/layout.tsx` ("MR ESTATES — Melbourne Living, Curated").

### 3.2 Marketing content components (bespoke copy + layout)
- `components/home/*` — `HomeHero`, `BrandStatement` (`PointOfView`/`ProblemSection`),
  `ExpertisePillars`, `FeaturedCollection`, `SocialProof`, `SystemOverview`, `InsightsTeaser`,
  `FinalCta`. Lots of hard-coded editorial copy specific to this agency.
- `components/about/team-section.tsx`, `components/category/*` (hero + grid),
  `components/article-card.tsx`, `project-card.tsx`, `enquiry-section.tsx`,
  `section-eyebrow.tsx`, `cta-button.tsx`, `nav-link.tsx`.
- `components/property/*` — `PropertyShowcase`, `PropertyDetails`, `PropertyActions`,
  `PropertySchedule` (presentation + heavy logic, see §4).
- `components/layout/*`, `components/motion/*` — editorial layout + animation primitives
  (`FadeUp`, `TextReveal`, `ImageReveal`, `MagneticButton`, `DrawUnderline`). Reusable visually.

### 3.3 Admin / dashboard presentation
- `components/admin/*` (leads-hub, listings-admin, blog-admin, analytics-admin, settings, etc.)
  and `components/dashboard/*`. Styled via `AdminThemeProvider` tokens. These mix UI with
  significant data logic (§4).

### 3.4 Content data
- `lib/data.ts` sample arrays (would be cleared/replaced per client) and `enquiryTypes` config
  (which is arguably config, not content).

---

## 4. ⚠️ Business Logic Tangled into Presentational Components

These are the untangling targets — ranked by severity. Each notes *what* leaks and a suggested
clean seam.

### 🔴 HIGH — `components/property/property-actions.tsx`
A presentational "Save / Book a Viewing / Register for Inspection" button cluster that contains a
full data layer:
- Directly imports `createClient` and runs queries/mutations against **`user_favourites`,
  `user_bookings`, `user_inspections`** (lines ~28–61, ~158–168, ~238–248).
- Builds insert payloads inline (`scheduled_at = \`${date}T${time}:00\``, inspection date/time
  splitting), does its own validation, error handling, and auth-redirect (`requireAuth`).
- Knows table names, column names, and the auth flow.
**Untangle:** move favourite/booking/inspection CRUD into `lib/members.ts` (or
`lib/favourites.ts`, `lib/bookings.ts`); component should call `toggleFavourite(listingId)` /
`createBooking(payload)` and stay dumb.

### 🔴 HIGH — `components/property/property-schedule.tsx`
The `EventRegistrationModal` (lines ~246–292) **inserts directly into the `leads` table**,
hard-coding `category: 'buyer'`, `enquiry_type`, `status: 'new'`, `source: 'property_schedule'`,
and encoding the inspection slot into `requirements` as a string. This duplicates — and bypasses —
`lib/leads.ts` `mapFormToLead`, so lead-shaping logic now lives in two places with different rules.
**Untangle:** add `auction_registration` / `inspection_registration` presets to
`lib/leads.ts` and call `submitLead()`; delete the inline insert.

### 🟠 MEDIUM — `components/cta-button.tsx`
A `Link` wrapper that, on click, **`fetch`es the Supabase Edge Function directly** with the anon
key from `process.env` and assembles the analytics payload inline. Transport + analytics schema
leak into a UI primitive.
**Untangle:** move to `lib/analytics.ts` as `trackCtaClick(label, href)`; component just calls it.

### 🟠 MEDIUM — `components/admin/simple-crud-admin.tsx` & `hooks/use-admin-table.ts`
The generic CRUD component takes a raw **table name union** and runs
`supabase.from(table).insert/update/delete` and publish-toggling **inside the component**. The
hook does the same for reads. Convenient, but every admin screen is one `supabase` call away from
the schema, with no validation/zod layer and `as never` casts hiding type holes.
**Untangle:** a thin repository per entity (or a typed `crud<T>(table)` module) so components pass
data, not SQL-shaped intent.

### 🟠 MEDIUM — `components/enquiry-form.tsx`
Better than the others (it delegates writes to `submitLead`), but it still: imports hard-coded
`enquiryTypes` from `lib/data`, owns the budget-range option list inline, and derives the preset
(`listingId ? 'register_interest' : undefined`) in the component. The form-field state is fine;
the **mapping decisions** are the leak.
**Untangle:** source `enquiryTypes` + budget ranges from config, and let `lib/leads` own preset
selection.

### 🟡 LOW — Auth/role redirect logic in shells
`components/dashboard/dashboard-shell.tsx` (staff→`/admin` redirect) and
`components/admin/require-auth.tsx` (suspended / `user`-role / role-allow-list redirects)
re-implement, client-side, gating that `middleware.ts` also performs. Two sources of truth for
"who can be here." Presentational shells shouldn't own the authorization policy.
**Untangle:** centralize role-routing rules (a `lib/access.ts` policy) consumed by both
middleware and a single guard component.

### 🟡 LOW — `contexts/auth-context.tsx` `loadProfile`
The Auth provider does **self-healing data work**: if a `users` row is missing it upserts one,
re-reads it, and back-fills a possibly-missing `country` column defensively. That's
repository/migration concern living in a UI context.
**Untangle:** an `ensureUserProfile()` in the data layer (or a DB trigger — migration 017 already
syncs auth users, suggesting this client code is now partly redundant).

### 🟡 LOW — Hard-coded routing/role constants in `site-nav.tsx`
`HERO_TRANSPARENT_PATHS`, the `links` array, and the `isStaff` role computation
(`role==='admin'||'agent' && !suspended_at`) are embedded in the nav component. Reasonable for
one site, but it's per-client config baked into presentation.

### 🟡 LOW — `lib/adapters.ts` content-shaping
`listingToProperty` strips HTML with a regex and truncates a descriptor to 120 chars; rendering
concerns sitting in the data adapter. Minor, but it's display logic in the data path.

---

## 5. Notable Risks & Observations (for the untangling effort)

1. **Category taxonomy drift.** Migration 001 defines `listing_category` as
   `('project','completed','commercial')`; `lib/adapters.ts`/`slugUtils.ts` use
   `('project','buy','commercial','rent')`; migrations 007 & 018 add/rename categories; and
   `next.config.mjs` redirects `/completed→/buy`, `/rentals→/rent`. The "current" enum is what
   `lib/database.types.ts` says — verify before relying on either set. This is exactly the kind
   of split-brain that makes the `data.ts`/`adapters` layer fragile.
2. **`typescript.ignoreBuildErrors: true`** + frequent `as never` / `as Record<string,unknown>`
   casts (auth-context, simple-crud-admin) mean the type system is *not* currently a safety net.
   Type errors won't fail the build.
3. **Dual read layers** (`queries.ts` throws, `queries-server.ts` swallows) — easy to import the
   wrong one in the wrong context. Same function names, different failure modes.
4. **Lead creation has two code paths** (`lib/leads.ts` vs inline in `property-schedule.tsx`) —
   consolidating these is the single highest-value untangle for CRM correctness.
5. **`lib/data.ts`** hard-coded arrays appear to be legacy seed/fallback; confirm nothing public
   still renders them before deleting (the live pages fetch from Supabase and adapt).
6. **Security posture is sound where it matters**: service-role key is server-only; the one
   mutating API route (`api/admin/users/[id]`) re-checks `role==='admin' && !suspended_at` and
   blocks self-deletion. RLS migrations exist — confirm they cover the member tables that
   `property-actions.tsx` writes from the browser.

---

## 6. One-paragraph summary

A single Next.js 16 / React 19 App Router project hosts three surfaces — a server-rendered
marketing/listings site (`(site)`), a member dashboard, and a staff admin/CRM — all backed by one
Supabase project (Postgres + Auth + Storage + Edge Functions). The **reusable foundation** is:
route-group layouts, two-layer Supabase auth (edge middleware + `AuthProvider`), context-split
data access (`queries-server` for RSC, `queries` for client, `leads`/`storage`/`analytics` for
writes), a token-driven Tailwind v4 design system, a data-driven page-section CMS, and the
nav/footer/shell chrome. The **per-client presentation** is the brand tokens, imagery, marketing
copy components (`components/home/*`, category/property/about), and admin screens. The main
**tangles to untangle** are direct Supabase reads/writes embedded in presentational components —
most importantly `property-actions.tsx` (member CRUD) and `property-schedule.tsx` (which inserts
leads directly and bypasses the centralized `lib/leads` mapper), followed by `cta-button.tsx`
(inline edge-function call) and the admin CRUD/auth-guard logic living inside UI shells.
