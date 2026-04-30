-- ============================================
-- RESOURCES — extend with admin-friendly fields
-- ============================================
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_order ON resources(order_index);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published);

-- Replace the "viewable by everyone" policy to respect is_published for non-admins
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON resources;

CREATE POLICY "Published resources are viewable by everyone" ON resources
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all resources" ON resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed crisis hotlines from the current hardcoded /resources page
INSERT INTO resources (title, description, category, type, url, phone, is_crisis_resource, order_index)
VALUES
  ('Kennedy Austin Foundation Crisis Line', 'Our 24/7 crisis intervention hotline', 'crisis', 'link', NULL, '909-808-6866', true, 1),
  ('National Suicide Prevention Lifeline', 'Free, confidential support 24/7', 'crisis', 'link', 'https://988lifeline.org', '988', true, 2),
  ('Crisis Text Line', 'Free crisis counseling via text', 'crisis', 'link', 'https://www.crisistextline.org', 'Text HOME to 741741', true, 3),
  ('National Domestic Violence Hotline', '24/7 support for DV survivors', 'crisis', 'link', 'https://www.thehotline.org', '1-800-799-7233', true, 4),
  ('SAMHSA National Helpline', 'Mental health & substance abuse support', 'crisis', 'link', 'https://www.samhsa.gov/find-help/national-helpline', '1-800-662-4357', true, 5)
ON CONFLICT DO NOTHING;
