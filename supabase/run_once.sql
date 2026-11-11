-- ============================================================================
-- CUI FREELANCE PLATFORM — FULL SETUP SCRIPT
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS everywhere.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'client', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS freelancer_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  program TEXT,
  department TEXT,
  campus TEXT,
  semester TEXT,
  experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  availability TEXT,
  budget_pref TEXT,
  work_mode TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  site_url TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3, 2) DEFAULT 0.0,
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS skills_name_lower_idx ON skills (LOWER(name));

CREATE TABLE IF NOT EXISTS freelancer_skills (
  freelancer_id UUID REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, skill_id)
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS portfolio_items_freelancer_idx ON portfolio_items(freelancer_id);

CREATE TABLE IF NOT EXISTS experience_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  organization TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS experience_items_freelancer_idx ON experience_items(freelancer_id);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  budget DECIMAL(10, 2) NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('Fixed price', 'Hourly')),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'submitted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_client_idx ON projects(client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

CREATE TABLE IF NOT EXISTS project_skills (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE IF NOT EXISTS saved_projects (
  freelancer_id UUID REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, project_id)
);

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  delivery_days INTEGER NOT NULL,
  portfolio_item_id UUID REFERENCES portfolio_items(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  client_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, freelancer_id)
);
CREATE INDEX IF NOT EXISTS bids_freelancer_idx ON bids(freelancer_id);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS milestones_project_idx ON milestones(project_id);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  notes TEXT,
  file_path TEXT,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, freelancer_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('held_in_escrow', 'released', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_freelancer_profiles_updated_at') THEN
    CREATE TRIGGER update_freelancer_profiles_updated_at BEFORE UPDATE ON freelancer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bids_updated_at') THEN
    CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- 3. ENABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_approved_freelancer() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM freelancer_profiles WHERE user_id = auth.uid() AND approval_status = 'approved');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 5. RLS POLICIES (drop-and-recreate for idempotency)
-- ============================================================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profile fields readable" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profile fields readable" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- freelancer_profiles
DROP POLICY IF EXISTS "Freelancers can read own profile" ON freelancer_profiles;
DROP POLICY IF EXISTS "Freelancers can update own profile" ON freelancer_profiles;
DROP POLICY IF EXISTS "Approved profiles are public" ON freelancer_profiles;
DROP POLICY IF EXISTS "Service role can insert freelancer profiles" ON freelancer_profiles;
DROP POLICY IF EXISTS "Admins can approve/reject" ON freelancer_profiles;

CREATE POLICY "Freelancers can read own profile" ON freelancer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Freelancers can update own profile" ON freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Approved profiles are public" ON freelancer_profiles FOR SELECT USING (approval_status = 'approved' AND auth.role() = 'authenticated');
CREATE POLICY "Service role can insert freelancer profiles" ON freelancer_profiles FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Admins can approve/reject" ON freelancer_profiles FOR UPDATE USING (is_admin());

-- skills
DROP POLICY IF EXISTS "Skills are publicly readable" ON skills;
DROP POLICY IF EXISTS "Service role can manage skills" ON skills;

CREATE POLICY "Skills are publicly readable" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage skills" ON skills FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- freelancer_skills
DROP POLICY IF EXISTS "Freelancers can manage own skills" ON freelancer_skills;
DROP POLICY IF EXISTS "Can read approved freelancer skills" ON freelancer_skills;

CREATE POLICY "Freelancers can manage own skills" ON freelancer_skills FOR ALL USING (auth.uid() = freelancer_id);
CREATE POLICY "Can read approved freelancer skills" ON freelancer_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM freelancer_profiles WHERE user_id = freelancer_skills.freelancer_id AND approval_status = 'approved')
);

-- portfolio_items
DROP POLICY IF EXISTS "Freelancers can manage own portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "Can read approved freelancer portfolios" ON portfolio_items;

CREATE POLICY "Freelancers can manage own portfolio" ON portfolio_items FOR ALL USING (auth.uid() = freelancer_id);
CREATE POLICY "Can read approved freelancer portfolios" ON portfolio_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM freelancer_profiles WHERE user_id = portfolio_items.freelancer_id AND approval_status = 'approved')
);

-- experience_items
DROP POLICY IF EXISTS "Freelancers can manage own experience" ON experience_items;

CREATE POLICY "Freelancers can manage own experience" ON experience_items FOR ALL USING (auth.uid() = freelancer_id);

-- categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage categories" ON categories FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- projects
DROP POLICY IF EXISTS "Clients can manage own projects" ON projects;
DROP POLICY IF EXISTS "Approved freelancers can browse projects" ON projects;
DROP POLICY IF EXISTS "Freelancers can read projects they bid on" ON projects;
DROP POLICY IF EXISTS "Admins can read all projects" ON projects;

CREATE POLICY "Clients can manage own projects" ON projects FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Approved freelancers can browse projects" ON projects FOR SELECT USING (is_approved_freelancer() OR auth.uid() = client_id);
CREATE POLICY "Admins can read all projects" ON projects FOR SELECT USING (is_admin());

