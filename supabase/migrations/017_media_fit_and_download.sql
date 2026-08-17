-- ============================================
-- Hero slides: show flyers whole + opt-in image download
-- ============================================
ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS image_fit TEXT NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS allow_download BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'hero_slides_image_fit_check'
  ) THEN
    ALTER TABLE hero_slides
      ADD CONSTRAINT hero_slides_image_fit_check
      CHECK (image_fit IN ('cover', 'contain'));
  END IF;
END $$;

-- ============================================
-- Events: let admins turn the flyer download off per event
-- (defaults on, matching how it already ships)
-- ============================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS allow_flyer_download BOOLEAN NOT NULL DEFAULT true;
