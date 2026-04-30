-- ============================================
-- SITE SETTINGS (singleton row controlling header/footer/branding)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Kennedy Austin Foundation',
  site_tagline TEXT,
  logo_url TEXT,
  primary_phone TEXT,
  crisis_line TEXT,
  primary_email TEXT,
  address TEXT,
  founded_year INTEGER,
  founder_name TEXT,
  footer_about TEXT,
  newsletter_blurb TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  copyright_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed a single default row
INSERT INTO site_settings (
  site_name,
  site_tagline,
  primary_phone,
  crisis_line,
  primary_email,
  address,
  founded_year,
  founder_name,
  footer_about,
  newsletter_blurb,
  facebook_url,
  instagram_url,
  twitter_url,
  youtube_url
) VALUES (
  'Kennedy Austin Foundation',
  'Crisis Intervention & Family Support',
  '909-808-6866',
  '988',
  'admin@kennedyaustinfoundation.com',
  'Pomona, CA',
  1993,
  'Ms. Ethel Gardner',
  'Supporting youth and families through the traumas of life and loss since 1993. A family crisis intervention center serving Pomona, Claremont, and La Verne, California.',
  'Subscribe to our newsletter for updates, resources, and inspiration on your healing journey.',
  'https://facebook.com',
  'https://instagram.com',
  'https://twitter.com',
  'https://youtube.com'
)
ON CONFLICT DO NOTHING;
