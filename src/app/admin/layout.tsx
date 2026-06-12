import type { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return <>{children}</>
}
