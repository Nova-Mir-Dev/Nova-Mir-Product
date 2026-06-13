'use client'

import Link from 'next/link'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  Pagination,
  Stack,
  Text,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { BillingSummary, Invoice } from '@/features/admin/types'
import { createInvoice, markInvoiceAsPaid } from './actions'
import styles from './billing-page.module.css'

interface BillingPageProps {
  invoices: Invoice[]
  billingSummary: BillingSummary
  showCreateForm: boolean
}

const statusVariant = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  return 'danger'
}

function formatAmount(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export default function BillingPage({
  invoices,
  billingSummary,
  showCreateForm,
}: BillingPageProps) {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    invoices,
    10,
  )

  const columns = [
    { key: 'invoice_number', title: 'Invoice #', sortable: true },
    { key: 'client_name', title: 'Client', sortable: true },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: unknown) => {
        const amount = Number(value)
        return <span>{formatAmount(amount)}</span>
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown) => {
        const status = String(value)
        return (
          <Badge variant={statusVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    { key: 'date', title: 'Date', sortable: true },
    {
      key: 'id',
      title: 'Actions',
      render: (value: unknown) => {
        const id = String(value)
        const invoice = invoices.find((i) => i.id === id)
        if (!invoice || invoice.status === 'paid') return null
        return (
          <form action={markInvoiceAsPaid}>
            <input type="hidden" name="id" value={id} />
            <Button variant="primary" type="submit">
              Mark as Paid
            </Button>
          </form>
        )
      },
    },
  ]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Billing Overview
      </Text>

      <div className={styles.kpiRow}>
        <KPICard
          value={formatAmount(billingSummary.mrr)}
          label="MRR"
          variant="accent"
        />
        <KPICard
          value={formatAmount(billingSummary.totalRevenue)}
          label="Total Revenue"
          variant="success"
        />
        <KPICard
          value={formatAmount(billingSummary.overdueTotal)}
          label="Overdue Total"
          variant="danger"
        />
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.statCard}>
          <Text>Paid: {billingSummary.paidCount}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text>Pending: {billingSummary.pendingCount}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text>Overdue: {billingSummary.overdueCount}</Text>
        </Card>
      </div>

      <a
        href={showCreateForm ? '/admin/billing' : '/admin/billing?create=true'}
      >
        <Button variant="primary" type="button">
          {showCreateForm ? 'Cancel' : 'Create Invoice'}
        </Button>
      </a>

      {showCreateForm && (
        <Card>
          <form action={createInvoice}>
            <Stack spacing="sm">
              <Input
                label={{ text: 'Client Name' }}
                name="clientName"
                required
              />
              <Input
                label={{ text: 'Description' }}
                name="description"
              />
              <Input
                label={{ text: 'Unit Price ($)' }}
                name="unitPrice"
                type="number"
              />
              <Input
                label={{ text: 'Quantity' }}
                name="quantity"
                type="number"
                defaultValue="1"
              />
              <div className={styles.formActions}>
                <Button variant="primary" type="submit">
                  Create
                </Button>
                <Link href="/admin/billing">
                  <Button variant="tertiary" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          All Invoices
        </Text>
        {invoices.length === 0 ? (
          <EmptyState
            title="No Invoices"
            description="Create your first invoice to get started."
          />
        ) : (
          <>
            <DataTable<Invoice>
              data={{ columns, data: pageData }}
              search={{ enabled: true, placeholder: 'Search invoices...' }}
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
    </Stack>
  )
}
