# Mode Switching Feature - Setup & Testing Guide

## What Was Implemented

### 1. **Removed API Settings Tab**
   - Removed the "API" tab from the settings page
   - Cleaned up unused API key state

### 2. **Clarification Check Before Running**
   - Code execution is now blocked if clarifications exist
   - Users must resolve all clarifications before running code

### 3. **Mode Switching (Natural Language ↔ Code)**
   - Added toggle between "Natural Language" and "Code" modes
   - State preservation when switching modes
   - Auto-generates missing content when switching

### 4. **Code Explanation Feature**
   - New `/api/explain` endpoint that generates line-by-line natural language explanations
   - Available in Code mode via "Show Natural Language Explanation" toggle

### 5. **Database Migration**
   - Added `coding_mode` column to projects table
   - Migration file: `supabase/migrations/002_add_coding_mode.sql`

## Database Setup

### Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/002_add_coding_mode.sql`

Or use the Supabase CLI:
```bash
supabase db push
```

The migration adds:
- `coding_mode` column (TEXT, default: 'natural_language')
- Constraint: must be either 'natural_language' or 'code'

## Testing in Development

### 1. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

### 2. Start the Python Server (for code execution)

The Python server is needed for running code. You have two options:

**Option A: Use the local Python server**
```bash
# Navigate to the api directory
cd api

# Start the Python server (runs on port 3001)
python run.py
# or
python3 run.py
```

**Option B: Use the serverless function (Vercel/Production)**
- The serverless function at `app/api/run/route.py` will be used automatically in production
- For local testing, you can use the Next.js API route which proxies to the Python server

### 3. Test the Features

#### Test Mode Switching:
1. Create a new project or open an existing one
2. You should see a toggle: `[Natural Language] [Code]`
3. Switch between modes - content should be preserved
4. In Code mode, write some code
5. Click "Show Natural Language Explanation" to see line-by-line explanation

#### Test Clarification Blocking:
1. Write ambiguous natural language code (e.g., "print all odd numbers")
2. Click "Run"
3. You should see clarifications appear
4. Try to run again - it should be blocked with an error message

#### Test Code Execution:
1. In Natural Language mode: Write "print hello world" and run
2. In Code mode: Write `print("hello world")` and run
3. Both should execute successfully

## How It Works

### Natural Language Mode:
- **Main Editor**: Editable natural language instructions
- **Toggle View**: Shows generated programming code (read-only)
- **Run**: Translates NL → Code → Executes

### Code Mode:
- **Main Editor**: Editable programming code
- **Toggle View**: Shows natural language explanation (read-only, line-by-line)
- **Run**: Executes code directly

### State Preservation:
- When switching modes, the system:
  1. Preserves the current content
  2. Generates missing content if needed (NL → Code or Code → NL)
  3. Saves both values to the database
  4. Restores the correct view based on the mode

## File Changes Summary

### New Files:
- `app/api/explain/route.ts` - Code → Natural Language explanation endpoint
- `supabase/migrations/002_add_coding_mode.sql` - Database migration
- `MODE_SWITCHING_SETUP.md` - This file

### Modified Files:
- `app/(protected)/settings/page.tsx` - Removed API tab
- `app/(protected)/ide/[projectId]/page.tsx` - Added mode switching, state preservation, clarification checks

## Troubleshooting

### "Column 'coding_mode' does not exist"
- **Solution**: Run the database migration (see Database Setup above)

### Code execution not working
- **Check**: Is the Python server running? (see Testing section)
- **Check**: Are there any clarifications that need to be resolved?

### Mode switching not preserving state
- **Check**: Is the database migration applied?
- **Check**: Browser console for any errors

### Natural language explanation not generating
- **Check**: Is `GEMINI_API_KEY` set in your environment variables?
- **Check**: Browser console for API errors

## Next Steps

1. Run the database migration
2. Test mode switching with existing projects
3. Test code execution in both modes
4. Verify clarification blocking works
5. Test the explain feature in Code mode

