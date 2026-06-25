import Link from 'next/link'
import { Card, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

interface Project {
  id: string
  name: string
  status: string
  deadline: string | null
  description: string
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', user.id)
    .order('deadline', { ascending: true })

  const raw = (projects ?? []) as Project[]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        My Projects
      </Text>

      {raw.length === 0 ? (
        <Card>
          <Stack
            spacing="sm"
            style={{
              textAlign: 'center',
              padding: 'var(--azimuth-spacing-lg)',
            }}
          >
            <Text color="secondary">No projects assigned yet.</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              When projects are assigned, they will appear here.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack spacing="sm">
          {raw.map((project) => (
            <Card key={project.id}>
              <Stack spacing="xs">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text weight="semibold">{project.name}</Text>
                  <Text element={{ size: 'sm' }} color="secondary">
                    {project.status}
                  </Text>
                </div>
                <Text element={{ size: 'sm' }} color="secondary">
                  {project.description}
                </Text>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text element={{ size: 'sm' }} color="secondary">
                    Deadline:{' '}
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </Text>
                  <Link href={'/dashboard/projects/' + project.id}>
                    <Text>View Details</Text>
                  </Link>
                </div>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
