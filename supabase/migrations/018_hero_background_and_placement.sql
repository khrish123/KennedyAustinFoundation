-- ============================================
-- Hero slides: per-slide background color + image placement
-- ============================================
ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS background_color TEXT,
  ADD COLUMN IF NOT EXISTS image_position TEXT NOT NULL DEFAULT 'right';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'hero_slides_image_position_check'
  ) THEN
    ALTER TABLE hero_slides
      ADD CONSTRAINT hero_slides_image_position_check
      CHECK (image_position IN ('left', 'right', 'center'));
  END IF;
END $$;

-- background_color holds a #rrggbb hex or NULL to keep the default
-- sunrise gradient. Validated in the admin action before it is written.
