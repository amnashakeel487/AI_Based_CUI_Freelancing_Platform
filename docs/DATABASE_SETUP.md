# Database Setup Guide

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the CLI tool
   ```bash
   # Using npm
   npm install -g supabase
   
   # Or using Homebrew (macOS)
   brew install supabase/tap/supabase
   
   # Or using Scoop (Windows)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

## Setup Steps

### 1. Initialize Supabase (if not already done)

```bash
cd d:\freelancing_platform
supabase init
```

### 2. Link to Your Supabase Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Get your project ref from your Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`

### 3. Apply Migrations

Run migrations in order:

```bash
# All migrations at once
supabase db push

# Or individually (in order)
supabase db push --file supabase/migrations/20261017000001_initial_schema.sql
supabase db push --file supabase/migrations/20261017000002_rls_policies.sql
supabase db push --file supabase/migrations/20261017000003_storage_buckets.sql
supabase db push --file supabase/migrations/20261017000004_seed_categories_skills.sql
```

### 4. Verify Schema

```bash
# Check tables
supabase db diff --schema public

# Or use the Supabase dashboard Table Editor
```

### 5. Optional: Seed Demo Data

**WARNING**: Only run this in development/testing environments!

```bash
# First, create demo users via Supabase Auth dashboard or API
# Then update the UUIDs in seed_demo.sql with real user IDs
# Finally, run the seed:

psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres -f supabase/seed_demo.sql
# Enter your database password when prompted
```

Or via Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/seed_demo.sql`
3. Update placeholder UUIDs with real user IDs from auth.users
4. Execute

## Database Structure

### Tables Created

**User & Profile (7 tables)**
- `profiles` - Core user profiles
- `freelancer_profiles` - Freelancer-specific data
- `skills` - Master skills catalog
- `freelancer_skills` - User skills with levels
- `portfolio_items` - Portfolio entries
- `experience_items` - Work experience
- `categories` - Project categories

**Projects & Work (8 tables)**
- `projects` - Client projects
- `project_skills` - Project required skills
- `saved_projects` - Bookmarked projects
- `bids` - Freelancer proposals
- `milestones` - Project milestones
- `submissions` - Work deliverables
- `activity_log` - Project timeline

**Communication (4 tables)**
- `conversations` - Chat threads
- `messages` - Chat messages
- `notifications` - User notifications
- `reviews` - Client reviews

**Financial & Support (3 tables)**
- `transactions` - Payment records (read-only in freelancer module)
- `complaints` - User complaints
- `disputes` - Project disputes

### Storage Buckets

1. **avatars** (public)
   - User profile pictures
   - Max size: 5MB
   - Types: JPEG, PNG, WebP

2. **portfolio** (public)
   - Portfolio project images
   - Max size: 10MB
   - Types: JPEG, PNG, WebP

3. **deliverables** (private)
   - Project submissions
   - Max size: 50MB
   - Types: PDF, ZIP, images

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Profiles**: Users read/update own; approved freelancers publicly readable
- **Projects**: Approved freelancers browse; clients manage own
- **Bids**: Only approved freelancers can bid; clients see bids on their projects
- **Messages**: Only participants can read/write
- **Notifications**: Users see only their own
- **Transactions**: Users see only their own
- **Storage**: Users manage own files; project participants access deliverables

## RLS Testing Checklist

Test with different user roles:

### As Unauthenticated User
- [ ] Cannot read any profiles
- [ ] Cannot read projects
- [ ] Cannot read any data

### As Pending Freelancer
- [ ] Can read own profile
- [ ] Cannot read projects (not approved)
- [ ] Cannot create bids

### As Approved Freelancer
- [ ] Can read own profile
- [ ] Can read open projects
- [ ] Can create bids on open projects
- [ ] Cannot bid twice on same project
- [ ] Can read own bids only
- [ ] Can read conversations they're in
- [ ] Can upload portfolio images
- [ ] Cannot access other users' deliverables

### As Client
- [ ] Can create projects
- [ ] Can read bids on own projects
- [ ] Cannot read other clients' projects
- [ ] Cannot create bids

### As Admin
- [ ] Can read all data
- [ ] Can update approval status
- [ ] Can resolve disputes

## Troubleshooting

### Migration Fails
```bash
# Reset local database (DESTROYS DATA)
supabase db reset

# Or view migration status
supabase migration list
```

### RLS Policy Issues
```bash
# Check which policies are blocking
# In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

### Storage Policy Issues
```bash
# Check storage policies in Supabase Dashboard
# Storage → Policies
# Or via SQL:
SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
```

## Next Steps

After database setup:
1. Get your Supabase credentials (URL, anon key, service role key, JWT secret)
2. Configure backend `.env` file
3. Configure frontend `.env` file
4. Run backend and frontend applications

See `SETUP_GUIDE.md` for full application setup.
