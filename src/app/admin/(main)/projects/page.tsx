import { Stack, Text, Button, Card, Input, TextArea } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { createProject } from '@/features/admin/projects/actions'
import {
  ProjectsPage,
  ProjectsPageSkeleton,
} from '@/features/admin/projects/projects-page'
import { Suspense } from 'react'
import type { Project } from '@/features/admin/types'

export default async function ProjectsPageRoute() {
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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('portfolio_clients')
    .select('id, name, user_id')
    .not('user_id', 'is', null)
    .order('name')

  const items = (projects ?? []) as unknown as Project[]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Projects
      </Text>

      <Card>
        <form action={createProject}>
          <Stack spacing="sm">
            <Text weight="semibold">Create Project</Text>
            <Input label={{ text: 'Project Name' }} name="name" required />
            <div>
              <Text element={{ size: 'sm' }}>Client</Text>
              <select
                name="clientId"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--azimuth-color-border)',
                }}
              >
                <option value="">Select a client</option>
                {(
                  clients as { id: string; name: string; user_id: string }[]
                )?.map((c) => (
                  <option key={c.id} value={c.user_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <TextArea label={{ text: 'Description' }} name="description" />
            <Input label={{ text: 'Deadline' }} name="deadline" type="date" />
            <Button variant="primary" type="submit">
              Create Project
            </Button>
          </Stack>
        </form>
      </Card>

      <Suspense fallback={<ProjectsPageSkeleton />}>
        <ProjectsPage projects={items} />
      </Suspense>
    </Stack>
  )
}
