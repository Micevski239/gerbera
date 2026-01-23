# Architecture Overview (Announcements Edition)

Gerbera now runs in a simplified mode where the marketing site remains intact, but Supabase only stores the top-bar announcement lines. Every other section (hero, products, categories, etc.) uses static fallback data until new data models are introduced. This document captures the current state so you can confidently maintain or extend the announcement workflow.

---

## 1. High-Level Flow

```
Visitor -> Next.js (App Router) -> fetch announcement_lines via Supabase client
                                              |
                                              v
                                          AnnouncementLinesClient (admin)
```

- **Public site**: `app/(public)` server component (`page.tsx`) fetches announcements via the server Supabase client and passes them to `HomePageClient`. When the array is empty, the UI falls back to demo strings.
- **Admin site**: `app/admin/announcements` is a server component that enforces `isAdmin()` before rendering the client-side management UI. Mutations use the browser Supabase client and respect RLS.
- **Auth**: Supabase Auth handles sessions. Layout logic gates the entire `/admin` tree and the announcement page additionally redirects unauthenticated users to `/admin/login`.
- **Caching**: The announcement query runs in a server component with `export const revalidate = 60`, so updates propagate within a minute on the public site. The admin page uses `dynamic = 'force-dynamic'` so it always shows the latest data.

---

## 2. Directory Map (Relevant Parts)

```
app/
├── (public)/page.tsx            # Fetches announcement_lines
├── (public)/HomePageClient.tsx  # Renders marketing site + ticker
└── admin/
    ├── page.tsx                 # Redirects /admin → /admin/announcements
    ├── layout.tsx               # Auth wrapper + nav
    ├── login/page.tsx           # Supabase Auth login form
    └── announcements/
        ├── page.tsx             # Server component + data fetch
        └── AnnouncementLinesClient.tsx # CRUD UI

components/
└── admin/AdminNav.tsx           # Single-link nav with logout + view site

lib/
├── supabase/client.ts           # Browser client + helper (getImageUrl)
├── supabase/server.ts           # Server client + auth helpers
└── supabase/types.ts            # Shared domain types (announcement + legacy)
```

> Note: `components/` and `app/(public)` still contain the legacy product/catalog UI so designers can iterate on visuals. These sections no longer depend on Supabase data.

---

## 3. Database Schema

### Table: `announcement_lines`

| Column | Type | Details |
|--------|------|---------|
| `id` | uuid | Primary key (`gen_random_uuid()`) |
| `text_mk` | text | Macedonian copy (required) |
| `text_en` | text | English copy (required) |
| `display_order` | integer | Determines manual ordering (default 0) |
| `is_active` | boolean | Toggle visibility without deleting |
| `created_at` | timestamptz | Defaults to `now()` |
| `updated_at` | timestamptz | Maintained by trigger |

Supporting helpers:
- `update_updated_at_column()` – shared trigger to bump `updated_at`
- `is_admin()` – security definer function that inspects `auth.jwt() -> user_metadata.is_admin`

The SQL script also seeds two example rows so the ticker has content on first boot.

---

## 4. Security Model

1. **Authentication** – Supabase Auth with email/password. Admin users have `{"is_admin": true}` stored in `user_metadata`.
2. **Authorization** – RLS policies on `announcement_lines`:
   - Public `SELECT` limited to `is_active = true`
   - Authenticated `ALL` limited to users passing `is_admin()`
3. **Admin Layout** – `app/admin/layout.tsx` checks `isAdmin()` server-side. Non-admins only see the requested page (used by `/admin/login`), while admins see the nav shell.
4. **Client Mutations** – `AnnouncementLinesClient` uses the browser Supabase client. Since the anon key is loaded, the RLS policies enforce permissions.

---

## 5. Data Fetching & Caching

| Area | Method | Notes |
|------|--------|-------|
| Public homepage | `app/(public)/page.tsx` server component | Runs on the server, uses `createServerSupabaseClient()`, revalidates every 60 seconds. Logs errors but falls back to static content.
| Admin page | `app/admin/announcements/page.tsx` | Marked `dynamic = 'force-dynamic'` to avoid caching; redirects to `/admin/login` when unauthorized.
| Client actions | `AnnouncementLinesClient` | Uses optimistic UI only for display order changes (two update calls in sequence). After mutation it calls `router.refresh()`.

---

## 6. Deployment Notes

- Vercel hosts the Next.js application. No API routes are required for this flow.
- Supabase hosts the Postgres database + Auth. Storage buckets are no longer required, but the helper `getImageUrl` remains for any legacy images you might keep.
- Environment variables needed in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus any marketing copy overrides like `NEXT_PUBLIC_SITE_NAME`.
- Incremental Static Regeneration ensures the ticker updates within a minute in production. If you need immediate updates, temporarily run `npm run dev` locally or adjust `revalidate`.

---

## 7. Extending the System

When you're ready to reintroduce richer data models:
1. Design the new tables (products, galleries, etc.) and add them to `supabase-schema.sql`.
2. Regenerate or hand-edit `lib/supabase/types.ts` to reflect the new schema.
3. Rebuild admin screens (likely reusing parts of the legacy directories that were removed).
4. Update the homepage queries to use the new tables instead of fallback content.

Until then, the announcement pipeline described above is self-contained and safe to operate.
