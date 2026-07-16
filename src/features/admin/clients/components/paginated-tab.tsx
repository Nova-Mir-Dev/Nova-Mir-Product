'use client'

import type React from 'react'
import { DataTable, EmptyState, Pagination, Stack } from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'

type DataTableColumns = React.ComponentProps<
  typeof DataTable
>['data']['columns']

/**
 * A paginated DataTable tab with an empty state — the shared shape behind the
 * client-detail Projects / Billing / Support / Activity tabs.
 */
export function PaginatedTab<T>({
  rows,
  columns,
  emptyTitle,
  emptyDescription,
  emptyMessage,
}: {
  rows: T[]
  columns: DataTableColumns
  emptyTitle: string
  emptyDescription: string
  emptyMessage: string
}) {
  const { page, setPage, totalPages, pageData } = useClientPagination(rows, 10)

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Stack spacing="sm">
      <DataTable
        data={{ columns, data: pageData, emptyMessage }}
        pagination={{
          virtual: { enabled: true, threshold: 30, maxHeight: 500 },
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
