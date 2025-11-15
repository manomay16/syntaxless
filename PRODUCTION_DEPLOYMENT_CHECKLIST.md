# Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Changes Complete
- [x] Removed API settings tab from settings page
- [x] Added clarification blocking before code execution
- [x] Implemented mode switching (Natural Language ↔ Code)
- [x] Created `/api/explain` endpoint for code → NL conversion
- [x] Added style preservation for natural language
- [x] Added auto-generation of NL explanation in Code mode
- [x] Fixed infinite loop detection with timeout
- [x] Fixed Google OAuth redirect URLs
- [x] Fixed Next.js 15 async cookies issues
- [x] **Fixed Python execution for Vercel** - Updated `api/run.py` to use Vercel serverless format
- [x] **Removed auto-generation of NL/code** - Now only generates on explicit user clicks to reduce API calls
- [x] **Improved Python execution routing** - Works automatically in both dev and production, with optional env var override

### ✅ Database Migration Required

**CRITICAL:** You must run the database migration before deploying:

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the migration: `supabase/migrations/002_add_coding_mode.sql`

```sql
-- Add coding_mode column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS coding_mode TEXT DEFAULT 'natural_language' CHECK (coding_mode IN ('natural_language', 'code'));

-- Update existing projects to have natural_language as default
UPDATE projects 
SET coding_mode = 'natural_language' 
WHERE coding_mode IS NULL;
```

**Why this is critical:** Without this migration, mode switching won't work and you'll get database errors.

### ✅ Environment Variables

Make sure these are set in your production environment (Vercel):

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GEMINI_API_KEY` - Your Google Gemini API key

**Verification:**
- All three should be set for Production environment
- No quotes around values
- No trailing spaces

### ✅ Google OAuth Configuration

If using Google OAuth (already configured):
- [x] Production domain added to Google Cloud Console
- [x] Supabase redirect URLs configured
- [x] Callback route updated for Next.js 15

## Deployment Steps

### Step 1: Run Database Migration

**Before deploying code:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and run `supabase/migrations/002_add_coding_mode.sql`
3. Verify: Check Table Editor → projects table should have `coding_mode` column

### Step 2: Verify Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set  
- [ ] `GEMINI_API_KEY` is set
- [ ] All are set for "Production" environment

### Step 3: Deploy to Vercel

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add mode switching, style preservation, and clarification fixes"
   git push origin main
   ```

2. **Vercel will auto-deploy** (if connected to Git)
   - Or manually trigger deployment in Vercel dashboard

3. **Monitor the build:**
   - Check build logs for any errors
   - Should complete successfully

### Step 4: Post-Deployment Verification

After deployment, test these features:

#### Test Mode Switching:
1. [ ] Create a new project
2. [ ] Write natural language code
3. [ ] Switch to Code mode - should show generated code
4. [ ] Edit code in Code mode
5. [ ] Switch back to NL mode - should show updated NL explanation
6. [ ] Verify style is preserved

#### Test Clarification Blocking:
1. [ ] Write ambiguous code (e.g., "print all odd numbers")
2. [ ] Click Run - should show clarifications
3. [ ] Edit code to resolve clarifications
4. [ ] Click Run again - should execute successfully

#### Test Code Execution:
1. [ ] Test in Natural Language mode
2. [ ] Test in Code mode
3. [ ] Test with infinite loops (should timeout after 10 seconds)
4. [ ] Test with user input

#### Test Google OAuth:
1. [ ] Sign in with Google
2. [ ] Sign up with Google
3. [ ] Verify redirect works correctly

## Potential Issues & Solutions

### Issue: "Column 'coding_mode' does not exist"
**Solution:** Run the database migration (Step 1 above)

### Issue: Mode switching not working
**Solution:** 
- Verify migration was run
- Check browser console for errors
- Verify `coding_mode` column exists in Supabase

### Issue: Natural language explanation not generating
**Solution:**
- Check `GEMINI_API_KEY` is set in production
- Check Vercel function logs for API errors
- Verify API key has sufficient quota

### Issue: Code execution timing out
**Solution:**
- This is expected for infinite loops (10 second timeout)
- Check Python serverless function is deployed correctly
- Verify `vercel.json` routes `/api/run` correctly
- Check Vercel function logs for Python execution errors
- Verify `api/run.py` uses the correct Vercel serverless format (handler function, not class)

### Issue: Clarifications not clearing
**Solution:**
- Clear browser cache
- Check that NL code changes are triggering the useEffect
- Verify no JavaScript errors in console

## Rollback Plan

If something goes wrong:

1. **Database:** The migration is safe (uses `IF NOT EXISTS`), but you can remove the column if needed:
   ```sql
   ALTER TABLE projects DROP COLUMN IF EXISTS coding_mode;
   ```

2. **Code:** Revert to previous Git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Success Criteria

✅ All features work in production:
- Mode switching preserves state
- Style is preserved when converting code → NL
- Clarifications block execution correctly
- Code execution works in both modes
- Infinite loops are detected and explained
- Google OAuth works

✅ No console errors
✅ No database errors
✅ All API endpoints respond correctly

## Next Steps After Deployment

1. Monitor Vercel function logs for the first few hours
2. Check Supabase logs for any database issues
3. Test with real users if possible
4. Monitor API usage (Gemini API quota)

---

**Ready to deploy?** Make sure you've completed:
1. ✅ Database migration
2. ✅ Environment variables set
3. ✅ Code committed and pushed
4. ✅ Google OAuth configured (if using)

Then proceed with deployment!

