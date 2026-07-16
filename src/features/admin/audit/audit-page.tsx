'use client'

import {
  Stack,
  Text,
  DataTable,
  EmptyState,
  Pagination,
  Skeleton,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { ActivityEntry } from '@/features/admin/types'
import { AuditFilterBar } from './components/audit-filter-bar'
import type { Column } from 'azimuth-ui'

export interface AuditPageProps {
  entries: ActivityEntry[]
  searchParams: { action?: string; client?: string; from?: string; to?: string }
}

const formatDate = (ts: string) => new Date(ts).toLocaleString('en-US')

export const AuditPage = ({ entries, searchParams }: AuditPageProps) => {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    entries,
    20,
  )

  const columns: Column<ActivityEntry>[] = [
    {
      key: 'created_at',
      title: 'Timestamp',
      render: (_, row) => formatDate(row.created_at),
    },
    { key: 'action', title: 'Action', render: (_, row) => row.action },
    {
      key: 'client_name',
      title: 'Client',
      render: (_, row) => row.client_name,
    },
    {
      key: 'performed_by',
      title: 'Performed By',
      render: (_, row) => row.performed_by,
    },
    { key: 'details', title: 'Details', render: (_, row) => row.details },
  ]

  if (entries.length === 0) {
    return (
      <Stack spacing="md">
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Audit Log
        </Text>
        <AuditFilterBar searchParams={searchParams} />
        <EmptyState
          title="No audit entries found"
          description="No activity matching your filters. Try adjusting the search criteria."
        />
      </Stack>
    )
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Audit Log
      </Text>
      <AuditFilterBar searchParams={searchParams} />
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

export const AuditPageSkeleton = () => (
  <Stack spacing="md">
    <Skeleton width="200px" height="32px" />
    <Skeleton width="100%" height="40px" />
    <Skeleton width="100%" height="300px" />
  </Stack>
)