-- project_skills
DROP POLICY IF EXISTS "Can read project skills if can read project" ON project_skills;
DROP POLICY IF EXISTS "Clients can manage project skills" ON project_skills;

CREATE POLICY "Can read project skills if can read project" ON project_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_skills.project_id)
);
CREATE POLICY "Clients can manage project skills" ON project_skills FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_skills.project_id AND projects.client_id = auth.uid())
);

-- saved_projects
DROP POLICY IF EXISTS "Freelancers can manage saved projects" ON saved_projects;

CREATE POLICY "Freelancers can manage saved projects" ON saved_projects FOR ALL USING (auth.uid() = freelancer_id);

-- bids
DROP POLICY IF EXISTS "Approved freelancers can create bids" ON bids;
DROP POLICY IF EXISTS "Freelancers can manage own bids" ON bids;
DROP POLICY IF EXISTS "Freelancers can update own pending bids" ON bids;
DROP POLICY IF EXISTS "Clients can read bids on own projects" ON bids;
DROP POLICY IF EXISTS "Clients can update bid status" ON bids;
DROP POLICY IF EXISTS "Admins can read all bids" ON bids;

CREATE POLICY "Approved freelancers can create bids" ON bids FOR INSERT WITH CHECK (auth.uid() = freelancer_id AND is_approved_freelancer());
CREATE POLICY "Freelancers can manage own bids" ON bids FOR SELECT USING (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update own pending bids" ON bids FOR UPDATE USING (auth.uid() = freelancer_id AND status = 'pending');
CREATE POLICY "Clients can read bids on own projects" ON bids FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bids.project_id AND projects.client_id = auth.uid())
);
CREATE POLICY "Clients can update bid status" ON bids FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bids.project_id AND projects.client_id = auth.uid())
);
CREATE POLICY "Admins can read all bids" ON bids FOR SELECT USING (is_admin());

-- milestones
DROP POLICY IF EXISTS "Project participants can read milestones" ON milestones;
DROP POLICY IF EXISTS "Clients can manage milestones" ON milestones;
DROP POLICY IF EXISTS "Hired freelancers can update milestones" ON milestones;

CREATE POLICY "Project participants can read milestones" ON milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND (
    projects.client_id = auth.uid() OR
    EXISTS (SELECT 1 FROM bids WHERE bids.project_id = projects.id AND bids.freelancer_id = auth.uid() AND bids.status = 'accepted')
  ))
);
CREATE POLICY "Clients can manage milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.client_id = auth.uid())
);

-- submissions
DROP POLICY IF EXISTS "Freelancers can submit work" ON submissions;
DROP POLICY IF EXISTS "Project participants can read submissions" ON submissions;

CREATE POLICY "Freelancers can submit work" ON submissions FOR INSERT WITH CHECK (
  auth.uid() = freelancer_id AND
  EXISTS (SELECT 1 FROM bids WHERE bids.project_id = submissions.project_id AND bids.freelancer_id = auth.uid() AND bids.status = 'accepted')
);
CREATE POLICY "Project participants can read submissions" ON submissions FOR SELECT USING (
  auth.uid() = freelancer_id OR
  EXISTS (SELECT 1 FROM projects WHERE projects.id = submissions.project_id AND projects.client_id = auth.uid())
);

-- conversations
DROP POLICY IF EXISTS "Participants can read conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;

CREATE POLICY "Participants can read conversations" ON conversations FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = freelancer_id OR is_admin()
);
CREATE POLICY "Participants can create conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = client_id OR auth.uid() = freelancer_id
);

-- messages
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
DROP POLICY IF EXISTS "Participants can send messages" ON messages;
DROP POLICY IF EXISTS "Participants can update read status" ON messages;

CREATE POLICY "Participants can read messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (
    conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid() OR is_admin()
  ))
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (
    conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid()
  ))
);
CREATE POLICY "Participants can update read status" ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (
    conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid()
  ))
);

-- notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can create notifications" ON notifications;

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can create notifications" ON notifications FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- reviews
DROP POLICY IF EXISTS "Freelancers can read own reviews" ON reviews;
DROP POLICY IF EXISTS "Can read reviews of approved freelancers" ON reviews;
DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;

CREATE POLICY "Freelancers can read own reviews" ON reviews FOR SELECT USING (auth.uid() = freelancer_id);
CREATE POLICY "Can read reviews of approved freelancers" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM freelancer_profiles WHERE user_id = reviews.freelancer_id AND approval_status = 'approved')
);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON transactions;

CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (
  auth.uid() = payer_id OR auth.uid() = payee_id OR is_admin()
);
CREATE POLICY "Service role can manage transactions" ON transactions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- complaints
DROP POLICY IF EXISTS "Users can create complaints" ON complaints;
DROP POLICY IF EXISTS "Users can read own complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can read all complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can update complaints" ON complaints;

