'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const name = formData.get('name') as string
  const clientId = formData.get('clientId') as string
  const description = (formData.get('description') as string) || null
  const deadline = (formData.get('deadline') as string) || null

  if (!name?.trim() || !clientId?.trim()) {
    throw new Error('Project name and client are required')
  }

  const admin = createServiceClient()
  const { data: created, error } = await admin
    .from('projects')
    .insert({
      name: name.trim(),
      client_id: clientId.trim(),
      description,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'active',
      progress: 0,
    })
    .select('id')
    .single()

  if (error) throw new Error('Failed to create project')

  void logAudit({
    action: 'admin.project.create',
    entity: 'project',
    entityId: created?.id as string | undefined,
    metadata: { client_id: clientId.trim() },
    userId: user.id,
  })

  revalidatePath('/admin/projects')
}
