# Supabase Setup (Announcements-Only)

This guide walks you through creating a fresh Supabase project that only stores rotating announcement lines for the Gerbera site. Running the schema script will **drop every existing table and view** so you start with a single, clean table.

---

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub or email)
2. Click **New Project**
3. Choose an organization, name the project (e.g., `gerbera-announcements`), and set a strong database password (save it!)
4. Pick the closest region and click **Create new project**
5. Wait a couple of minutes for Supabase to provision the resources

---

## Step 2: Reset the Database

1. In your project dashboard open **SQL Editor** → **New query**
2. Open `supabase-schema.sql` from this repo
3. Copy/paste everything into the query editor
4. Click **Run**
5. Expected result: `Success. No rows returned`

The script performs these actions:
- Drops **all** existing tables, views, and helper functions
- Recreates the helper triggers/functions needed for timestamps and admin checks
- Creates the single `announcement_lines` table
- Adds RLS policies + the update trigger
- Seeds two example announcements

Verify by opening **Table Editor** – you should only see `announcement_lines`.

---

## Step 3: Create an Admin User

1. Go to **Authentication** → **Users** → **Add user**
2. Enter your email + password and toggle **Auto confirm user**
3. After creation, open the user record and edit **Raw User Meta Data** to:
   ```json
   {
     "is_admin": true
   }
   ```
4. Save. This metadata flag is what the RLS policy checks to grant edit permissions.

---

## Step 4: Grab API Credentials

1. Settings → **API**
2. Copy **Project URL** and the **anon public key**
3. Add them to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

These are safe to expose in the browser; admin-only mutations are still protected by RLS.

---

## Step 5: Test Locally

1. Run `npm run dev`
2. Visit `/` to confirm the announcement bar renders (it will fall back to seeded data if empty)
3. Visit `/admin/login`, sign in with the user from Step 3
4. You should be redirected to `/admin/announcements`
5. Create, edit, delete, toggle, and reorder announcement lines – every action should persist in Supabase

---

## Optional: Clean Up Old Data

If you previously had buckets or tables you no longer need, you can delete them manually from the Supabase dashboard after running the schema script. Storage is no longer required for the announcements-only flow.

That's it! Your Supabase backend now contains just the data required for the announcement ticker.
