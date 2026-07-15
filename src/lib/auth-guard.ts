import 'server-only'
import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'

interface AdminGuard {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
  profile: { role: string; name?: string | null }
}

/**
 * Enforces an authenticated admin for a Server Component or Server Action, and
 * returns the session-scoped Supabase client for reuse so callers don't open a
 * second one. Redirects to the admin login on failure. The role lookup uses the
 * service client because the caller may not yet satisfy a users-table SELECT
 * policy. This is defense in depth on top of middleware + the admin layout.
 */
export async function requireAdmin(): Promise<AdminGuard> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/auth/login')

  const { data: profile } = await createServiceClient()
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin/auth/login')

  return { supabase, user, profile }
}
