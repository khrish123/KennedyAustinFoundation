-- ============================================
-- EMAIL SETTINGS (SMTP credentials + sender identity)
-- Admin-only access; the password column is sensitive.
-- ============================================
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- SMTP transport
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_encryption TEXT NOT NULL DEFAULT 'ssl' CHECK (smtp_encryption IN ('none', 'tls', 'ssl')),
  -- Sender identity
  from_email TEXT,
  from_name TEXT,
  reply_to_email TEXT,
  -- Optional Resend API key override (otherwise read from RESEND_API_KEY env var)
  resend_api_key TEXT,
  -- Active transport: 'smtp', 'resend', or 'auto' (smtp first, then resend)
  transport TEXT NOT NULL DEFAULT 'auto' CHECK (transport IN ('smtp', 'resend', 'auto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: ONLY admins can read or write. No public access.
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email settings" ON email_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage email settings" ON email_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON email_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed an empty row so the admin always has something to edit
INSERT INTO email_settings (smtp_encryption, transport)
SELECT 'ssl', 'auto'
WHERE NOT EXISTS (SELECT 1 FROM email_settings);
