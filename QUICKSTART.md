# Quick Start Guide - Get Running in 30 Minutes

This is the fastest path to get your Christmas catalog running locally.

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] Node.js 18+ installed ([download](https://nodejs.org))
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account ([sign up free](https://supabase.com))
- [ ] Basic command line knowledge

---

## Step 1: Install Dependencies (2 minutes)

Open terminal in the project folder:

```bash
npm install
```

Wait for installation to complete.

---

## Step 2: Create Supabase Project (5 minutes)

### 2.1 Create Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Create new organization (if needed)

### 2.2 Create Project
1. Click "New Project"
2. Name: `christmas-catalog`
3. Database Password: **Generate strong password and SAVE IT**
4. Region: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes

---

## Step 3: Set Up Database (5 minutes)

### 3.1 Run SQL Schema
1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open `supabase-schema.sql` from your project folder
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click **"Run"**
7. Should see: "Success. No rows returned"

### 3.2 Verify Tables
1. Click **"Table Editor"** (left sidebar)
2. You should only see one table: `announcement_lines`

---

## Step 4: Create Admin User (5 minutes)

### 5.1 Create User
1. Click **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - Email: your-email@example.com
   - Password: strong-password (SAVE THIS!)
   - Auto Confirm User: ✅ YES
4. Click **"Create user"**

### 5.2 Make User Admin (CRITICAL!)
1. Click on the user you just created
2. Scroll to **"Raw User Meta Data"**
3. Click **"Edit"** (pencil icon)
4. Replace JSON with:
   ```json
   {
     "is_admin": true
   }
   ```
5. Click **"Save"**

---

## Step 5: Get API Keys (2 minutes)

1. Click **"Settings"** (gear icon, bottom left)
2. Click **"API"**
3. Copy these two values:

**Project URL:**
```
https://xxxxx.supabase.co
```

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(long string)
```

---

## Step 6: Configure Environment (2 minutes)

1. In your project folder, copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...

NEXT_PUBLIC_SITE_NAME="Christmas Decorations"
NEXT_PUBLIC_CONTACT_EMAIL="your-email@example.com"
```

---

## Step 7: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the homepage! 🎉

---

## Step 8: Test Admin Login (3 minutes)

1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Enter:
   - Email: (from Step 4)
   - Password: (from Step 4)
3. Click "Log In"
4. You should land on the Announcements screen and be able to add/edit rows

**If you see "Unauthorized":**
- Go back to Step 5.2
- Make sure `is_admin: true` is saved
- Log out and log in again

---

### Q: Can multiple people be admins?

**A:** Yes! Create more users and set `is_admin: true` for each.

### Q: What if I exceed free tier limits?

**A:**
- Optimize images (<500KB each)
- Supabase Pro is $25/month (100GB bandwidth)
- Very unlikely for small catalogs

---

## Documentation Reference

| Guide | When to Use |
|-------|-------------|
| **QUICKSTART.md** (this file) | First time setup |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Detailed Supabase config |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to production |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Understand the system |
| [README.md](./README.md) | Project overview |

---

## Success Checklist

After following this guide, you should have:

- [x] Supabase project created
- [x] Database schema installed
- [x] Storage bucket configured
- [x] Admin user created with `is_admin: true`
- [x] Environment variables set
- [x] App running on localhost:3000
- [x] Successfully logged into admin dashboard
- [x] Created at least one category
- [x] Created at least one product with image
- [x] Viewed product on public site

**If all checked: Congratulations! 🎄**

---

## Get Help

**Stuck on something?**

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed steps
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
3. Review error messages in browser console (F12)
4. Check Supabase logs (Dashboard → Logs)

**Still stuck?**
- Supabase: [Discord](https://discord.supabase.com)
- Next.js: [Documentation](https://nextjs.org/docs)

---

**Ready to deploy? → [DEPLOYMENT.md](./DEPLOYMENT.md)**
## Troubleshooting

### "Failed to fetch" error
**Problem:** App cannot reach Supabase

**Fix:**
1. Verify `.env.local` contains the correct Supabase URL + anon key
2. Restart `npm run dev` so the new env vars load
3. Check the Supabase dashboard → Database to ensure the project is online

### "Unauthorized" when logging in
**Problem:** Admin metadata flag missing

**Fix:**
1. Supabase → Authentication → Users → select your user
2. Edit **Raw User Meta Data** to `{ "is_admin": true }`
3. Log out and sign in again

### No announcements appear on the site
**Problem:** All rows are inactive or missing

**Fix:**
1. Create an announcement in the admin UI
2. Ensure the toggle is enabled (is_active = true)
3. Wait for ISR (60s) or reload your dev server to see the update immediately

### Old tables still show up
**Problem:** Schema reset did not complete

**Fix:**
1. Re-run `supabase-schema.sql`
2. Confirm no SQL errors were thrown
3. Refresh Table Editor – only `announcement_lines` should remain

---

## Next Steps

- **Customize content**: Update the static sections in `app/(public)` to better match your brand.
- **Style the ticker**: Adjust the announcement bar styles inside `HomePageClient.tsx` and related components.
- **Deploy**: When ready, follow [DEPLOYMENT.md](./DEPLOYMENT.md) to push everything to Vercel.

---

## Common Questions

### Q: Do I still need Supabase Storage?
**A:** Not for this announcement-only setup. You can delete any old buckets to keep things tidy.

### Q: Can I bring back products later?
**A:** Absolutely. Introduce new tables, regenerate types, and rebuild the admin screens when you're ready. The announcement workflow will continue to operate independently.

### Q: How do I back up announcements?
**A:** Use Supabase Dashboard → Database → Backups for automatic daily snapshots, or export the `announcement_lines` table manually from SQL Editor.
