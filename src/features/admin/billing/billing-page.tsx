import { Button, Card, KPICard, Stack, Text } from 'azimuth-ui'
import type { BillingSummary, Invoice } from '@/features/admin/types'
import { formatAmount } from './billing-utils'
import { CreateInvoiceForm } from './components/create-invoice-form'
import { InvoicesTable } from './components/invoices-table'
import styles from './billing-page.module.css'

interface BillingPageProps {
  invoices: Invoice[]
  billingSummary: BillingSummary
  showCreateForm: boolean
}

export default function BillingPage({
  invoices,
  billingSummary,
  showCreateForm,
}: BillingPageProps) {
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

      {showCreateForm && <CreateInvoiceForm />}

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          All Invoices
        </Text>
        <InvoicesTable invoices={invoices} />
      </Stack>
    </Stack>
  )
}
