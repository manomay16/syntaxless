# Fixing "Failed to connect to authentication service"

## Quick Checklist

### 1. Verify Your `.env.local` File

Open `.env.local` in your root directory and check:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common mistakes:**
- ❌ Using dashboard URL: `https://app.supabase.com/project/xxxxx` 
- ✅ Use API URL: `https://xxxxx.supabase.co`
- ❌ Quotes around values: `NEXT_PUBLIC_SUPABASE_URL="https://..."`
- ✅ No quotes: `NEXT_PUBLIC_SUPABASE_URL=https://...`
- ❌ Trailing spaces
- ❌ Wrong variable names (must be `NEXT_PUBLIC_` prefix)

### 2. Get Correct Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (should be `https://xxxxx.supabase.co`)
   - **anon public** key (very long string starting with `eyJ...`)

### 3. Check Supabase Project Status

**Is your project paused?**
- Free tier projects pause after 1 week of inactivity
- Go to Supabase dashboard
- If paused, click "Restore project" or "Resume"

### 4. Restart Dev Server

**CRITICAL:** After any changes to `.env.local`:

```bash
# Stop server (Ctrl+C)
npm run dev
```

Environment variables are only loaded when the server starts!

### 5. Test Connection

Visit: http://localhost:3000/test-connection

This page will:
- ✅ Check if environment variables are set
- ✅ Test Supabase client connection
- ✅ Test direct API connection
- ✅ Show specific error messages

### 6. Check Browser Console

Open DevTools (F12) → Console tab and look for:
- CORS errors
- Network errors
- Specific error messages

## Common Issues & Solutions

### Issue: "Invalid Supabase URL format"

**Solution:**
- URL must start with `https://`
- URL must end with `.supabase.co`
- Example: `https://abcdefghijklmnop.supabase.co`

### Issue: "Connection timeout"

**Possible causes:**
1. Supabase project is paused → Resume it in dashboard
2. Network/firewall blocking → Check internet connection
3. Wrong region → Check Supabase project region

### Issue: CORS errors in browser console

**Solution:**
- Make sure you're using the correct Project URL (not dashboard URL)
- Check Supabase project settings → API → CORS (should allow your domain)

### Issue: "Failed to fetch" with no details

**Check:**
1. Browser console for specific errors
2. Network tab to see the actual request
3. Supabase project is active
4. URL format is correct

## Step-by-Step Fix

1. **Open Supabase Dashboard**
   - https://app.supabase.com
   - Select your project

2. **Check Project Status**
   - If paused, click "Restore" or "Resume"
   - Wait for project to be active

3. **Get Credentials**
   - Settings → API
   - Copy Project URL
   - Copy anon public key

4. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-full-anon-key-here
   ```

5. **Restart Dev Server**
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

6. **Test**
   - Go to http://localhost:3000/test-connection
   - Or try signing up again

## Still Not Working?

1. **Verify URL is accessible:**
   ```bash
   # Test if you can reach Supabase
   curl https://your-project-id.supabase.co/rest/v1/
   ```
   Should return JSON (not an error)

2. **Check browser Network tab:**
   - Open DevTools → Network
   - Try signing up
   - Look for failed requests to `*.supabase.co`
   - Check the error message

3. **Verify environment variables are loaded:**
   - Open browser console
   - Type: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
   - Should show your URL (not `undefined`)

4. **Check Supabase project logs:**
   - Go to Supabase Dashboard → Logs
   - Look for any errors or blocked requests

## Need More Help?

Share:
1. The exact error message from browser console
2. Your Supabase URL format (first 30 chars: `https://xxxxx...`)
3. Whether your Supabase project is active
4. Any CORS errors from browser console

