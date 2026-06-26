-- Users must be able to read their own row so middleware can verify their role.
-- The existing users_select_admin policy is circular — it requires admin role to
-- read users, but you need to read users to prove you're an admin.
CREATE POLICY IF NOT EXISTS "users_select_self" ON users FOR SELECT
  USING (id = auth.uid());
