'use client'

import Link from 'next/link'
import {
  Stack,
  Text,
  DataTable,
  Badge,
  EmptyState,
  Pagination,
  Skeleton,
  ProgressBar,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { Project } from '@/features/admin/types'
import type { Column } from 'azimuth-ui'
import styles from './projects-page.module.css'

type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export interface ProjectsPageProps {
  projects: Project[]
}

const statusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'active':
      return 'info'
    case 'completed':
      return 'success'
    default:
      return 'neutral'
  }
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString() : '—'

export const ProjectsPage = ({ projects }: ProjectsPageProps) => {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    projects,
    20,
  )

  const columns: Column<Project>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (_, row) => (
        <Link href={`/admin/projects/${row.id}`}>{row.name}</Link>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => (
        <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: 'deadline',
      title: 'Deadline',
      render: (_, row) => formatDate(row.deadline),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (_, row) => (
        <div className={styles.progressWrapper}>
          <ProgressBar value={row.progress ?? 0} max={100} />
          <span className={styles.progressValue}>{row.progress ?? 0}%</span>
        </div>
      ),
    },
  ]

  if (projects.length === 0) {
    return (
      <Stack spacing="md">
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Projects
        </Text>
        <EmptyState
          title="No projects found"
          description="There are no projects to display yet."
        />
      </Stack>
    )
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Projects
      </Text>
      <DataTable
        data={{ columns, data: pageData }}
        pagination={{
          virtual: { enabled: true, threshold: 50, maxHeight: 600 },
        }}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showFirstLast
        />
      )}
    </Stack>
  )
}

export const ProjectsPageSkeleton = () => (
  <Stack spacing="md">
    <Skeleton width="200px" height="32px" />
    <Skeleton width="100%" height="300px" />
  </Stack>
)
