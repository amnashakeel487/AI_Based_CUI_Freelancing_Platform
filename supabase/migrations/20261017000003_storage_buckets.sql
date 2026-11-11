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
