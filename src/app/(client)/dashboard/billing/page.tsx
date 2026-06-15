import { Card, Stack, Text, Button } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { openCustomerPortal } from './actions'

interface Invoice {
  id: string
  amount: number
  status: string
  date: string
}

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: invoices } = await supabase
    .from('portfolio_invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const raw = (invoices ?? []) as Invoice[]
  const nextInvoice = raw.find(
    (i) => i.status === 'pending' || i.status === 'overdue',
  )
  const pastInvoices = raw.filter((i) => i.status === 'paid')

  const totalPaid = pastInvoices.reduce((sum, i) => sum + i.amount, 0)

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Billing
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--azimuth-spacing-md)',
        }}
      >
        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Current Plan
            </Text>
            <Text element={{ as: 'p', size: 'h4' }} weight="bold">
              Professional
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Monthly subscription
            </Text>
          </Stack>
        </Card>

        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Next Invoice
            </Text>
            {nextInvoice ? (
              <>
                <Text element={{ as: 'p', size: 'h4' }} weight="bold">
                  ${(nextInvoice.amount / 100).toFixed(2)}
                </Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  Due {new Date(nextInvoice.date).toLocaleDateString()}
                </Text>
                <form action={openCustomerPortal}>
                  <Button variant="primary" type="submit" size="sm">
                    Pay Now
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Text element={{ as: 'p', size: 'h4' }} weight="bold">
                  $0.00
                </Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  No pending invoices
                </Text>
              </>
            )}
          </Stack>
        </Card>

        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Payment Method
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              No card on file
            </Text>
            <form action={openCustomerPortal}>
              <Button variant="tertiary" type="submit" size="sm">
                Update Payment Method
              </Button>
            </form>
          </Stack>
        </Card>

        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Total Paid
            </Text>
            <Text element={{ as: 'p', size: 'h4' }} weight="bold">
              ${(totalPaid / 100).toFixed(2)}
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              {pastInvoices.length} invoices paid
            </Text>
          </Stack>
        </Card>
      </div>

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          Invoice History
        </Text>
        {raw.length > 0 ? (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--azimuth-color-border)',
                  }}
                >
                  <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {raw.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <td style={{ padding: '8px' }}>
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '8px' }}>
                      ${(inv.amount / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor:
                            inv.status === 'paid'
                              ? 'var(--azimuth-color-success-bg, #e6f7e6)'
                              : inv.status === 'overdue'
                                ? 'var(--azimuth-color-danger-bg, #fde8e8)'
                                : 'var(--azimuth-color-warning-bg, #fff4e5)',
                          color:
                            inv.status === 'paid'
                              ? 'var(--azimuth-color-success, #166534)'
                              : inv.status === 'overdue'
                                ? 'var(--azimuth-color-danger, #991b1b)'
                                : 'var(--azimuth-color-warning, #9a5b00)',
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Button variant="tertiary" size="sm" type="button">
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <Stack
              spacing="sm"
              style={{
                textAlign: 'center',
                padding: 'var(--azimuth-spacing-lg)',
              }}
            >
              <Text color="secondary">No invoices yet.</Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Stack>
  )
}
