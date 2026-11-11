-- QUICK REFERENCE: Common Database Queries
-- Use these in Supabase SQL Editor for testing and debugging

-- ============================================================================
-- USER & PROFILE QUERIES
-- ============================================================================

-- Get all users with their roles
SELECT p.id, p.full_name, p.email, p.role, p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Get freelancer profile with approval status
SELECT 
  p.full_name, p.email,
  fp.approval_status, fp.program, fp.department,
  fp.avg_rating, fp.profile_completion, fp.onboarding_complete
FROM profiles p
JOIN freelancer_profiles fp ON fp.user_id = p.id
WHERE p.role = 'freelancer'
ORDER BY fp.created_at DESC;

-- Get pending freelancers (for admin approval)
SELECT p.full_name, p.email, fp.program, fp.campus, fp.created_at
FROM profiles p
JOIN freelancer_profiles fp ON fp.user_id = p.id
WHERE fp.approval_status = 'pending'
ORDER BY fp.created_at;

-- Approve a freelancer (admin action)
UPDATE freelancer_profiles
SET approval_status = 'approved',
    approved_at = NOW(),
    approved_by = 'admin-user-id-here'
WHERE user_id = 'freelancer-user-id-here';

-- Reject a freelancer (admin action)
UPDATE freelancer_profiles
SET approval_status = 'rejected',
    rejection_reason = 'Does not meet requirements'
WHERE user_id = 'freelancer-user-id-here';

-- ============================================================================
-- SKILLS QUERIES
-- ============================================================================

-- Get all skills (catalog)
SELECT * FROM skills ORDER BY name;

-- Get freelancer's skills with levels
SELECT p.full_name, s.name AS skill, fs.level
FROM profiles p
JOIN freelancer_skills fs ON fs.freelancer_id = p.id
JOIN skills s ON s.id = fs.skill_id
WHERE p.id = 'freelancer-user-id-here'
ORDER BY s.name;

-- Find freelancers with specific skill
SELECT p.full_name, p.email, fs.level
FROM profiles p
JOIN freelancer_skills fs ON fs.freelancer_id = p.id
JOIN skills s ON s.id = fs.skill_id
WHERE s.name = 'React'
  AND fp.approval_status = 'approved'
ORDER BY fs.level DESC;

-- Skills ranked by popularity
SELECT s.name, COUNT(*) as freelancer_count
FROM skills s
JOIN freelancer_skills fs ON fs.skill_id = s.id
GROUP BY s.id, s.name
ORDER BY freelancer_count DESC
LIMIT 20;

-- ============================================================================
-- PROJECT QUERIES
-- ============================================================================

-- Get all open projects
SELECT 
  p.title, p.budget, p.deadline,
  pr.full_name AS client_name,
  c.name AS category
FROM projects p
JOIN profiles pr ON pr.id = p.client_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'open'
ORDER BY p.created_at DESC;

-- Get project with skills
SELECT 
  p.title, p.budget, p.status,
  ARRAY_AGG(s.name) AS required_skills
FROM projects p
LEFT JOIN project_skills ps ON ps.project_id = p.id
LEFT JOIN skills s ON s.id = ps.skill_id
WHERE p.id = 'project-id-here'
GROUP BY p.id;

-- Projects by status
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY count DESC;

-- ============================================================================
-- BIDS QUERIES
-- ============================================================================

-- Get bids for a project
SELECT 
  b.amount, b.delivery_days, b.status,
  p.full_name AS freelancer_name,
  b.cover_letter,
  b.created_at
FROM bids b
JOIN profiles p ON p.id = b.freelancer_id
WHERE b.project_id = 'project-id-here'
ORDER BY b.created_at;

-- Get freelancer's bids
SELECT 
  pr.title AS project,
  b.amount, b.delivery_days, b.status,
  b.client_response,
  b.created_at
FROM bids b
JOIN projects pr ON pr.id = b.project_id
WHERE b.freelancer_id = 'freelancer-user-id-here'
ORDER BY b.created_at DESC;

-- Bids by status
SELECT status, COUNT(*) as count
FROM bids
GROUP BY status;

-- Accept a bid (client action)
UPDATE bids
SET status = 'accepted',
    client_response = 'Welcome aboard! Let''s get started.'
WHERE id = 'bid-id-here'
  AND project_id IN (SELECT id FROM projects WHERE client_id = 'client-user-id-here');

-- Also update project status to in_progress
UPDATE projects
SET status = 'in_progress'
WHERE id = 'project-id-here';

-- ============================================================================
-- MESSAGING QUERIES
-- ============================================================================

-- Get user's conversations
SELECT 
  c.id,
  CASE 
    WHEN c.client_id = 'user-id-here' THEN p_f.full_name
    ELSE p_c.full_name
  END AS other_party,
  pr.title AS project,
  c.updated_at AS last_activity
FROM conversations c
LEFT JOIN projects pr ON pr.id = c.project_id
LEFT JOIN profiles p_c ON p_c.id = c.client_id
LEFT JOIN profiles p_f ON p_f.id = c.freelancer_id
WHERE c.client_id = 'user-id-here' OR c.freelancer_id = 'user-id-here'
ORDER BY c.updated_at DESC;

-- Get messages in a conversation
SELECT 
  m.body,
  p.full_name AS sender,
  m.created_at,
  m.read_at
FROM messages m
JOIN profiles p ON p.id = m.sender_id
WHERE m.conversation_id = 'conversation-id-here'
ORDER BY m.created_at;

