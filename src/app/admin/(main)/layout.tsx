import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { AdminSidebar } from '@/features/admin/components/admin-nav'
import { UserMenu } from '@/features/admin/components/user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { PageLayout } from 'azimuth-ui'

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
    <PageLayout
      sidebar={<AdminSidebar />}
      topNav={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--azimuth-space-sm)',
            marginLeft: 'auto',
          }}
        >
          <ThemeToggle />
          <UserMenu
            name={(profile as { name?: string })?.name ?? null}
            email={user.email ?? null}
          />
        </div>
      }
    >
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: 9999,
          padding: '8px 16px',
          background: 'var(--azimuth-color-surface)',
          color: 'var(--azimuth-color-text)',
        }}
        onFocus={(e) => (e.currentTarget.style.left = '0')}
        onBlur={(e) => (e.currentTarget.style.left = '-9999px')}
      >
        Skip to main content
      </a>
      <main id="main-content">{children}</main>
    </PageLayout>
  )
}
