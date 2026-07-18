'use client'

import { Badge, Button, DataTable, EmptyState, Pagination } from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { Invoice } from '@/features/admin/types'
import { markInvoiceAsPaid } from '../actions'
import { formatAmount, invoiceStatusVariant } from '../billing-utils'

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
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
      render: (value: unknown) => <span>{formatAmount(Number(value))}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown) => {
        const status = String(value)
        return (
          <Badge variant={invoiceStatusVariant(status)}>
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

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No Invoices"
        description="Create your first invoice to get started."
      />
    )
  }

  return (
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
  )
}
