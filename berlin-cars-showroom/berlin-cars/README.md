# 🚗 Berlin Cars Showroom — Deployment Guide

## What you get
- **Public website**: Customers browse cars, see photos, contact you via WhatsApp/phone
- **Admin panel** (`/admin`): You log in and manage all cars + photos from your phone
- **Database**: All data stored in Supabase (free cloud database)
- **Photo storage**: Car photos stored in Supabase Storage (free)
- **Live URL**: Free `yourname.vercel.app` domain (or your own custom domain)

---

## Step 1 — Set up Supabase (Database + Storage) [~5 min]

1. Go to **https://supabase.com** → Sign up free
2. Click **New Project** → Name it `berlin-cars` → Set a database password → Create
3. Wait ~1 minute for it to set up
4. Go to **SQL Editor** (left sidebar) → Click **New Query**
5. Copy the entire contents of `supabase-schema.sql` and paste it → Click **Run**
6. Go to **Storage** (left sidebar) → Click **New Bucket**
   - Name: `car-photos`
   - Check ✅ **Public bucket** → Create
7. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Deploy to Vercel [~5 min]

### Option A: Deploy from GitHub (recommended)
1. Push this folder to a GitHub repository
2. Go to **https://vercel.com** → Sign up free with GitHub
3. Click **New Project** → Import your GitHub repo
4. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   JWT_SECRET = berlin-cars-super-secret-2025
   ```
5. Click **Deploy** → Done!

### Option B: Deploy with Vercel CLI
```bash
npm install -g vercel
cd berlin-cars-showroom
cp .env.example .env.local
# Edit .env.local with your Supabase keys
vercel --prod
# It will ask you to log in and then deploy
```

---

## Step 3 — Your live URLs

After deployment, Vercel gives you a URL like:
```
https://berlin-cars-showroom.vercel.app
```

- **Customer site**: `https://berlin-cars-showroom.vercel.app`
- **Admin panel**: `https://berlin-cars-showroom.vercel.app/admin`

---

## Default Admin Login
```
Username: admin
Password: password
```
⚠️ **Change your password immediately** after first login via Admin → Settings

---

## Custom Domain (optional)
1. In Vercel dashboard → Your project → Settings → Domains
2. Add your domain (e.g. `berlincars.qa`)
3. Follow the DNS instructions

---

## Daily Use (from your phone)

1. Go to `yoursite.vercel.app/admin`
2. Log in with your credentials
3. Tap **+ Add New Car** → Fill details → Save
4. Upload photos by tapping the photo area
5. Car appears live on the website immediately!

---

## Troubleshooting

**Photos not uploading**: Make sure your `car-photos` Supabase bucket is set to **Public**

**Login not working**: Check that your `SUPABASE_SERVICE_ROLE_KEY` is set correctly in Vercel environment variables

**Site not loading**: Check Vercel logs (Dashboard → Your Project → Functions tab)

---

## Tech Stack
- **Frontend**: Next.js 14 (React)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Auth**: JWT tokens (HttpOnly cookies)
- **Hosting**: Vercel (free tier)
- **Cost**: $0/month for typical showroom usage
