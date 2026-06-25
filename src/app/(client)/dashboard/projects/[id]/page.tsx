import { Card, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!project) redirect('/dashboard/projects')

  return (
    <Stack spacing="md">
      <Link
        href="/dashboard/projects"
        style={{
          textDecoration: 'none',
          color: 'var(--azimuth-color-primary)',
        }}
      >
        ← Back to Projects
      </Link>
      <Card>
        <Stack spacing="sm">
          <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
            {project.name}
          </Text>
          <Text element={{ size: 'sm' }} color="secondary">
            Status: {project.status}
          </Text>
          {project.description && <Text>{project.description}</Text>}
          <Text element={{ size: 'sm' }} color="secondary">
            Deadline:{' '}
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : 'No deadline'}
          </Text>
        </Stack>
      </Card>
    </Stack>
  )
}
