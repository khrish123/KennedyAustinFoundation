-- ============================================
-- SUPPORT MESSAGES (threaded conversations attached to support_requests)
-- ============================================

-- Thread of messages for each support_request
-- direction = 'inbound' (from user) or 'outbound' (from staff)
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  support_request_id UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  -- Sender metadata. For inbound (from the user) we capture name/email at submit time
  -- so we can keep history even if the user is a guest.
  from_name TEXT,
  from_email TEXT,
  -- For outbound staff replies, the admin who sent it
  sent_by_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Email provider trace (Resend)
  email_provider_id TEXT,
  email_status TEXT, -- 'sent', 'delivered', 'bounced', 'failed', or null when no email was attempted
  email_error TEXT,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages on their own requests
CREATE POLICY "Users can view messages on own requests" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_requests sr
      WHERE sr.id = support_messages.support_request_id
        AND sr.user_id = auth.uid()
    )
  );

-- Users can append a follow-up message to their own request (inbound only)
CREATE POLICY "Users can post follow-ups on own requests" ON support_messages
  FOR INSERT
  WITH CHECK (
    direction = 'inbound'
    AND EXISTS (
      SELECT 1 FROM support_requests sr
      WHERE sr.id = support_messages.support_request_id
        AND sr.user_id = auth.uid()
    )
  );

-- Admins can read/write everything
CREATE POLICY "Admins can view all messages" ON support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage all messages" ON support_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE INDEX IF NOT EXISTS idx_support_messages_request ON support_messages(support_request_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

-- Add a 'subject' column to support_requests so threads have a title.
-- Existing rows will be NULL; the API will populate going forward.
ALTER TABLE support_requests
  ADD COLUMN IF NOT EXISTS subject TEXT;

-- Backfill: copy first 80 chars of message into subject for existing rows
UPDATE support_requests
SET subject = LEFT(message, 80)
WHERE subject IS NULL;
