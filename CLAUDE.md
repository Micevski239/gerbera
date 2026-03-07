# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Local dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript type checking (also: npx tsc --noEmit)
```

No test framework is configured.

## Environment Setup

Copy `.env.local.example` to `.env.local`. Required vars:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

Optional:
- `SUPABASE_SERVICE_ROLE_KEY` — Used server-side if set; falls back to anon key
- `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`

## Architecture Overview

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript (strict) + Supabase + Tailwind CSS 3

**Path alias:** `@/*` maps to the project root (e.g., `@/components/Header`, `@/lib/supabase/server`).

### Routing

App Router with route groups:
- `app/(public)/` — Marketing pages (home, products, product/[id], category/[slug], about, contact)
- `app/admin/` — Admin interface behind Supabase Auth (announcements, products, categories, occasions, hero-tiles, sections, stats, testimonials)

### Server/Client Component Split

- **Page files** (`page.tsx`) are Server Components that fetch data via `createClient()` from `lib/supabase/server.ts`
- **`*Client.tsx` files** are Client Components (`'use client'`) receiving data as props
- Pattern: server page fetches → passes props to client component (e.g., `page.tsx` → `HomePageClient.tsx`)

### Data Fetching & Caching

- Public pages use `export const revalidate = 3600` (ISR, 1-hour cache)
- Admin pages use `export const dynamic = 'force-dynamic'`
- After client-side mutations, call `router.refresh()` to invalidate server cache

### Authentication

Supabase Auth with email/password. Admin access gated by `user_metadata.is_admin = true`. Auth helpers in `lib/supabase/server.ts`: `getCurrentUser()`, `isAdmin()`, `requireAdmin()`. Admin layout (`app/admin/layout.tsx`) wraps all `/admin` routes with auth check; unauthenticated users see the login page passthrough.

### Supabase Clients

- `lib/supabase/server.ts` — Server-side client (cookies-based auth for SSR). Exports both `createServerSupabaseClient()` and alias `createClient`. Uses `SUPABASE_SERVICE_ROLE_KEY` if available, otherwise anon key.
- `lib/supabase/client.ts` — Browser-side client via `createBrowserClient()` + `getImageUrl(storagePath)` helper for Supabase storage URLs.
- `lib/supabase/types.ts` — Hand-maintained database types. Convenience Row/Insert/Update type aliases exported at the bottom.

### Database Schema

Primary tables used by the live site: `categories`, `products`, `product_images`, `occasions`, `product_occasions`, `hero_tiles`, `sections`, `announcement_lines`, `site_stats`, `testimonials`, `about_content`, `about_stats`, `about_gallery`, `homepage_sections`, `homepage_section_items`.

Views: `products_with_details`, `homepage_sections_with_items`.

All bilingual fields use `_mk` / `_en` suffixes. Most tables have `display_order`, `is_active`/`is_visible`, and `created_at`/`updated_at` columns.

SQL migrations live in `supabase/migrations/` and `lib/supabase/migrations/`. The canonical base schema is `supabase-schema.sql`.

### Bilingual Support (Macedonian / English)

- `context/LanguageContext.tsx` provides `useLanguage()` hook with `t('key.path')` for UI string translations
- `getLocalizedField(obj, field, language)` extracts `_mk`/`_en` suffixed DB fields
- `useLocalized(obj, field)` — hook version that reads current language from context
- Language preference persisted in localStorage key `gerbera-language`
- Translation strings in `i18n/translations.ts` (single file, keyed by language)

### Styling

Tailwind CSS with a custom design system in `tailwind.config.ts`:
- **Colors:** coral primary, sage secondary, saffron accent, plus `canvas`, `surface`, `ink`, `border`, `neutral`, `pastel` tokens
- **Fonts:** Playfair Display (`font-heading`), Nunito (`font-body`), Bad Script (`font-handwriting`) — loaded via `next/font/google` in `app/layout.tsx` as CSS variables
- **Type scale:** `text-ds-display`, `text-ds-title`, `text-ds-section`, `text-ds-body`, `text-ds-body-lg`, `text-ds-body-sm`, `text-ds-eyebrow`
- **Layout:** Max content width `max-w-shell` (82.5rem/1320px). Container class: `.section-shell` or `.container-custom`
- Component classes in `app/globals.css`: `.btn-*`, `.badge-*`, `.card`, `.heading-*`, `.section`, `.section-header`, grid utilities, skeleton loaders

### Image Configuration

`next.config.js` allows remote images from `*.supabase.co/storage/...`, `images.unsplash.com`, and `placehold.co`. Server actions have a 10MB body size limit.

### RLS Policies

`announcement_lines` table:
- Public: SELECT where `is_active = true`
- Admin: Full CRUD if `user_metadata.is_admin = true`
