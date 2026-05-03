-- ============================================
-- Extend events with type, registration mode, deadline, published flag
-- ============================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS registration_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- Loose constraint: any string accepted; we list common ones in the admin UI
-- (general, toy_drive, turkey_drive, workshop, fundraiser, dinner,
--  support_group, volunteer_day, gathering)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'events_registration_type_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_registration_type_check
      CHECK (registration_type IN ('none', 'rsvp', 'volunteer', 'toy_request'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- ============================================
-- EVENT REGISTRATIONS (RSVP, volunteer, toy-drive request signups)
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('rsvp', 'volunteer', 'toy_request')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  guests_count INTEGER NOT NULL DEFAULT 1,
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'confirmed', 'waitlist', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a registration (form is public). Storing only contact +
-- non-PHI activity info per the foundation's privacy policy.
CREATE POLICY "Anyone can register for an event" ON event_registrations
  FOR INSERT WITH CHECK (true);

-- Logged-in users can view their own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view + manage all registrations
CREATE POLICY "Admins can view all registrations" ON event_registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage registrations" ON event_registrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_created ON event_registrations(created_at DESC);
