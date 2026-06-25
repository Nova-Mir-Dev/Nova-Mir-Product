'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Stack,
  Text,
  EmptyState,
  DataTable,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import { updateLeadAction, convertToClientAction } from './actions'
import { LeadStatusBadge } from './components/lead-status-badge'
import type { Lead } from '@/features/admin/types'
import styles from './components/lead-list.module.css'

interface LeadsPageProps {
  leads: Lead[]
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export function LeadsPage({ leads }: LeadsPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false
      if (!q) return true
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.business_name ?? '').toLowerCase().includes(q)
      )
    })
  }, [leads, search, statusFilter])

  const { page, setPage, totalPages, pageData } = useClientPagination(
    filtered,
    10,
  )
  const selectedLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId)
    : null

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      searchable: true,
    },
    {
      key: 'business_name',
      title: 'Company',
      sortable: true,
      searchable: true,
      render: (value: unknown) => (value as string) || '-',
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown) => <LeadStatusBadge status={String(value)} />,
    },
    {
      key: 'source',
      title: 'Source',
      sortable: true,
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: 'id',
      title: '',
      render: (_: unknown, row: Lead) => (
        <Stack direction="horizontal" spacing="xs">
          <Button
            variant="tertiary"
            size="sm"
            type="button"
            onClick={() =>
              setSelectedLeadId(selectedLeadId === row.id ? null : row.id)
            }
          >
            {selectedLeadId === row.id ? 'Close' : 'View'}
          </Button>
          {row.status !== 'won' && row.status !== 'lost' && (
            <form action={convertToClientAction}>
              <input type="hidden" name="id" value={row.id} />
              <Button variant="primary" size="sm" type="submit">
                Convert
              </Button>
            </form>
          )}
        </Stack>
      ),
    },
  ]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Lead Management
      </Text>

      <div className={styles.toolbar}>
        <Input
          label={{ text: 'Search' }}
          name="q"
          value={{
            value: search,
            onChange: (e) => {
              setSearch(e.target.value)
              setPage(1)
            },
          }}
          placeholder="Search by name, email, or company..."
        />
        <Select
          label={{ text: 'Status' }}
          options={statusOptions}
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {selectedLead && (
        <Card className={styles.detailCard}>
          <Stack spacing="sm">
            <Text element={{ as: 'h5' }} weight="semibold">
              {selectedLead.name}
            </Text>
            <div className={styles.detailGrid}>
              <div>
                <Text className={styles.detailLabel}>Email</Text>
                <Text className={styles.detailValue}>{selectedLead.email}</Text>
              </div>
              <div>
                <Text className={styles.detailLabel}>Phone</Text>
                <Text className={styles.detailValue}>
                  {selectedLead.phone || '-'}
                </Text>
              </div>
              <div>
                <Text className={styles.detailLabel}>Company</Text>
                <Text className={styles.detailValue}>
                  {selectedLead.business_name || '-'}
                </Text>
              </div>
              <div>
                <Text className={styles.detailLabel}>Source</Text>
                <Text className={styles.detailValue}>
                  {selectedLead.source}
                </Text>
              </div>
            </div>
            {selectedLead.message && (
              <div>
                <Text className={styles.detailLabel}>Message</Text>
                <Text className={styles.detailValue}>
                  {selectedLead.message}
                </Text>
              </div>
            )}
            <form action={updateLeadAction}>
              <input type="hidden" name="id" value={selectedLead.id} />
              <Stack spacing="sm">
                <Select
                  label={{ text: 'Status' }}
                  name="status"
                  options={statusOptions.filter((o) => o.value)}
                  defaultValue={selectedLead.status}
                />
                <Input
                  label={{ text: 'Notes' }}
                  name="notes"
                  defaultValue={selectedLead.notes ?? ''}
                  placeholder="Add internal notes..."
                />
                <div className={styles.formActions}>
                  <Button variant="primary" type="submit">
                    Update
                  </Button>
                </div>
              </Stack>
            </form>
          </Stack>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No leads found"
          description={
            search || statusFilter
              ? 'Try different search terms or filters.'
              : 'No leads have been submitted yet.'
          }
        />
      ) : (
        <>
          <DataTable<Lead>
            data={{
              columns,
              data: pageData,
              emptyMessage: 'No leads found.',
            }}
            search={{
              enabled: true,
              placeholder: 'Search leads...',
            }}
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
        </>
      )}
    </Stack>
  )
}
