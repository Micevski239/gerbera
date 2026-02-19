# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Local dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript type checking
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in Supabase credentials. Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Architecture Overview

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript (strict) + Supabase + Tailwind CSS

**Current mode:** "Content-lite" — the only live dynamic data is the announcement bar powered by Supabase (`announcement_lines` table). All other sections (products, categories, testimonials, etc.) render static/demo fallback content. Legacy tables and components exist in code but are dormant.

### Routing

Uses App Router with route groups:
- `app/(public)/` — Marketing site pages (home, products, product/[id], category/[slug], about, contact)
- `app/admin/` — Admin interface behind Supabase Auth (announcements CRUD, login)

### Server/Client Component Split

- **Page files** are Server Components that fetch data via `createServerSupabaseClient()` from `lib/supabase/server.ts`
- **`*Client.tsx` files** are Client Components (`'use client'`) for interactivity
- Pattern: server page fetches data → passes as props to client component (e.g., `page.tsx` → `HomePageClient.tsx`)

### Data Fetching & Caching

- Public pages use `export const revalidate = 60` (ISR, 60-second cache)
- Admin pages use `export const dynamic = 'force-dynamic'`
- After client-side mutations, call `router.refresh()` to invalidate server cache

### Authentication

Supabase Auth with email/password. Admin access gated by `user_metadata.is_admin = true`. Auth helpers in `lib/supabase/server.ts`: `getCurrentUser()`, `isAdmin()`, `requireAdmin()`. Admin layout wraps all `/admin` routes with auth checks.

### Bilingual Support (Macedonian / English)

- `context/LanguageContext.tsx` provides `useLanguage()` hook with `t('key.path')` translation function
- DB fields use `_mk` / `_en` suffixes; `getLocalizedField(obj, field, language)` extracts the right one
- Language preference persisted in localStorage (`gerbera-language`)
- Translation strings live in `i18n/translations/`

### Supabase Clients

- `lib/supabase/server.ts` — Server-side client (cookies-based auth for SSR)
- `lib/supabase/client.ts` — Browser-side singleton client + `getImageUrl()` helper
- `lib/supabase/types.ts` — Auto-generated database types

### Styling

Tailwind CSS with a custom design system defined in `tailwind.config.ts` (burgundy/sage/gold palette, Nunito font) and component classes in `app/globals.css` (`.btn-*`, `.badge-*`, `.card`, `.heading-*`, grid utilities, skeleton loaders). Max content width: 1320px ("shell").

### RLS Policies

`announcement_lines` table:
- Public: SELECT where `is_active = true`
- Admin: Full CRUD if `user_metadata.is_admin = true`
