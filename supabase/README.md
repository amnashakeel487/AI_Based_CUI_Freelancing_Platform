# Supabase Database Migrations

This folder contains SQL migrations for the CUI Freelance Platform database.

## Migration Files

Migrations are applied in order:

1. **20261017000001_initial_schema.sql**
   - Creates all tables (profiles, projects, bids, messages, etc.)
   - Sets up foreign keys and indexes
   - Adds triggers for `updated_at` columns

2. **20261017000002_rls_policies.sql**
   - Enables Row Level Security on all tables
   - Defines access policies for each table
   - Creates helper functions for role checks

3. **20261017000003_storage_buckets.sql**
   - Creates storage buckets (avatars, portfolio, deliverables)
   - Defines storage access policies

4. **20261017000004_seed_categories_skills.sql**
   - Seeds categories (Web Development, Mobile Apps, etc.)
   - Seeds skills catalog (React, Python, Flutter, etc.)

## Optional Files

- **seed_demo.sql** - Demo data for testing (NOT for production)

## How to Apply

See `docs/DATABASE_SETUP.md` for detailed instructions.

Quick start:
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Migration Rules

- ✅ **DO**: Write idempotent migrations (use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- ✅ **DO**: Use timestamps in migration filenames
- ✅ **DO**: Test migrations on a local Supabase instance first
- ❌ **DON'T**: Edit applied migrations (create new ones instead)
- ❌ **DON'T**: Delete or reorder migrations
- ❌ **DON'T**: Run `seed_demo.sql` in production

## Table Relationships

```
profiles (auth.users)
  ↓
freelancer_profiles ← freelancer_skills → skills
  ↓                ↓
portfolio_items   saved_projects → projects ← client (profiles)
  ↓                                   ↓
experience_items                    bids
                                    ↓
                              milestones, submissions, activity_log

conversations (client + freelancer)
  ↓
messages

profiles
  ↓
notifications, reviews, transactions, complaints, disputes
```

## Storage Structure

```
avatars/
  {user_id}/
    avatar.jpg

portfolio/
  {user_id}/
    {portfolio_item_id}.jpg

deliverables/
  {freelancer_id}/
    {submission_id}/
      file.pdf
```

## RLS Security Model

- **Service Role Key**: Full access (backend only, never exposed)
- **Anon Key**: Limited access via RLS policies (frontend safe)
- **User JWT**: Contains user ID, checked by RLS policies

### Key Policies

- Users can only modify their own data
- Approved freelancers can browse projects
- Only approved freelancers can submit bids
- Project participants can message each other
- Clients see bids on their projects only
- Admins can access everything

## Maintenance

### Adding a New Table

1. Create migration: `20261017NNNNNN_add_table_name.sql`
2. Define table schema
3. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
4. Add policies in same file or new policy file
5. Test locally
6. Apply: `supabase db push`

### Modifying a Table

Never edit applied migrations. Instead:

1. Create new migration: `20261017NNNNNN_alter_table_name.sql`
2. Use `ALTER TABLE` commands
3. Test locally
4. Apply: `supabase db push`

## Troubleshooting

### "relation already exists"
- Migration ran before. Check `supabase_migrations.schema_migrations` table
- Either skip or make migration idempotent with `IF NOT EXISTS`

### "permission denied"
- Check RLS policies
- Verify JWT contains correct user ID
- Use service role key for backend operations

### "violates foreign key constraint"
- Ensure parent records exist before inserting children
- Check `ON DELETE` behavior (CASCADE vs SET NULL)

## Contact

For database issues, see:
- Supabase Dashboard → Database → Schema
- Supabase Logs → Database logs
- `docs/DATABASE_SETUP.md`
