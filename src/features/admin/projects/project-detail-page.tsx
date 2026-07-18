'use client'

import Link from 'next/link'
import { Badge, Button, Stack, Tabs, Text } from 'azimuth-ui'
import type { Project } from '@/features/admin/types'
import { OverviewTab } from './components/overview-tab'

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
