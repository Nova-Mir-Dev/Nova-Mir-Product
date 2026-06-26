import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { listAdminUsers } from './actions'
import { AdminList } from './admin-list'
import { InviteForm } from './invite-form'

export default async function AdminsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/auth/login')

  const { data: profile } = await createServiceClient()
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin) return <div>Access denied. Admin role required.</div>

  const admins = await listAdminUsers()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Admin Users</h1>
      <AdminList admins={admins} />
      <InviteForm />
    </div>
  )
}
