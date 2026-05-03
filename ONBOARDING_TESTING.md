# Testing Onboarding Feature

This guide will help you test the new onboarding feature for new users.

## Prerequisites

1. ✅ Supabase account and project set up
2. ✅ `.env.local` file configured
3. ✅ Previous migrations run (projects table)

## Step 1: Set Up Supabase (If Not Done)

If you don't have Supabase set up yet:

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com) and sign up
   - Create a new project (choose a name and region)
   - Wait 2-3 minutes for the project to initialize

2. **Get Your Credentials**
   - Go to **Settings** → **API** in your Supabase dashboard
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (long string starting with `eyJ...`)

3. **Create `.env.local` File**
   
   In your project root, create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   
   **Important:**
   - No quotes around values
   - No trailing spaces
   - Replace with your actual values

## Step 2: Run Database Migrations

You need to run **all three** migrations in order:

### Migration 1: Projects Table (If Not Already Done)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Copy and paste contents of `supabase/migrations/001_create_projects_table.sql`
4. Click **Run** (or Ctrl+Enter)
5. Should see: "Success. No rows returned"

### Migration 2: Coding Mode (If Not Already Done)

1. In SQL Editor, click **New query**
2. Copy and paste contents of `supabase/migrations/002_add_coding_mode.sql`
3. Click **Run**

### Migration 3: User Profiles (NEW - Required for Onboarding)

1. In SQL Editor, click **New query**
2. Copy and paste contents of `supabase/migrations/003_create_user_profiles.sql`
3. Click **Run**
4. Should see: "Success. No rows returned"

**Verify the migration worked:**
- Go to **Table Editor**
- You should see a `user_profiles` table
- It should have columns: `id`, `user_id`, `onboarding_completed`, `created_at`, `updated_at`

## Step 3: Start Development Server

```bash
pnpm dev
```

The server should start on `http://localhost:3000`

**If you get errors:**
- Make sure `.env.local` exists and has correct values
- Restart the dev server after creating/editing `.env.local`
- Check browser console for specific errors

## Step 4: Test the Onboarding Flow

### Test 1: New User Sign Up (Full Flow)

1. **Open a fresh browser window** (or use incognito/private mode)
   - This ensures you don't have any existing session

2. **Go to Sign Up Page**
   ```
   http://localhost:3000/auth/sign-up
   ```

3. **Create a New Account**
   - Enter an email (use a test email like `test+onboarding@example.com`)
   - Enter a password
   - Click "Sign Up"

4. **Expected Behavior:**
   - ✅ You should see "Account created successfully! Redirecting to onboarding..."
   - ✅ You should be redirected to `/onboarding` (NOT `/dashboard`)
   - ✅ You should see the onboarding page with 5 steps

5. **Go Through Onboarding:**
   - ✅ Click "Next" to go through each step
   - ✅ You should see a progress bar at the top
   - ✅ Step counter should show "1 / 5", "2 / 5", etc.
   - ✅ On the last step, click "Get Started!"

6. **After Completing Onboarding:**
   - ✅ You should be redirected to `/dashboard`
   - ✅ You should NOT see the onboarding page again
   - ✅ Normal dashboard should appear

### Test 2: Verify User Profile Was Created

1. **Check Supabase Database:**
   - Go to Supabase Dashboard → **Table Editor**
   - Click on `user_profiles` table
   - You should see a row with:
     - `user_id`: Your user's UUID
     - `onboarding_completed`: `true` (after completing)
   - If you haven't completed onboarding yet, it should be `false`

### Test 3: Test Existing Users (No Onboarding)

1. **If you have an existing account:**
   - Sign out from the test account
   - Sign in with an existing account
   - ✅ You should go directly to `/dashboard`
   - ✅ You should NOT see onboarding

### Test 4: OAuth Sign Up (Google)

1. **Sign Out** if logged in

2. **Go to Sign Up Page**
   ```
   http://localhost:3000/auth/sign-up
   ```

3. **Click "Sign up with Google"**
   - Complete Google OAuth flow
   - After returning from Google...

