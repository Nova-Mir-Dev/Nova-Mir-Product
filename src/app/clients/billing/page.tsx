'use client'

import { useEffect, useState } from 'react'
import { Text, Card } from 'azimuth-ui'
import styles from './billing.module.css'

interface Invoice {
  id: string
  user_id: string
  client_name: string
  amount: number
  status: string
  due_date: string | null
  created_at: string
  paid_at: string | null
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadgeClass(status: string): string {
  if (status === 'paid') return styles.badgePaid!
  if (status === 'overdue') return styles.badgeOverdue!
  return styles.badgePending!
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients/invoices')
      .then((r) => r.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? (data as Invoice[]) : [])
      })
      .catch(() => {
        setInvoices([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Text>Loading billing...</Text>
  }

  return (
    <div className={styles.container}>
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Billing
      </Text>

      {invoices.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <Text element={{ size: 'h2' }} weight="semibold">
              No invoices yet
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Invoices will appear here once they&apos;re created.
            </Text>
          </div>
        </Card>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Due Date</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {inv.id.substring(0, 8)}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {formatAmount(inv.amount)}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${statusBadgeClass(inv.status)}`}
                    >
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDueDate(inv.due_date)}</td>
                  <td>{inv.client_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
