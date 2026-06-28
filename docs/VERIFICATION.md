# MR ESTATES — Backend Verification Checklist

Run after completing Supabase project setup and `npm run db:push` (or `npm run db:reset` locally).

## Infrastructure

- [ ] `supabase/migrations/` applied — 001 through 004 (+ 002b, 003)
- [ ] All tables exist in Supabase Table Editor
- [ ] RLS enabled on every table (`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`)
- [ ] Storage buckets created: listing-images, listing-renders, listing-floorplans, listing-brochures, blog-covers, team-photos, documents
- [ ] Edge functions deployed: `npm run fn:deploy`
- [ ] Database webhook on `leads` INSERT → `handle-new-lead` function URL

## Auth

- [ ] Staff user created in Supabase Auth (Authentication → Users)
- [ ] `002b_seed_admin.sql` email updated to your login email, then migration re-run or manual `UPDATE users SET role = 'admin'`
- [ ] `/admin/login` — sign in works
- [ ] `/admin` — dashboard loads with seeded metrics
- [ ] Non-authenticated visit to `/admin/leads` redirects to login

## Public site

- [ ] `npm run dev` — no env errors with `.env.local` filled
- [ ] `/projects`, `/completed`, `/commercial` — listings from Supabase (or empty state if unpublished)
- [ ] `/contact` — form submit creates `leads` row
- [ ] Footer newsletter — creates `newsletter_subscribers` row
- [ ] Property page enquiry — `listing_id` set on lead row
- [ ] Navigate pages — `page_views` rows appear

## Edge functions & email

- [ ] New lead triggers `handle-new-lead` (check Edge Function logs)
- [ ] `lead_tasks` row created ("Follow up new lead", due +24h)
- [ ] `lead_activities` auto-note created
- [ ] Resend emails sent (admin + lead confirmation) when `RESEND_API_KEY` set

## SEO & build

- [ ] `node scripts/generate-sitemap.js` exits 0
- [ ] `npm run build` succeeds
- [ ] `public/robots.txt` disallows `/admin/`
- [ ] JSON-LD present on home and listing pages (view source)

## Manual setup commands (one-time)

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
# Fill .env.local from dashboard → Settings → API
npx supabase db push
npm run db:types
supabase secrets set RESEND_API_KEY=re_xxx ADMIN_NOTIFY_EMAIL=you@example.com
npm run fn:deploy
```

Configure webhook in Dashboard → Database → Webhooks:
- Table: `leads`
- Events: INSERT
- URL: `https://<project-ref>.supabase.co/functions/v1/handle-new-lead`
- HTTP headers: `Authorization: Bearer <SERVICE_ROLE_KEY>`
