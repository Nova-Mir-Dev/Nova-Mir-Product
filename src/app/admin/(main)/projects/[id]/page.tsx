import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { ProjectDetailPage } from '@/features/admin/projects/project-detail-page'
import type { Project } from '@/features/admin/types'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  if (profile?.role !== 'admin') redirect('/admin/auth/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: clientUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', project.client_id)
    .single()

  return (
    <ProjectDetailPage
      project={project as Project}
      clientName={clientUser?.name ?? null}
    />
  )
}
