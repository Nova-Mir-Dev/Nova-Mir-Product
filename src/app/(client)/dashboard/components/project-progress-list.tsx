import Link from 'next/link'
import { Card, Stack, Text } from 'azimuth-ui'
import type { Project } from '@/types/entities'

export function ProjectProgressList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card>
        <Stack
          spacing="sm"
          style={{ textAlign: 'center', padding: 'var(--azimuth-space-lg)' }}
        >
          <Text color="secondary">No active projects yet.</Text>
          <Link href="/dashboard/projects">
            <Text>View Projects</Text>
          </Link>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack spacing="sm">
      <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
        Project Progress
      </Text>
      {projects.slice(0, 3).map((project) => (
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
            <div
              role="progressbar"
              aria-label={`Progress for ${project.name}`}
              aria-valuenow={project.progress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                height: 8,
                backgroundColor: 'var(--azimuth-color-bg-secondary)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: (project.progress ?? 0) + '%',
                  height: '100%',
                  backgroundColor: 'var(--azimuth-color-primary)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <Text element={{ size: 'sm' }} color="secondary">
              {project.progress ?? 0}% complete — Deadline:{' '}
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString('en-US')
                : 'No deadline'}
            </Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
