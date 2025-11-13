# Database Setup Guide

This guide will help you set up your Supabase database for the Syntaxless application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Your project name (e.g., "syntaxless")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace:
- `your_project_url_here` with your Project URL from Step 2
- `your_anon_key_here` with your anon public key from Step 2
- `your_gemini_api_key_here` with your Google Gemini API key

## Step 4: Run the Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_create_projects_table.sql`
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Step 5: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a `projects` table with these columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `name` (text)
   - `code` (text, nullable)
   - `generated_code` (text, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. Go to **Authentication** → **Policies**
4. You should see 4 policies for the `projects` table:
   - Users can view their own projects
   - Users can insert their own projects
   - Users can update their own projects
   - Users can delete their own projects

## Step 6: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings if needed (or use Supabase's default email service for development)

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/auth/sign-up`
3. Create a test account
4. You should be able to:
   - Sign up successfully
   - Sign in
   - Create a project
   - Save code
   - Run code

## Troubleshooting

### "relation 'projects' does not exist"
- Make sure you ran the migration SQL in Step 4
- Check that you're connected to the correct Supabase project

### "new row violates row-level security policy"
- Make sure the RLS policies were created correctly
- Verify that you're authenticated (check if you're signed in)

### "permission denied for table projects"
- Check that Row Level Security is enabled
- Verify that the policies are correctly set up

### Authentication not working
- Check your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you restarted your dev server after adding environment variables
- Check the browser console for any errors

## Database Schema

The application uses one main table:

### `projects`
Stores user projects with natural language code and generated code.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to `auth.users`, identifies the owner |
| `name` | TEXT | Project name |
| `code` | TEXT | Natural language instructions (nullable) |
| `generated_code` | TEXT | Generated code from AI (nullable) |
| `created_at` | TIMESTAMP | When the project was created |
| `updated_at` | TIMESTAMP | When the project was last updated (auto-updated) |

## Security

- **Row Level Security (RLS)** is enabled on the `projects` table
- Users can only access their own projects
- All database operations are authenticated through Supabase Auth
- The `anon` key is safe to use in client-side code (RLS protects the data)

## Next Steps

Once your database is set up:
1. ✅ Authentication should work (sign up, sign in)
2. ✅ Project creation should work
3. ✅ Code saving should work
4. ✅ Code execution should work (if Python server is running)

If you encounter any issues, check the browser console and server logs for error messages.

