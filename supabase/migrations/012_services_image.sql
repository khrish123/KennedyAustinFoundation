-- ============================================
-- SERVICES — add image_url
-- ============================================
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS image_url TEXT;
