# Gerbera Announcements

Gerbera now runs in a "content-lite" mode – the public marketing site still renders the polished landing page, but the only dynamic data lives in the rotating top‑bar announcements that are powered by Supabase. Everything else falls back to static demo content so you can keep the brand experience online while rebuilding the rest of the catalog later.

## Features

- **Live Announcement Bar** – Manage multilingual promo lines from Supabase and they instantly appear on the public site.
- **Simplified Admin** – A single focused admin screen with CRUD, ordering, activation toggles, and authentication via Supabase.
- **Secure by Default** – Row Level Security combined with the `is_admin` metadata flag keeps edits restricted to approved accounts.
- **Zero Ops** – Still deployable on Vercel + Supabase free tiers with no additional services.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Reset Supabase to announcements-only
1. Open your Supabase project → **SQL Editor**
2. Paste the contents of [`supabase-schema.sql`](./supabase-schema.sql)
3. Run the script – it drops every previous table/view and recreates only `announcement_lines`

### 3. Configure environment variables
Create `.env.local` and fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

NEXT_PUBLIC_SITE_NAME="Gerbera Gifts"
NEXT_PUBLIC_CONTACT_EMAIL="hello@example.com"
```

### 4. Create an admin user
1. Supabase → **Authentication** → **Users** → **Add user**
2. Auto-confirm and set a strong password
3. Edit the user’s **Raw User Meta Data** to `{ "is_admin": true }`

### 5. Run the app
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to manage announcements.

### 6. Deploy
Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to push to GitHub and deploy on Vercel.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Current system design (announcements-first) |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Step-by-step Supabase reset + configuration |
| [QUICKSTART.md](./QUICKSTART.md) | 30-minute hands-on guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment checklist |
| [supabase-schema.sql](./supabase-schema.sql) | Canonical announcements-only schema |

## Project Structure

```
Gerbera/
├── app/
│   ├── (public)/              # Marketing site (static data + live announcements)
│   ├── admin/
│   │   ├── page.tsx           # Redirects /admin → /admin/announcements
│   │   ├── layout.tsx         # Auth wrapper + nav shell
│   │   ├── login/             # Admin login form
│   │   └── announcements/     # Announcement management page + client component
├── components/
│   ├── admin/AdminNav.tsx     # Simplified admin navigation
│   └── ...                    # Marketing components (still static/demo data)
├── lib/
│   └── supabase/              # Client/server helpers + shared types
└── supabase-schema.sql        # Database reset + table definition
```

## Row Level Security

`announcement_lines` has two policies:
- **Public read access** (`anon`, `authenticated` roles) limited to rows where `is_active = true`
- **Admin full access** (`authenticated` users with `user_metadata.is_admin = true`)

Supabase Auth still powers admin logins, so no API keys are exposed client-side beyond the anon key.

## Database Schema

Only one table remains:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto generated |
| `text_mk` | text | Macedonian copy |
| `text_en` | text | English copy |
| `display_order` | integer | Used for manual ordering (defaults to 0) |
| `is_active` | boolean | Toggle visibility without deleting |
| `created_at` | timestamptz | Defaults to now() |
| `updated_at` | timestamptz | Maintained via trigger |

The schema script seeds two example rows so the UI has data immediately.

## Troubleshooting

- **Login loops back to login** – Ensure the Supabase user has `"is_admin": true` in metadata.
- **No announcements appear** – Confirm at least one row is active (`is_active = true`) and `display_order` values are unique so sorting is deterministic.
- **Old tables still visible** – Re-run `supabase-schema.sql`. It drops existing tables and recreates only `announcement_lines`.

## Notes on Legacy Features

The catalog, product, and gallery experiences are still present in code but now rely on placeholder content. Once you are ready to reintroduce richer data models, you can extend the schema again or wire those components to a new backend without touching the announcement workflow created here.
