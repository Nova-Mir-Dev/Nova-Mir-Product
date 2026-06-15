import { Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

interface Project {
  id: string
  client_id: string
  name: string
  description: string
  status: string
  deadline: string
  progress: number
}

export default async function ProjectsPage() {
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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const items = (projects ?? []) as Project[]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Projects
      </Text>

      {items.length === 0 ? (
        <Text>No projects found.</Text>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Client ID</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {items.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.client_id}</td>
                <td>{project.status}</td>
                <td>
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString()
                    : '—'}
                </td>
                <td>{project.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Stack>
  )
}
