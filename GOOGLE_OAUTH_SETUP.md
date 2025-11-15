# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for your Syntaxless application.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to your Supabase project dashboard

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name: `Syntaxless` (or your app name)
     - User support email: Your email
     - Developer contact information: Your email
   - Click **Save and Continue**
   - Add scopes (default is fine): `email`, `profile`, `openid`
   - Add test users if your app is in testing mode
   - Click **Save and Continue** until done

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Syntaxless Web Client` (or any name you prefer)
   - **Authorized JavaScript origins**:
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com` (replace with your actual domain)
   - **Authorized redirect URIs**:
     - For development: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
     - For production: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID (found in your Supabase dashboard URL or project settings)
   - Click **Create**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these in the next step

## Step 2: Configure Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click on it
5. Toggle **Enable Google provider** to ON
6. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Paste the Client ID from Step 1
   - **Client Secret (for OAuth)**: Paste the Client Secret from Step 1
7. Click **Save**

## Step 3: Verify Redirect URL

The redirect URL should be automatically set to:
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
```

Make sure this exact URL is added to your Google OAuth credentials' **Authorized redirect URIs** (from Step 1).

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/sign-in` or `http://localhost:3000/auth/sign-up`

3. Click the **"Sign in with Google"** or **"Sign up with Google"** button

4. You should be redirected to Google's sign-in page

5. After signing in, you should be redirected back to your app's dashboard

## Troubleshooting

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in Google Cloud Console exactly matches: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
- Check that there are no trailing slashes or extra characters
- Wait a few minutes after updating redirect URIs in Google Cloud Console (changes can take time to propagate)

### "Access blocked: This app's request is invalid"

- Make sure your OAuth consent screen is properly configured
- If your app is in testing mode, add the user's email to the test users list
- Consider publishing your app if you want to allow all users

### "OAuth provider not enabled"

- Double-check that Google provider is enabled in Supabase dashboard
- Verify that Client ID and Client Secret are correctly entered (no extra spaces)

### Users not being redirected back to the app

- Check that the callback route (`/auth/callback`) is working correctly
- Verify your middleware is not blocking the callback route
- Check browser console for any errors

## Production Deployment

When deploying to production, you need to update your Google OAuth configuration:

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   - Your production domain: `https://yourdomain.com` (replace with your actual domain)
   - Keep `http://localhost:3000` for local development
4. Under **Authorized redirect URIs**, make sure you have:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
   - (This is the Supabase callback URL - it stays the same for both dev and production)
5. Click **Save**

### Step 2: Verify Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication** → **URL Configuration**
3. Make sure **Site URL** is set to your production domain: `https://yourdomain.com`
4. Under **Redirect URLs**, add your production callback URL:
   - `https://yourdomain.com/auth/callback`
   - Keep `http://localhost:3000/auth/callback` for local development

### Step 3: Set Production Environment Variables

Make sure your production environment (Vercel, etc.) has these variables set:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

**Important:** The code automatically uses `window.location.origin`, so it will work with both `localhost:3000` (dev) and your production domain without any code changes!

## Additional Notes

- Google OAuth works for both sign-in and sign-up - Supabase automatically creates an account if the user doesn't exist
- Users can link their Google account to an existing email/password account (if you implement account linking)
- The callback route (`/app/auth/callback/route.ts`) is already configured to handle OAuth redirects

