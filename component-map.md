# component-map.md — shadcn primitives → MR ESTATES equivalents

> **Important context.** The full shadcn/ui "new-york" set (~50 primitives) **is installed** under
> `components/ui/`, but it is **barely used outside that folder**. The public/editorial site and
> most admin screens are built from **bespoke components + plain elements styled with brand
> utility classes** (see `token-map.md`). So for each primitive there are up to three answers:
> (1) the installed `ui/` path, (2) the project's actual bespoke equivalent / Tailwind pattern,
> and (3) guidance. When porting a v0 screen, **prefer the bespoke editorial pattern for public
> pages**, and the `ui/` primitive only where the project already uses it (mostly admin/auth).
>
> Legend: ✅ installed & used · ⚠️ installed but rarely/not used in app · 🔨 rebuild as plain element.

## Layout / structural

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Card` | `ui/card.tsx` ⚠️ | `@/components/project-card` (`ProjectCard`), `@/components/article-card` (`ArticleCard`), `@/components/layout/editorial-section` (`EditorialSection`) | Public cards = bespoke. Pattern: plain `div` + `bg-white border border-border` (panel) or borderless editorial blocks. Use `ui/card` only if matching an admin panel. |
| `Separator` | `ui/separator.tsx` ⚠️ | Tailwind `border-t border-border` (used everywhere) | 🔨 Prefer `border-t border-border` / `<span className="h-px w-8 bg-gold" />` for the brand hairline. |
| `AspectRatio` | `ui/aspect-ratio.tsx` ⚠️ | Tailwind `aspect-[4/3]`, `aspect-[3/4]`, `aspect-[16/9]` on a wrapper | 🔨 Use `aspect-[…]` utility directly (as `CategoryGrid`/`PropertyShowcase` do). |
| `ScrollArea` | `ui/scroll-area.tsx` ⚠️ | native `overflow-auto` | 🔨 Plain `overflow-y-auto`. |
| `Resizable` | `ui/resizable.tsx` ⚠️ | — | Not used; keep only if a split-pane is needed. |
| `Sidebar` | `ui/sidebar.tsx` ⚠️ | `@/components/admin/admin-shell` (`AdminShell`) + `@/components/dashboard/dashboard-shell` (`DashboardShell`) | 🔨 **Do not use `ui/sidebar`** — it needs `--sidebar-*` tokens that don't exist here. Admin/dashboard nav is bespoke and themed via `AdminThemeProvider`. |

## Buttons & links

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Button` | `ui/button.tsx` ⚠️ | Plain `<button>`/`<Link>` + brand classes; bespoke: `@/components/motion/magnetic-button` (`MagneticButton`), `@/components/cta-button` (`CTAButton`, also fires analytics), `@/components/ui/animated-link` (`AnimatedLink`), `@/components/nav-link` (`NavLink`) | 🔨 For public CTAs use the patterns in `token-map.md` cheat sheet (forest-deep solid / gold pill / outline). `CTAButton` when you need click tracking. `ui/button` acceptable in admin forms. |
| `ButtonGroup` | `ui/button-group.tsx` ⚠️ | flex row of buttons | 🔨 Plain `flex gap-2`. |
| `Toggle` / `ToggleGroup` | `ui/toggle*.tsx` ⚠️ | bespoke toggle buttons (admin pipeline/status use `pipelineActive`/`pipelineInactive` token strings) | 🔨 Plain buttons with active/inactive classes. |

