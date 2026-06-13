'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  Pagination,
  Stack,
} from 'azimuth-ui'
import { ClientStatusBadge } from './client-status-badge'
import type { PortfolioClient } from '@/features/admin/types'
import styles from './client-list.module.css'

interface ClientListProps {
  clients: PortfolioClient[]
  searchQuery?: string
  pagination: { page: number; totalPages: number }
}

const columns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    searchable: true,
    render: (_: unknown, row: PortfolioClient) => (
      <Link href={`/admin/clients/${row.id}`}>{row.name}</Link>
    ),
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    searchable: true,
  },
  {
    key: 'project_count',
    title: 'Projects',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: PortfolioClient) => (
      <ClientStatusBadge status={row.status} />
    ),
  },
]

export function ClientList({
  clients,
  searchQuery,
  pagination,
}: ClientListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`?${params.toString()}`)
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description={
          searchQuery
            ? `No clients matching "${searchQuery}". Try a different search term.`
            : 'Get started by adding your first client.'
        }
        action={
          <Link href="/admin/clients?create=true">
            <Button variant="primary">Add Client</Button>
          </Link>
        }
      />
    )
  }

  return (
    <Stack spacing="md">
      <form method="GET" className={styles.toolbar}>
        <Input
          label={{ text: 'Search' }}
          name="q"
          defaultValue={searchQuery ?? ''}
          placeholder="Search clients..."
        />
        <Button variant="primary" type="submit">
          Search
        </Button>
        {searchQuery && (
          <Link href="/admin/clients">
            <Button variant="tertiary" type="button">
              Clear
            </Button>
          </Link>
        )}
        <Link href="/admin/clients?create=true">
          <Button variant="primary" type="button">
            Add Client
          </Button>
        </Link>
      </form>

      <DataTable
        data={{
          columns,
          data: clients,
          emptyMessage: 'No clients found.',
        }}
        search={{
          enabled: true,
          placeholder: 'Search clients...',
        }}
        pagination={{
          virtual: { enabled: true, threshold: 50, maxHeight: 600 },
        }}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          showFirstLast
        />
      )}
    </Stack>
  )
}