CREATE POLICY "Users can create complaints" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own complaints" ON complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all complaints" ON complaints FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update complaints" ON complaints FOR UPDATE USING (is_admin());

-- disputes
DROP POLICY IF EXISTS "Project participants can create disputes" ON disputes;
DROP POLICY IF EXISTS "Participants can read disputes" ON disputes;
DROP POLICY IF EXISTS "Admins can update disputes" ON disputes;

CREATE POLICY "Project participants can create disputes" ON disputes FOR INSERT WITH CHECK (
  auth.uid() = raised_by AND
  EXISTS (SELECT 1 FROM projects WHERE projects.id = disputes.project_id AND (
    projects.client_id = auth.uid() OR
    EXISTS (SELECT 1 FROM bids WHERE bids.project_id = projects.id AND bids.freelancer_id = auth.uid() AND bids.status = 'accepted')
  ))
);
CREATE POLICY "Participants can read disputes" ON disputes FOR SELECT USING (
  auth.uid() = raised_by OR
  EXISTS (SELECT 1 FROM projects WHERE projects.id = disputes.project_id AND projects.client_id = auth.uid())
  OR is_admin()
);
CREATE POLICY "Admins can update disputes" ON disputes FOR UPDATE USING (is_admin());

-- activity_log
DROP POLICY IF EXISTS "Project participants can read activity" ON activity_log;
DROP POLICY IF EXISTS "Service role can create activity logs" ON activity_log;

CREATE POLICY "Project participants can read activity" ON activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = activity_log.project_id AND (
    projects.client_id = auth.uid() OR
    EXISTS (SELECT 1 FROM bids WHERE bids.project_id = projects.id AND bids.freelancer_id = auth.uid() AND bids.status = 'accepted')
  ))
);
CREATE POLICY "Service role can create activity logs" ON activity_log FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('deliverables', 'deliverables', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Freelancers can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Freelancers can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Freelancers can delete portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Freelancers can upload deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Project participants can view deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Uploaders can delete own deliverables" ON storage.objects;

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Freelancers can upload portfolio images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Freelancers can update portfolio images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Freelancers can delete portfolio images" ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Freelancers can upload deliverables" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Project participants can view deliverables" ON storage.objects FOR SELECT
  USING (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Uploaders can delete own deliverables" ON storage.objects FOR DELETE
  USING (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

INSERT INTO categories (name, description)
SELECT name, description FROM (VALUES
  ('Web Development',  'Full-stack, frontend, backend, and API development'),
  ('Mobile Apps',      'iOS, Android, and cross-platform mobile applications'),
  ('UI/UX Design',     'User interface and user experience design'),
  ('Data & AI',        'Data analysis, machine learning, and AI solutions'),
  ('Writing',          'Technical writing, content creation, and documentation'),
  ('Multimedia',       'Video editing, graphic design, and multimedia production')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.name = v.name);

INSERT INTO skills (name)
SELECT v.name FROM (VALUES
  ('React'), ('JavaScript'), ('Python'), ('FastAPI'), ('Node.js'),
  ('Tailwind CSS'), ('Figma'), ('UI/UX Design'), ('SQL'), ('Supabase'),
  ('Flutter'), ('Data Analysis'), ('Technical Writing'), ('Machine Learning'),
  ('Graphic Design'), ('Video Editing'), ('TypeScript'), ('Vue.js'),
  ('Angular'), ('Django'), ('Express.js'), ('PostgreSQL'), ('MongoDB'),
  ('MySQL'), ('Git'), ('Docker'), ('AWS'), ('Azure'), ('Firebase'),
  ('React Native'), ('Swift'), ('Kotlin'), ('Java'), ('C++'), ('C#'),
  ('.NET'), ('PHP'), ('Laravel'), ('WordPress'), ('Shopify'), ('SEO'),
  ('Content Writing'), ('Copywriting'), ('Proofreading'),
  ('Adobe Photoshop'), ('Adobe Illustrator'), ('Adobe XD'), ('Sketch'),
  ('InVision'), ('After Effects'), ('Premiere Pro'), ('Final Cut Pro'),
  ('3D Modeling'), ('Blender'), ('Unity'), ('Unreal Engine'),
  ('Game Development'), ('Blockchain'), ('Solidity'), ('Web3'), ('NFT'),
  ('DevOps'), ('CI/CD'), ('Kubernetes'), ('Linux'), ('Bash'),
  ('API Development'), ('REST API'), ('GraphQL'), ('Microservices'),
  ('Testing'), ('Jest'), ('Pytest'), ('Selenium'), ('Cypress'),
  ('Agile'), ('Scrum'), ('Project Management')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM skills s WHERE LOWER(s.name) = LOWER(v.name));

-- Done!
SELECT 'Setup complete. Tables: ' || COUNT(*)::text || ' created.' FROM information_schema.tables WHERE table_schema = 'public';
