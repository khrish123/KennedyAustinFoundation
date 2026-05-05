-- ============================================
-- CLASS SESSIONS — individual meetings of a class
-- (e.g., the weekly grief group held on a specific date)
-- ============================================
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  title TEXT,
  location_override TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage class sessions" ON class_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Enrolled members can see the schedule for their classes
CREATE POLICY "Enrolled members can view sessions" ON class_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.class_id = class_sessions.class_id
        AND enrollments.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_class_sessions_updated_at BEFORE UPDATE ON class_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_class_sessions_class ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON class_sessions(session_date DESC);

-- ============================================
-- CLASS ATTENDANCE — who showed up for which session
-- ============================================
CREATE TABLE IF NOT EXISTS class_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent'
    CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  marked_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage class attendance" ON class_attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Members can see their own attendance history
CREATE POLICY "Members see own attendance" ON class_attendance
  FOR SELECT USING (user_id = auth.uid());

CREATE TRIGGER update_class_attendance_updated_at BEFORE UPDATE ON class_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_class_attendance_session ON class_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user ON class_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_status ON class_attendance(status);
