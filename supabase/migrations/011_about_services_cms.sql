-- ============================================
-- SERVICES (shown on / homepage and /services page)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon_name TEXT,
  color_class TEXT,
  bg_color_class TEXT,
  features TEXT[],
  href_anchor TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published services are viewable by everyone" ON services
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all services" ON services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);

-- Seed with the existing hardcoded services
INSERT INTO services (slug, title, short_description, long_description, icon_name, color_class, bg_color_class, features, href_anchor, order_index)
VALUES
  ('crisis', 'Crisis Intervention', 'Compassionate support during life''s most difficult moments. You''re not alone—we''re here 24/7.',
   'Our crisis intervention team is available around the clock to provide immediate support during emergencies. We partner with local emergency services to ensure you get the help you need, when you need it.',
   'Shield', 'text-rose-500', 'bg-rose-50',
   ARRAY['24/7 crisis hotline support','Same-day response for urgent situations','Safety planning and resources','Connection to emergency services when needed','Follow-up care and support'],
   'crisis', 1),
  ('grief', 'Grief Counseling', 'Gentle guidance through the journey of loss, helping you find peace and healing.',
   'In partnership with Tri-City Mental Health Services, we provide comprehensive grief counseling for individuals and families. Our trained counselors help you process your loss and find a path toward healing.',
   'Heart', 'text-purple-500', 'bg-purple-50',
   ARRAY['Individual counseling sessions','Group support meetings','Child and teen grief programs','Family grief support','Memorial and remembrance events'],
   'grief', 2),
  ('dv', 'DV Support', 'A safe haven for survivors, offering hope, resources, and a path to safety.',
   'We provide a safe, judgment-free environment for domestic violence survivors. Our services include safety planning, resource connections, and ongoing support as you rebuild your life.',
   'HandHeart', 'text-blue-500', 'bg-blue-50',
   ARRAY['Confidential support services','Safety planning assistance','Resource referrals and advocacy','Support groups for survivors','Children''s programs'],
   'dv', 3),
  ('selfhelp', 'Self-Help Programs', 'Discover your inner strength through empowering workshops and wellness programs.',
   'Our self-help programs empower you with practical skills and strategies for personal growth. From stress management to relationship building, we provide tools for lasting positive change.',
   'Sparkles', 'text-amber-500', 'bg-amber-50',
   ARRAY['Personal development workshops','Stress management techniques','Building healthy relationships','Life skills training','Goal setting and achievement'],
   'selfhelp', 4),
  ('youth', 'Youth Programs', 'Specialized support for young people facing challenges.',
   'Our youth programs provide specialized support for young people facing challenges. We help them build resilience, develop leadership skills, and navigate the path to adulthood.',
   'BookOpen', 'text-emerald-500', 'bg-emerald-50',
   ARRAY['Youth mentorship programs','After-school support groups','Teen crisis intervention','College and career guidance','Leadership development'],
   'youth', 5),
  ('family', 'Family Support', 'Connect with others who understand. Together, we heal stronger.',
   'Strong families build strong communities. Our family support services help families communicate better, resolve conflicts, and access the resources they need to thrive.',
   'Users', 'text-teal-500', 'bg-teal-50',
   ARRAY['Family counseling sessions','Parenting workshops','Communication skills training','Conflict resolution support','Resource assistance (food, clothing, shelter)'],
   'family', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ABOUT VALUES
-- ============================================
CREATE TABLE IF NOT EXISTS about_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published values are viewable by everyone" ON about_values
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all values" ON about_values
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage values" ON about_values
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_about_values_updated_at BEFORE UPDATE ON about_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO about_values (title, description, icon_name, order_index) VALUES
  ('Compassion', 'We meet everyone with empathy and understanding, recognizing that healing is a personal journey.', 'Heart', 1),
  ('Community', 'We believe in the power of connection and support from those who understand your experience.', 'Users', 2),
  ('Accessibility', 'Our core services are free because we believe everyone deserves access to support.', 'Target', 3),
  ('Excellence', 'We are committed to providing the highest quality support and resources to our community.', 'Award', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- ABOUT MILESTONES
-- ============================================
CREATE TABLE IF NOT EXISTS about_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE about_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published milestones are viewable by everyone" ON about_milestones
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all milestones" ON about_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage milestones" ON about_milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_about_milestones_updated_at BEFORE UPDATE ON about_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO about_milestones (year, title, description, order_index) VALUES
  ('1993', 'Foundation Established', 'Ms. Ethel Gardner founded the Kennedy Austin Foundation after losing her teenage son.', 1),
  ('2004', 'Published ''A Mother''s Cry''', 'Ms. Gardner authored her book, sharing her journey and helping others through grief.', 2),
  ('2010', 'Partnered with Tri-City Mental Health', 'Expanded grief counseling services through strategic partnership.', 3),
  ('2015', 'California Woman of the Year', 'Ms. Ethel Gardner was recognized for her outstanding service to the community.', 4),
  ('2020', 'Virtual Services Launch', 'Expanded reach with online classes and virtual support groups.', 5),
  ('2024', 'AI Support Initiative', 'Launched 24/7 AI-powered support to complement our human services.', 6)
ON CONFLICT DO NOTHING;
