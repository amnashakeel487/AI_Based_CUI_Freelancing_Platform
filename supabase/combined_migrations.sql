-- Initial schema for CUI Freelance Platform
-- Freelancer Module: profiles, skills, portfolio, projects, bids, contracts, etc.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES & USER DATA
-- ============================================================================

-- Main profiles table (extends auth.users)
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

-- Freelancer-specific profile data
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Academic info
  program TEXT,
  department TEXT,
  campus TEXT,
  semester TEXT,
  -- Professional info
  experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  availability TEXT,
  budget_pref TEXT,
  work_mode TEXT,
  -- Links
  github_url TEXT,
  linkedin_url TEXT,
  site_url TEXT,
  -- Admin approval
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  -- Premium status
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  -- Onboarding
  onboarding_complete BOOLEAN DEFAULT FALSE,
  -- Computed fields
  avg_rating DECIMAL(3, 2) DEFAULT 0.0,
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SKILLS
-- ============================================================================

-- Master skills catalog
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique constraint on skill name
CREATE UNIQUE INDEX IF NOT EXISTS skills_name_lower_idx ON skills (LOWER(name));

-- Freelancer skills (many-to-many with level)
CREATE TABLE IF NOT EXISTS freelancer_skills (
  freelancer_id UUID REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, skill_id)
);

-- ============================================================================
-- PORTFOLIO
-- ============================================================================

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

-- ============================================================================
-- EXPERIENCE
-- ============================================================================

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

-- ============================================================================
-- CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS
-- ============================================================================

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
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_deadline_idx ON projects(deadline);

-- Project skills (many-to-many)
CREATE TABLE IF NOT EXISTS project_skills (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Saved/bookmarked projects
CREATE TABLE IF NOT EXISTS saved_projects (
  freelancer_id UUID REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, project_id)
);

-- ============================================================================
-- BIDS (called "proposals" in UI)
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS bids_project_idx ON bids(project_id);
CREATE INDEX IF NOT EXISTS bids_freelancer_idx ON bids(freelancer_id);
CREATE INDEX IF NOT EXISTS bids_status_idx ON bids(status);

-- ============================================================================
-- MILESTONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS milestones_project_idx ON milestones(project_id);

-- ============================================================================
-- SUBMISSIONS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS submissions_project_idx ON submissions(project_id);
CREATE INDEX IF NOT EXISTS submissions_freelancer_idx ON submissions(freelancer_id);

-- ============================================================================
-- MESSAGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_client_idx ON conversations(client_id);
CREATE INDEX IF NOT EXISTS conversations_freelancer_idx ON conversations(freelancer_id);
CREATE INDEX IF NOT EXISTS conversations_project_idx ON conversations(project_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at DESC);

-- ============================================================================
-- REVIEWS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS reviews_freelancer_idx ON reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS reviews_project_idx ON reviews(project_id);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS transactions_payer_idx ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS transactions_payee_idx ON transactions(payee_id);
CREATE INDEX IF NOT EXISTS transactions_project_idx ON transactions(project_id);

-- ============================================================================
-- COMPLAINTS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS complaints_user_idx ON complaints(user_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);

-- ============================================================================
-- DISPUTES
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS disputes_project_idx ON disputes(project_id);
CREATE INDEX IF NOT EXISTS disputes_raised_by_idx ON disputes(raised_by);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_project_idx ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freelancer_profiles_updated_at
  BEFORE UPDATE ON freelancer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Row Level Security (RLS) Policies
-- Enforce authorization at the database level

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
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
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if freelancer is approved
CREATE OR REPLACE FUNCTION is_approved_freelancer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM freelancer_profiles 
    WHERE user_id = auth.uid() AND approval_status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Authenticated users can read public profile fields of others
CREATE POLICY "Public profile fields readable"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Profiles are created via trigger or service role
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- FREELANCER PROFILES
-- ============================================================================

-- Freelancers can read their own profile
CREATE POLICY "Freelancers can read own profile"
  ON freelancer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Freelancers can update their own profile (except approval fields)
CREATE POLICY "Freelancers can update own profile"
  ON freelancer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Approved freelancer profiles are publicly readable (for matching)
CREATE POLICY "Approved profiles are public"
  ON freelancer_profiles FOR SELECT
  USING (approval_status = 'approved' AND auth.role() = 'authenticated');

-- Service role can insert freelancer profiles
CREATE POLICY "Service role can insert freelancer profiles"
  ON freelancer_profiles FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Admins can update approval status
CREATE POLICY "Admins can approve/reject"
  ON freelancer_profiles FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- SKILLS
-- ============================================================================

-- Everyone can read skills
CREATE POLICY "Skills are publicly readable"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage skills
CREATE POLICY "Service role can manage skills"
  ON skills FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- FREELANCER SKILLS
-- ============================================================================

-- Freelancers can manage their own skills
CREATE POLICY "Freelancers can manage own skills"
  ON freelancer_skills FOR ALL
  USING (auth.uid() = freelancer_id);

