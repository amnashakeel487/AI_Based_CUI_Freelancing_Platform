-- OPTIONAL DEMO DATA SEED
-- WARNING: This creates demo users, projects, and data for testing purposes only.
-- DO NOT run this in production.
-- Run AFTER the migrations and AFTER creating at least one user via Supabase Auth.

-- ============================================================================
-- DEMO USERS
-- ============================================================================

-- Note: Actual user creation must be done via Supabase Auth (auth.users)
-- This file assumes you've already created demo users via the Supabase dashboard or Auth API
-- and that their IDs are known. Replace the UUIDs below with your actual test user IDs.

-- Example structure (you need to replace with real user IDs from auth.users):
-- User 1: Freelancer (approved) - Replace with real UUID
-- User 2: Client - Replace with real UUID
-- User 3: Freelancer (pending) - Replace with real UUID

-- For this demo seed, we'll use placeholder UUIDs that you MUST replace:
DO $$
DECLARE
  freelancer_id UUID := '11111111-1111-1111-1111-111111111111';  -- REPLACE ME
  client_id UUID := '22222222-2222-2222-2222-222222222222';      -- REPLACE ME
  pending_fl_id UUID := '33333333-3333-3333-3333-333333333333';  -- REPLACE ME
BEGIN
  -- Check if placeholder IDs exist, if not, skip demo seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = freelancer_id) THEN
    RAISE NOTICE 'Demo seed skipped: Replace placeholder UUIDs with real user IDs from auth.users';
    RETURN;
  END IF;

  -- ============================================================================
  -- PROFILES
  -- ============================================================================

  INSERT INTO profiles (id, role, full_name, email, phone, city, headline, bio) VALUES
    (freelancer_id, 'freelancer', 'Ayesha Khan', 'ayesha.khan@cuilahore.edu.pk', '+92 300 1234567', 'Lahore', 
     'Full-stack developer · React & Python', 
     'Sixth-semester software engineering student who builds web apps with React and FastAPI.'),
    (client_id, 'client', 'CUI Debating Society', 'debating@cuilahore.edu.pk', '+92 300 9876543', 'Lahore', 
     'Student Society', 
     'Official debating society looking for web development support.'),
    (pending_fl_id, 'freelancer', 'Ahmed Ali', 'ahmed.ali@cuilahore.edu.pk', '+92 301 1111111', 'Islamabad', 
     'Mobile App Developer', 
     'CS student specializing in Flutter and mobile development.')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- FREELANCER PROFILES
  -- ============================================================================

  INSERT INTO freelancer_profiles (
    user_id, program, department, campus, semester, experience_level, 
    availability, work_mode, approval_status, onboarding_complete, avg_rating, profile_completion
  ) VALUES
    (freelancer_id, 'BS Software Engineering', 'Computer Science', 'Lahore', '6th', 'Intermediate',
     'Part-time (20 hrs/week)', 'Remote', 'approved', true, 4.8, 85),
    (pending_fl_id, 'BS Computer Science', 'Computer Science', 'Islamabad', '4th', 'Beginner',
     'Part-time (15 hrs/week)', 'Remote or On-site', 'pending', true, 0.0, 60)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================================================
  -- SKILLS FOR DEMO FREELANCER
  -- ============================================================================

  -- Get skill IDs
  INSERT INTO freelancer_skills (freelancer_id, skill_id, level)
  SELECT freelancer_id, id, 'Advanced' FROM skills WHERE name = 'React'
  UNION ALL
  SELECT freelancer_id, id, 'Advanced' FROM skills WHERE name = 'JavaScript'
  UNION ALL
  SELECT freelancer_id, id, 'Intermediate' FROM skills WHERE name = 'Python'
  UNION ALL
  SELECT freelancer_id, id, 'Intermediate' FROM skills WHERE name = 'FastAPI'
  UNION ALL
  SELECT freelancer_id, id, 'Advanced' FROM skills WHERE name = 'Tailwind CSS'
  ON CONFLICT DO NOTHING;

  INSERT INTO freelancer_skills (freelancer_id, skill_id, level)
  SELECT pending_fl_id, id, 'Intermediate' FROM skills WHERE name = 'Flutter'
  UNION ALL
  SELECT pending_fl_id, id, 'Beginner' FROM skills WHERE name = 'Firebase'
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PORTFOLIO ITEMS
  -- ============================================================================

  INSERT INTO portfolio_items (freelancer_id, title, description, technologies, link) VALUES
    (freelancer_id, 'Campus map redesign', 
     'Interactive campus map with building search and directions.', 
     ARRAY['React', 'Tailwind CSS', 'Leaflet'], 
     'https://example.com/campus-map'),
    (freelancer_id, 'Club membership form', 
     'Form with validation and CSV export for a student club.', 
     ARRAY['JavaScript', 'Node.js', 'Express.js'], 
     'https://example.com/membership-form'),
    (freelancer_id, 'Expense tracker API', 
     'REST API with JWT authentication for personal expense tracking.', 
     ARRAY['Python', 'FastAPI', 'PostgreSQL'], 
     'https://github.com/example/expense-api')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- EXPERIENCE
  -- ============================================================================

  INSERT INTO experience_items (freelancer_id, role, organization, period, description) VALUES
    (freelancer_id, 'Web Developer (volunteer)', 'CUI Computing Society', '2025 – present', 
     'Maintain society website and build event registration tools')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO PROJECTS
  -- ============================================================================

  -- Get category IDs
  INSERT INTO projects (id, client_id, title, description, requirements, category_id, budget, project_type, deadline, status)
  SELECT 
    'a0000000-0000-0000-0000-000000000001'::uuid,
    client_id,
    'Society event registration website',
    'Build a responsive website where students can browse and register for society events, with an admin view for organisers.',
    ARRAY['Responsive layout', 'Registration form with validation', 'Organiser export to CSV'],
    (SELECT id FROM categories WHERE name = 'Web Development'),
    25000,
    'Fixed price',
    '2026-11-20'::date,
    'open'
  WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 'a0000000-0000-0000-0000-000000000001'::uuid);

  INSERT INTO projects (id, client_id, title, description, requirements, category_id, budget, project_type, deadline, status)
  SELECT 
    'a0000000-0000-0000-0000-000000000002'::uuid,
    client_id,
    'REST API for hostel management',
    'Build an API for room allocation, complaints and fee tracking.',
    ARRAY['JWT authentication', 'OpenAPI docs', 'Unit tests'],
    (SELECT id FROM categories WHERE name = 'Web Development'),
    35000,
    'Fixed price',
    '2026-12-20'::date,
    'in_progress'
  WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 'a0000000-0000-0000-0000-000000000002'::uuid);

  -- Add skills to projects
  INSERT INTO project_skills (project_id, skill_id)
  SELECT 'a0000000-0000-0000-0000-000000000001'::uuid, id FROM skills WHERE name IN ('React', 'Tailwind CSS', 'Supabase')
  ON CONFLICT DO NOTHING;

  INSERT INTO project_skills (project_id, skill_id)
  SELECT 'a0000000-0000-0000-0000-000000000002'::uuid, id FROM skills WHERE name IN ('Python', 'FastAPI', 'SQL')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO BIDS
  -- ============================================================================

  INSERT INTO bids (project_id, freelancer_id, cover_letter, amount, delivery_days, status, client_response)
  VALUES
    ('a0000000-0000-0000-0000-000000000001'::uuid, freelancer_id, 
     'I have built two similar event sites with React and Supabase and can deliver within two weeks.',
     22000, 14, 'pending', NULL),
    ('a0000000-0000-0000-0000-000000000002'::uuid, freelancer_id,
     'I will deliver a documented FastAPI service with tests.',
     33000, 21, 'accepted', 'Your approach looks solid. Welcome aboard.')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO MILESTONES
  -- ============================================================================

  INSERT INTO milestones (project_id, title, done, position) VALUES
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'Data model and auth', true, 1),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'Room allocation endpoints', true, 2),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'Fees and complaints', false, 3),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'Tests and docs', false, 4)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO CONVERSATION & MESSAGES
  -- ============================================================================

  INSERT INTO conversations (id, project_id, client_id, freelancer_id)
  VALUES ('b0000000-0000-0000-0000-000000000001'::uuid, 
          'a0000000-0000-0000-0000-000000000002'::uuid, 
          client_id, freelancer_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES
    ('b0000000-0000-0000-0000-000000000001'::uuid, client_id, 
     'Thanks for the update on room allocation.', NOW() - INTERVAL '2 days'),
    ('b0000000-0000-0000-0000-000000000001'::uuid, freelancer_id,
     'Fee endpoints are next. I will share a draft by Friday.', NOW() - INTERVAL '1 day'),
    ('b0000000-0000-0000-0000-000000000001'::uuid, client_id,
     'Can we review the fee endpoints on Sunday?', NOW() - INTERVAL '3 hours')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO NOTIFICATIONS
  -- ============================================================================

  INSERT INTO notifications (user_id, type, body, read, created_at) VALUES
    (freelancer_id, 'Proposals', 
     'Your proposal for "REST API for hostel management" was accepted.', 
     false, NOW() - INTERVAL '2 days'),
    (freelancer_id, 'Messages', 
     'New message from CUI Debating Society.', 
     false, NOW() - INTERVAL '3 hours'),
    (freelancer_id, 'Projects', 
     'Deadline in 5 days: REST API for hostel management.', 
     true, NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- DEMO ACTIVITY LOG
  -- ============================================================================

  INSERT INTO activity_log (project_id, actor_id, text, created_at) VALUES
    ('a0000000-0000-0000-0000-000000000002'::uuid, freelancer_id,
     'Project started', NOW() - INTERVAL '20 days'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, client_id,
     'Client commented on the data model', NOW() - INTERVAL '12 days'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, freelancer_id,
     'Milestone "Room allocation endpoints" marked complete', NOW() - INTERVAL '5 days')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo data seeded successfully';
END $$;
