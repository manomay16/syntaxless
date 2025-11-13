# Supabase Database Setup

This directory contains SQL migration files for setting up the Supabase database.

## Quick Start

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your credentials** from Settings → API:
   - Project URL
   - anon/public key

3. **Run the migration**:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `quick_setup.sql`
   - Click "Run"

4. **Set environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Files

- **`quick_setup.sql`**: Quick copy-paste SQL for immediate setup
- **`migrations/001_create_projects_table.sql`**: Full migration with comments

## Database Schema

### `projects` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique project identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) | Owner of the project |
| `name` | TEXT | NOT NULL | Project name |
| `code` | TEXT | NULLABLE | Natural language instructions |
| `generated_code` | TEXT | NULLABLE | Generated code from AI |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp (auto-updated) |

### Security

- **Row Level Security (RLS)** is enabled
- Users can only access their own projects
- All operations are authenticated through Supabase Auth

### Indexes

- `idx_projects_user_id`: Fast lookups by user
- `idx_projects_updated_at`: Fast sorting by update time

### Triggers

- `update_projects_updated_at`: Automatically updates `updated_at` on row updates

## Verification

After running the migration, verify:

1. ✅ Table exists: Go to Table Editor → see `projects` table
2. ✅ RLS enabled: Go to Authentication → Policies → see 4 policies
3. ✅ Indexes created: Go to Database → Indexes → see 2 indexes
4. ✅ Trigger exists: Go to Database → Triggers → see `update_projects_updated_at`

## Troubleshooting

If you need to reset the database:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS projects CASCADE;
```

Then re-run the migration.

