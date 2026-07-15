import { requireAdmin } from '@/lib/auth-guard'
import { listAdminUsers } from './actions'
import { AdminList } from './admin-list'
import { InviteForm } from './invite-form'

export default async function AdminsPage() {
  await requireAdmin()

  const admins = await listAdminUsers()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Admin Users</h1>
      <AdminList admins={admins} />
      <InviteForm />
    </div>
  )
}
