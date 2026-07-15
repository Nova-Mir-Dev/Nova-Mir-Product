import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-guard'
import { ProjectDetailPage } from '@/features/admin/projects/project-detail-page'
import type { Project } from '@/features/admin/types'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireAdmin()

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