4. **Expected Behavior:**
   - ✅ Should redirect to `/onboarding` (for new users)
   - ✅ Should redirect to `/dashboard` (for existing users)

### Test 5: Prevent Skipping Onboarding

1. **Create a new test account** (or use one that hasn't completed onboarding)

2. **Try to access dashboard directly:**
   ```
   http://localhost:3000/dashboard
   ```

3. **Expected Behavior:**
   - ✅ Should redirect back to `/onboarding`
   - ✅ Cannot access dashboard until onboarding is completed

## Step 5: Verify All Features Work

After completing onboarding, verify the app works normally:

1. **Create a Project:**
   - Click "New Project" on dashboard
   - Give it a name
   - ✅ Should create successfully

2. **Open IDE:**
   - Click on a project
   - ✅ Should open the IDE

3. **Write Code:**
   - Try writing natural language: "print hello world"
   - ✅ Should translate correctly

## Troubleshooting

### Issue: "relation 'user_profiles' does not exist"

**Solution:**
- Make sure you ran migration `003_create_user_profiles.sql`
- Check in Supabase Table Editor that the table exists

### Issue: User not redirected to onboarding

**Possible causes:**
1. Profile wasn't created automatically
   - The trigger should create it on signup
   - Manually check if row exists in `user_profiles` table
   - If not, you may need to manually create it:
     ```sql
     INSERT INTO user_profiles (user_id, onboarding_completed)
     VALUES ('your-user-id', false);
     ```

2. Migration not run
   - Verify all three migrations were run successfully

### Issue: Can't complete onboarding / "Failed to complete onboarding"

**Check:**
- Open browser console (F12) for errors
- Check if API route `/api/onboarding/complete` is working
- Verify RLS policies are set up for `user_profiles` table
- Check network tab to see if the POST request succeeds

### Issue: Onboarding shows every time

**Solution:**
- Check `user_profiles` table in Supabase
- Verify `onboarding_completed` is set to `true`
- Make sure you're logged in as the same user

### Issue: Environment variables not loading

**Solution:**
- Verify `.env.local` exists in project root (same level as `package.json`)
- Restart dev server after creating/editing `.env.local`
- Check that variable names are correct:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY`

## Quick Test Checklist

- [ ] Supabase project created and active
- [ ] `.env.local` file created with correct credentials
- [ ] All three migrations run successfully
- [ ] `user_profiles` table exists in Supabase
- [ ] Dev server running (`pnpm dev`)
- [ ] Can sign up new user
- [ ] Redirected to onboarding after signup
- [ ] Can navigate through all 5 onboarding steps
- [ ] Can complete onboarding
- [ ] Redirected to dashboard after completion
- [ ] Dashboard works normally
- [ ] Can't skip onboarding (redirects back)
- [ ] Existing users don't see onboarding

## Manual SQL Check (If Needed)

If something isn't working, you can manually check the database:

```sql
-- Check if user_profiles table exists
SELECT * FROM user_profiles;

-- Check onboarding status for a specific user
SELECT * FROM user_profiles 
WHERE user_id = 'your-user-id-here';

-- Manually mark onboarding as complete (for testing)
UPDATE user_profiles 
SET onboarding_completed = true 
WHERE user_id = 'your-user-id-here';

-- Manually mark onboarding as incomplete (to test again)
UPDATE user_profiles 
SET onboarding_completed = false 
WHERE user_id = 'your-user-id-here';
```

## Reset Onboarding for Testing

To test onboarding multiple times with the same account:

1. **Option 1: Use Different Accounts**
   - Create new test accounts each time
   - Use email aliases like: `test+1@example.com`, `test+2@example.com`

2. **Option 2: Manually Reset in Database**
   ```sql
   UPDATE user_profiles 
   SET onboarding_completed = false 
   WHERE user_id = 'your-user-id';
   ```
   Then sign out and sign in again

3. **Option 3: Delete User Profile**
   ```sql
   DELETE FROM user_profiles 
   WHERE user_id = 'your-user-id';
   ```
   The next time you access dashboard, it will redirect to onboarding