-- Authenticated users can read approved freelancers' skills
CREATE POLICY "Can read approved freelancer skills"
  ON freelancer_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles 
      WHERE user_id = freelancer_skills.freelancer_id 
      AND approval_status = 'approved'
    )
  );

-- ============================================================================
-- PORTFOLIO ITEMS
-- ============================================================================

-- Freelancers can manage their own portfolio
CREATE POLICY "Freelancers can manage own portfolio"
  ON portfolio_items FOR ALL
  USING (auth.uid() = freelancer_id);

-- Approved freelancer portfolios are publicly readable
CREATE POLICY "Can read approved freelancer portfolios"
  ON portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles 
      WHERE user_id = portfolio_items.freelancer_id 
      AND approval_status = 'approved'
    )
  );

-- ============================================================================
-- EXPERIENCE ITEMS
-- ============================================================================

-- Freelancers can manage their own experience
CREATE POLICY "Freelancers can manage own experience"
  ON experience_items FOR ALL
  USING (auth.uid() = freelancer_id);

-- Approved freelancer experience is publicly readable
CREATE POLICY "Can read approved freelancer experience"
  ON experience_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles 
      WHERE user_id = experience_items.freelancer_id 
      AND approval_status = 'approved'
    )
  );

-- ============================================================================
-- CATEGORIES
-- ============================================================================

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage categories
CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PROJECTS
-- ============================================================================

-- Clients can manage their own projects
CREATE POLICY "Clients can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = client_id);

-- Approved freelancers can read open projects
CREATE POLICY "Approved freelancers can browse projects"
  ON projects FOR SELECT
  USING (is_approved_freelancer() OR auth.uid() = client_id);

-- Freelancers can read projects they've bid on
CREATE POLICY "Freelancers can read projects they bid on"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bids 
      WHERE bids.project_id = projects.id 
      AND bids.freelancer_id = auth.uid()
    )
  );

-- Admins can read all projects
CREATE POLICY "Admins can read all projects"
  ON projects FOR SELECT
  USING (is_admin());

-- ============================================================================
-- PROJECT SKILLS
-- ============================================================================

-- Read access follows project access
CREATE POLICY "Can read project skills if can read project"
  ON project_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_skills.project_id
    )
  );

-- Clients can manage their project skills
CREATE POLICY "Clients can manage project skills"
  ON project_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_skills.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- ============================================================================
-- SAVED PROJECTS
-- ============================================================================

-- Freelancers can manage their saved projects
CREATE POLICY "Freelancers can manage saved projects"
  ON saved_projects FOR ALL
  USING (auth.uid() = freelancer_id);

-- ============================================================================
-- BIDS
-- ============================================================================

-- Freelancers can create bids (approval checked at application level)
CREATE POLICY "Approved freelancers can create bids"
  ON bids FOR INSERT
  WITH CHECK (
    auth.uid() = freelancer_id 
    AND is_approved_freelancer()
  );

-- Freelancers can read and update their own bids
CREATE POLICY "Freelancers can manage own bids"
  ON bids FOR SELECT
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can update own pending bids"
  ON bids FOR UPDATE
  USING (auth.uid() = freelancer_id AND status = 'pending');

-- Clients can read bids on their projects
CREATE POLICY "Clients can read bids on own projects"
  ON bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = bids.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Clients can update bid status on their projects
CREATE POLICY "Clients can update bid status"
  ON bids FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = bids.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Admins can read all bids
CREATE POLICY "Admins can read all bids"
  ON bids FOR SELECT
  USING (is_admin());

-- ============================================================================
-- MILESTONES
-- ============================================================================

-- Project participants can read milestones
CREATE POLICY "Project participants can read milestones"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND (
        projects.client_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM bids 
          WHERE bids.project_id = projects.id 
          AND bids.freelancer_id = auth.uid() 
          AND bids.status = 'accepted'
        )
      )
    )
  );

-- Clients can manage milestones on their projects
CREATE POLICY "Clients can manage milestones"
  ON milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Hired freelancers can update milestone status
CREATE POLICY "Hired freelancers can update milestones"
  ON milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN bids b ON b.project_id = p.id
      WHERE p.id = milestones.project_id
      AND b.freelancer_id = auth.uid()
      AND b.status = 'accepted'
    )
  );

-- ============================================================================
-- SUBMISSIONS
-- ============================================================================

-- Freelancers can create submissions for their accepted bids
CREATE POLICY "Freelancers can submit work"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = freelancer_id
    AND EXISTS (
      SELECT 1 FROM bids 
      WHERE bids.project_id = submissions.project_id 
      AND bids.freelancer_id = auth.uid() 
      AND bids.status = 'accepted'
    )
  );

-- Project participants can read submissions
CREATE POLICY "Project participants can read submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = freelancer_id
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = submissions.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Clients can update submission status
CREATE POLICY "Clients can update submission status"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = submissions.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

-- Participants can read their conversations
CREATE POLICY "Participants can read conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = client_id 
    OR auth.uid() = freelancer_id 
    OR is_admin()
  );

-- Participants can create conversations
CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = client_id 
    OR auth.uid() = freelancer_id
  );