-- Count unread messages per user
SELECT 
  CASE 
    WHEN c.client_id = 'user-id-here' THEN c.freelancer_id
    ELSE c.client_id
  END AS user_id,
  COUNT(*) AS unread_count
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE (c.client_id = 'user-id-here' OR c.freelancer_id = 'user-id-here')
  AND m.sender_id != 'user-id-here'
  AND m.read_at IS NULL
GROUP BY user_id;

-- ============================================================================
-- NOTIFICATIONS QUERIES
-- ============================================================================

-- Get user's unread notifications
SELECT type, body, created_at
FROM notifications
WHERE user_id = 'user-id-here'
  AND read = false
ORDER BY created_at DESC;

-- Mark notification as read
UPDATE notifications
SET read = true
WHERE id = 'notification-id-here'
  AND user_id = 'user-id-here';

-- Mark all as read
UPDATE notifications
SET read = true
WHERE user_id = 'user-id-here'
  AND read = false;

-- ============================================================================
-- REVIEWS & RATINGS QUERIES
-- ============================================================================

-- Get freelancer's reviews
SELECT 
  r.rating, r.comment,
  pr.title AS project,
  p.full_name AS client,
  r.created_at
FROM reviews r
JOIN projects pr ON pr.id = r.project_id
JOIN profiles p ON p.id = r.client_id
WHERE r.freelancer_id = 'freelancer-user-id-here'
ORDER BY r.created_at DESC;

-- Calculate freelancer's average rating
SELECT 
  p.full_name,
  COUNT(r.id) AS review_count,
  AVG(r.rating)::NUMERIC(3,2) AS avg_rating,
  COUNT(CASE WHEN r.rating = 5 THEN 1 END) AS five_stars,
  COUNT(CASE WHEN r.rating = 4 THEN 1 END) AS four_stars,
  COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS three_stars,
  COUNT(CASE WHEN r.rating = 2 THEN 1 END) AS two_stars,
  COUNT(CASE WHEN r.rating = 1 THEN 1 END) AS one_star
FROM profiles p
JOIN reviews r ON r.freelancer_id = p.id
WHERE p.id = 'freelancer-user-id-here'
GROUP BY p.id, p.full_name;

-- Update freelancer's cached avg_rating
UPDATE freelancer_profiles fp
SET avg_rating = (
  SELECT AVG(rating)::NUMERIC(3,2)
  FROM reviews
  WHERE freelancer_id = fp.user_id
)
WHERE fp.user_id = 'freelancer-user-id-here';

-- ============================================================================
-- TRANSACTIONS QUERIES
-- ============================================================================

-- Get freelancer's earnings
SELECT 
  pr.title AS project,
  t.amount,
  t.status,
  t.created_at,
  t.released_at
FROM transactions t
LEFT JOIN projects pr ON pr.id = t.project_id
WHERE t.payee_id = 'freelancer-user-id-here'
ORDER BY t.created_at DESC;

-- Calculate total earnings by status
SELECT 
  status,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount
FROM transactions
WHERE payee_id = 'freelancer-user-id-here'
GROUP BY status;

-- ============================================================================
-- PORTFOLIO QUERIES
-- ============================================================================

-- Get freelancer's portfolio
SELECT title, description, technologies, link, created_at
FROM portfolio_items
WHERE freelancer_id = 'freelancer-user-id-here'
ORDER BY created_at DESC;

-- ============================================================================
-- ADMIN QUERIES
-- ============================================================================

-- Platform statistics
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'freelancer') AS total_freelancers,
  (SELECT COUNT(*) FROM freelancer_profiles WHERE approval_status = 'approved') AS approved_freelancers,
  (SELECT COUNT(*) FROM freelancer_profiles WHERE approval_status = 'pending') AS pending_freelancers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'client') AS total_clients,
  (SELECT COUNT(*) FROM projects) AS total_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'open') AS open_projects,
  (SELECT COUNT(*) FROM bids) AS total_bids,
  (SELECT COUNT(*) FROM reviews) AS total_reviews;

-- Recent activity
SELECT 
  'project' AS type, 
  p.title AS title,
  pr.full_name AS user_name,
  p.created_at
FROM projects p
JOIN profiles pr ON pr.id = p.client_id
UNION ALL
SELECT 
  'bid' AS type,
  pr.title AS title,
  p.full_name AS user_name,
  b.created_at
FROM bids b
JOIN projects pr ON pr.id = b.project_id
JOIN profiles p ON p.id = b.freelancer_id
UNION ALL
SELECT 
  'review' AS type,
  pr.title AS title,
  p.full_name AS user_name,
  r.created_at
FROM reviews r
JOIN projects pr ON pr.id = r.project_id
JOIN profiles p ON p.id = r.client_id
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- HELPER FUNCTIONS FOR TESTING
-- ============================================================================

-- Check if user is approved freelancer
SELECT is_approved_freelancer() AS is_approved;

-- Check current user role
SELECT current_user_role() AS my_role;

-- Check if user is admin
SELECT is_admin() AS is_admin;

-- Get current authenticated user ID
SELECT auth.uid() AS my_user_id;

-- ============================================================================
-- CLEANUP QUERIES (TESTING ONLY)
-- ============================================================================

-- Delete all demo bids (cascade will handle)
-- DELETE FROM bids WHERE project_id LIKE 'a0000000-%';

-- Delete all demo projects
-- DELETE FROM projects WHERE id LIKE 'a0000000-%';

-- Delete all demo conversations
-- DELETE FROM conversations WHERE id LIKE 'b0000000-%';

-- Reset a freelancer's approval status (testing)
-- UPDATE freelancer_profiles SET approval_status = 'pending' WHERE user_id = 'user-id-here';
