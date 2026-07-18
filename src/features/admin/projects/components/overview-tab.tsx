import { Card, Divider, ProgressBar, Stack, Text } from 'azimuth-ui'
import type { Project } from '@/features/admin/types'

export function OverviewTab({
  project,
  clientName,
}: {
  project: Project
  clientName: string | null
}) {
  return (
    <Stack spacing="md">
      <Stack direction="horizontal" spacing="md" wrap>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Client
            </Text>
            <Text weight="semibold">{clientName ?? '—'}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Deadline
            </Text>
            <Text weight="semibold">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString('en-US')
                : '—'}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Progress
            </Text>
            <Stack direction="horizontal" spacing="xs" align="center">
              <ProgressBar
                value={project.progress ?? 0}
                max={100}
                style={{ width: '120px' }}
              />
              <Text weight="semibold">{project.progress ?? 0}%</Text>
            </Stack>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Created
            </Text>
            <Text weight="semibold">
              {new Date(project.created_at).toLocaleDateString('en-US')}
            </Text>
          </Stack>
        </Card>
      </Stack>

      {project.description && (
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Description
            </Text>
            <Text>{project.description}</Text>
          </Stack>
        </Card>
      )}

      <Card>
        <Stack spacing="sm">
          <Text element={{ size: 'lg' }} weight="semibold">
            Timeline
          </Text>
          <Divider />
          <Stack direction="horizontal" spacing="xl">
            <Stack spacing="xs">
              <Text element={{ size: 'sm' }} color="muted">
                Created
              </Text>
              <Text weight="semibold">
                {new Date(project.created_at).toLocaleDateString('en-US')}
              </Text>
            </Stack>
            {project.deadline && (
              <>
                <Divider orientation="vertical" />
                <Stack spacing="xs">
                  <Text element={{ size: 'sm' }} color="muted">
                    Deadline
                  </Text>
                  <Text weight="semibold">
                    {new Date(project.deadline).toLocaleDateString('en-US')}
                  </Text>
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