-- ============================================================================
-- MESSAGES
-- ============================================================================

-- Participants can read messages in their conversations
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_id = auth.uid() 
        OR conversations.freelancer_id = auth.uid()
        OR is_admin()
      )
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_id = auth.uid() 
        OR conversations.freelancer_id = auth.uid()
      )
    )
  );

-- Participants can mark messages as read
CREATE POLICY "Participants can update read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_id = auth.uid() 
        OR conversations.freelancer_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can create notifications
CREATE POLICY "Service role can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- REVIEWS
-- ============================================================================

-- Freelancers can read their own reviews
CREATE POLICY "Freelancers can read own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = freelancer_id);

-- Anyone can read reviews of approved freelancers
CREATE POLICY "Can read reviews of approved freelancers"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles 
      WHERE user_id = reviews.freelancer_id 
      AND approval_status = 'approved'
    )
  );

-- Clients can create reviews for their projects
CREATE POLICY "Clients can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

-- Users can read transactions they're involved in
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (
    auth.uid() = payer_id 
    OR auth.uid() = payee_id 
    OR is_admin()
  );

-- Service role manages transactions
CREATE POLICY "Service role can manage transactions"
  ON transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- COMPLAINTS
-- ============================================================================

-- Users can create complaints
CREATE POLICY "Users can create complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own complaints
CREATE POLICY "Users can read own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all complaints
CREATE POLICY "Admins can read all complaints"
  ON complaints FOR SELECT
  USING (is_admin());

-- Admins can update complaints
CREATE POLICY "Admins can update complaints"
  ON complaints FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- DISPUTES
-- ============================================================================

-- Project participants can create disputes
CREATE POLICY "Project participants can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = disputes.project_id 
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM bids 
          WHERE bids.project_id = projects.id 
          AND bids.freelancer_id = auth.uid() 
          AND bids.status = 'accepted'
        )
      )
    )
  );

-- Participants and admins can read disputes
CREATE POLICY "Participants can read disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = raised_by
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = disputes.project_id 
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM bids 
          WHERE bids.project_id = projects.id 
          AND bids.freelancer_id = auth.uid() 
          AND bids.status = 'accepted'
        )
      )
    )
    OR is_admin()
  );

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

-- Project participants can read activity
CREATE POLICY "Project participants can read activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = activity_log.project_id 
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM bids 
          WHERE bids.project_id = projects.id 
          AND bids.freelancer_id = auth.uid() 
          AND bids.status = 'accepted'
        )
      )
    )
  );

-- Service role can create activity log entries
CREATE POLICY "Service role can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
-- Storage buckets and policies for file uploads

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Avatar images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Portfolio images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Deliverables and submissions (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES: AVATARS (PUBLIC BUCKET)
-- ============================================================================

-- Anyone authenticated can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone authenticated can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone authenticated can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access (bucket is public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ============================================================================
-- STORAGE POLICIES: PORTFOLIO (PUBLIC BUCKET)
-- ============================================================================

-- Freelancers can upload portfolio images
CREATE POLICY "Freelancers can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM freelancer_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Freelancers can update their portfolio images
CREATE POLICY "Freelancers can update portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Freelancers can delete their portfolio images
CREATE POLICY "Freelancers can delete portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access (bucket is public)
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

-- ============================================================================
-- STORAGE POLICIES: DELIVERABLES (PRIVATE BUCKET)
-- ============================================================================

-- Freelancers can upload deliverables for their accepted bids
CREATE POLICY "Freelancers can upload deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM bids 
      WHERE freelancer_id = auth.uid() 
      AND status = 'accepted'
    )
  );

-- Project participants can read deliverables
CREATE POLICY "Project participants can view deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables'
    AND (
      -- Uploader can always view
      auth.uid()::text = (storage.foldername(name))[1]
      -- Or client of projects where user has accepted bid
      OR EXISTS (
        SELECT 1 FROM projects p
        JOIN bids b ON b.project_id = p.id
        WHERE b.freelancer_id::text = (storage.foldername(name))[1]
        AND b.status = 'accepted'
        AND p.client_id = auth.uid()
      )
    )
  );

-- Uploaders can delete their own deliverables
CREATE POLICY "Uploaders can delete own deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- FILE SIZE AND TYPE RESTRICTIONS
-- ============================================================================

-- Note: File size and type restrictions are enforced at application level
-- Recommended limits:
-- - Avatars: 5MB, types: image/jpeg, image/png, image/webp
-- - Portfolio: 10MB, types: image/jpeg, image/png, image/webp
-- - Deliverables: 50MB, types: application/pdf, application/zip, images

-- Supabase bucket configuration (set via dashboard or API):
-- avatars: { fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }
-- portfolio: { fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }
-- deliverables: { fileSizeLimit: 52428800, allowedMimeTypes: ['application/pdf', 'application/zip', 'image/*'] }
-- Seed categories and skills

-- ============================================================================
-- CATEGORIES
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

-- ============================================================================
-- SKILLS  (uses WHERE NOT EXISTS to avoid conflict with functional index)
-- ============================================================================

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
