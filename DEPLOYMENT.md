# Deployment Guide

This guide walks you through deploying the Gerbera marketing site with its Supabase-powered announcement bar.

## Prerequisites

- Supabase account (free tier)
- Vercel account (free tier)
- GitHub account
- Git installed locally

---

## Step 1: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Christmas catalog"

# Create GitHub repository and push
# Follow GitHub instructions to create a new repository, then:
git remote add origin https://github.com/YOUR_USERNAME/christmas-catalog.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Supabase Project

See **SUPABASE_SETUP.md** for detailed Supabase configuration.

**Quick checklist:**
- [ ] Create Supabase project
- [ ] Run SQL schema (`supabase-schema.sql`)
- [ ] Create admin user and set `is_admin: true`
- [ ] Copy Supabase URL and anon key

---

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your `christmas-catalog` repository
5. Click **"Import"**

### 3.2 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave default)

**Build Command:** `npm run build` (auto-detected)

**Output Directory:** `.next` (auto-detected)

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Where to Find |
|------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SITE_NAME` | "Christmas Decorations" | (or your business name) |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | "Handmade Christmas decorations" | (optional) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | your-email@example.com | (optional) |

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Visit your deployed site at `https://your-project.vercel.app`

---

## Step 4: Add Custom Domain (Optional)

### 4.1 In Vercel

1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `christmasdecor.com`)
4. Follow Vercel's DNS configuration instructions

### 4.2 Update DNS

Add these records to your domain DNS:

**For Apex Domain (christmasdecor.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain (www.christmasdecor.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Wait for SSL

- Vercel automatically provisions SSL certificate (Let's Encrypt)
- Takes 5-10 minutes
- Your site will be available at `https://yourdomain.com`

---

## Step 5: Test Everything

### Public Site
- [ ] Visit the homepage
- [ ] Confirm the announcement bar renders and rotates (if multiple rows exist)
- [ ] Check the rest of the marketing content loads (it falls back to static data)
- [ ] Test on mobile/tablet breakpoints

### Admin Dashboard
- [ ] Log in at `/admin/login`
- [ ] Create or edit an announcement line
- [ ] Toggle `is_active` on/off
- [ ] Move a line up/down
- [ ] Refresh the homepage to verify the update

---

## Step 6: Update Supabase URL Whitelist (Security)

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL**:
   ```
   https://your-project.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   ```

---

## Continuous Deployment

Every time you push to `main` branch, Vercel automatically:
1. Pulls latest code
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys to production

**No manual deployments needed!**

---

## Monitoring & Maintenance

### Vercel Dashboard
- **Analytics**: View traffic, performance
- **Logs**: Debug errors
- **Deployments**: See deployment history

### Supabase Dashboard
- **Database**: Monitor storage usage
- **Storage**: Check image storage (1GB free)
- **Auth**: View admin login activity

### Free Tier Limits

**Vercel:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL

**Supabase:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month

**If you exceed limits:**
- Optimize images (compress to <500KB each)
- Consider upgrading Supabase ($25/month for 100GB bandwidth)

---

## Rollback (If Deployment Fails)

1. Go to Vercel Dashboard → **Deployments**
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Troubleshooting

### Announcements Not Updating
- Make sure the row is saved with `is_active = true`
- Trigger a revalidation by refreshing the homepage (ISR is set to 60 seconds)
- Check Supabase logs for errors (Table Editor → announcement_lines)

### Admin Can't Log In
- Verify user has `is_admin: true` in Supabase user metadata
- Check RLS policies are enabled (they come from `supabase-schema.sql`)
- Clear browser cache and try again

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Test build locally: `npm run build`

---

## Cost Estimate

| Service | Free Tier | Typical Usage | Cost |
|---------|-----------|---------------|------|
| Vercel | 100GB bandwidth | <10k visits/month | **$0** |
| Supabase | 500MB DB, 1GB storage, 2GB bandwidth | <500 announcement rows | **$0** |
| Domain (optional) | N/A | 1 domain | **$10-15/year** |

**Total: $0-15/year**

---

## Next Steps

1. **Customize copy**: Update hero text, imagery, and sections in `app/(public)`
2. **Polish the ticker**: Adjust announcement styles or durations to match your brand
3. **Analytics**: Add Google Analytics (optional)
4. **Backup**: Export the `announcement_lines` table weekly (Supabase Dashboard → Database → Backups)
5. **Plan the rebuild**: When you're ready for products again, design the new schema before reintroducing admin screens

**Your announcement-driven site is now live!**
