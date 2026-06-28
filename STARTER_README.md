# Starter Template

A reusable **Next.js 16 (App Router) + Supabase + Tailwind v4** starter, derived from a
production real-estate platform and stripped to a clean, brandless skeleton. It ships
type-checking, lint-clean, and building with neutral placeholder content.

> **Reference docs in this repo:**
> - **`INTEGRATION_CONTRACT.md`** — exact names/types of every hook, provider, layout shell,
>   page template, and `lib/` data helper. **Target this for any v0 design or merge step.**
> - **`ARCHITECTURE_ANALYSIS.md`** — foundation vs. presentation split + where logic is tangled.
> - **`token-map.md`** — shadcn/v0 tokens → this project's `@theme` tokens (read the CTA/accent rules).
> - **`component-map.md`** — shadcn primitives → this project's components / rebuild guidance.
> - **`PLACEHOLDERS.md`** — index of every placeholder, `TODO(client)`, asset, and unset theme value.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js `16.0.10` (App Router, RSC) |
| Runtime | React `19.2.0` |
| Styling | Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`; **no** `tailwind.config`) |
| UI | shadcn/ui (new-york) + Radix + bespoke editorial components |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Animation | Framer Motion |
| Lint | ESLint flat config (`next/core-web-vitals`) |

All dependencies are **pinned to exact versions** in `package.json`.

## Quick start

```bash
pnpm install
cp .env.example .env.local      # then fill in real values (see PLACEHOLDERS.md §2)
pnpm dev
```

Verify any time:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm build       # regenerates sitemap + next build
```

## Per-client customization (in order)

1. **Brand tokens** — set the colour VALUES in `app/globals.css` (`@theme` token names stay).
   Read `token-map.md` first: `accent` is the CTA colour, `primary === band`, and dark mode is dead code.
2. **Brand name + copy** — replace every `{{...}}` placeholder and resolve each `TODO(client):`
   (full index in `PLACEHOLDERS.md`). Start with `{{BRAND_NAME}}` and `{{SITE_DESCRIPTION}}`.
3. **Assets** — drop real logos/photography into `public/images/` (filenames are referenced already;
   all are currently neutral placeholders) and update favicons in `public/`.
4. **Environment** — set Supabase, Resend, and (optional) Twilio values in `.env.local`; set the
   same secrets in the Supabase dashboard for Edge Functions.
5. **Database** — link the project (`supabase link`), run migrations (`pnpm db:push`), regenerate
   types (`pnpm db:types`), and either edit `supabase/seed.sql` or manage content via the admin CRM.
6. **SEO** — set `NEXT_PUBLIC_SITE_URL`; `robots.txt`/`sitemap.xml`/structured data follow from it.

## What was kept vs. stripped

**Kept (foundation):** App Router structure, `@/*` root alias, middleware/auth, the
`lib/supabase/` data layer (client/server/admin/middleware), providers + context, the layout
shell, routing skeleton (`[id]`/slug patterns), reusable structural + admin/dashboard components,
the Supabase schema (migrations, RLS, storage, edge functions), and the Tailwind `@theme` token **names**.

**Stripped to placeholders (per-client):** brand name & copy, contact details, logos & photography
(neutral placeholders), seed/mock data, structured-data locale, and all `@theme` token **values**.

**Fixed (not carried forward):** removed `typescript.ignoreBuildErrors`; exported the real enum
aliases (`ListingCategory`, `UserRole`, `LeadCategory`, …) from `lib/database.types.ts`; removed a
duplicate generated table type; corrected the `useAdminTable` generic; pinned all dependencies.

## Notes

- **ESLint:** the new React-Compiler-grade rules from `react-hooks@7`
  (`set-state-in-effect`, `static-components`, `refs`, `purity`, `globals`) are disabled in
  `eslint.config.mjs` because they flag idiomatic, correct patterns here. `rules-of-hooks` and
  `exhaustive-deps` remain ON. Re-enable the others if/when you adopt the React Compiler.
- **Edge Functions** (`supabase/functions/**`) run on Deno and are excluded from lint/typecheck.
