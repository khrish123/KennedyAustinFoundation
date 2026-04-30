-- ============================================
-- ECM PROVIDERS (Managed Care Plan partners shown on /ecm)
-- ============================================
CREATE TABLE IF NOT EXISTS ecm_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  phone TEXT,
  populations_served TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ecm_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible ECM providers are viewable by everyone" ON ecm_providers
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins can view all ECM providers" ON ecm_providers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage ECM providers" ON ecm_providers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_ecm_providers_updated_at BEFORE UPDATE ON ecm_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_ecm_providers_order ON ecm_providers(order_index);
CREATE INDEX IF NOT EXISTS idx_ecm_providers_visible ON ecm_providers(is_visible);
