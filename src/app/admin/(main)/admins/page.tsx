import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { checkFirstAdmin, listAdminUsers } from './actions'
import { AdminSetupForm } from './setup-form'
import { AdminList } from './admin-list'
import { InviteForm } from './invite-form'

export default async function AdminsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const isFirst = await checkFirstAdmin()
    if (isFirst) return <AdminSetupForm />
    redirect('/admin/auth/login')
  }

  const { data: profile } = await supabase
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
