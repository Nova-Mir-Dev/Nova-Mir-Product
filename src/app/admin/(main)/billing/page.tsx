import { createClient } from '@/lib/supabase-server'
import BillingPage from '@/features/admin/billing/billing-page'
import type { BillingSummary, Invoice } from '@/features/admin/types'

function groupByMonth(invoices: Invoice[]) {
  const map = new Map<string, number>()
  for (const inv of invoices) {
    const key = inv.date.slice(0, 7)
    map.set(key, (map.get(key) || 0) + Number(inv.amount) / 100)
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

function computeSummary(invoices: Invoice[]): BillingSummary {
  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue')

  const totalRevenueCents = paidInvoices.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  )
  const overdueTotalCents = overdueInvoices.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  )

  const monthCount =
    new Set(paidInvoices.map((i) => i.date.slice(0, 7))).size || 1
  const mrrCents = totalRevenueCents / monthCount

  return {
    mrr: mrrCents,
    totalRevenue: totalRevenueCents,
    overdueTotal: overdueTotalCents,
    paidCount: paidInvoices.length,
    pendingCount: invoices.filter((i) => i.status === 'pending').length,
    overdueCount: overdueInvoices.length,
  }
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; page?: string; pageSize?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('portfolio_invoices')
    .select('*')
    .order('created_at', { ascending: false })

  const raw = (invoices ?? []) as Invoice[]
  const billingSummary = computeSummary(raw)
  const revenueByMonth = groupByMonth(raw.filter((i) => i.status === 'paid'))

  return (
    <>
      <BillingPage
        invoices={raw}
        billingSummary={billingSummary}
        showCreateForm={params.create === 'true'}
      />
      {revenueByMonth.length > 0 && (
        <RevenueTable revenueByMonth={revenueByMonth} />
      )}
    </>
  )
}

function RevenueTable({
  revenueByMonth,
}: {
  revenueByMonth: [string, number][]
}) {
  return (
    <div style={{ marginTop: 'var(--azimuth-spacing-md)' }}>
      <h2>Revenue by Month</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {revenueByMonth.map(([month, total]) => (
            <tr key={month}>
              <td>
                {new Date(month + '-01').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </td>
              <td>${total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
