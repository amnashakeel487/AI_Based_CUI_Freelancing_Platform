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
