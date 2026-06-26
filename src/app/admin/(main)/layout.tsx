import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminNav from '@/features/admin/components/admin-nav'
import styles from './admin-layout.module.css'

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
    <div className={styles.container}>
      <AdminNav />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  )
}
