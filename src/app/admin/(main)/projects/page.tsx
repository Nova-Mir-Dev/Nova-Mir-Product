import { Stack, Text, Button, Card, Input, TextArea } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { createProject } from '@/features/admin/projects/actions'

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
    .select('id, name')
    .order('name')

  const items = (projects ?? []) as Project[]

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
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
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
