-- ============================================
-- Allow admins / super_admins to update any profile.
--
-- The original policy in 001_initial_schema.sql only lets users update
-- their own profile (auth.uid() = id), which means admin-driven role
-- changes silently no-op (RLS filters the row, the UPDATE succeeds with
-- 0 rows affected, no error is raised). This adds a permissive policy
-- so admin role changes from /admin/users actually persist.
-- ============================================

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );
