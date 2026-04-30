-- ============================================
-- FAQS (frequently asked questions on /faq)
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published FAQs are viewable by everyone" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all FAQs" ON faqs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);

-- Seed with the current hardcoded FAQs from /faq page
INSERT INTO faqs (question, answer, order_index) VALUES
  ('Are your classes really free?', 'Most of our core classes — grief recovery, crisis support, youth programs — are free. A small number of specialized programs are paid; pricing is shown on each class page.', 1),
  ('Do I need to live in California to participate?', 'Our in-person services are based in Pomona, CA, but our recorded classes, live online classes, and community forum are open to everyone, anywhere.', 2),
  ('How do I sign up for a class?', 'Create a free account, browse the Classes page, and click Enroll on any class. Free classes start immediately. Paid classes go through a secure Stripe checkout.', 3),
  ('Are the live classes recorded?', 'Most live classes are recorded and added to the class page within 24 hours so you can rewatch or catch up if you missed it.', 4),
  ('Is my journal really private?', 'Yes. Entries marked private are visible only to you. We do not read, scan, or share private journal content. See our privacy policy for full details.', 5),
  ('Can I delete my account?', 'Yes — go to Settings → Delete Account, or email admin@kennedyaustinfoundation.com. We''ll permanently remove your data within 30 days.', 6),
  ('Are donations tax-deductible?', 'The Kennedy Austin Foundation is a registered nonprofit. Donations are tax-deductible to the extent allowed by law in your jurisdiction. Stripe sends an automatic receipt; reach out for an annual giving statement.', 7),
  ('How can I volunteer or partner with the foundation?', 'We love partnerships. Email admin@kennedyaustinfoundation.com or fill out the contact form and we''ll be in touch.', 8),
  ('What should I do if I''m in crisis right now?', 'If you are in immediate danger or having thoughts of suicide, call 988 (US Suicide & Crisis Lifeline) or 911. You can also call our line at 909-808-6866 during business hours.', 9)
ON CONFLICT DO NOTHING;
