import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminNav from '@/features/admin/components/admin-nav'

export default async function AdminMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin/auth/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <main style={{ flex: 1, padding: 'var(--azimuth-spacing-lg)' }}>
        {children}
      </main>
    </div>
  )
}
