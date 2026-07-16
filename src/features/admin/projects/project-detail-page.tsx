'use client'

import Link from 'next/link'
import {
  Badge,
  Button,
  Card,
  Divider,
  ProgressBar,
  Stack,
  Tabs,
  Text,
} from 'azimuth-ui'
import type { Project } from '@/features/admin/types'

interface ProjectDetailPageProps {
  project: Project
  clientName: string | null
}

const statusBadgeVariant = (
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  switch (status) {
    case 'active':
      return 'info'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'success'
    case 'on_hold':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

function OverviewTab({
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

export function ProjectDetailPage({
  project,
  clientName,
}: ProjectDetailPageProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab project={project} clientName={clientName} />,
    },
  ]

  return (
    <Stack spacing="md">
      <Stack direction="horizontal" justify="between" align="start">
        <Stack spacing="xs">
          <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
            {project.name}
          </Text>
          <Badge variant={statusBadgeVariant(project.status)}>
            {project.status.replace(/_/g, ' ')}
          </Badge>
        </Stack>
        <Link href="/admin/projects">
          <Button variant="secondary" size="sm">
            Back to Projects
          </Button>
        </Link>
      </Stack>

      <Tabs tabs={tabs} defaultTab="overview" />
    </Stack>
  )
}