## Badges, labels, eyebrows

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Badge` | `ui/badge.tsx` ⚠️ | `@/components/section-eyebrow` (`SectionEyebrow`) + `.eyebrow` class; admin role pills = plain `<span class="rounded-full border px-2.5 py-0.5 text-xs">` | 🔨 Public "labels" are eyebrows, not pills — use `.eyebrow` / `<SectionEyebrow>`. Status pills = plain span with `border-border` (admin uses theme token `badge`). |
| `Label` | `ui/label.tsx` ⚠️ | plain `<label className="text-xs text-muted-foreground">` (as in `EnquiryForm`) | 🔨 Plain label. |

## Forms & inputs

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Input` | `ui/input.tsx` ⚠️ | plain `<input>` + shared `fieldClass` (defined inline in `enquiry-form`, `property-actions`, `property-schedule`) | 🔨 Reuse the `fieldClass` pattern: `border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold/30`. |
| `Textarea` | `ui/textarea.tsx` ⚠️ | plain `<textarea>` + `fieldClass` + `resize-none` | 🔨 Same as input. |
| `Select` (Radix) | `ui/select.tsx` ⚠️ | **native `<select>`** + `fieldClass` (EnquiryForm) | 🔨 Public forms use native select. Use Radix `ui/select` only if you need custom styling/portal. |
| `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `InputOTP` | `ui/*.tsx` ✅(avail) | — (no bespoke variant) | Use the `ui/` primitive; restyle with brand tokens. |
| `Form` (RHF wrapper) | `ui/form.tsx` ⚠️ | **not used** — bespoke forms use raw `useState` + manual submit (e.g. `EnquiryForm`) | 🔨 Either keep raw-state pattern, or adopt `ui/form` + `react-hook-form` + `zod` (both installed) for new complex forms. |
| `Field`, `InputGroup`, `Item`, `Empty`, `Kbd` | `ui/*.tsx` ⚠️ | — | Niche; use as-is or skip. |

## Overlays & menus

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Dialog` | `ui/dialog.tsx` ✅ | Used by `@/components/staff-auth-dialog`. Bespoke alternative: `ModalWrapper` inside `property-actions.tsx` and the modal in `property-schedule.tsx` (plain fixed overlay + `bg-ink/40 backdrop-blur-sm`) | Mixed. For new modals either reuse `ui/dialog` (auth) or copy the bespoke `ModalWrapper` pattern (property flows). |
| `AlertDialog` | `ui/alert-dialog.tsx` ⚠️ | — | Use `ui/alert-dialog` for confirms (admin deletes), restyled. |
| `Sheet` / `Drawer` (vaul) | `ui/sheet.tsx`, `ui/drawer.tsx` ⚠️ | bespoke mobile menu = Framer-Motion panel in `@/components/site-nav`; admin lead drawer = plain fixed panel via theme token `drawer` | 🔨 Public mobile nav is a custom motion drawer — keep it. |
| `DropdownMenu` / `ContextMenu` / `Menubar` / `NavigationMenu` | `ui/*.tsx` ⚠️ | desktop nav = plain `<ul>`/`<NavLink>` list in `site-nav` | 🔨 Primary nav is plain links. Use `ui/dropdown-menu` for admin row actions if needed. |
| `Popover` / `HoverCard` / `Tooltip` | `ui/*.tsx` ⚠️ | — | Use `ui/` primitive as-is. |
| `Command` (cmdk) | `ui/command.tsx` ⚠️ | — | Use as-is if you add a command palette / search. |

## Tabs, disclosure, navigation

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Tabs` | `ui/tabs.tsx` ⚠️ | admin uses **bespoke tab buttons** styled via `AdminThemeProvider` tokens `tabActive` / `tabInactive` | 🔨 For admin, match existing bespoke tabs (plain buttons + token classes). Public site has no tabs. |
| `Accordion` | `ui/accordion.tsx` ⚠️ | — (no bespoke equivalent in use) | Use `ui/accordion` restyled with brand tokens (e.g. FAQ blocks), or 🔨 rebuild as `<details>` for a minimal editorial look. |
| `Collapsible` | `ui/collapsible.tsx` ⚠️ | — | Use as-is. |
| `Breadcrumb` | `ui/breadcrumb.tsx` ⚠️ | SEO breadcrumbs are **JSON-LD only** (`buildBreadcrumb` in `lib/schemaUtils.ts`); no visual breadcrumb component in use | 🔨 If a visual breadcrumb is needed, build plain `text-xs text-muted-foreground` links; keep JSON-LD separate. |
| `Pagination` | `ui/pagination.tsx` ⚠️ | — | Use as-is if listing pagination is added. |

## Data display & feedback

| shadcn primitive | Installed `ui/` path | THIS project equivalent | Guidance |
|---|---|---|---|
| `Table` | `ui/table.tsx` ⚠️ | admin uses **plain `<table>`** + theme tokens (`tableBorder`, `tableHeader`, `tableRow`) — see `simple-crud-admin.tsx` | 🔨 Match the existing plain-table + `useAdminTheme().t.*` pattern for admin tables. |
| `Chart` (Recharts) | `ui/chart.tsx` ✅ | admin analytics (`analytics-admin`) | ⚠️ **No `--chart-*` brand tokens defined** — pass explicit brand colours (forest/gold/green-mid) instead of relying on chart CSS vars. |
| `Avatar` | `ui/avatar.tsx` ⚠️ | dashboard uses plain initials circle (`bg-gold/30` + computed initials) in `dashboard-shell` | 🔨 Reuse the bespoke initials circle, or `ui/avatar` with image fallback. |
| `Progress` | `ui/progress.tsx` ⚠️ | upload progress handled numerically in `lib/storage.ts` (`onProgress`) | Use `ui/progress` if you surface it visually. |
| `Skeleton` | `ui/skeleton.tsx` ⚠️ | loading states are plain `"Loading…"` text (e.g. `RequireAuth`, `useAdminTable`) | 🔨 Either keep text or adopt `ui/skeleton`. |
| `Spinner` | `ui/spinner.tsx` ⚠️ | bespoke `<Loader2 className="animate-spin" />` (lucide) in modals | 🔨 Use the lucide `Loader2` spin pattern already in property flows. |
| `Toast` / `Toaster` (Radix) | `ui/toast.tsx`, `ui/toaster.tsx` ⚠️ | — | See Sonner row. |
| `Sonner` | `ui/sonner.tsx` ⚠️ | bespoke `SuccessToast` (fixed bottom-right) in `property-actions.tsx`; `use-toast` hook exists | ⚠️ **No `<Toaster>`/`<Sonner>` is mounted** in `app/layout` or `providers`. So `toast()` calls won't render until one is mounted. Public success feedback currently = bespoke `SuccessToast`. 🔨 Reuse `SuccessToast`, or mount `ui/sonner` once and use `sonner.toast()`. |
| `Alert` | `ui/alert.tsx` ⚠️ | inline error text `<p className="text-sm text-destructive">` (forms) | 🔨 Inline destructive text is the established pattern. |

## Media & rich text (project-specific, no shadcn default)

| Need | THIS project component | Notes |
|---|---|---|
| Images | `@/components/optimized-image` (`OptimizedImage`) | wraps `next/image`; props `{ src, alt, fill?, sizes?, priority?, width?, height? }`. Prefer over raw `<img>`/`next/image`. |
| Rich-text **display** | `@/components/rich-text-content` (`RichTextContent`) | renders Tiptap HTML or falls back to plain text; pair with `.section-rich-text` CSS. |
| Rich-text **editing** | `@/components/admin/rich-text-editor` (`RichTextEditor`) | Tiptap 3 editor (admin only). |
| Scroll/entrance motion | `@/components/motion/*`: `FadeUp`, `TextReveal`, `ImageReveal`, `HoverZoom`, `DrawUnderline`, `MagneticButton` | Framer-Motion primitives; honour `usePrefersReducedMotion()`. Use these instead of `tw-animate-css` for editorial reveals. |
| Section scaffolding | `EditorialSection`, `SectionEyebrow`, `SectionNumeral`, `BrokenGridImage` (`@/components/layout/*`, `@/components/section-eyebrow`) | The editorial layout vocabulary — compose pages from these. |
| CMS section render | `@/components/page-sections/page-section-renderer` + `page-layout-composer` | data-driven section rendering. |

## Decision rule for a v0 port

1. **Public / marketing page?** → build from **bespoke editorial components + brand utilities**
   (`EditorialSection`, `SectionEyebrow`, `ProjectCard`, `MagneticButton`, motion primitives).
   Treat `ui/*` as a last resort.
2. **Admin / dashboard / auth?** → `ui/*` primitives are acceptable, but **style with
   `AdminThemeProvider` tokens** (tables, tabs, drawers, modals already follow this) and avoid
   `ui/sidebar`.
3. **No clean match anywhere?** → 🔨 rebuild as a plain element using the `token-map.md` cheat
   sheet, matching radius `rounded-sm`/`0.25rem`, `border-border` hairlines, and the
   serif/`.eyebrow` type system.

> **Default path for v0-designed PUBLIC elements = REBUILD, not drop-in.** Because the public
> site is overwhelmingly bespoke editorial components and rarely uses `ui/*`, the default for any
> v0-designed public element is to **rebuild it as a branded editorial component** (e.g.
> `ProjectCard` / `ArticleCard` / `EditorialSection`, with `SectionEyebrow` + the motion
> primitives) — **not** to drop in a shadcn primitive. Reaching for a `ui/*` primitive on a public
> page is the exception, not the rule. **Only admin surfaces default to themed `ui/*`.**
