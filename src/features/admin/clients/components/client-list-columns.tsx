import Link from 'next/link'
import { ClientStatusBadge } from './client-status-badge'
import type { PortfolioClient } from '@/features/admin/types'

export const clientListColumns = [
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
