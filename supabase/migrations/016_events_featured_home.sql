-- ============================================
-- Let admins promote an event into the homepage hero slider
-- ============================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS featured_on_home BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_featured_home
  ON events(featured_on_home, date)
  WHERE featured_on_home = true;
