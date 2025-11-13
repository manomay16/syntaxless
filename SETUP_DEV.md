# Development Server Setup

Quick guide to get your development server running.

## Prerequisites

✅ Node.js 18.x or later installed  
✅ Supabase database set up (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))  
✅ Python 3.x installed (for local code execution)

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Step 2: Set Up Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and fill in your values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Where to get these:**
   - **Supabase URL & Key**: Supabase Dashboard → Settings → API
   - **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 3: Start the Development Server

### Option A: Next.js Only (Authentication & UI work, but code execution needs Vercel)

```bash
npm run dev
```

### Option B: Full Local Development (Next.js + Python Server)

**Terminal 1 - Next.js Server:**
```bash
npm run dev
```

**Terminal 2 - Python Code Execution Server:**
```bash
cd api
python run.py
```

The Python server will show:
```
Starting server on port 3001...
```

## Step 4: Access the Application

Open your browser and go to:
- **Main app**: http://localhost:3000
- **Sign up**: http://localhost:3000/auth/sign-up
- **Sign in**: http://localhost:3000/auth/sign-in
- **Demo mode**: http://localhost:3000/ide?demo=true

## Step 5: Test Everything

1. **Test Authentication:**
   - Go to http://localhost:3000/auth/sign-up
   - Create a new account
   - Sign in

2. **Test Project Creation:**
   - After signing in, you should see the dashboard
   - Click "Create New Project"
   - Give it a name and create it

3. **Test Code Translation:**
   - Open a project in the IDE
   - Write natural language: `print "Hello, World!"`
   - Select Python as the language
   - Click "Run" to see it translate and execute

4. **Test Code Execution:**
   - If Python server is running, code will execute locally
   - If not, you'll need to deploy to Vercel for code execution

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Make sure `.env.local` exists and has the correct values
- Restart your dev server after changing `.env.local`

### "Failed to load project" or "Unauthorized"
- Check that you ran the SQL migration in Supabase
- Verify your Supabase credentials in `.env.local`
- Make sure you're signed in

### "Translation failed" or Gemini errors
- Check your `GEMINI_API_KEY` in `.env.local`
- Verify the API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Code execution not working
- Make sure Python server is running on port 3001
- Check that `api/run.py` is running without errors
- Verify Python dependencies are installed: `pip install -r requirements.txt`

### Port already in use
- Next.js default port: 3000 (change with `npm run dev -- -p 3001`)
- Python server default port: 3001 (change in `api/run.py`)

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start Next.js dev server
npm run dev

# Start Python server (in separate terminal)
cd api && python run.py

# Build for production
npm run build

# Start production server
npm start
```

## What Works Where

| Feature | Local Dev | Vercel Production |
|---------|-----------|-------------------|
| Authentication | ✅ | ✅ |
| Project Management | ✅ | ✅ |
| Code Translation | ✅ | ✅ |
| Code Execution | ✅ (with Python server) | ✅ (serverless) |

## Next Steps

Once everything is running:
1. ✅ Create an account
2. ✅ Create a project
3. ✅ Write natural language code
4. ✅ See it translate to Python/JavaScript/Java/C++
5. ✅ Run and see the output!

