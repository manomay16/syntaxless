# Troubleshooting Guide

## "Failed to fetch" Error on Sign Up

This error typically means the Supabase client cannot connect to your Supabase project. Here's how to fix it:

### Step 1: Verify Environment Variables

1. **Check if `.env.local` exists** in the root directory
2. **Verify the file contains:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important checks:**
   - ✅ No quotes around the values
   - ✅ No trailing spaces
   - ✅ URL starts with `https://`
   - ✅ URL ends with `.supabase.co`
   - ✅ Key is the full anon/public key (very long string)

### Step 2: Get Correct Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (should look like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 3: Restart Dev Server

**CRITICAL:** After changing `.env.local`, you MUST restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are only loaded when the server starts!

### Step 4: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for error messages
2. **Network tab** - Check if requests to Supabase are failing

### Step 5: Test Configuration

Add this to any page temporarily to test:

```typescript
import { checkSupabaseConfig } from "@/lib/supabase/diagnostics"

// In your component:
console.log(checkSupabaseConfig())
```

Or run in browser console:
```javascript
// Check if env vars are loaded
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
```

## Common Issues & Solutions

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution:**
- Make sure `.env.local` exists in the root directory (same level as `package.json`)
- Restart your dev server
- Check for typos: `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)

### Issue: "Failed to fetch" or Network Error

**Possible causes:**
1. **Wrong Supabase URL**
   - Should be: `https://xxxxx.supabase.co`
   - NOT: `https://app.supabase.com/project/xxxxx`

2. **CORS Issues**
   - Make sure you're using the correct URL from Settings → API
   - Check Supabase project is active (not paused)

3. **Network/Firewall**
   - Try accessing the Supabase URL directly in browser
   - Check if you're behind a corporate firewall

4. **Project Paused**
   - Free tier projects pause after inactivity
   - Go to Supabase dashboard and resume if needed

### Issue: "Invalid API key"

**Solution:**
- Make sure you're using the **anon/public** key, not the service_role key
- Copy the key again from Settings → API → anon public
- Check for extra spaces or line breaks

### Issue: Authentication works but database operations fail

**Solution:**
- Make sure you ran the SQL migration (see `DATABASE_SETUP.md`)
- Check that Row Level Security policies are set up
- Verify the `projects` table exists in Supabase

## Quick Diagnostic Checklist

- [ ] `.env.local` file exists in root directory
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set and starts with `https://`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set and is a long string
- [ ] Dev server was restarted after creating/editing `.env.local`
- [ ] Supabase project is active (not paused)
- [ ] Can access Supabase dashboard
- [ ] SQL migration was run (projects table exists)
- [ ] Browser console shows no CORS errors

## Still Not Working?

1. **Check Supabase Project Status:**
   - Go to Supabase dashboard
   - Make sure project is not paused
   - Check project settings

2. **Test Supabase Connection:**
   ```bash
   # Test if you can reach Supabase
   curl https://your-project-id.supabase.co/rest/v1/
   ```

3. **Verify Environment Variables are Loaded:**
   - Add a temporary console.log in your code
   - Check browser console for the values
   - Make sure they're not `undefined`

4. **Check Next.js Version:**
   ```bash
   npm list next
   ```
   Should be 13+ for proper env var handling

5. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

## Getting Help

If none of these work:
1. Check browser console for specific error messages
2. Check terminal/console for server errors
3. Verify Supabase project is working (try creating a user in Supabase dashboard)
4. Share the specific error message from browser console

