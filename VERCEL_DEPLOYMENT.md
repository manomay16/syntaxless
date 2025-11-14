# Vercel Deployment Guide

Complete guide to deploy Syntaxless to Vercel.

## Pre-Deployment Checklist

- [x] API routing fixed for Vercel compatibility
- [ ] Code committed to Git
- [ ] Environment variables ready
- [ ] Supabase project configured

## Step 1: Prepare Your Code

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your files:**
   - ✅ `vercel.json` exists and is configured
   - ✅ `api/run.py` exists (Python serverless function)
   - ✅ `package.json` has all dependencies
   - ✅ `.env.local` has your environment variables (for reference)

## Step 2: Deploy via Vercel Dashboard

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (GitHub account recommended)

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Import your Git repository:
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Click **"Import"**

### 2.3 Configure Project Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 2.4 Add Environment Variables

**Before deploying**, add these environment variables in Vercel:

1. In the deployment page, expand **"Environment Variables"**
2. Add each variable:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   Value: Your Supabase anon/public key

   ```
   GEMINI_API_KEY
   ```
   Value: Your Google Gemini API key

3. **Important:** Add these for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **"Deploy"**

## Step 3: Configure Supabase

After deployment, update Supabase redirect URLs:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URLs:

   **Site URL:**
   ```
   https://your-project.vercel.app
   ```

   **Redirect URLs (add all):**
   ```
   https://your-project.vercel.app/**
   https://your-project.vercel.app/auth/callback
   https://your-project-*.vercel.app/**
   ```

   (The `*` wildcard covers preview deployments)

5. Click **"Save"**

## Step 4: Verify Deployment

### 4.1 Check Build Status

1. In Vercel dashboard, check the deployment status
2. Wait for build to complete (usually 2-5 minutes)
3. If build fails, check the build logs

### 4.2 Test Your Application

Visit your Vercel URL: `https://your-project.vercel.app`

Test these features:
- [ ] **Homepage loads**
- [ ] **Sign up works** - Create a new account
- [ ] **Sign in works** - Log in with your account
- [ ] **Dashboard loads** - See your projects
- [ ] **Create project** - Create a new project
- [ ] **IDE works** - Open a project in the IDE
- [ ] **Code translation** - Write natural language and translate
- [ ] **Code execution** - Run generated code

### 4.3 Check Function Logs

1. In Vercel dashboard → **Functions** tab
2. Check for any errors in:
   - `/api/run` (Python serverless function)
   - Other API routes

## Step 5: Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Build Fails

**Check:**
- Build logs in Vercel dashboard
- All dependencies in `package.json`
- TypeScript errors
- Missing environment variables

**Common fixes:**
```bash
# Test build locally first
npm run build
```

### Environment Variables Not Working

**Check:**
- Variables are set in Vercel dashboard
- Variable names match exactly (case-sensitive)
- Redeployed after adding variables
- Variables added for correct environment (Production/Preview)

### Authentication Not Working

**Check:**
- Supabase redirect URLs include your Vercel domain
- Environment variables are set correctly
- Browser console for errors
- Supabase project is active (not paused)

### Code Execution Not Working

**Check:**
- Python serverless function is deployed (`api/run.py`)
- `vercel.json` routing is correct
- Function logs in Vercel dashboard
- API route is calling the correct endpoint

### API Routes Return 404

**Check:**
- `vercel.json` configuration
- Python function file exists at `api/run.py`
- Function logs for errors
- Route paths match exactly

## Post-Deployment

### Monitor Your Application

1. **Vercel Analytics** (if enabled)
2. **Function Logs** - Check for errors
3. **Supabase Logs** - Check authentication and database operations

### Update Environment Variables

If you need to update environment variables:

1. Go to Vercel dashboard → **Settings** → **Environment Variables**
2. Update the values
3. **Redeploy** (or wait for next deployment)

### Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

## Quick Reference

### Vercel Dashboard URLs

- **Projects:** https://vercel.com/dashboard
- **Settings:** Project → Settings
- **Deployments:** Project → Deployments
- **Functions:** Project → Functions
- **Environment Variables:** Project → Settings → Environment Variables

### Important Files

- `vercel.json` - Vercel configuration
- `api/run.py` - Python serverless function
- `.env.local` - Local environment variables (not deployed)
- `package.json` - Dependencies and scripts

### Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY
```

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Check Supabase logs
4. Review this guide's troubleshooting section

