import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import AdminNav from '@/features/admin/components/admin-nav'
import { UserMenu } from '@/features/admin/components/user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
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

  const admin = createServiceClient()
  const { data: profile } = await admin
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin/auth/login')

  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.content}>
        <header className={styles.topbar}>
          <div />
          <div className={styles.topbarRight}>
            <ThemeToggle />
            <UserMenu
              name={(profile as { name?: string })?.name ?? null}
              email={user.email ?? null}
            />
          </div>
        </header>
        <main id="main-content" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
